import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "courses:create"); } catch { return forbidden(); }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error("CSV file is required", 400);

    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) return error("CSV must have a header row and at least one data row", 400);

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name") ?? headers.indexOf("course name") ?? headers.indexOf("course");
    const levelIdx = headers.indexOf("level");
    const categoryIdx = headers.indexOf("category");
    const descriptionIdx = headers.indexOf("description");
    const durationIdx = headers.indexOf("duration");
    const feesIdx = headers.indexOf("fees") ?? headers.indexOf("tuition fee") ?? headers.indexOf("tuition");
    const currencyIdx = headers.indexOf("currency");
    const skillsIdx = headers.indexOf("skills");
    const countryIdx = headers.indexOf("country") ?? headers.indexOf("country code");

    if (nameIdx === -1 || levelIdx === -1 || categoryIdx === -1) {
      return error("CSV must contain at least 'name', 'level', and 'category' columns", 400);
    }

    const results = { total: 0, created: 0, skipped: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      results.total++;

      const name = cols[nameIdx];
      const level = cols[levelIdx];
      const category = cols[categoryIdx];
      if (!name || !level || !category) {
        results.errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      // Check for duplicates
      const existing = await prisma.course.findFirst({
        where: { name, level, deletedAt: null },
      });
      if (existing) {
        results.skipped++;
        continue;
      }

      const duration = descriptionIdx !== -1 ? cols[descriptionIdx] : undefined;
      const durationVal = durationIdx !== -1 ? cols[durationIdx] : undefined;
      const fees = feesIdx !== -1 ? parseFloat(cols[feesIdx]?.replace(/[^0-9.]/g, "")) : undefined;
      const currency = currencyIdx !== -1 ? cols[currencyIdx] : "USD";
      const skills = skillsIdx !== -1 ? cols[skillsIdx]?.split(";").map(s => s.trim()) : [];
      const countryCode = countryIdx !== -1 ? cols[countryIdx]?.toUpperCase() : undefined;

      let countryId = null;
      if (countryCode) {
        const country = await prisma.country.findUnique({ where: { code: countryCode } });
        if (country) countryId = country.id;
      }

      await prisma.course.create({
        data: {
          name, level, category,
          description: duration,
          duration: durationVal,
          tuitionFeeMin: fees,
          tuitionFeeMax: fees ? fees * 1.2 : null,
          currency,
          skills,
          countryId: countryId || (await prisma.country.findFirst())!.id,
          normalizedName: name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " "),
          status: "PENDING_REVIEW",
          importSource: "CSV",
        },
      });
      results.created++;
    }

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COURSE_IMPORT", entity: "Course",
      newValue: { imported: results.created, skipped: results.skipped, total: results.total },
    });

    return success(results, 201);
  } catch (e) {
    return error("Failed to import courses: " + (e instanceof Error ? e.message : "unknown error"), 500);
  }
}
