import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface ExamRecord {
  name: string;
  shortName: string;
  level: string;
  conductingBody: string;
  websiteUrl: string;
  tags: string;
}

function parseBlock(lines: string[]): ExamRecord[] {
  const result: ExamRecord[] = [];

  const sections: string[][] = [];
  let current: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "" || line === "\f") {
      if (current.length > 0) {
        sections.push(current);
        current = [];
      }
      continue;
    }

    const lower = line.toLowerCase();
    if (lower === "name" || lower === "short_name" || lower === "level" ||
        lower === "conducting_body" || lower === "website_url" || lower === "tags") {
      if (current.length > 0) {
        sections.push(current);
        current = [];
      }
      continue;
    }

    current.push(line);
  }
  if (current.length > 0) sections.push(current);

  if (sections.length < 3) return result;

  const names = sections[0];
  const shortLevel = sections[1];
  const rest = sections.slice(2);

  let shortNames: string[] = [];
  let levels: string[] = [];

  const allUG = shortLevel.every((s) => s.toUpperCase() === "UG" || s.toUpperCase() === "PG");
  if (allUG) {
    levels = shortLevel;
    shortNames = rest[0] || [];
    const afterSN = rest.slice(1);
    if (afterSN.length >= 2) {
      const bodies = afterSN[0];
      const urls = afterSN[1];
      const tags = afterSN[2] || [];
      for (let i = 0; i < names.length; i++) {
        result.push({
          name: names[i] || `Unknown ${i}`,
          shortName: shortNames[i] || "",
          level: levels[i] || "UG",
          conductingBody: bodies[i] || "",
          websiteUrl: urls[i] || "",
          tags: tags[i] || shortNames[i] || "",
        });
      }
    }
  } else {
    for (let i = 0; i < shortLevel.length; i += 2) {
      shortNames.push(shortLevel[i]);
      levels.push(shortLevel[i + 1] || "UG");
    }
    if (rest.length >= 2) {
      const bodies = rest[0];
      const urls = rest[1];
      const tags = rest[2] || [];
      for (let i = 0; i < names.length; i++) {
        result.push({
          name: names[i] || `Unknown ${i}`,
          shortName: shortNames[i] || "",
          level: levels[i] || "UG",
          conductingBody: bodies[i] || "",
          websiteUrl: urls[i] || "",
          tags: tags[i] || shortNames[i] || "",
        });
      }
    }
  }

  return result;
}

async function main() {
  const text = fs.readFileSync(path.join(process.cwd(), "Exams Master71.txt"), "utf-8");

  const rawBlocks = text.split("\f").map((b) => b.trim()).filter(Boolean);
  const allExams: ExamRecord[] = [];

  for (const raw of rawBlocks) {
    const lines = raw.split("\n");
    const parsed = parseBlock(lines);
    allExams.push(...parsed);
  }

  console.log(`Parsed ${allExams.length} exam types total`);

  await prisma.examType.deleteMany();
  console.log("Deleted existing exam types");

  for (const exam of allExams) {
    const existing = await prisma.examType.findFirst({
      where: { OR: [{ name: exam.name }, { code: exam.shortName }] },
    });
    if (existing) {
      await prisma.examType.update({
        where: { id: existing.id },
        data: {
          name: exam.name,
          code: exam.shortName || existing.code,
          description: exam.conductingBody || existing.description,
          isActive: true,
        },
      });
    } else {
      await prisma.examType.create({
        data: {
          name: exam.name,
          code: exam.shortName,
          description: exam.conductingBody,
          isActive: true,
        },
      });
    }
  }

  console.log(`Imported ${allExams.length} exam types`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
