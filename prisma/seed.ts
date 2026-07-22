import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { countries } from "./data/countries";
import { universities } from "./data/universities";
import { globalCourses } from "./data/courses";
import { careers } from "./data/careers";
import { scholarships } from "./data/scholarships";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateWebsite(name: string, countryCode: string): string {
  const slug = slugify(name);
  // Try to infer common domain patterns
  if (name.includes("MIT") || name.includes("Massachusetts Institute")) return "https://mit.edu";
  if (name.includes("Harvard")) return "https://harvard.edu";
  if (name.includes("Stanford")) return "https://stanford.edu";
  if (name.includes("Caltech") || name.includes("California Institute")) return "https://caltech.edu";
  if (name.includes("Oxford")) return "https://ox.ac.uk";
  if (name.includes("Cambridge")) return "https://cam.ac.uk";
  if (name.includes("Imperial")) return "https://imperial.ac.uk";
  if (name.includes("UCL") || name.includes("University College London")) return "https://ucl.ac.uk";
  if (name.includes("ETH")) return "https://ethz.ch";
  if (name.includes("NUS") || name.includes("National University of Singapore")) return "https://nus.edu.sg";
  if (name.includes("Tsinghua")) return "https://tsinghua.edu.cn";
  if (name.includes("Peking")) return "https://pku.edu.cn";
  if (name.includes("Tokyo") && name.includes("University")) return "https://u-tokyo.ac.jp";
  if (name.includes("Seoul National")) return "https://snu.ac.kr";
  if (name.includes("KAIST")) return "https://kaist.ac.kr";
  if (name.includes("Delft")) return "https://tudelft.nl";
  if (name.includes("KU Leuven")) return "https://kuleuven.be";
  if (name.includes("Trinity College")) return "https://tcd.ie";
  if (name.includes("University of Melbourne")) return "https://unimelb.edu.au";
  if (name.includes("University of Sydney")) return "https://sydney.edu.au";
  if (name.includes("University of Toronto")) return "https://utoronto.ca";
  if (name.includes("McGill")) return "https://mcgill.ca";
  if (name.includes("UBC") || name.includes("University of British Columbia")) return "https://ubc.ca";
  if (name.includes("ANU") || name.includes("Australian National")) return "https://anu.edu.au";
  if (name.includes("Monash")) return "https://monash.edu";
  if (name.includes("TU Munich") || name.includes("Technical University of Munich")) return "https://tum.de";
  if (name.includes("LMU")) return "https://lmu.de";
  if (name.includes("Heidelberg")) return "https://uni-heidelberg.de";
  if (name.includes("IIT")) return "https://iit.edu";
  if (name.includes("IISc")) return "https://iisc.ac.in";
  // Default pattern: university-name.edu or .ac.{country}
  const tld = countryCode === "US" ? "edu" : countryCode === "GB" ? "ac.uk" : "edu";
  return `https://${slug}.${tld}`;
}

function generateLogoUrl(name: string): string {
  // Use ui-avatars.com to generate colored avatar with initials
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&size=200&rounded=true`;
}

// Part 3 — Seed functions
async function seedRoles() {
  const roleNames = [
    "SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT", "PARENT",
  ] as const;
  const records: Record<string, string> = {};
  for (const name of roleNames) {
    const record = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name.replace(/_/g, " ")} role`, isSystem: true },
    });
    records[name] = record.id;
  }
  console.log(`${roleNames.length} roles created`);
  return records;
}

async function seedPermissions(roles: Record<string, string>) {
  const allPermissions: { name: string; description: string; module: string; roles: string[] }[] = [
    { name: "View Students", description: "View student profiles", module: "students", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"] },
    { name: "Create Students", description: "Create student profiles", module: "students", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"] },
    { name: "Edit Students", description: "Update student profiles", module: "students", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"] },
    { name: "Delete Students", description: "Delete student profiles", module: "students", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "View Applications", description: "View applications", module: "applications", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Create Applications", description: "Create applications", module: "applications", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Edit Applications", description: "Update applications", module: "applications", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"] },
    { name: "Delete Applications", description: "Delete applications", module: "applications", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "View Universities", description: "View university profiles", module: "universities", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Create Universities", description: "Create university profiles", module: "universities", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Edit Universities", description: "Update university profiles", module: "universities", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Delete Universities", description: "Delete university profiles", module: "universities", roles: ["SUPER_ADMIN"] },
    { name: "View Courses", description: "View courses", module: "courses", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Create Courses", description: "Create courses", module: "courses", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Edit Courses", description: "Update courses", module: "courses", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Delete Courses", description: "Delete courses", module: "courses", roles: ["SUPER_ADMIN"] },
    { name: "View Careers", description: "View careers", module: "careers", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Create Careers", description: "Create careers", module: "careers", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Edit Careers", description: "Update careers", module: "careers", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Delete Careers", description: "Delete careers", module: "careers", roles: ["SUPER_ADMIN"] },
    { name: "Manage Organizations", description: "Manage organizations", module: "organizations", roles: ["SUPER_ADMIN"] },
    { name: "Manage Users", description: "Manage users", module: "users", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "View Documents", description: "View documents", module: "documents", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Upload Documents", description: "Upload documents", module: "documents", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Verify Documents", description: "Verify documents", module: "documents", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Delete Documents", description: "Delete documents", module: "documents", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Manage Exams", description: "Manage entrance exams", module: "exams", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"] },
    { name: "Manage Psychometric Tests", description: "Manage psychometric tests", module: "psychometric", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR"] },
    { name: "View Reports", description: "View reports and analytics", module: "reports", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Access AI Tools", description: "Access AI-powered tools", module: "ai", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT"] },
    { name: "Manage Settings", description: "Manage system settings", module: "settings", roles: ["SUPER_ADMIN"] },
    { name: "View Audit Log", description: "View audit log", module: "audit", roles: ["SUPER_ADMIN"] },
    { name: "Manage Notifications", description: "Manage notification templates", module: "notifications", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Bulk Import", description: "Bulk import data", module: "bulk", roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Manage Sync", description: "Manage synchronization jobs", module: "sync", roles: ["SUPER_ADMIN"] },
    { name: "View Own Profile", description: "View own profile", module: "profile", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT", "PARENT"] },
    { name: "Edit Own Profile", description: "Edit own profile", module: "profile", roles: ["SUPER_ADMIN", "ADMIN", "COUNSELOR", "STUDENT", "PARENT"] },
  ];

  let count = 0;
  for (const perm of allPermissions) {
    const existing = await prisma.permission.findUnique({ where: { name: perm.name } });
    if (existing) {
      // Ensure role-permission links exist
      for (const roleName of perm.roles) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: roles[roleName], permissionId: existing.id } },
          update: {},
          create: { roleId: roles[roleName], permissionId: existing.id },
        });
      }
      continue;
    }
    const record = await prisma.permission.create({
      data: { name: perm.name, description: perm.description, module: perm.module },
    });
    for (const roleName of perm.roles) {
      await prisma.rolePermission.create({
        data: { roleId: roles[roleName], permissionId: record.id },
      });
    }
    count++;
  }
  console.log(`${count} permissions created, ${allPermissions.length} total defined`);
}

async function seedExamTypes() {
  const examTypes = [
    { name: "IELTS", code: "ielts", description: "International English Language Testing System", minScore: 0, maxScore: 9, scoreUnit: "Band" },
    { name: "TOEFL", code: "toefl", description: "Test of English as a Foreign Language", minScore: 0, maxScore: 120, scoreUnit: "Points" },
    { name: "PTE", code: "pte", description: "Pearson Test of English Academic", minScore: 10, maxScore: 90, scoreUnit: "Points" },
    { name: "GRE", code: "gre", description: "Graduate Record Examination", minScore: 260, maxScore: 340, scoreUnit: "Points" },
    { name: "GMAT", code: "gmat", description: "Graduate Management Admission Test", minScore: 200, maxScore: 800, scoreUnit: "Points" },
    { name: "SAT", code: "sat", description: "Scholastic Assessment Test", minScore: 400, maxScore: 1600, scoreUnit: "Points" },
    { name: "ACT", code: "act", description: "American College Testing", minScore: 1, maxScore: 36, scoreUnit: "Composite Score" },
    { name: "MCAT", code: "mcat", description: "Medical College Admission Test", minScore: 472, maxScore: 528, scoreUnit: "Points" },
    { name: "LSAT", code: "lsat", description: "Law School Admission Test", minScore: 120, maxScore: 180, scoreUnit: "Points" },
    { name: "Duolingo English Test", code: "duolingo", description: "Duolingo English Test", minScore: 10, maxScore: 160, scoreUnit: "Points" },
  ];

  let count = 0;
  for (const exam of examTypes) {
    await prisma.examType.upsert({
      where: { code: exam.code },
      update: {},
      create: exam,
    });
    count++;
  }
  console.log(`${count} exam types created`);
}

async function seedCourseCategories() {
  const categories = [
    { name: "Computer Science & IT", slug: "computer-science-it", description: "Computer Science, Information Technology, and related fields" },
    { name: "Business & Management", slug: "business-management", description: "Business Administration, Management, and related fields" },
    { name: "Engineering", slug: "engineering", description: "All engineering disciplines" },
    { name: "Medicine & Health Sciences", slug: "medicine-health", description: "Medicine, Nursing, Pharmacy, and Health Sciences" },
    { name: "Natural Sciences", slug: "natural-sciences", description: "Physics, Chemistry, Biology, Mathematics, and related fields" },
    { name: "Social Sciences & Humanities", slug: "social-sciences-humanities", description: "Sociology, Psychology, History, Philosophy, and related fields" },
    { name: "Law", slug: "law", description: "Law and Legal Studies" },
    { name: "Arts & Design", slug: "arts-design", description: "Fine Arts, Design, Architecture, and Creative Arts" },
    { name: "Education", slug: "education", description: "Teaching, Education, and related fields" },
    { name: "Agriculture & Environmental Sciences", slug: "agriculture-environmental", description: "Agriculture, Forestry, Environmental Science" },
    // Part 10 — Extended course categories
    { name: "Data Science", slug: "data-science", description: "Data Science, Analytics, and Big Data" },
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Artificial Intelligence, Machine Learning, and Intelligent Systems" },
    { name: "Cyber Security", slug: "cyber-security", description: "Cyber Security, Information Security, and Network Defense" },
    { name: "Finance", slug: "finance", description: "Finance, Investment, and Financial Engineering" },
    { name: "Commerce", slug: "commerce", description: "Commerce, Trade, and Business Economics" },
  ];

  let count = 0;
  for (const cat of categories) {
    await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    count++;
  }
  console.log(`${count} course categories created`);
}

async function seedCareerCategories() {
  const categories = [
    { name: "Technology & IT", slug: "technology-it", description: "Software, AI, Data, Cybersecurity, and IT careers" },
    { name: "Engineering", slug: "engineering", description: "Mechanical, Electrical, Civil, and other engineering disciplines" },
    { name: "Medical & Healthcare", slug: "medical-healthcare", description: "Doctors, Nurses, Pharmacists, and healthcare professionals" },
    { name: "Business & Management", slug: "business-management", description: "Consulting, Finance, Marketing, and Management careers" },
    { name: "Science & Research", slug: "science-research", description: "Research scientists, environmental scientists, and academia" },
    { name: "Design & Creative", slug: "design-creative", description: "UX/UI, graphic design, architecture, and creative arts" },
    { name: "Law & Legal", slug: "law-legal", description: "Corporate law, legal tech, and compliance" },
    { name: "Education", slug: "education", description: "Teaching, educational leadership, and EdTech" },
    { name: "Finance & Commerce", slug: "finance-commerce", description: "Investment banking, financial analysis, and accounting" },
    { name: "Emerging Fields", slug: "emerging-fields", description: "Robotics, sustainability, blockchain, and future-focused careers" },
  ];

  let count = 0;
  const catMap = new Map<string, string>();
  for (const cat of categories) {
    const record = await prisma.careerCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    catMap.set(cat.slug, record.id);
    count++;
  }
  console.log(`${count} career categories created`);
  return catMap;
}

async function seedAssessmentQuestions() {
  const questions = [
    // Interest assessment
    { category: "INTEREST", questionText: "How much do you enjoy solving complex problems with code?", questionType: "RATING", order: 1, weight: 1.0, careerCategory: "Technology & IT" },
    { category: "INTEREST", questionText: "How interested are you in understanding how machines and systems work?", questionType: "RATING", order: 2, weight: 1.0, careerCategory: "Engineering" },
    { category: "INTEREST", questionText: "How passionate are you about helping people improve their health?", questionType: "RATING", order: 3, weight: 1.0, careerCategory: "Medical & Healthcare" },
    { category: "INTEREST", questionText: "How much do you enjoy leading teams and making strategic decisions?", questionType: "RATING", order: 4, weight: 1.0, careerCategory: "Business & Management" },
    { category: "INTEREST", questionText: "How curious are you about discovering new knowledge through research?", questionType: "RATING", order: 5, weight: 1.0, careerCategory: "Science & Research" },
    { category: "INTEREST", questionText: "How much do you enjoy creating visual designs and user experiences?", questionType: "RATING", order: 6, weight: 1.0, careerCategory: "Design & Creative" },
    { category: "INTEREST", questionText: "How interested are you in the legal system and justice?", questionType: "RATING", order: 7, weight: 1.0, careerCategory: "Law & Legal" },
    { category: "INTEREST", questionText: "How much do you enjoy teaching and mentoring others?", questionType: "RATING", order: 8, weight: 1.0, careerCategory: "Education" },
    { category: "INTEREST", questionText: "How interested are you in financial markets and investments?", questionType: "RATING", order: 9, weight: 1.0, careerCategory: "Finance & Commerce" },

    // Skills assessment
    { category: "SKILLS", questionText: "How would you rate your logical reasoning and analytical thinking?", questionType: "RATING", order: 10, weight: 1.0 },
    { category: "SKILLS", questionText: "How would you rate your communication and interpersonal skills?", questionType: "RATING", order: 11, weight: 1.0 },
    { category: "SKILLS", questionText: "How comfortable are you with mathematics and numerical analysis?", questionType: "RATING", order: 12, weight: 1.0 },
    { category: "SKILLS", questionText: "How would you rate your creativity and ability to think outside the box?", questionType: "RATING", order: 13, weight: 1.0 },
    { category: "SKILLS", questionText: "How strong are your leadership and teamwork abilities?", questionType: "RATING", order: 14, weight: 1.0 },
    { category: "SKILLS", questionText: "How proficient are you with computers and technology?", questionType: "RATING", order: 15, weight: 1.0 },
    { category: "SKILLS", questionText: "How would you rate your writing and documentation skills?", questionType: "RATING", order: 16, weight: 1.0 },

    // Personality assessment
    { category: "PERSONALITY", questionText: "Do you prefer working independently or in a team?", questionType: "MCQ", options: [{ label: "Strongly prefer independent", value: 1 }, { label: "Somewhat prefer independent", value: 2 }, { label: "No preference", value: 3 }, { label: "Somewhat prefer team", value: 4 }, { label: "Strongly prefer team", value: 5 }], order: 17, weight: 1.0 },
    { category: "PERSONALITY", questionText: "Do you prefer structured routines or dynamic environments?", questionType: "MCQ", options: [{ label: "Strongly prefer routine", value: 1 }, { label: "Somewhat prefer routine", value: 2 }, { label: "No preference", value: 3 }, { label: "Somewhat prefer dynamic", value: 4 }, { label: "Strongly prefer dynamic", value: 5 }], order: 18, weight: 1.0 },
    { category: "PERSONALITY", questionText: "Are you more detail-oriented or big-picture focused?", questionType: "MCQ", options: [{ label: "Very detail-oriented", value: 1 }, { label: "Somewhat detail-oriented", value: 2 }, { label: "Balanced", value: 3 }, { label: "Somewhat big-picture", value: 4 }, { label: "Very big-picture", value: 5 }], order: 19, weight: 1.0 },

    // Aptitude assessment
    { category: "APTITUDE", questionText: "When faced with a problem, do you usually find a solution quickly?", questionType: "MCQ", options: [{ label: "Almost never", value: 1 }, { label: "Rarely", value: 2 }, { label: "Sometimes", value: 3 }, { label: "Often", value: 4 }, { label: "Almost always", value: 5 }], order: 20, weight: 1.0 },
    { category: "APTITUDE", questionText: "How quickly do you learn new software or tools?", questionType: "RATING", order: 21, weight: 1.0 },
    { category: "APTITUDE", questionText: "How effective are you at managing multiple tasks and deadlines?", questionType: "RATING", order: 22, weight: 1.0 },
  ];

  let count = 0;
  await prisma.careerAssessmentQuestion.deleteMany({});
  for (const q of questions) {
    await prisma.careerAssessmentQuestion.create({ data: { ...q, options: q.options || undefined } });
    count++;
  }
  console.log(`${count} assessment questions created`);
}

async function seedPsychometricTests() {
  const existing = await prisma.psychometricTest.count();
  if (existing > 0) { console.log("Psychometric tests already seeded"); return; }

  // Interest Assessment Test
  const interestTest = await prisma.psychometricTest.create({
    data: {
      title: "Career Interest Assessment",
      description: "Discover your career interests across different fields",
      type: "INTEREST",
      timeLimit: 15,
      instructions: "Rate each activity based on how much you would enjoy it. There are no right or wrong answers.",
      scoringConfig: { rules: [{ category: "TECHNOLOGY", weight: 1 }, { category: "BUSINESS", weight: 1 }, { category: "CREATIVE", weight: 1 }, { category: "HELPING", weight: 1 }, { category: "RESEARCH", weight: 1 }] },
    },
  });
  await prisma.psychometricQuestion.createMany({
    data: [
      { testId: interestTest.id, question: "Write computer programs or software", options: [{ label: "Dislike", value: 1 }, { label: "Neutral", value: 3 }, { label: "Like", value: 5 }], category: "TECHNOLOGY", scoringRule: "RATING_SCALE", weight: 1, order: 0 },
      { testId: interestTest.id, question: "Lead a team to achieve business goals", options: [{ label: "Dislike", value: 1 }, { label: "Neutral", value: 3 }, { label: "Like", value: 5 }], category: "BUSINESS", scoringRule: "RATING_SCALE", weight: 1, order: 1 },
      { testId: interestTest.id, question: "Design visual content or user interfaces", options: [{ label: "Dislike", value: 1 }, { label: "Neutral", value: 3 }, { label: "Like", value: 5 }], category: "CREATIVE", scoringRule: "RATING_SCALE", weight: 1, order: 2 },
      { testId: interestTest.id, question: "Help people with their health and wellbeing", options: [{ label: "Dislike", value: 1 }, { label: "Neutral", value: 3 }, { label: "Like", value: 5 }], category: "HELPING", scoringRule: "RATING_SCALE", weight: 1, order: 3 },
      { testId: interestTest.id, question: "Conduct experiments or research new ideas", options: [{ label: "Dislike", value: 1 }, { label: "Neutral", value: 3 }, { label: "Like", value: 5 }], category: "RESEARCH", scoringRule: "RATING_SCALE", weight: 1, order: 4 },
    ],
  });

  // Personality Assessment Test
  const personalityTest = await prisma.psychometricTest.create({
    data: {
      title: "Work Personality Assessment",
      description: "Understand your working style and preferences",
      type: "PERSONALITY",
      timeLimit: 10,
      instructions: "Choose the option that best describes you in a work setting.",
      scoringConfig: { rules: [{ category: "TEAM", weight: 1 }, { category: "INDEPENDENT", weight: 1 }, { category: "STRUCTURED", weight: 1 }, { category: "CREATIVE", weight: 1 }] },
    },
  });
  await prisma.psychometricQuestion.createMany({
    data: [
      { testId: personalityTest.id, question: "I prefer working in a team rather than alone", options: [{ label: "Strongly Disagree", value: 1 }, { label: "Disagree", value: 2 }, { label: "Neutral", value: 3 }, { label: "Agree", value: 4 }, { label: "Strongly Agree", value: 5 }], category: "TEAM", scoringRule: "RATING_SCALE", weight: 1, order: 0 },
      { testId: personalityTest.id, question: "I like having clear instructions and structure", options: [{ label: "Strongly Disagree", value: 1 }, { label: "Disagree", value: 2 }, { label: "Neutral", value: 3 }, { label: "Agree", value: 4 }, { label: "Strongly Agree", value: 5 }], category: "STRUCTURED", scoringRule: "RATING_SCALE", weight: 1, order: 1 },
      { testId: personalityTest.id, question: "I enjoy coming up with new ideas and approaches", options: [{ label: "Strongly Disagree", value: 1 }, { label: "Disagree", value: 2 }, { label: "Neutral", value: 3 }, { label: "Agree", value: 4 }, { label: "Strongly Agree", value: 5 }], category: "CREATIVE", scoringRule: "RATING_SCALE", weight: 1, order: 2 },
      { testId: personalityTest.id, question: "I am comfortable taking initiative without direction", options: [{ label: "Strongly Disagree", value: 1 }, { label: "Disagree", value: 2 }, { label: "Neutral", value: 3 }, { label: "Agree", value: 4 }, { label: "Strongly Agree", value: 5 }], category: "INDEPENDENT", scoringRule: "RATING_SCALE", weight: 1, order: 3 },
    ],
  });

  // Aptitude Assessment
  const aptitudeTest = await prisma.psychometricTest.create({
    data: {
      title: "Logical Reasoning Assessment",
      description: "Test your analytical and problem-solving abilities",
      type: "APTITUDE",
      timeLimit: 20,
      instructions: "Each question has one correct answer. Choose the best option.",
      scoringConfig: { rules: [{ category: "LOGICAL", weight: 1 }, { category: "NUMERICAL", weight: 1 }, { category: "VERBAL", weight: 1 }] },
    },
  });
  await prisma.psychometricQuestion.createMany({
    data: [
      { testId: aptitudeTest.id, question: "Complete the sequence: 2, 6, 12, 20, ?", options: [{ label: "28", value: "28" }, { label: "30", value: "30" }, { label: "32", value: "32" }, { label: "36", value: "36" }], correctAnswer: "30", category: "NUMERICAL", scoringRule: "CORRECT_ANSWER", weight: 1, order: 0 },
      { testId: aptitudeTest.id, question: "If all A are B, and some B are C, which must be true?", options: [{ label: "All A are C", value: "all_a_c" }, { label: "Some A are C", value: "some_a_c" }, { label: "No conclusion can be drawn", value: "none" }, { label: "All C are A", value: "all_c_a" }], correctAnswer: "none", category: "LOGICAL", scoringRule: "CORRECT_ANSWER", weight: 1, order: 1 },
      { testId: aptitudeTest.id, question: "Choose the odd one out: Mercury, Mars, Moon, Venus", options: [{ label: "Mercury", value: "mercury" }, { label: "Mars", value: "mars" }, { label: "Moon", value: "moon" }, { label: "Venus", value: "venus" }], correctAnswer: "moon", category: "LOGICAL", scoringRule: "CORRECT_ANSWER", weight: 1, order: 2 },
      { testId: aptitudeTest.id, question: "A train travels 300 km in 5 hours. What is its speed in km/h?", options: [{ label: "50", value: "50" }, { label: "60", value: "60" }, { label: "70", value: "70" }, { label: "80", value: "80" }], correctAnswer: "60", category: "NUMERICAL", scoringRule: "CORRECT_ANSWER", weight: 1, order: 3 },
      { testId: aptitudeTest.id, question: "What does the word 'benevolent' mean?", options: [{ label: "Hostile", value: "hostile" }, { label: "Kind-hearted", value: "kind" }, { label: "Indifferent", value: "indifferent" }, { label: "Courageous", value: "courageous" }], correctAnswer: "kind", category: "VERBAL", scoringRule: "CORRECT_ANSWER", weight: 1, order: 4 },
    ],
  });

  console.log("3 psychometric tests created with questions");
}

const VISA_SEED_DATA: Record<string, { processes: any[]; documents: any[]; rejections: any[]; work: any[]; pr: any[] }> = {
  US: {
    processes: [
      { visaType: "STUDENT", name: "F-1 Student Visa", description: "For full-time students at accredited US institutions", timeline: "3-6 months before program start", fees: "$510 SEVIS + $185 visa fee", processingTime: "3-6 weeks", interviewRequired: true, biometricsRequired: true, healthInsurance: false, workAllowed: true, workHours: "20 hrs/week on campus", postStudyWork: "OPT: 12 months (STEM: 36 months)", dependentAllowed: true, applicationMethod: "DS-160 form + SEVIS payment + Interview" },
      { visaType: "WORK", name: "H-1B Work Visa", description: "For specialty occupations requiring bachelor's degree", timeline: "Varies (lottery-based)", fees: "$1,500-$4,000+", processingTime: "2-6 months (premium: 15 days)", interviewRequired: true, biometricsRequired: true, workAllowed: true, dependentAllowed: true, extensionsAvailable: true, extendsTo: "Up to 6 years" },
    ],
    documents: [
      { visaType: "STUDENT", name: "Valid Passport", description: "Must be valid for at least 6 months beyond stay", isMandatory: true, format: "ORIGINAL", order: 1 },
      { visaType: "STUDENT", name: "I-20 Form", description: "Issued by the US university", isMandatory: true, format: "ORIGINAL", order: 2 },
      { visaType: "STUDENT", name: "SEVIS Fee Receipt", description: "Payment confirmation of I-901 SEVIS fee", isMandatory: true, format: "PDF", order: 3 },
      { visaType: "STUDENT", name: "DS-160 Confirmation", description: "Online visa application confirmation page", isMandatory: true, format: "PDF", order: 4 },
      { visaType: "STUDENT", name: "Financial Evidence", description: "Bank statements showing sufficient funds for tuition + living", isMandatory: true, format: "ORIGINAL", order: 5 },
      { visaType: "STUDENT", name: "Academic Transcripts", description: "All previous academic records", isMandatory: true, format: "ORIGINAL", order: 6 },
      { visaType: "STUDENT", name: "Test Scores", description: "TOEFL/IELTS, GRE/GMAT as applicable", isMandatory: true, format: "PDF", order: 7 },
      { visaType: "STUDENT", name: "Visa Photo", description: "2x2 inches, white background", isMandatory: true, format: "JPG", order: 8 },
    ],
    rejections: [
      { reason: "Insufficient financial documentation", description: "Unable to prove adequate funds for tuition and living", solution: "Provide detailed bank statements, loan approval letters, or sponsor documents. Ensure funds have been in account for at least 3 months.", frequency: "COMMON" },
      { reason: "Strong ties to home country not demonstrated", description: "VO doubts applicant will return after studies", solution: "Show family connections, property ownership, job offers, or other ties to home country.", frequency: "COMMON" },
      { reason: "Inconsistent or incomplete application", description: "DS-160 form has errors or missing information", solution: "Double-check all entries before submission. Be consistent across all documents.", frequency: "COMMON" },
      { reason: "Academic background mismatch", description: "Course chosen doesn't align with previous education", solution: "Clearly explain how the program fits your career goals and academic background.", frequency: "MODERATE" },
    ],
    work: [
      { name: "Optional Practical Training (OPT)", description: "Work authorization for F-1 students, available before or after graduation", duration: "12 months (STEM: 36 months)", eligibility: "Enrolled full-time for at least 1 academic year", applicationProcess: "Apply for EAD card through USCIS", salaryRange: "$40,000-$100,000+", workRights: "Any job related to field of study", pathwayToPR: true },
      { name: "Curricular Practical Training (CPT)", description: "Work experience that is integral to your curriculum", duration: "Varies (up to 12 months)", eligibility: "Enrolled for at least 1 academic year", applicationProcess: "Through university international office", pathwayToPR: false },
    ],
    pr: [
      { name: "Employment-Based Green Card (EB-2/EB-3)", description: "For skilled workers with employer sponsorship", eligibility: "Advanced degree or bachelor's + 5 years experience", process: "PERM labor certification → I-140 → Adjustment of Status", timeline: "1-3 years", pointsBased: false, minWorkExperience: 2, languageRequired: "English proficiency", investmentRequired: undefined },
      { name: "Diversity Visa Lottery", description: "Annual lottery for countries with low immigration rates", eligibility: "High school education or 2 years work experience", process: "Online entry during October-November", timeline: "1-2 years", pointsBased: false },
    ],
  },
  GB: {
    processes: [
      { visaType: "STUDENT", name: "Student Visa (formerly Tier 4)", description: "For students aged 16+ accepted into a UK course", timeline: "3 months before course start", fees: "£490 + £776/year healthcare surcharge", processingTime: "3-6 weeks", interviewRequired: false, biometricsRequired: true, healthInsurance: true, workAllowed: true, workHours: "20 hrs/week during term", postStudyWork: "Graduate Route: 2 years (3 years for PhD)", dependentAllowed: true, extensionsAvailable: true, extendsTo: "Graduate Route extension", applicationMethod: "Online application + biometrics appointment" },
    ],
    documents: [
      { visaType: "STUDENT", name: "Valid Passport", isMandatory: true, format: "ORIGINAL", order: 1 },
      { visaType: "STUDENT", name: "CAS (Confirmation of Acceptance for Studies)", description: "Unique reference number from UK university", isMandatory: true, format: "PDF", order: 2 },
      { visaType: "STUDENT", name: "Financial Evidence", description: "Funds for tuition + £1,334/month living (up to 9 months)", isMandatory: true, format: "PDF", order: 3 },
      { visaType: "STUDENT", name: "English Language Proof", description: "IELTS/TOEFL/SELT meeting university requirements", isMandatory: true, format: "PDF", order: 4 },
      { visaType: "STUDENT", name: "Academic Qualifications", description: "Certificates and transcripts", isMandatory: true, format: "ORIGINAL", order: 5 },
      { visaType: "STUDENT", name: "ATAS Certificate", description: "Required for certain sensitive subjects", isMandatory: false, format: "PDF", order: 6 },
      { visaType: "STUDENT", name: "Tuberculosis Test Results", description: "Required if from certain countries", isMandatory: false, format: "PDF", order: 7 },
    ],
    rejections: [
      { reason: "Insufficient funds", description: "Bank statements don't meet maintenance requirements", solution: "Maintain required funds for 28 consecutive days before applying. Use official exchange rates.", frequency: "COMMON" },
      { reason: "Invalid CAS or course changes", description: "CAS number issues or course doesn't match previous qualifications", solution: "Ensure CAS has correct details. Check course progression requirements.", frequency: "COMMON" },
      { reason: "Genuine Student Rule", description: "VO not convinced applicant is a genuine student", solution: "Prepare for credibility interview. Clearly explain study and career plans.", frequency: "MODERATE" },
    ],
    work: [
      { name: "Graduate Route", description: "Work or look for work for 2 years after graduation (3 years for PhD)", duration: "2-3 years", eligibility: "Completed a UK degree at bachelor's level or above", applicationProcess: "Apply from within UK before student visa expires", salaryRange: "£25,000-£60,000+", workRights: "Any job, no skill level restriction", pathwayToPR: true },
      { name: "Skilled Worker Visa", description: "For skilled jobs with approved employer sponsorship", duration: "Up to 5 years", eligibility: "Job offer from Home Office approved sponsor, skill level RQF 3+", applicationProcess: "Employer issues Certificate of Sponsorship → visa application", salaryRange: "£26,200-£50,000+", pathwayToPR: true },
    ],
    pr: [
      { name: "Indefinite Leave to Remain (ILR)", description: "Permanent residency after 5 years of continuous residence", eligibility: "5 years on eligible visa (Skilled Worker, etc.)", process: "Life in the UK test + English B1 + continuous residence", timeline: "5 years on visa → ILR → Citizenship (12 months later)", pointsBased: false, languageRequired: "English B1", minWorkExperience: 5 },
    ],
  },
  CA: {
    processes: [
      { visaType: "STUDENT", name: "Study Permit", description: "For international students at designated learning institutions", timeline: "3-6 months before course", fees: "CAD $150", processingTime: "8-12 weeks (SDS: 20 days)", interviewRequired: false, biometricsRequired: true, healthInsurance: true, workAllowed: true, workHours: "20 hrs/week off-campus", postStudyWork: "PGWP: Up to 3 years", dependentAllowed: true, extensionsAvailable: true, extendsTo: "Study permit extension possible", applicationMethod: "Online or paper application" },
    ],
    documents: [
      { visaType: "STUDENT", name: "Valid Passport", isMandatory: true, format: "ORIGINAL", order: 1 },
      { visaType: "STUDENT", name: "Letter of Acceptance", description: "From a designated learning institution", isMandatory: true, format: "PDF", order: 2 },
      { visaType: "STUDENT", name: "Proof of Funds", description: "Tuition + CAD $20,635 living + return transportation", isMandatory: true, format: "PDF", order: 3 },
      { visaType: "STUDENT", name: "Immigration Medical Exam", description: "From panel physician approved by IRCC", isMandatory: true, format: "PDF", order: 4 },
      { visaType: "STUDENT", name: "English/French Test", description: "IELTS/TOEFL/PTE or TEF for French programs", isMandatory: true, format: "PDF", order: 5 },
      { visaType: "STUDENT", name: "Statement of Purpose", description: "Explain study plans, career goals, ties to home country", isMandatory: true, format: "PDF", order: 6 },
      { visaType: "STUDENT", name: "Digital Photo", description: "Passport-size photo with specific requirements", isMandatory: true, format: "JPG", order: 7 },
    ],
    rejections: [
      { reason: "Purpose of visit not clear", description: "VO not satisfied you'll leave Canada after studies", solution: "Write a strong SOP explaining ties to home country and future plans.", frequency: "COMMON" },
      { reason: "Insufficient financial proof", description: "Failed to clearly demonstrate adequate funds", solution: "Provide bank statements showing funds available from a known source.", frequency: "COMMON" },
      { reason: "Family ties in Canada", description: "Strong family connections that might encourage overstay", solution: "Emphasize family and property ties in home country.", frequency: "MODERATE" },
    ],
    work: [
      { name: "Post-Graduation Work Permit (PGWP)", description: "Open work permit for graduates of Canadian DLI institutions", duration: "8 months to 3 years", eligibility: "Graduated from eligible program of 8+ months", applicationProcess: "Apply within 180 days of final marks/grad confirmation", salaryRange: "CAD $40,000-$90,000+", workRights: "Any employer, any job", pathwayToPR: true },
    ],
    pr: [
      { name: "Express Entry (FSW/CEC)", description: "Points-based system for skilled workers", eligibility: "Work experience, language, education", process: "CRS score → ITA → PR application", timeline: "6-12 months", pointsBased: true, minPoints: 67, minWorkExperience: 1, languageRequired: "CLB 7 (IELTS 6.0 each band)", investmentRequired: undefined },
      { name: "Provincial Nominee Program (PNP)", description: "For candidates nominated by a Canadian province", eligibility: "Varies by province, often requires job offer or graduate status", process: "Apply to province → nomination → PR application", timeline: "6-12 months after nomination", pointsBased: false, minWorkExperience: 1, languageRequired: "CLB 4-7 depending on stream", investmentRequired: undefined },
      { name: "Quebec Experience Program (PEQ)", description: "For Quebec graduates and temporary workers", eligibility: "Quebec degree completion or 12-24 months work in Quebec", process: "Apply to Quebec → CSQ → PR", timeline: "6-12 months", pointsBased: false, languageRequired: "French B2", investmentRequired: undefined },
    ],
  },
  AU: {
    processes: [
      { visaType: "STUDENT", name: "Student Visa (Subclass 500)", description: "For full-time study at an Australian institution", timeline: "4-6 months before course", fees: "AUD $1,600", processingTime: "4-8 weeks", interviewRequired: false, biometricsRequired: true, healthInsurance: true, workAllowed: true, workHours: "48 hrs/fortnight during study", postStudyWork: "Temporary Graduate (Subclass 485): 2-4 years", dependentAllowed: true, extensionsAvailable: true, extendsTo: "Visa extension possible", applicationMethod: "Online through ImmiAccount" },
    ],
    documents: [
      { visaType: "STUDENT", name: "Valid Passport", isMandatory: true, format: "ORIGINAL", order: 1 },
      { visaType: "STUDENT", name: "Confirmation of Enrolment (CoE)", description: "Issued by Australian institution after accepting offer", isMandatory: true, format: "PDF", order: 2 },
      { visaType: "STUDENT", name: "Genuine Student (GS) Statement", description: "Evidence of genuine intent to study and temporary stay", isMandatory: true, format: "PDF", order: 3 },
      { visaType: "STUDENT", name: "Financial Evidence", description: "Tuition + living costs (AUD $24,505/year) + travel", isMandatory: true, format: "PDF", order: 4 },
      { visaType: "STUDENT", name: "English Test Results", description: "IELTS/TOEFL/PTE meeting university + visa requirements", isMandatory: true, format: "PDF", order: 5 },
      { visaType: "STUDENT", name: "OSHC (Health Insurance)", description: "Overseas Student Health Cover for visa duration", isMandatory: true, format: "PDF", order: 6 },
      { visaType: "STUDENT", name: "Academic Documents", description: "All qualifications and transcripts", isMandatory: true, format: "ORIGINAL", order: 7 },
    ],
    rejections: [
      { reason: "Genuine Student requirement not met", description: "Failed to demonstrate genuine intent to study and return", solution: "Submit detailed GS statement with career plans, home country ties.", frequency: "COMMON" },
      { reason: "Financial capacity insufficient", description: "Unable to prove enough funds for entire study period", solution: "Show sufficient, genuine funds from verifiable sources.", frequency: "COMMON" },
      { reason: "Health or character issues", description: "Failed health examination or police clearance", solution: "Complete required medical checks early. Obtain police clearance.", frequency: "MODERATE" },
    ],
    work: [
      { name: "Temporary Graduate Visa (Subclass 485)", description: "Work in Australia after graduation", duration: "2-4 years", eligibility: "Completed 2+ years of study in Australia (92 weeks)", applicationProcess: "Apply within 6 months of course completion", salaryRange: "AUD $55,000-$120,000+", workRights: "Full work rights; any job, any employer", pathwayToPR: true },
    ],
    pr: [
      { name: "Skilled Independent Visa (Subclass 189)", description: "Points-based permanent residency for skilled workers", eligibility: "Occupation on skilled occupation list, points test pass", process: "Skills assessment → EOI → Invitation → Visa application", timeline: "8-18 months", pointsBased: true, minPoints: 65, minWorkExperience: 1, languageRequired: "Competent English (IELTS 6.0)", investmentRequired: undefined },
      { name: "Skilled Nominated Visa (Subclass 190)", description: "PR for nominees of Australian states/territories", eligibility: "Occupation on state skilled list, state nomination", process: "State nomination → EOI → Invitation → Visa", timeline: "8-18 months", pointsBased: true, minPoints: 65, minWorkExperience: 1, languageRequired: "Competent English", investmentRequired: undefined },
      { name: "Global Talent Visa (Subclass 858)", description: "For highly skilled professionals in target sectors", eligibility: "High income (AUD $167,500+), international recognition", process: "Global Talent identifier → EOI → Visa application", timeline: "2-6 months", pointsBased: false, languageRequired: "Functional English" },
    ],
  },
  DE: {
    processes: [
      { visaType: "STUDENT", name: "Student Visa (Studienvisum)", description: "For students accepted into German university", timeline: "3 months before program start", fees: "€75", processingTime: "4-12 weeks", interviewRequired: true, biometricsRequired: true, healthInsurance: true, workAllowed: true, workHours: "120 full days or 240 half days/year", postStudyWork: "18-month job seeker visa", dependentAllowed: false, extensionsAvailable: true, extendsTo: "Residence permit extension possible", applicationMethod: "Appointment at German embassy/consulate" },
      { visaType: "STUDENT", name: "Student Applicant Visa", description: "For those who need to be in Germany for university application", timeline: "Before application deadline", fees: "€75", processingTime: "4-12 weeks", interviewRequired: true, biometricsRequired: true, healthInsurance: true, workAllowed: false, dependentAllowed: false, applicationMethod: "Appointment at German embassy" },
    ],
    documents: [
      { visaType: "STUDENT", name: "Valid Passport", isMandatory: true, format: "ORIGINAL", order: 1 },
      { visaType: "STUDENT", name: "University Admission Letter", description: "Zulassungsbescheid from German university", isMandatory: true, format: "PDF", order: 2 },
      { visaType: "STUDENT", name: "Proof of Funds", description: "€11,904/year in blocked account (Sperrkonto)", isMandatory: true, format: "PDF", order: 3 },
      { visaType: "STUDENT", name: "Health Insurance", description: "German health insurance (€110-€150/month)", isMandatory: true, format: "PDF", order: 4 },
      { visaType: "STUDENT", name: "Academic Documents", description: "Certified translations of certificates and transcripts", isMandatory: true, format: "ORIGINAL", order: 5 },
      { visaType: "STUDENT", name: "CV & Statement of Purpose", description: "Detailed CV and motivation letter", isMandatory: true, format: "PDF", order: 6 },
      { visaType: "STUDENT", name: "APS Certificate", description: "Required for applicants from India, China, Vietnam, etc.", isMandatory: false, format: "PDF", order: 7 },
    ],
    rejections: [
      { reason: "Inadequate blocked account", description: "Failed to set up or fund the blocked account properly", solution: "Open a blocked account with a recognized provider (Expatrio, Fintiba, etc.) and deposit the full amount.", frequency: "COMMON" },
      { reason: "Course doesn't match background", description: "Academic qualifications don't align with chosen program", solution: "Carefully check course prerequisites. Consider preparatory courses (Studienkolleg).", frequency: "COMMON" },
    ],
    work: [
      { name: "18-Month Job Seeker Visa", description: "Extended stay to find qualified employment", duration: "18 months", eligibility: "Completed German degree or recognized qualification", applicationProcess: "Apply at Foreigners Authority", salaryRange: "€40,000-€70,000+", workRights: "Unrestricted job search, any employment", pathwayToPR: true },
      { name: "EU Blue Card", description: "For highly skilled non-EU workers", duration: "1-4 years", eligibility: "German degree + job offer €43,800+ (€39,683 for shortage jobs)", applicationProcess: "Employer application → Blue Card issuance", salaryRange: "€43,800-€100,000+", pathwayToPR: true },
    ],
    pr: [
      { name: "Niederlassungserlaubnis (Settlement Permit)", description: "Permanent residence after 33 months on Blue Card (21 months with B1 German)", eligibility: "33 months Blue Card + pension contributions + B1 German", process: "Apply at Foreigners Authority → PR issuance", timeline: "21-33 months", pointsBased: false, languageRequired: "A1-B1 German", minWorkExperience: 33, investmentRequired: undefined },
    ],
  },
  IE: {
    processes: [
      { visaType: "STUDENT", name: "Study Visa (D-Type)", description: "For full-time study at recognized Irish institution", timeline: "3 months before course", fees: "€60-€100", processingTime: "4-8 weeks", interviewRequired: false, biometricsRequired: true, healthInsurance: true, workAllowed: true, workHours: "20 hrs/week term, 40 hrs/week holidays", postStudyWork: "Stay Back: 1-2 years (Stamp 1G)", dependentAllowed: false, applicationMethod: "Online via AVATS system" },
    ],
    documents: [
      { visaType: "STUDENT", name: "Valid Passport", isMandatory: true, format: "ORIGINAL", order: 1 },
      { visaType: "STUDENT", name: "Letter of Acceptance", description: "From recognized Irish higher education institution", isMandatory: true, format: "PDF", order: 2 },
      { visaType: "STUDENT", name: "Fee Receipt", description: "Evidence of tuition fee payment (at least first installment)", isMandatory: true, format: "PDF", order: 3 },
      { visaType: "STUDENT", name: "Proof of Funds", description: "€7,000+ for living costs (single student)", isMandatory: true, format: "PDF", order: 4 },
      { visaType: "STUDENT", name: "English Test Results", description: "IELTS/TOEFL meeting university requirements", isMandatory: true, format: "PDF", order: 5 },
      { visaType: "STUDENT", name: "Private Medical Insurance", description: "Minimum €25,000 cover", isMandatory: true, format: "PDF", order: 6 },
    ],
    rejections: [
      { reason: "Insufficient course progression", description: "New course doesn't follow logically from previous studies", solution: "Explain how the course relates to your academic background and career.", frequency: "COMMON" },
      { reason: "Financial insufficiency", description: "Failed to prove adequate maintenance funds", solution: "Maintain funds in bank for at least 6 months. Document source clearly.", frequency: "COMMON" },
    ],
    work: [
      { name: "Stamp 1G (Third Level Graduate Scheme)", description: "Permission to seek employment and work in Ireland", duration: "12-24 months", eligibility: "Graduated from Irish institution with level 8+ degree", applicationProcess: "Apply at immigration registration office", salaryRange: "€30,000-€70,000+", pathwayToPR: true },
    ],
    pr: [
      { name: "Stamp 4 (Long Term Residency)", description: "Permission to work without employment permit", eligibility: "5 years residence on work visa or CSEP", process: "Renewable 2-year permission → Citizenship after 5 years", timeline: "5 years", pointsBased: false, languageRequired: "English proficiency" },
    ],
  },
};

async function seedAIPromptTemplates() {
  const existing = await prisma.aIPromptTemplate.count();
  if (existing > 0) { console.log("AI prompt templates already seeded"); return; }

  const templates = [
    { key: "chatbot-general", name: "General Chatbot", category: "CHATBOT", systemPrompt: "You are a helpful study abroad and career guidance assistant. Help students with university selection, course guidance, career advice, visa information, and application tips. Answer based on provided context when available.", temperature: 0.5, maxTokens: 2048, isDefault: true },
    { key: "university-recommendation", name: "University Recommendation", category: "RECOMMENDATION", systemPrompt: "You are a study abroad counselor specializing in university recommendations. Analyze the student's academic profile, test scores, budget, and preferences to recommend suitable universities. Categorize recommendations as dream, best fit, safe, scholarship-friendly, or high ROI.", temperature: 0.3, maxTokens: 4096, isDefault: true },
    { key: "career-recommendation", name: "Career Recommendation", category: "RECOMMENDATION", systemPrompt: "You are a career guidance expert. Analyze the student's academic background, interests, skills, and psychometric results to recommend suitable career paths. Provide detailed roadmaps and skill development plans.", temperature: 0.3, maxTokens: 4096, isDefault: true },
    { key: "sop-research", name: "Research SOP", category: "SOP", systemPrompt: "You are an expert SOP writer for research programs. Generate a compelling, well-structured SOP that highlights research experience, academic achievements, and future research goals. Use a formal academic tone.", temperature: 0.7, maxTokens: 4096, isDefault: true },
    { key: "sop-mba", name: "MBA SOP", category: "SOP", systemPrompt: "You are an expert SOP writer for MBA programs. Generate a compelling SOP highlighting professional experience, leadership, career goals, and why this MBA program. Use a confident professional tone.", temperature: 0.7, maxTokens: 4096, isDefault: true },
    { key: "sop-masters", name: "Masters SOP", category: "SOP", systemPrompt: "You are an expert SOP writer for Master's programs. Generate a well-structured SOP covering academic background, work experience, reasons for choosing this program, and future goals.", temperature: 0.7, maxTokens: 4096, isDefault: true },
    { key: "sop-phd", name: "PhD SOP", category: "SOP", systemPrompt: "You are an expert SOP writer for PhD programs. Generate a research-focused SOP demonstrating deep field knowledge, research experience, specific research interests, and program fit.", temperature: 0.7, maxTokens: 4096, isDefault: true },
    { key: "sop-undergraduate", name: "Undergraduate SOP", category: "SOP", systemPrompt: "You are an expert SOP writer for undergraduate programs. Generate an SOP highlighting academic achievements, extracurricular activities, personal growth, and reasons for choosing this program.", temperature: 0.7, maxTokens: 4096, isDefault: true },
    { key: "resume-modern", name: "Modern Resume", category: "RESUME", systemPrompt: "You are a professional resume writer. Generate a modern, visually clean ATS-friendly resume with clear section headers and bullet points.", temperature: 0.5, maxTokens: 4096, isDefault: true },
    { key: "resume-ats", name: "ATS Resume", category: "RESUME", systemPrompt: "You are a professional resume writer. Generate an ATS-optimized resume with simple formatting, standard section headers, and keyword-rich content.", temperature: 0.5, maxTokens: 4096, isDefault: true },
    { key: "document-analysis", name: "Document Analysis", category: "DOCUMENT", systemPrompt: "You are a document verification expert for study abroad applications. Analyze uploaded documents and provide feedback on missing information, errors, and improvement suggestions. Return a JSON object with summary, missingInformation, errors, suggestions, and score.", temperature: 0.2, maxTokens: 2048, isDefault: true },
    { key: "university-comparison", name: "University Comparison", category: "COMPARISON", systemPrompt: "You are a university comparison expert. Compare universities across rankings, fees, location, courses, and ROI. Provide detailed comparison, summary, recommendation, and reasoning.", temperature: 0.3, maxTokens: 4096, isDefault: true },
  ];

  for (const t of templates) {
    await prisma.aIPromptTemplate.create({ data: { ...t, variables: [] } });
  }
  console.log(`${templates.length} AI prompt templates created`);
}

async function main() {
  console.log("Seeding started...");

  // 0. Seed Roles and Permissions (Part 3 — Identity Domain)
  const roles = await seedRoles();
  await seedPermissions(roles);

  // 0b. Seed Exam Types and Course Categories (Part 3)
  await seedExamTypes();
  await seedCourseCategories();

  // Part 11 — Career categories and assessment questions
  const careerCatMap = await seedCareerCategories();
  await seedAssessmentQuestions();

  // Part 12 — Psychometric test samples
  await seedPsychometricTests();

  // Part 13 — AI prompt templates
  await seedAIPromptTemplates();

  // 1. Create organization
  const passwordHash = await bcrypt.hash("admin123", 12);
  const org = await prisma.organization.upsert({
    where: { slug: "default-org" },
    update: {},
    create: {
      name: "Default Organization",
      slug: "default-org",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("Organization created");

  // 2. Create users
  await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: { email: "superadmin@example.com", passwordHash, fullName: "Super Admin", role: UserRole.SUPER_ADMIN, organizationId: org.id, roleId: roles["SUPER_ADMIN"] },
  });
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", passwordHash, fullName: "Admin User", role: UserRole.ADMIN, organizationId: org.id, roleId: roles["ADMIN"] },
  });
  console.log("Users created");

  // 2b. Create students
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  const studentData = [
    { email: "riya.sharma@example.com", fullName: "Riya Sharma", mobile: "+91-9876543210", gender: "Female", tenthPercentage: 92, twelfthPercentage: 88, interests: ["Engineering", "Computer Science"] },
    { email: "arun.kumar@example.com", fullName: "Arun Kumar", mobile: "+91-9876543211", gender: "Male", tenthPercentage: 85, twelfthPercentage: 82, interests: ["Medicine", "Biology"] },
    { email: "priya.singh@example.com", fullName: "Priya Singh", mobile: "+91-9876543212", gender: "Female", tenthPercentage: 78, twelfthPercentage: 85, interests: ["Business", "Finance"] },
    { email: "vikram.patel@example.com", fullName: "Vikram Patel", mobile: "+91-9876543213", gender: "Male", tenthPercentage: 90, twelfthPercentage: 91, interests: ["Data Science", "AI"] },
    { email: "ananya.gupta@example.com", fullName: "Ananya Gupta", mobile: "+91-9876543214", gender: "Female", tenthPercentage: 88, twelfthPercentage: 86, interests: ["Arts", "Design"] },
  ];
  for (const sd of studentData) {
    const studentUser = await prisma.user.upsert({
      where: { email: sd.email },
      update: {},
      create: { email: sd.email, passwordHash, fullName: sd.fullName, role: UserRole.STUDENT, organizationId: org.id, roleId: roles["STUDENT"] },
    });
    await prisma.student.upsert({
      where: { email: sd.email },
      update: {},
      create: {
        userId: studentUser.id,
        fullName: sd.fullName,
        email: sd.email,
        mobile: sd.mobile,
        gender: sd.gender,
        tenthPercentage: sd.tenthPercentage,
        twelfthPercentage: sd.twelfthPercentage,
        interests: sd.interests,
        organizationId: org.id,
        counselorId: adminUser?.id,
      },
    });
  }
  console.log(`${studentData.length} students created`);

  // 3. Create countries
  const countryMap = new Map<string, string>();
  for (const c of countries) {
    const record = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: { name: c.name, code: c.code, currency: c.currency, language: c.language, livingCost: c.livingCost, visaInfo: c.visaInfo },
    });
    countryMap.set(c.code, record.id);
  }
  console.log(`${countries.length} countries created`);

  // Part 16 — Visa data for top destinations
  const visaCountryCodes = ["US", "GB", "CA", "AU", "DE", "IE", "NZ", "SG", "FR", "NL"];
  for (const code of visaCountryCodes) {
    const countryId = countryMap.get(code);
    if (!countryId) continue;

    // Visa processes
    const existingProcesses = await prisma.visaProcess.count({ where: { countryId } });
    if (existingProcesses === 0) {
      const visaData = VISA_SEED_DATA[code];
      if (visaData) {
        await prisma.visaProcess.createMany({
          data: visaData.processes.map(p => ({ countryId, ...p })),
        });
        await prisma.visaDocument.createMany({
          data: visaData.documents.map(d => ({ countryId, ...d })),
        });
        await prisma.visaRejectionReason.createMany({
          data: visaData.rejections.map(r => ({ countryId, ...r })),
        });
        await prisma.workOpportunity.createMany({
          data: visaData.work.map(w => ({ countryId, ...w })),
        });
        await prisma.pRPathway.createMany({
          data: visaData.pr.map(p => ({ countryId, ...p })),
        });
      }
    }
  }
  console.log(`Visa data seeded for ${visaCountryCodes.length} countries`);

  // 4. Create universities
  const universityMap = new Map<string, string>();
  for (const u of universities) {
    const countryId = countryMap.get(u.countryCode);
    if (!countryId) {
      console.warn(`Country ${u.countryCode} not found for university ${u.name}`);
      continue;
    }
    const slug = u.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + u.countryCode.toLowerCase();
    const existing = await prisma.university.findFirst({ where: { name: u.name, countryId } });
    if (existing) {
      universityMap.set(u.name + "|" + u.countryCode, existing.id);
      continue;
    }
    const record = await prisma.university.create({
      data: {
        name: u.name,
        countryId,
        city: u.city,
        description: u.description,
        ranking: u.ranking,
        rankingSource: "QS World University Rankings",
        intakePeriods: u.intakePeriods,
        applicationFee: u.applicationFee,
        website: u.website || generateWebsite(u.name, u.countryCode),
        logoUrl: u.logoUrl || generateLogoUrl(u.name),
      },
    });
    universityMap.set(u.name + "|" + u.countryCode, record.id);
  }
  console.log(`${universities.length} universities created`);

  // Part 17 — Scholarship seed data
  let scholarshipCount = 0;
  for (const s of scholarships) {
    const countryId = s.countryCode ? countryMap.get(s.countryCode) : null;
    const existingSlug = await prisma.scholarship.findUnique({ where: { slug: s.slug } });
    if (existingSlug) continue;
    await prisma.scholarship.create({
      data: {
        name: s.name, slug: s.slug, description: s.description, type: s.type,
        amount: s.amount || null, amountMax: s.amountMax || null, currency: s.currency,
        eligibility: s.eligibility, coverage: s.coverage,
        applicationUrl: s.applicationUrl, deadline: new Date(s.deadline),
        intakeSeasons: s.intakeSeasons, academicLevels: s.academicLevels,
        gpaRequirement: s.gpaRequirement || null, englishTest: s.englishTest || null,
        documentsRequired: s.documentsRequired, nationalities: s.nationalities,
        isFeatured: s.isFeatured, countryId: countryId,
      },
    });
    scholarshipCount++;
  }
  console.log(`${scholarshipCount} scholarships seeded`);

  // 5. Create courses at country level and link to universities
  const courseMap = new Map<string, string>();
  const categoryOrder: string[] = [];
  const seenCategories = new Set<string>();

  for (const c of globalCourses) {
    if (!seenCategories.has(c.category)) {
      seenCategories.add(c.category);
      categoryOrder.push(c.category);
    }
  }

  // Create courses for each country (general courses available country-wide)
  const catMap = new Map<string, string>();
  const allCats = await prisma.courseCategory.findMany();
  for (const cat of allCats) catMap.set(cat.slug, cat.id);

  for (const c of globalCourses) {
    const courseKey = `${c.name}|${c.level}`;
    if (courseMap.has(courseKey)) continue;

    // Find category slug from the category name using the pre-defined map
    const categorySlugMap: Record<string, string> = {
      "Computer Science & IT": "computer-science-it",
      "Business & Management": "business-management",
      "Engineering": "engineering",
      "Medicine & Health Sciences": "medicine-health",
      "Natural Sciences": "natural-sciences",
      "Social Sciences & Humanities": "social-sciences-humanities",
      "Law": "law",
      "Arts & Design": "arts-design",
      "Education": "education",
      "Agriculture & Environmental Sciences": "agriculture-environmental",
      "Data Science": "data-science",
      "Artificial Intelligence": "artificial-intelligence",
      "Cyber Security": "cyber-security",
      "Finance": "finance",
      "Commerce": "commerce",
    };
    const categorySlug = categorySlugMap[c.category];
    const categoryId = categorySlug ? catMap.get(categorySlug) : undefined;
    if (!categoryId) console.warn(`Category not found for "${c.category}"`);

    const countryId = countryMap.get("US")!;
    const record = await prisma.course.create({
      data: {
        name: c.name,
        level: c.level,
        category: c.category,
        categoryId,
        description: c.description,
        duration: c.duration,
        tuitionFeeMin: c.tuitionFeeMin,
        tuitionFeeMax: c.tuitionFeeMax,
        currency: c.currency,
        countryId,
        skills: c.skills || [],
        entranceExams: c.entranceExams || [],
        popularIn: c.popularIn || [],
        status: "PUBLISHED",
        normalizedName: c.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " "),
      },
    });
    courseMap.set(courseKey, record.id);
  }

  // Create university-specific course records (each university gets its own Course records)
  interface UniCourse { name: string; level: string; category: string; }
  const uniCourseAssignments: Map<string, UniCourse[]> = new Map();

  for (const u of universities) {
    const key = u.name + "|" + u.countryCode;
    const assignments: UniCourse[] = [];

    // Every university gets CS, Business, Math
    assignments.push({ name: "Computer Science", level: "BACHELOR", category: "Computer Science & IT" });
    assignments.push({ name: "Business Administration", level: "BACHELOR", category: "Business & Management" });
    assignments.push({ name: "Mathematics", level: "BACHELOR", category: "Natural Sciences" });

    // Engineering schools get more engineering
    if (u.name.includes("Technical") || u.name.includes("Technology") || u.name.includes("Engineering") || u.name.includes("Institute of Technology") || u.name.includes("IIT") || u.name.includes("Polytechnic")) {
      assignments.push({ name: "Mechanical Engineering", level: "BACHELOR", category: "Engineering" });
      assignments.push({ name: "Electrical Engineering", level: "BACHELOR", category: "Engineering" });
      assignments.push({ name: "Computer Science", level: "MASTER", category: "Computer Science & IT" });
      assignments.push({ name: "Data Science", level: "MASTER", category: "Computer Science & IT" });
    } else {
      assignments.push({ name: "Economics", level: "BACHELOR", category: "Social Sciences & Humanities" });
      assignments.push({ name: "Psychology", level: "BACHELOR", category: "Medicine & Health Sciences" });
    }

    // Research universities get more
    if (u.ranking <= 10) {
      assignments.push({ name: "Physics", level: "BACHELOR", category: "Natural Sciences" });
      assignments.push({ name: "Chemistry", level: "BACHELOR", category: "Natural Sciences" });
      assignments.push({ name: "Biology", level: "BACHELOR", category: "Natural Sciences" });
      assignments.push({ name: "Computer Science", level: "PHD", category: "Computer Science & IT" });
      assignments.push({ name: "Physics", level: "PHD", category: "Natural Sciences" });
    }

    uniCourseAssignments.set(key, assignments);
  }

  // Create university-specific course records (each university gets its own Course records)
  let uniCourseCount = 0;
  let uniCourseLinkCount = 0;
  for (const [key, assignments] of uniCourseAssignments) {
    const uniId = universityMap.get(key);
    if (!uniId) continue;

    const parts = key.split("|");
    const uniName = parts[0];
    const countryCode = parts[1];
    const countryId = countryMap.get(countryCode);
    if (!countryId) continue;

    for (const a of assignments) {
      const courseKey = `${a.name}|${a.level}`;
      const canonicalId = courseMap.get(courseKey);
      if (!canonicalId) continue;

      // Check if this university already has a course with this name+level
      const existing = await prisma.course.findFirst({
        where: { name: a.name, level: a.level, universityId: uniId },
      });
      if (existing) {
        // Ensure UniversityCourse link exists
        const existingLink = await prisma.universityCourse.findUnique({
          where: { universityId_courseId: { universityId: uniId, courseId: existing.id } },
        });
        if (!existingLink) {
          await prisma.universityCourse.create({
            data: { universityId: uniId, courseId: existing.id, isActive: true },
          });
          uniCourseLinkCount++;
        }
        continue;
      }

      // Find the canonical course to copy its details
      const canonical = globalCourses.find(gc => gc.name === a.name && gc.level === a.level);
      if (!canonical) continue;

      const record = await prisma.course.create({
        data: {
          name: a.name,
          level: a.level,
          category: a.category,
          description: canonical.description,
          duration: canonical.duration,
          tuitionFeeMin: canonical.tuitionFeeMin,
          tuitionFeeMax: canonical.tuitionFeeMax,
          currency: canonical.currency,
          skills: canonical.skills || [],
          entranceExams: canonical.entranceExams || [],
          popularIn: canonical.popularIn || [],
          countryId,
          universityId: uniId,
          status: "PUBLISHED",
        },
      });

      await prisma.universityCourse.create({
        data: { universityId: uniId, courseId: record.id, isActive: true },
      });
      uniCourseCount++;
      uniCourseLinkCount++;
    }
  }
  console.log(`${globalCourses.length} canonical courses + ${uniCourseCount} university-specific courses + ${uniCourseLinkCount} university-course links created`);

  // 6. Create careers
  const careerMap = new Map<string, string>();
  const careerCatByName: Record<string, string> = {
    "Software Engineer": "technology-it",
    "Data Scientist": "technology-it",
    "AI/ML Engineer": "technology-it",
    "Cybersecurity Analyst": "technology-it",
    "Cloud Architect": "technology-it",
    "DevOps Engineer": "technology-it",
    "Blockchain Developer": "technology-it",
    "Data Engineer": "technology-it",
    "Business Analyst": "business-management",
    "Quantitative Analyst": "finance-commerce",
    "Product Manager": "business-management",
    "UX/UI Designer": "design-creative",
    "Product Designer": "design-creative",
    "Management Consultant": "business-management",
    "Investment Banker": "finance-commerce",
    "Financial Analyst": "finance-commerce",
    "Marketing Manager": "business-management",
    "Human Resources Manager": "business-management",
    "Mechanical Engineer": "engineering",
    "Electrical Engineer": "engineering",
    "Civil Engineer": "engineering",
    "Robotics Engineer": "emerging-fields",
    "Aerospace Engineer": "engineering",
    "Biomedical Engineer": "engineering",
    "Physician (Doctor)": "medical-healthcare",
    "Pharmacist": "medical-healthcare",
    "Healthcare Data Analyst": "medical-healthcare",
    "Biomedical Scientist": "medical-healthcare",
    "Physiotherapist": "medical-healthcare",
    "Research Scientist": "science-research",
    "Environmental Scientist": "science-research",
    "Bioinformatician": "science-research",
    "Corporate Lawyer": "law-legal",
    "Legal Technology Specialist": "law-legal",
    "Compliance Officer": "law-legal",
    "Education Consultant": "education",
    "Instructional Designer": "education",
    "Architect": "design-creative",
    "Creative Director": "design-creative",
    "Digital Marketing Specialist": "business-management",
    "Sustainability Manager": "emerging-fields",
    "Agri-Tech Specialist": "science-research",
    "Sustainability Consultant": "emerging-fields",
    "IT Security Manager": "technology-it",
    "Accountant": "finance-commerce",
    "Financial Manager": "finance-commerce",
    "Risk Analyst": "finance-commerce",
    "Security Architect": "technology-it",
    "Policy Advisor": "business-management",
    "Clinical Research Associate": "medical-healthcare",
  };

  const careerIndustry: Record<string, string> = {
    "Software Engineer": "Technology",
    "Data Scientist": "Technology",
    "AI/ML Engineer": "Technology/AI",
    "Cybersecurity Analyst": "Technology/Security",
    "Cloud Architect": "Technology/Cloud",
    "DevOps Engineer": "Technology",
    "Blockchain Developer": "Technology/Blockchain",
    "Data Engineer": "Technology",
    "Business Analyst": "Business/IT",
    "Quantitative Analyst": "Finance",
    "Product Manager": "Technology",
    "UX/UI Designer": "Technology/Design",
    "Management Consultant": "Management Consulting",
    "Investment Banker": "Finance",
    "Financial Analyst": "Finance",
    "Marketing Manager": "Marketing",
    "Human Resources Manager": "HR",
    "Mechanical Engineer": "Manufacturing",
    "Electrical Engineer": "Electronics",
    "Civil Engineer": "Construction",
    "Robotics Engineer": "Robotics",
    "Aerospace Engineer": "Aerospace",
    "Biomedical Engineer": "Healthcare/Engineering",
    "Physician (Doctor)": "Healthcare",
    "Pharmacist": "Pharmaceutical",
    "Healthcare Data Analyst": "Healthcare",
    "Biomedical Scientist": "Biotechnology",
    "Research Scientist": "Research",
    "Environmental Scientist": "Environment",
    "Corporate Lawyer": "Legal",
    "Education Consultant": "Education",
    "Sustainability Manager": "Sustainability",
    "Digital Marketing Specialist": "Marketing",
    "Sustainability Consultant": "Sustainability",
  };

  for (const c of careers) {
    const existing = await prisma.career.findUnique({ where: { name: c.name } });
    const catSlug = careerCatByName[c.name];
    const categoryId = catSlug ? careerCatMap.get(catSlug) : null;
    const industry = careerIndustry[c.name] || null;

    const data = {
      name: c.name,
      description: c.description,
      skills: c.skills,
      eligibility: c.eligibility,
      futureScope: c.futureScope,
      salaryTrends: c.salaryTrends,
      recruiters: c.recruiters,
      isEmerging: c.isEmerging,
      categoryId,
      industry,
      status: "PUBLISHED",
      normalizedName: c.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " "),
    };

    if (existing) {
      await prisma.career.update({ where: { name: c.name }, data });
      careerMap.set(c.name, existing.id);
    } else {
      const record = await prisma.career.create({ data });
      careerMap.set(c.name, record.id);
    }
  }
  console.log(`${careers.length} careers created`);

  // 7. Link courses to careers
  // Map course categories to relevant careers
  const categoryCareerMap: Record<string, string[]> = {
    "Computer Science & IT": ["Software Engineer", "Data Scientist", "AI/ML Engineer", "Cybersecurity Analyst", "Cloud Architect", "DevOps Engineer", "Blockchain Developer", "Product Manager"],
    "Business & Management": ["Management Consultant", "Investment Banker", "Product Manager", "Financial Analyst", "Marketing Manager", "Human Resources Manager", "Business Analyst"],
    "Engineering": ["Mechanical Engineer", "Electrical Engineer", "Civil Engineer", "Robotics Engineer", "Data Engineer", "Aerospace Engineer", "Biomedical Engineer"],
    "Medicine & Health Sciences": ["Physician (Doctor)", "Pharmacist", "Healthcare Data Analyst", "Biomedical Scientist", "Clinical Research Associate", "Physiotherapist"],
    "Natural Sciences": ["Research Scientist", "Environmental Scientist", "Bioinformatician", "Data Scientist"],
    "Social Sciences & Humanities": ["Management Consultant", "Business Analyst", "Marketing Manager", "Policy Advisor", "UX/UI Designer"],
    "Law": ["Corporate Lawyer", "Legal Technology Specialist", "Compliance Officer"],
    "Arts & Design": ["UX/UI Designer", "Product Designer", "Creative Director", "Architect"],
    "Education": ["Education Consultant", "Instructional Designer", "Human Resources Manager"],
    "Agriculture & Environmental Sciences": ["Environmental Scientist", "Agri-Tech Specialist", "Sustainability Consultant"],
    "Data Science": ["Data Scientist", "Data Engineer", "AI/ML Engineer", "Business Analyst", "Research Scientist"],
    "Artificial Intelligence": ["AI/ML Engineer", "Research Scientist", "Data Scientist", "Robotics Engineer", "Software Engineer"],
    "Cyber Security": ["Cybersecurity Analyst", "Security Architect", "Cloud Architect", "DevOps Engineer", "IT Security Manager"],
    "Finance": ["Financial Analyst", "Investment Banker", "Quantitative Analyst", "Financial Manager", "Risk Analyst"],
    "Commerce": ["Financial Analyst", "Business Analyst", "Management Consultant", "Marketing Manager", "Accountant"],
  };

  let linkCount = 0;
  for (const [category, careerNames] of Object.entries(categoryCareerMap)) {
    const categoryCourses = await prisma.course.findMany({
      where: { category, universityId: { not: null } },
      select: { id: true },
    });

    for (const course of categoryCourses) {
      for (const careerName of careerNames) {
        const careerId = careerMap.get(careerName);
        if (!careerId) continue;

        const existing = await prisma.career.findFirst({
          where: { id: careerId, courses: { some: { id: course.id } } },
        });
        if (existing) continue;

        await prisma.career.update({
          where: { id: careerId },
          data: { courses: { connect: { id: course.id } } },
        });
        linkCount++;
      }
    }
  }
  console.log(`${linkCount} course-career links created`);

  // 8. Seed Features
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

  console.log("Seed completed successfully!");
  console.log(`  - ${countries.length} countries`);
  console.log(`  - ${universities.length} universities`);
  console.log(`  - ${globalCourses.length + uniCourseCount} courses`);
  console.log(`  - ${careers.length} careers`);
  console.log(`  - ${scholarshipCount} scholarships`);
  console.log(`  - ${features.length} features`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
