import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:create"); } catch { return forbidden(); }

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

        const name = row["name"] || row["scholarship name"] || row["scholarship"];
        if (!name) { results.errors.push(`Row ${i}: Missing name`); continue; }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const existing = await prisma.scholarship.findUnique({ where: { slug } });
        if (existing) { results.duplicates++; continue; }

        const countryName = row["country"];
        let countryId = null;
        if (countryName) {
          const country = await prisma.country.findFirst({
            where: { OR: [{ name: { contains: countryName, mode: "insensitive" } }, { code: countryName.toUpperCase() }] },
          });
          if (country) countryId = country.id;
        }

        const coverage = row["coverage"] ? row["coverage"].split(";").map(c => c.trim().toUpperCase()) : [];
        const intakeSeasons = row["intake"] ? row["intake"].split(";").map(i => i.trim().toUpperCase()) : [];
        const academicLevels = row["level"] ? row["level"].split(";").map(l => l.trim().toUpperCase()) : [];
        const documentsRequired = row["documents"] ? row["documents"].split(";").map(d => d.trim()) : [];
        const nationalities = row["nationalities"] ? row["nationalities"].split(";").map(n => n.trim()) : [];

        await prisma.scholarship.create({
          data: {
            name, slug, description: row["description"] || undefined,
            type: row["type"]?.toUpperCase() || "UNIVERSITY",
            amount: row["amount"] ? parseFloat(row["amount"]) : null,
            amountMax: row["amount max"] ? parseFloat(row["amount max"]) : null,
            currency: row["currency"] || "USD",
            eligibility: row["eligibility"] || undefined,
            coverage, applicationUrl: row["url"] || row["application url"] || undefined,
            deadline: row["deadline"] ? new Date(row["deadline"]) : null,
            intakeSeasons, academicLevels,
            gpaRequirement: row["gpa"] ? parseFloat(row["gpa"]) : null,
            englishTest: row["english test"] || undefined,
            documentsRequired, nationalities,
            isFeatured: row["featured"]?.toLowerCase() === "true",
            countryId,
          },
        });
        results.created++;
      } catch (e: unknown) {
        results.errors.push(`Row ${i}: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    }

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "SCHOLARSHIP_IMPORT", entity: "Scholarship",
      newValue: { imported: results.created, duplicates: results.duplicates, total: results.total },
    });

    return success(results, results.errors.length > 0 ? 207 : 201);
  } catch {
    return error("Failed to import scholarships", 500);
  }
}
