import { getCurrentUserWithDetails } from "@/lib/auth";
import { unauthorized, success } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUserWithDetails();
  if (!user) {
    return unauthorized();
  }

  return success({
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    organizationId: user.organizationId,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  });
}
