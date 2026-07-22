import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validatePassword } from "@/lib/password";
import { success, error, unauthorized, forbidden, validationError } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const where: Record<string, unknown> = { organizationId: user.organizationId, deletedAt: null };
  if (search) where.OR = [{ fullName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
  if (status) where.status = status;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { _count: { select: { documents: true, applications: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return success({ data: students, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { fullName, email, mobile, username, password } = body;

    if (!fullName || !email || !password) return error("Full name, email, and password are required", 400);

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return validationError({ password: passwordCheck.errors });

    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) return error("Email already in use", 409);

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) return error("Username already taken", 409);
    }

    if (mobile) {
      const existingMobile = await prisma.student.findFirst({
        where: { organizationId: user.organizationId, mobile, deletedAt: null },
      });
      if (existingMobile) return error("Mobile already in use in this organization", 409);
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username || null,
        passwordHash,
        fullName,
        role: "STUDENT",
        status: "ACTIVE",
        organizationId: user.organizationId,
      },
      select: { id: true, email: true, fullName: true },
    });

    const student = await prisma.student.create({
      data: {
        userId: newUser.id,
        fullName,
        email: email.toLowerCase(),
        mobile,
        organizationId: user.organizationId,
        status: "REGISTERED",
      },
    });

    await prisma.notification.create({
      data: {
        userId: student.userId,
        studentId: student.id,
        type: "GENERAL",
        title: "Account Created",
        message: `Welcome ${fullName}! Your account has been created. Please complete your profile.`,
      },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: student.id,
      action: "STUDENT_CREATED",
      entity: "Student",
      entityId: student.id,
      newValue: { fullName, email: email.toLowerCase() },
      ipAddress: ip,
      userAgent,
    });

    return success({ ...student, user: newUser }, 201);
  } catch {
    return error("Failed to create student", 500);
  }
}
