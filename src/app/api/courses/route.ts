import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const countryId = url.searchParams.get("countryId");
    const universityId = url.searchParams.get("universityId");
    const level = url.searchParams.get("level");
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: any = { deletedAt: null };
    if (countryId) where.countryId = countryId;
    if (universityId) where.universityId = universityId;
    if (level) where.level = level;
    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = { not: "DISABLED" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          country: { select: { id: true, name: true, code: true } },
          university: { select: { id: true, name: true, logoUrl: true, city: true } },
          categoryRef: { select: { id: true, name: true, slug: true } },
          careers: { select: { id: true, name: true } },
          universityCourses: {
            include: {
              university: { select: { id: true, name: true, logoUrl: true, city: true, countryId: true, feeStructure: true } },
            },
          },
          _count: { select: { universityCourses: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return error("Failed to fetch courses", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "courses:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, code, level, category, categoryId, description, duration, skills, tuitionFeeMin, tuitionFeeMax, currency, countryId, universityId, eligibility, requirements, careerOutcomes, popularIn, entranceExams, languageRequirements, status } = body;

    if (!name || !level || !category) return error("Name, level, and category are required", 400);
    if (!countryId) return error("Country is required", 400);

    const normalizedName = slugify(name);

    const course = await prisma.course.create({
      data: {
        name, code, level, category, categoryId: categoryId || null,
        description, duration,
        skills: skills || [],
        tuitionFeeMin: tuitionFeeMin ? parseFloat(tuitionFeeMin) : null,
        tuitionFeeMax: tuitionFeeMax ? parseFloat(tuitionFeeMax) : null,
        currency, countryId, universityId: universityId || null,
        eligibility: eligibility || undefined,
        requirements: requirements || undefined,
        careerOutcomes: careerOutcomes || undefined,
        popularIn: popularIn || [],
        entranceExams: entranceExams || [],
        languageRequirements: languageRequirements || undefined,
        status: status || "PUBLISHED",
        normalizedName,
        importSource: universityId ? "MANUAL" : "MANUAL",
      },
    });

    if (universityId) {
      await prisma.universityCourse.create({
        data: { universityId, courseId: course.id, isActive: true },
      });
    }

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COURSE_CREATED", entity: "Course", entityId: course.id,
      newValue: { name, level, category, universityId },
    });

    return success(course, 201);
  } catch {
    return error("Failed to create course", 500);
  }
}
