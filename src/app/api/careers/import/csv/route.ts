import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:create"); } catch { return forbidden(); }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error("CSV file is required", 400);

    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) return error("CSV must have a header row and at least one data row", 400);

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
    const results = { total: 0, created: 0, duplicates: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      results.total++;
      try {
        const values = lines[i].split(",").map(v => v.trim().replace(/['"]/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

        const name = row["name"] || row["career name"] || row["career"];
        if (!name) { results.errors.push(`Row ${i}: Missing name`); continue; }

        const existing = await prisma.career.findUnique({ where: { name } });
        if (existing) { results.duplicates++; continue; }

        const skills = row["skills"] ? row["skills"].split(";").map(s => s.trim()) : [];
        const recruiters = row["recruiters"] ? row["recruiters"].split(";").map(r => r.trim()) : [];
        const recommendedDegrees = row["degrees"] ? row["degrees"].split(";").map(d => d.trim()) : [];

        let salaryTrends = undefined;
        if (row["salary"] || row["salary range"]) {
          salaryTrends = { range: row["salary"] || row["salary range"] };
        }

        let roadmap = undefined;
        if (row["roadmap"]) {
          roadmap = { steps: row["roadmap"].split(";").map(s => ({ title: s.trim() })) };
        }

        const categoryName = row["category"] || row["industry"];
        let categoryId = null;
        if (categoryName) {
          const cat = await prisma.careerCategory.findFirst({
            where: { name: { contains: categoryName, mode: "insensitive" } },
          });
          if (cat) categoryId = cat.id;
        }

        await prisma.career.create({
          data: {
            name, description: row["description"] || undefined,
            skills, eligibility: row["eligibility"] || undefined,
            futureScope: row["future scope"] || undefined,
            salaryTrends, recruiters, roadmap,
            isEmerging: row["emerging"]?.toLowerCase() === "true",
            categoryId, status: "PENDING_REVIEW",
            industry: row["industry"] || categoryName || undefined,
            minEducation: row["min education"] || undefined,
            recommendedDegrees,
            normalizedName: name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " "),
          },
        });
        results.created++;
      } catch (e: unknown) {
        results.errors.push(`Row ${i}: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    }

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "CAREER_IMPORT", entity: "Career",
      newValue: { imported: results.created, duplicates: results.duplicates, total: results.total },
    });

    return success(results, results.errors.length > 0 ? 207 : 201);
  } catch {
    return error("Failed to import careers", 500);
  }
}
