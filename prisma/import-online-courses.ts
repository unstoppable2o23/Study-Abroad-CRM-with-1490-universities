import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const onlineUniversities = [
  { name: "Alliance University", displayName: "Alliance Online", fees: "₹76,000 - ₹1,60,000", courses: 3, description: "Digital learning arm of Alliance University, renowned for academic excellence and innovation in higher education." },
  { name: "Amity University", displayName: "Amity Online", fees: "₹99,000 - ₹3,45,800", courses: 8, description: "India's first UGC-approved private university to offer degree programs entirely in online mode." },
  { name: "Andhra University", displayName: "Andhra University Online", fees: "Contact for fees", courses: 3, description: "Public research university in Visakhapatnam, Andhra Pradesh, NAAC A++ accredited, NIRF rank 43." },
  { name: "Bharathidasan University", displayName: "Bharathidasan University Online", fees: "₹45,800 - ₹91,000", courses: 4, description: "UGC-recognized, NAAC A+ accredited university offering UG/PG programs through regular, distance, and online modes." },
  { name: "Dayananda Sagar University", displayName: "DSU Online", fees: "₹1,00,000 - ₹1,20,000", courses: 4, description: "Private university in Bangalore offering undergraduate, postgraduate, and Ph.D. programs." },
  { name: "Galgotias University", displayName: "Galgotias Online", fees: "₹50,000 - ₹78,000", courses: 5, description: "Centre for Distance and Online Education with motto 'Boundless Opportunities, Growth for Life'." },
  { name: "JAIN University", displayName: "JAIN University Online", fees: "₹45,500 - ₹2,60,000", courses: 6, description: "E-learning platform of JAIN (Deemed-to-be University) delivering UGC-entitled and AICTE-approved degree programs." },
  { name: "KIIT University", displayName: "KIIT Online", fees: "₹70,000 - ₹75,000", courses: 3, description: "Founded in 1992, granted university status under Section 3 of UGC Act in 2004." },
  { name: "KL University", displayName: "KL Online", fees: "₹65,500 - ₹85,500", courses: 3, description: "Digital learning platform of Koneru Lakshmaiah Education Foundation offering UGC-entitled online degree programs." },
  { name: "Kurukshetra University", displayName: "Kurukshetra University Online", fees: "Contact for fees", courses: 11, description: "Unitary residential university established in 1956, located in Kurukshetra, Haryana." },
  { name: "Lovely Professional University", displayName: "LPU Online", fees: "₹16,400 - ₹40,400", courses: 8, description: "Top-ranking private university offering online UG and PG courses with industry-oriented curriculum." },
  { name: "NMIMS University", displayName: "NMIMS Online", fees: "₹1,00,000 - ₹4,00,000", courses: 4, description: "CDOE began ODL & OL journey in 2013 with state-of-the-art learning management system." },
  { name: "Northcap University", displayName: "Northcap University Online", fees: "₹48,000 - ₹72,000", courses: 2, description: "UGC-entitled online degree programs with technology-driven learning and live interactive classes." },
  { name: "Shoolini University", displayName: "Shoolini University Online", fees: "₹30,000 - ₹2,00,000", courses: 7, description: "Leading outcome-based higher education with online degree programs focused on career advantage." },
  { name: "UPES", displayName: "UPES Online", fees: "₹85,000 - ₹2,40,000", courses: 4, description: "Private university in Dehradun offering online programs in engineering, management, and law." },
  { name: "Alagappa University", displayName: "Alagappa University", fees: "₹30,100 - ₹80,600", courses: 6, description: "State Government University established in 1985 in Karaikudi, Tamil Nadu." },
  { name: "Amrita Vishwa Vidyapeetham", displayName: "Amrita AHEAD Online", fees: "₹30,000 - ₹2,85,000", courses: 5, description: "India's 8th ranked university (NIRF 2025) offering UGC-entitled bachelor's and master's programs online." },
  { name: "Bharath University", displayName: "Bharath University Online", fees: "₹85,000 - ₹1,71,000", courses: 4, description: "Bridging inherent skills of students with industrial expectations in global competitive business." },
  { name: "Bharati Vidyapeeth", displayName: "Bharati Vidyapeeth Online", fees: "₹132,000 - ₹160,000", courses: 3, description: "Deemed to be University making high-quality education available through constituent units." },
  { name: "Birla Institute of Management Technology", displayName: "BIMTECH Online", fees: "₹2,00,000 - ₹2,75,000", courses: 2, description: "AICTE-approved postgraduate management diplomas equivalent to MBA, NAAC A+ accredited." },
];

async function main() {
  const india = await prisma.country.findFirst({ where: { name: "India" } });
  if (!india) { console.error("India not found"); return; }

  for (const u of onlineUniversities) {
    const existing = await prisma.university.findFirst({
      where: { name: { contains: u.name, mode: "insensitive" } },
    });

    if (existing) {
      const existingFee = existing.feeStructure as any;
      const onlineFees = { onlinePrograms: { fees: u.fees, totalCourses: u.courses } };
      const updatedFee = existingFee ? { ...existingFee as any, ...onlineFees } : onlineFees;

      await prisma.university.update({
        where: { id: existing.id },
        data: {
          feeStructure: updatedFee,
          description: existing.description
            ? existing.description + (existing.description.endsWith(".") ? "" : ".") + ` Online: ${u.description}`
            : u.description,
        },
      });
      console.log(`UPDATED: ${existing.name} → online fees: ${u.fees}`);
    } else {
      await prisma.university.create({
        data: {
          name: u.displayName,
          normalizedName: u.displayName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          countryId: india.id,
          description: u.description,
          feeStructure: { onlinePrograms: { fees: u.fees, totalCourses: u.courses } },
          universityType: "PRIVATE",
          isActive: true,
          status: "PUBLISHED",
          visibility: "GLOBAL",
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=random&color=fff&size=200&bold=true`,
          website: `https://${u.displayName.toLowerCase().replace(/[^a-z]/g, "")}.ac.in`,
        },
      });
      console.log(`CREATED: ${u.displayName} → fees: ${u.fees}`);
    }
  }
  console.log("Done! Online course data imported.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
