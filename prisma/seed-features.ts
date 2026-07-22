import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const features = [
    { key: "universities", name: "Universities", description: "Browse and search universities", module: "STUDENT", isDefault: true },
    { key: "courses", name: "Courses", description: "Browse courses and programs", module: "STUDENT", isDefault: true },
    { key: "careers", name: "Careers", description: "Career guidance and roadmap", module: "STUDENT", isDefault: true },
    { key: "psychometric-tests", name: "Psychometric Tests", description: "Take assigned psychometric tests", module: "STUDENT", isDefault: true },
    { key: "documents", name: "Documents", description: "Upload and manage documents", module: "STUDENT", isDefault: true },
    { key: "applications", name: "Applications", description: "Apply to universities", module: "STUDENT", isDefault: true },
    { key: "ai-search", name: "AI Search", description: "AI-powered search assistant", module: "STUDENT", isDefault: false },
    { key: "exam-types", name: "Exam Types", description: "Browse entrance exam information", module: "STUDENT", isDefault: true },
    { key: "technology", name: "Technology", description: "Technology resources", module: "STUDENT", isDefault: false },
  ];

  for (const f of features) {
    await prisma.feature.upsert({
      where: { key: f.key },
      update: { name: f.name, description: f.description, module: f.module, isDefault: f.isDefault },
      create: f,
    });
  }

  console.log(`${features.length} features seeded`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
