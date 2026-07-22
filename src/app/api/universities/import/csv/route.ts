import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

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
    const results = { total: 0, created: 0, duplicates: 0, errors: 0, errors_list: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      results.total++;
      try {
        const values = lines[i].split(",").map(v => v.trim().replace(/['"]/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

        const name = row["name"] || row["university name"] || row["university"];
        const countryName = row["country"];
        const city = row["city"] || row["state"] || "";

        if (!name || !countryName) {
          results.errors++;
          results.errors_list.push(`Row ${i}: Missing name or country`);
          continue;
        }

        const country = await prisma.country.findFirst({
          where: { OR: [{ name: { contains: countryName, mode: "insensitive" } }, { code: { contains: countryName, mode: "insensitive" } }] },
        });
        if (!country) {
          results.errors++;
          results.errors_list.push(`Row ${i}: Country "${countryName}" not found`);
          continue;
        }

        const normalizedName = slugify(name);

        const existing = await prisma.university.findFirst({
          where: { normalizedName, countryId: country.id, deletedAt: null },
        });
        if (existing) {
          results.duplicates++;
          continue;
        }

        const website = row["website"] || undefined;
        const websiteExisting = website ? await prisma.university.findFirst({
          where: { website: { contains: website.replace(/https?:\/\//, "").replace(/\/.*$/, ""), mode: "insensitive" }, countryId: country.id, deletedAt: null },
        }) : null;
        if (websiteExisting) {
          results.duplicates++;
          continue;
        }

        const ranking = row["ranking"] || row["rank"] || undefined;
        const description = row["description"] || row["about"] || undefined;
        const applicationFee = row["application fee"] || row["fee"] || undefined;

        await prisma.university.create({
          data: {
            name,
            countryId: country.id,
            city: city || undefined,
            description: description || undefined,
            website: website || undefined,
            ranking: ranking ? parseInt(ranking) : null,
            status: "PENDING_REVIEW",
            normalizedName,
            intakePeriods: [],
          },
        });

        results.created++;
      } catch (e: any) {
        results.errors++;
        results.errors_list.push(`Row ${i}: ${e.message}`);
      }
    }

    return success(results, results.errors > 0 ? 207 : 201);
  } catch {
    return error("Failed to process CSV import", 500);
  }
}
