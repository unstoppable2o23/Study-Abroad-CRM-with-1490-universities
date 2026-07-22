import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { success, error, validationError } from "@/lib/api-response";
import { validatePassword } from "@/lib/password";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  username: z.string().min(3).optional(),
  password: z.string().min(1, "Password is required"),
  mobile: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError({ fields: parsed.error.errors.map(e => e.message) });
    }

    const { fullName, email, username, password, mobile } = parsed.data;

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return validationError({ password: passwordCheck.errors });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return error("Email already registered", 409);
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return error("Username already taken", 409);
      }
    }

    const org = await prisma.organization.findFirst({
      where: { slug: "default-org" },
    });

    if (!org) {
      return error("No organization configured", 500);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username || null,
        passwordHash,
        fullName,
        role: "STUDENT",
        status: "PENDING",
        organizationId: org.id,
      },
    });

    return success(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      201
    );
  } catch {
    return error("Internal server error", 500);
  }
}
