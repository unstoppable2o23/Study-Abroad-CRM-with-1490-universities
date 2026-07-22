import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "reports:read"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { type, format } = body;

    if (!type || !format) return error("type and format are required", 400);
    if (!["csv", "json"].includes(format)) return error("Format must be csv or json", 400);

    let data: Record<string, unknown>[] = [];
    let filename = "";

    switch (type) {
      case "students": {
        filename = "students-export";
        const students = await prisma.student.findMany({
          where: format === "csv" ? { organizationId: user.organizationId, deletedAt: null } : undefined,
        });
        data = students.map(s => ({
          id: s.id, fullName: s.fullName, email: s.email, mobile: s.mobile,
          country: s.country, status: s.status, gender: s.gender,
          preferredCountry: s.preferredCountry, preferredCourse: s.preferredCourse,
          createdAt: s.createdAt.toISOString(),
        }));
        break;
      }
      case "universities": {
        filename = "universities-export";
        const universities = await prisma.university.findMany({
          where: { deletedAt: null },
          include: { country: { select: { name: true } } },
        });
        data = universities.map(u => ({
          id: u.id, name: u.name, country: u.country?.name, city: u.city,
          ranking: u.ranking, website: u.website, status: u.status,
        }));
        break;
      }
      case "courses": {
        filename = "courses-export";
        const courses = await prisma.course.findMany({
          where: { deletedAt: null },
          include: { country: { select: { name: true } } },
        });
        data = courses.map(c => ({
          id: c.id, name: c.name, level: c.level, category: c.category,
          country: c.country?.name, duration: c.duration, status: c.status,
        }));
        break;
      }
      case "applications": {
        filename = "applications-export";
        const applications = await prisma.application.findMany({
          where: { deletedAt: null },
          include: { student: { select: { fullName: true } }, university: { select: { name: true } } },
        });
        data = applications.map(a => ({
          id: a.id, student: a.student.fullName, university: a.university.name,
          status: a.status, intake: a.intake, createdAt: a.createdAt.toISOString(),
          visaStatus: a.visaStatus,
        }));
        break;
      }
      case "careers": {
        filename = "careers-export";
        const careers = await prisma.career.findMany({ where: { deletedAt: null } });
        data = careers.map(c => ({
          id: c.id, name: c.name, industry: c.industry,
          minEducation: c.minEducation, skills: c.skills,
          isEmerging: c.isEmerging,
        }));
        break;
      }
      default:
        return error(`Invalid export type: ${type}`, 400);
    }

    if (format === "json") {
      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.json"`,
        },
      });
    }

    if (data.length === 0) return success({ message: "No data to export", count: 0 });

    const headers = Object.keys(data[0]);
    const csvLines = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(",")),
    ];

    return new Response(csvLines.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.csv"`,
      },
    });
  } catch {
    return error("Failed to generate export", 500);
  }
}
