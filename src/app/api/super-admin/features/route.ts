import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId");

  if (!orgId) return error("orgId query parameter required", 400);

  const features = await prisma.feature.findMany({ orderBy: { key: "asc" } });
  const overrides = await prisma.organizationFeature.findMany({ where: { orgId } });
  const overrideMap = new Map(overrides.map(o => [o.featureKey, o.enabled]));

  const result = features.map(f => ({
    key: f.key,
    name: f.name,
    description: f.description,
    module: f.module,
    isDefault: f.isDefault,
    enabled: overrideMap.has(f.key) ? overrideMap.get(f.key)! : f.isDefault,
  }));

  return success(result);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const body = await request.json();
  const { orgId, features } = body;

  if (!orgId || !Array.isArray(features)) return error("orgId and features array required", 400);

  for (const f of features) {
    if (!f.key || typeof f.enabled !== "boolean") continue;
    await prisma.organizationFeature.upsert({
      where: { orgId_featureKey: { orgId, featureKey: f.key } },
      update: { enabled: f.enabled },
      create: { orgId, featureKey: f.key, enabled: f.enabled },
    });
  }

  return success({ message: "Features updated" });
}
