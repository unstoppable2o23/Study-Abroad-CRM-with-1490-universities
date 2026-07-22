import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized, error } from "@/lib/api-response";
import { getAIProvider } from "@/lib/ai";
import { logAIUsage } from "@/lib/ai/prompt-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: {
        preferredCountryRef: { select: { name: true } },
        entranceExams: { select: { examType: true, score: true } },
      },
    });
    if (!student) return error("Profile not found. Complete registration first.", 404);

    const tenthPct = student.tenthPercentage ?? null;
    const twelfthPct = student.twelfthPercentage ?? null;
    const graduationPct = student.graduationPercentage ?? null;
    const preferredCountry = student.preferredCountryRef?.name || student.preferredCountry || null;
    const interests = student.interests || [];
    const hobbies = student.hobbies || [];

    const careers = await prisma.career.findMany({
      where: { isActive: true, deletedAt: null, status: "PUBLISHED" },
      select: { id: true, name: true, industry: true, skills: true, minEducation: true, eligibility: true, futureScope: true, salaryTrends: true, recruiters: true, roadmap: true },
    });

    const provider = getAIProvider();
    const start = Date.now();

    const profileSummary = [
      `10th Percentage: ${tenthPct ?? "Not provided"}`,
      `12th Percentage: ${twelfthPct ?? "Not provided"}`,
      `Graduation Percentage: ${graduationPct ?? "Not provided"}`,
      `Preferred Study Country: ${preferredCountry ?? "Not specified"}`,
      `Interests: ${interests.length ? interests.join(", ") : "None specified"}`,
      `Hobbies: ${hobbies.length ? hobbies.join(", ") : "None specified"}`,
    ].join("\n");

    const response = await provider.complete({
      messages: [
        { role: "system", content: `You are a career guidance counselor. Given a student's academic profile and a list of available careers, recommend the 5-8 most suitable careers and generate a personalized step-by-step roadmap for each.

Available careers:
${JSON.stringify(careers.map(c => ({ id: c.id, name: c.name, industry: c.industry, skills: c.skills, minEducation: c.minEducation })), null, 2)}

Return a JSON object with:
{
  "recommendations": [
    {
      "careerId": "career-uuid",
      "careerName": "Career Name",
      "matchScore": 85,
      "whyMatch": "Brief explanation of why this career fits the student's profile",
      "roadmap": [
        { "step": 1, "title": "Short step title", "description": "Detailed description of what to do", "timeline": "e.g. Grades 11-12" }
      ]
    }
  ]
}

Each career should have 4-8 roadmap steps covering education path, skill development, gaining experience, and job preparation. Tailor the roadmap based on the student's current academic level and preferred country.` },
        { role: "user", content: `Student Profile:\n${profileSummary}\n\nPlease recommend suitable careers with personalized roadmaps.` },
      ],
      temperature: 0.4,
    });

    await logAIUsage({
      userId: user.userId,
      feature: "CAREER_ROADMAP",
      provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
      model: process.env.AI_MODEL,
      durationMs: Date.now() - start,
      metadata: { type: "personalized-career-roadmap" },
    });

    let parsed;
    try {
      parsed = JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
    } catch {
      return success({
        recommendations: careers.slice(0, 5).map(c => ({
          careerId: c.id,
          careerName: c.name,
          matchScore: 50,
          whyMatch: "Based on general career fit",
          roadmap: Array.isArray(c.roadmap) ? c.roadmap : [
            { step: 1, title: "Complete your education", description: "Focus on your current studies to build a strong foundation.", timeline: "Current" },
            { step: 2, title: "Research career paths", description: "Explore this career field to understand requirements.", timeline: "Next 6 months" },
            { step: 3, title: "Develop relevant skills", description: "Build skills needed for this career path.", timeline: "1-2 years" },
          ],
        })),
      });
    }

    return success(parsed.recommendations || []);
  } catch (e) {
    return error("Failed to generate career roadmap: " + (e instanceof Error ? e.message : ""), 500);
  }
}
