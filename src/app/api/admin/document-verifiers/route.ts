import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validatePassword } from "@/lib/password";
import { success, error, unauthorized, forbidden, validationError } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "documents:read"); } catch { return forbidden(); }

  const verifiers = await prisma.user.findMany({
    where: { role: "DOCUMENT_VERIFIER", organizationId: user.organizationId, deletedAt: null },
    select: {
      id: true, email: true, username: true, fullName: true, isActive: true, status: true,
      lastLoginAt: true, createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return success(verifiers);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { fullName, email, username, password } = body;

    if (!fullName || !email || !password) return error("Full name, email, and password are required", 400);

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return validationError({ password: passwordCheck.errors });

    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) return error("Email already in use", 409);

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) return error("Username already taken", 409);
    }

    const passwordHash = await hashPassword(password);

    const verifier = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username || null,
        passwordHash,
        fullName,
        role: "DOCUMENT_VERIFIER",
        status: "ACTIVE",
        organizationId: user.organizationId,
      },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "DOCUMENT_VERIFIER_CREATED",
      entity: "User",
      entityId: verifier.id,
      newValue: { fullName, email: email.toLowerCase(), role: "DOCUMENT_VERIFIER" },
      ipAddress: ip,
      userAgent,
    });

    return success(verifier, 201);
  } catch {
    return error("Failed to create document verifier", 500);
  }
}
