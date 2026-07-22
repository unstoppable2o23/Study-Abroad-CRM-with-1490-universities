import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const cityToState: Record<string, string> = {
  Agartala: 'Tripura',
  Ahmedabad: 'Gujarat',
  Aizawl: 'Mizoram',
  Ajmer: 'Rajasthan',
  Aligarh: 'Uttar Pradesh',
  Amritsar: 'Punjab',
  Bangalore: 'Karnataka',
  Bathinda: 'Punjab',
  Bengaluru: 'Karnataka',
  Berhampur: 'Odisha',
  Bhilai: 'Chhattisgarh',
  Bhopal: 'Madhya Pradesh',
  Bhubaneswar: 'Odisha',
  'Bodh Gaya': 'Bihar',
  Calicut: 'Kerala',
  Chandigarh: 'Chandigarh',
  Chennai: 'Tamil Nadu',
  Coimbatore: 'Tamil Nadu',
  Cuttack: 'Odisha',
  Dhanbad: 'Jharkhand',
  Dharwad: 'Karnataka',
  Dimapur: 'Nagaland',
  Durgapur: 'West Bengal',
  Ganderbal: 'Jammu and Kashmir',
  Gandhinagar: 'Gujarat',
  'Greater Noida': 'Uttar Pradesh',
  Guwahati: 'Assam',
  Hamirpur: 'Himachal Pradesh',
  Hyderabad: 'Telangana',
  Imphal: 'Manipur',
  Indore: 'Madhya Pradesh',
  Jabalpur: 'Madhya Pradesh',
  Jaipur: 'Rajasthan',
  Jammu: 'Jammu and Kashmir',
  Jamshedpur: 'Jharkhand',
  Jodhpur: 'Rajasthan',
  Kalaburagi: 'Karnataka',
  Kalyani: 'West Bengal',
  Kanpur: 'Uttar Pradesh',
  Karaikal: 'Puducherry',
  Kasaragod: 'Kerala',
  Kashipur: 'Uttarakhand',
  Kharagpur: 'West Bengal',
  Kochi: 'Kerala',
  Kolkata: 'West Bengal',
  Koraput: 'Odisha',
  Kota: 'Rajasthan',
  Kozhikode: 'Kerala',
  Kurukshetra: 'Haryana',
  Longowal: 'Punjab',
  Lucknow: 'Uttar Pradesh',
  Madurai: 'Tamil Nadu',
  Mahendragarh: 'Haryana',
  Mandi: 'Himachal Pradesh',
  Mangalore: 'Karnataka',
  Manipal: 'Karnataka',
  Mohali: 'Punjab',
  Mumbai: 'Maharashtra',
  Mysuru: 'Karnataka',
  Nagpur: 'Maharashtra',
  'Navi Mumbai': 'Maharashtra',
  Neemrana: 'Rajasthan',
  'New Delhi': 'Delhi',
  Noida: 'Uttar Pradesh',
  Palakkad: 'Kerala',
  Patiala: 'Punjab',
  Patna: 'Bihar',
  Phagwara: 'Punjab',
  Pilani: 'Rajasthan',
  Prayagraj: 'Uttar Pradesh',
  Pune: 'Maharashtra',
  Raipur: 'Chhattisgarh',
  Ranchi: 'Jharkhand',
  Ravangla: 'Sikkim',
  Rohtak: 'Haryana',
  Roorkee: 'Uttarakhand',
  Rourkela: 'Odisha',
  Rupnagar: 'Punjab',
  Sambalpur: 'Odisha',
  Shillong: 'Meghalaya',
  Silchar: 'Assam',
  Sirmaur: 'Himachal Pradesh',
  Sonipat: 'Haryana',
  'Sri City': 'Andhra Pradesh',
  Srinagar: 'Jammu and Kashmir',
  Sriviliputhur: 'Tamil Nadu',
  Surat: 'Gujarat',
  Tezpur: 'Assam',
  Thiruvananthapuram: 'Kerala',
  Thiruvarur: 'Tamil Nadu',
  Tiruchirappalli: 'Tamil Nadu',
  Tirupati: 'Andhra Pradesh',
  Udaipur: 'Rajasthan',
  Vaddeswaram: 'Andhra Pradesh',
  Vadodara: 'Gujarat',
  Varanasi: 'Uttar Pradesh',
  Vellore: 'Tamil Nadu',
  Visakhapatnam: 'Andhra Pradesh',
  Warangal: 'Telangana',
  Yupia: 'Arunachal Pradesh',
};

const stateNames = new Set([
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]);

function normalizeForMatch(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const india = await prisma.country.findUnique({ where: { name: 'India' }, select: { id: true } });
  if (!india) { console.log('India not found'); return; }

  const universities = await prisma.university.findMany({
    where: { countryId: india.id },
    select: { id: true, name: true, city: true, state: true },
  });

  console.log(`Total Indian universities: ${universities.length}`);

  let updated = 0;
  let stateLikeMoved = 0;
  let cityMapped = 0;
  let skipped = 0;

  for (const uni of universities) {
    let newState: string | null = null;
    let newCity: string | null = uni.city;

    if (uni.city) {
      const cityTrimmed = uni.city.trim();

      if (stateNames.has(cityTrimmed)) {
        newState = cityTrimmed;
        newCity = null;
        stateLikeMoved++;
      } else if (cityToState[cityTrimmed]) {
        newState = cityToState[cityTrimmed];
        cityMapped++;
      } else {
        skipped++;
        continue;
      }
    } else {
      skipped++;
      continue;
    }

    await prisma.university.update({
      where: { id: uni.id },
      data: { state: newState, city: newCity },
    });
    updated++;
  }

  console.log(`Updated: ${updated}`);
  console.log(`  State-like values moved to state field: ${stateLikeMoved}`);
  console.log(`  Cities mapped to state: ${cityMapped}`);
  console.log(`Skipped (no city or unmapped): ${skipped}`);

  const stateCounts = await prisma.university.groupBy({
    by: ['state'],
    where: { countryId: india.id, state: { not: null } },
    _count: true,
    orderBy: { state: 'asc' },
  });

  console.log('\nUniversities per state:');
  for (const s of stateCounts) {
    console.log(`  ${s.state}: ${s._count}`);
  }
  console.log(`Total with state: ${stateCounts.reduce((a, b) => a + b._count, 0)}`);

  const withoutState = await prisma.university.count({
    where: { countryId: india.id, state: null },
  });
  console.log(`Without state: ${withoutState}`);
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
