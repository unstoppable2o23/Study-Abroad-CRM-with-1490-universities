import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validatePassword } from "@/lib/password";
import { success, error, unauthorized, forbidden, validationError } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, students: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return success(orgs);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return unauthorized();
  try { requirePermission(currentUser.role, "organizations:manage"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, adminName, adminEmail, adminUsername, adminPassword, logo, brandColor, subscriptionStart, subscriptionEnd } = body;

    if (!name || !adminName || !adminEmail || !adminPassword) {
      return error("Name, admin name, email, and password are required", 400);
    }

    const passwordCheck = validatePassword(adminPassword);
    if (!passwordCheck.valid) return validationError({ password: passwordCheck.errors });

    const slug = slugify(name);
    const existingSlug = await prisma.organization.findUnique({ where: { slug } });
    if (existingSlug) return error("Organization slug already exists", 409);

    const existingEmail = await prisma.user.findUnique({ where: { email: adminEmail.toLowerCase() } });
    if (existingEmail) return error("Admin email already in use", 409);

    if (adminUsername) {
      const existingUsername = await prisma.user.findUnique({ where: { username: adminUsername } });
      if (existingUsername) return error("Username already taken", 409);
    }

    const passwordHash = await hashPassword(adminPassword);

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        logo: logo || null,
        brandColor: brandColor || null,
        subscriptionStart: subscriptionStart ? new Date(subscriptionStart) : new Date(),
        subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        plan: body.plan || "TRIAL",
        users: {
          create: {
            email: adminEmail.toLowerCase(),
            username: adminUsername || null,
            passwordHash,
            fullName: adminName,
            role: "ADMIN",
            status: "ACTIVE",
          },
        },
      },
      include: { users: { select: { id: true, email: true, fullName: true, role: true } } },
    });

    await createAuditLog({
      organizationId: org.id,
      userId: currentUser.userId,
      action: "ORGANIZATION_CREATED",
      entity: "Organization",
      entityId: org.id,
      newValue: { name: org.name, adminEmail, plan: org.plan },
    });

    return success(org, 201);
  } catch {
    return error("Failed to create organization", 500);
  }
}


