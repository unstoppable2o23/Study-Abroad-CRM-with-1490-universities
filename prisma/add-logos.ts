import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function generateLogoUrl(name: string): string {
  const encoded = encodeURIComponent(name.trim());
  return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&size=200&bold=true&font-size=0.5`;
}

async function main() {
  const universities = await prisma.university.findMany({ where: { logoUrl: null }, select: { id: true, name: true } });
  console.log(`Updating ${universities.length} universities with logoUrl...`);

  let count = 0;
  const batchSize = 100;
  for (let i = 0; i < universities.length; i += batchSize) {
    const batch = universities.slice(i, i + batchSize);
    await Promise.all(
      batch.map((u) =>
        prisma.university.update({
          where: { id: u.id },
          data: { logoUrl: generateLogoUrl(u.name) },
        })
      )
    );
    count += batch.length;
    console.log(`Progress: ${count}/${universities.length}`);
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
