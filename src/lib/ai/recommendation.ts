import { prisma } from "@/lib/prisma";
import { getAIProvider } from "./index";
import { completeWithTemplate, logAIUsage } from "./prompt-service";

interface UniversityRecommendationInput {
  userId: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  graduationCGPA?: number;
  examScores?: Record<string, number>;
  budget?: number;
  preferredCountries?: string[];
  preferredCourses?: string[];
  careerInterests?: string[];
  psychometricResults?: Record<string, unknown>;
}

interface CareerRecommendationInput {
  userId: string;
  academicProfile?: string;
  interests?: string[];
  favoriteSubjects?: string[];
  skills?: string[];
  psychometricResults?: Record<string, unknown>;
}

export async function getUniversityRecommendations(input: UniversityRecommendationInput) {
  const universities = await prisma.university.findMany({
    where: { status: "PUBLISHED", visibility: "GLOBAL" },
    include: {
      country: { select: { name: true } },
      universityCourses: { include: { course: { select: { name: true } } }, take: 5 },
    },
  });

  const provider = getAIProvider();
  const start = Date.now();

  const universityList = universities.map(u => ({
    id: u.id,
    name: u.name,
    country: u.country?.name || "Unknown",
    ranking: u.ranking,
    courses: u.universityCourses.map(c => c.course.name).slice(0, 5),
  }));

  const response = await provider.complete({
    messages: [
      { role: "system", content: `You are a study abroad counselor. Recommend universities from the following list based on the student's profile.

Available universities:
${JSON.stringify(universityList, null, 2)}

Return a JSON object with categories: dreamUniversities, bestFitUniversities, safeUniversities, scholarshipFriendly, highROI.
Each category is an array of { universityId, universityName, confidenceScore (0-100), explanation }.
Also include a summary field.` },
      { role: "user", content: `Student profile:
${JSON.stringify(input, null, 2)}

Please recommend universities based on this profile.` },
    ],
    temperature: 0.3,
  });

  await logAIUsage({
    userId: input.userId,
    feature: "RECOMMENDATION",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    durationMs: Date.now() - start,
    metadata: { type: "university-recommendation" },
  });

  try {
    const parsed = JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
    return parsed;
  } catch {
    return { summary: response.content, dreamUniversities: [], bestFitUniversities: [], safeUniversities: [], scholarshipFriendly: [], highROI: [] };
  }
}

export async function getCareerRecommendations(input: CareerRecommendationInput) {
  const careers = await prisma.career.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true, industry: true, skills: true, minEducation: true, salaryTrends: true, futureScope: true },
  });

  const provider = getAIProvider();
  const start = Date.now();

  const response = await provider.complete({
    messages: [
      { role: "system", content: `You are a career guidance counselor. Recommend careers from the following list based on the student's profile.

Available careers:
${JSON.stringify(careers, null, 2)}

Return a JSON object with: careerOptions (array of { careerId, careerName, matchScore 0-100, explanation }), recommendedDegrees (array of strings), certifications (array of strings), roadmap (array of steps), futureScope (string).` },
      { role: "user", content: `Student profile:
${JSON.stringify(input, null, 2)}

Please recommend careers based on this profile.` },
    ],
    temperature: 0.3,
  });

  await logAIUsage({
    userId: input.userId,
    feature: "RECOMMENDATION",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    durationMs: Date.now() - start,
  });

  try {
    return JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
  } catch {
    return { careerOptions: [], recommendedDegrees: [], certifications: [], roadmap: [], futureScope: response.content };
  }
}
