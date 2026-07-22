import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const mbbsData = {
  Russia: {
    description: "Russia has been a top destination for Indian MBBS students for over three decades, offering NMC-approved English-medium programs at affordable fees. Home to 27,000+ Indian medical students.",
    totalFees: "₹25,00,000 - ₹35,00,000",
    annualTuition: "₹2,50,000 - ₹8,00,000",
    duration: "6 years",
    fmgePassRate: "29.54%",
    nmcApproved: true,
    topUniversities: [
      { name: "Crimean Federal University", annualFees: "₹3,50,000", city: "Simferopol" },
      { name: "Kazan Federal University", annualFees: "₹4,00,000", city: "Kazan" },
      { name: "Orenburg State Medical University", annualFees: "₹3,00,000", city: "Orenburg" },
      { name: "Smolensk State Medical University", annualFees: "₹3,20,000", city: "Smolensk" },
      { name: "Far Eastern Federal University", annualFees: "₹3,50,000", city: "Vladivostok" },
      { name: "Immanuel Kant Baltic Federal University", annualFees: "₹4,50,000", city: "Kaliningrad" },
      { name: "North Ossetian State Medical Academy", annualFees: "₹2,80,000", city: "Vladikavkaz" },
      { name: "N.P. Ogarev Mordovia State University", annualFees: "₹2,70,000", city: "Saransk" },
      { name: "Altai State Medical University", annualFees: "₹3,10,000", city: "Barnaul" },
      { name: "Tver State Medical University", annualFees: "₹3,60,000", city: "Tver" },
    ],
  },
  Georgia: {
    description: "Georgia offers European-standard MBBS education with English-medium programs at affordable fees. Growing destination for Indian students seeking quality medical education.",
    totalFees: "₹35,00,000 - ₹55,00,000",
    annualTuition: "₹4,50,000 - ₹7,00,000",
    duration: "6 years",
    fmgePassRate: "Varies by university",
    nmcApproved: true,
    topUniversities: [
      { name: "Tbilisi State Medical University", annualFees: "₹6,50,000", city: "Tbilisi" },
      { name: "Ivane Javakhishvili Tbilisi State University", annualFees: "₹5,00,000", city: "Tbilisi" },
      { name: "Batumi Shota Rustaveli State University", annualFees: "₹4,50,000", city: "Batumi" },
      { name: "David Tvildiani Medical University", annualFees: "₹6,00,000", city: "Tbilisi" },
      { name: "New Vision University", annualFees: "₹5,50,000", city: "Tbilisi" },
    ],
  },
  Kazakhstan: {
    description: "Kazakhstan offers some of the lowest MBBS fees with NMC-approved universities in a stable environment. Simple admission process with no local entrance exam required.",
    totalFees: "₹20,00,000 - ₹35,00,000",
    annualTuition: "₹3,20,000 - ₹4,20,000",
    duration: "5+1 years",
    fmgePassRate: "Varies by university",
    nmcApproved: true,
    topUniversities: [
      { name: "Kazakh National Medical University", annualFees: "₹3,80,000", city: "Almaty" },
      { name: "Astana Medical University", annualFees: "₹4,20,000", city: "Astana" },
      { name: "Semey Medical University", annualFees: "₹3,50,000", city: "Semey" },
      { name: "Karaganda Medical University", annualFees: "₹3,60,000", city: "Karaganda" },
      { name: "South Kazakhstan Medical Academy", annualFees: "₹3,20,000", city: "Shymkent" },
      { name: "Al-Farabi Kazakh National University", annualFees: "₹4,00,000", city: "Almaty" },
    ],
  },
  Kyrgyzstan: {
    description: "Kyrgyzstan is the cheapest destination for MBBS abroad with NMC-approved universities. Very affordable tuition and living costs, ideal for budget-conscious students.",
    totalFees: "₹18,00,000 - ₹28,00,000",
    annualTuition: "₹2,00,000 - ₹3,50,000",
    duration: "5+1 years",
    fmgePassRate: "Varies by university",
    nmcApproved: true,
    topUniversities: [
      { name: "Kyrgyz State Medical Academy", annualFees: "₹3,00,000", city: "Bishkek" },
      { name: "Asian Medical Institute", annualFees: "₹2,20,000", city: "Kant" },
      { name: "International University of Kyrgyzstan", annualFees: "₹2,50,000", city: "Bishkek" },
      { name: "Osh State University", annualFees: "₹2,00,000", city: "Osh" },
      { name: "Jalal-Abad State University", annualFees: "₹2,30,000", city: "Jalal-Abad" },
    ],
  },
  Philippines: {
    description: "Philippines follows American-style medical education with English as native language. Excellent FMGE pass rates and strong USMLE pathways make it a preferred choice.",
    totalFees: "₹27,00,000 - ₹40,00,000",
    annualTuition: "₹5,00,000 - ₹6,00,000",
    duration: "5+1 years",
    fmgePassRate: "Higher than average",
    nmcApproved: true,
    topUniversities: [
      { name: "University of the Philippines College of Medicine", annualFees: "₹5,50,000", city: "Manila" },
      { name: "University of Santo Tomas", annualFees: "₹6,00,000", city: "Manila" },
      { name: "Davao Medical School Foundation", annualFees: "₹5,00,000", city: "Davao" },
      { name: "Cebu Doctors' University", annualFees: "₹5,20,000", city: "Cebu" },
      { name: "University of Perpetual Help", annualFees: "₹4,80,000", city: "Manila" },
    ],
  },
  Bangladesh: {
    description: "Bangladesh offers MBBS education with India-like patient flow and higher FMGE pass rates. Cultural and geographical proximity makes it convenient for Indian students.",
    totalFees: "₹35,00,000 - ₹50,00,000",
    annualTuition: "₹5,00,000 - ₹9,00,000",
    duration: "5+1 years",
    fmgePassRate: "Higher than CIS average",
    nmcApproved: true,
    topUniversities: [
      { name: "Dhaka Medical College", annualFees: "₹8,00,000", city: "Dhaka" },
      { name: "Bangladesh Medical College", annualFees: "₹7,50,000", city: "Dhaka" },
      { name: "Sir Salimullah Medical College", annualFees: "₹6,50,000", city: "Dhaka" },
      { name: "Rajshahi Medical College", annualFees: "₹5,00,000", city: "Rajshahi" },
      { name: "Chittagong Medical College", annualFees: "₹5,50,000", city: "Chittagong" },
    ],
  },
  Uzbekistan: {
    description: "Uzbekistan is an emerging destination for Indian MBBS students with improving infrastructure and growing Indian presence. Affordable fees with NMC-approved programs.",
    totalFees: "₹22,00,000 - ₹30,00,000",
    annualTuition: "₹3,00,000 - ₹4,00,000",
    duration: "5+1 years",
    fmgePassRate: "Varies by university",
    nmcApproved: true,
    topUniversities: [
      { name: "Tashkent Medical Academy", annualFees: "₹3,50,000", city: "Tashkent" },
      { name: "Samarkand State Medical Institute", annualFees: "₹3,00,000", city: "Samarkand" },
      { name: "Bukhara State Medical Institute", annualFees: "₹3,20,000", city: "Bukhara" },
      { name: "Andijan State Medical Institute", annualFees: "₹2,80,000", city: "Andijan" },
      { name: "Urgench Branch of Tashkent Medical Academy", annualFees: "₹2,50,000", city: "Urgench" },
    ],
  },
};

async function main() {
  for (const [countryName, data] of Object.entries(mbbsData)) {
    let country = await prisma.country.findFirst({ where: { name: countryName } });
    if (!country) {
      country = await prisma.country.create({
        data: {
          name: countryName,
          code: countryName.substring(0, 2).toUpperCase(),
          description: `MBBS destination for Indian students. ${data.description}`,
          currency: "USD",
        },
      });
      console.log(`CREATED country: ${countryName}`);
    } else {
      console.log(`FOUND country: ${countryName} (${country.id})`);
    }

    const mbbsInfo = {
      totalFees: data.totalFees,
      annualTuition: data.annualTuition,
      duration: data.duration,
      fmgePassRate: data.fmgePassRate,
      nmcApproved: data.nmcApproved,
    };

    for (const uni of data.topUniversities) {
      const existing = await prisma.university.findFirst({
        where: { name: { contains: uni.name, mode: "insensitive" }, countryId: country.id },
      });

      if (!existing) {
        await prisma.university.create({
          data: {
            name: uni.name,
            normalizedName: uni.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            countryId: country.id,
            city: uni.city,
            description: `Medical university in ${uni.city}, ${countryName}. NMC-approved MBBS program with annual tuition of ${uni.annualFees}. ${data.description}`,
            feeStructure: { mbbs: { ...mbbsInfo, annualTuition: uni.annualFees } },
            universityType: "STATE",
            isActive: true,
            status: "PUBLISHED",
            visibility: "GLOBAL",
            logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name)}&background=random&color=fff&size=200&bold=true`,
            website: "",
          },
        });
        console.log(`  CREATED: ${uni.name} (${countryName}) - ${uni.annualFees}/yr`);
      } else {
        const existingFee = existing.feeStructure as any;
        await prisma.university.update({
          where: { id: existing.id },
          data: {
            feeStructure: existingFee
              ? { ...existingFee as any, mbbs: { ...mbbsInfo, annualTuition: uni.annualFees } }
              : { mbbs: { ...mbbsInfo, annualTuition: uni.annualFees } },
          },
        });
        console.log(`  UPDATED: ${uni.name} (${countryName}) - added MBBS fee data`);
      }
    }
  }
  console.log("\nDone! MBBS abroad data imported.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
