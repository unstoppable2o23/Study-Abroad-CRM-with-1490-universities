import { PrismaClient, UniversityType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

function mapType(type: string): UniversityType {
  switch (type.toLowerCase()) {
    case 'central': return UniversityType.CENTRAL;
    case 'state': return UniversityType.STATE;
    case 'deemed': return UniversityType.DEEMED;
    case 'private': return UniversityType.PRIVATE;
    default: return UniversityType.PRIVATE;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateWebsite(properName: string): string {
  const s = properName.toLowerCase();
  const knownDomains: Record<string, string> = {
    'aligarh muslim university': 'amu.ac.in',
    'banaras hindu university': 'bhu.ac.in',
    'university of delhi': 'du.ac.in',
    'delhi university': 'du.ac.in',
    'jawaharlal nehru university': 'jnu.ac.in',
    'university of calcutta': 'caluniv.ac.in',
    'calcutta university': 'caluniv.ac.in',
    'university of madras': 'unom.ac.in',
    'madras university': 'unom.ac.in',
    'university of mumbai': 'mu.ac.in',
    'mumbai university': 'mu.ac.in',
    'jamia millia islamia': 'jmi.ac.in',
    'indira gandhi national open university': 'ignou.ac.in',
    'anna university': 'annauniv.edu',
    'amrita vishwa vidyapeetham': 'amrita.edu',
    'bits pilani': 'bits-pilani.ac.in',
    'birla institute of technology & science': 'bits-pilani.ac.in',
    'birla institute of technology': 'bitmesra.ac.in',
    'iit bombay': 'iitb.ac.in',
    'iit delhi': 'iitd.ac.in',
    'iit kanpur': 'iitk.ac.in',
    'iit kharagpur': 'iitkgp.ac.in',
    'iit madras': 'iitm.ac.in',
    'iit roorkee': 'iitr.ac.in',
    'iit guwahati': 'iitg.ac.in',
    'iisc bangalore': 'iisc.ac.in',
    'indian institute of science': 'iisc.ac.in',
    'lovely professional university': 'lpu.in',
    'vellore institute of technology': 'vit.ac.in',
    'vit university': 'vit.ac.in',
    'manipal academy of higher education': 'manipal.edu',
    'symbiosis international': 'siu.edu.in',
    'srm institute of science and technology': 'srmist.edu.in',
    'sastra deemed university': 'sastra.edu',
    'thapar university': 'thapar.edu',
    'thapar institute of engineering': 'thapar.edu',
    'university of hyderabad': 'uohyd.ac.in',
    'hyderabad university': 'uohyd.ac.in',
    'aligarh university': 'amu.ac.in',
    'banasthali vidyapith': 'banasthali.in',
    'shiv nadar university': 'snu.edu.in',
    'ashoka university': 'ashoka.edu.in',
    'azim premji university': 'azimpremjiuniversity.edu.in',
    'tata institute of social sciences': 'tiss.edu',
    'tata institute of fundamental research': 'tifr.res.in',
    'nirma university': 'nirmauni.ac.in',
    'dhirubhai ambani institute': 'daiict.ac.in',
    'pune university': 'unipune.ac.in',
    'savitribai phule pune university': 'unipune.ac.in',
    'gujarat university': 'gujaratuniversity.ac.in',
    'maharaja sayajirao university': 'msubaroda.ac.in',
    'baroda university': 'msubaroda.ac.in',
    'goa university': 'unigoa.ac.in',
    'punjab university': 'pu.ac.in',
    'panjab university': 'pu.ac.in',
    'chandigarh university': 'cumail.in',
    'savitribai phule university': 'unipune.ac.in',
    'university of mysore': 'uni-mysore.ac.in',
    'mysore university': 'uni-mysore.ac.in',
    'university of kerala': 'keralauniversity.ac.in',
    'kerala university': 'keralauniversity.ac.in',
    'cochin university': 'cusat.ac.in',
    'cochin university of science': 'cusat.ac.in',
    'university of kalyani': 'klyuniv.ac.in',
    'kalyani university': 'klyuniv.ac.in',
    'north bengal university': 'nbu.ac.in',
    'university of north bengal': 'nbu.ac.in',
    'visva bharati': 'visva-bharati.ac.in',
    'visva-bharati': 'visva-bharati.ac.in',
    'sardar patel university': 'spuvvn.edu',
    'veer narmad south gujarat university': 'vnsgu.ac.in',
    'south gujarat university': 'vnsgu.ac.in',
    'bhavnagar university': 'mkbhavuni.edu.in',
    'saurashtra university': 'saurashtrauniversity.edu',
    'hemchandracharya north gujarat university': 'ngu.ac.in',
    'north gujarat university': 'ngu.ac.in',
    'sardarkrushinagar dantiwada agricultural university': 'sdau.edu.in',
    'jammu university': 'jammuuniversity.ac.in',
    'university of jammu': 'jammuuniversity.ac.in',
    'kashmir university': 'kashmiruniversity.net',
    'university of kashmir': 'kashmiruniversity.net',
    'gauhati university': 'gauhati.ac.in',
    'dibrugarh university': 'dibru.ac.in',
    'tezpur university': 'tezu.ernet.in',
    'assam university': 'assamuniversity.nic.in',
    'rajiv gandhi university': 'rgu.ac.in',
    'nagaland university': 'nagalanduniversity.ac.in',
    'mizoram university': 'mzu.edu.in',
    'manipur university': 'manipuruniv.ac.in',
    'tripura university': 'tripurauniv.ac.in',
    'pondicherry university': 'pondiuni.edu.in',
    'sikkim university': 'cus.ac.in',
    'central university of rajasthan': 'curaj.ac.in',
    'central university of jharkhand': 'cuj.ac.in',
    'central university of karnataka': 'cuk.ac.in',
    'central university of kerala': 'cukerala.ac.in',
    'central university of haryana': 'cuh.ac.in',
    'central university of himachal': 'cuhimachal.ac.in',
    'central university of odisha': 'cuo.ac.in',
    'central university of punjab': 'cup.edu.in',
    'central university of south bihar': 'cub.ac.in',
    'central university of tamil nadu': 'cutn.ac.in',
    'central university of gujarat': 'cug.ac.in',
    'babasaheb bhimrao ambedkar university': 'bbau.ac.in',
    'mahatma gandhi antarrashtriya hindi': 'hindivishwa.org',
    'english and foreign languages university': 'efluniversity.ac.in',
    'maulana azad national urdu university': 'manuu.ac.in',
    'hemwati nandan bahuguna garhwal university': 'hnbgu.ac.in',
    'guru ghasidas vishwavidyalaya': 'ggu.ac.in',
    'dr harisingh gour vishwavidyalaya': 'dhsgsu.ac.in',
    'indian maritime university': 'imu.edu.in',
    'nalanda university': 'nalandauniv.edu.in',
    'mahatma gandhi central university': 'mgcub.ac.in',
    'central sanskrit university': 'sanskrit.nic.in',
    'jawaharlal nehru technological university anantapur': 'jntua.ac.in',
    'jntu anantapur': 'jntua.ac.in',
    'jawaharlal nehru technological university kakinada': 'jntuk.edu.in',
    'jntu kakinada': 'jntuk.edu.in',
    'jawaharlal nehru technological university hyderabad': 'jntuh.ac.in',
    'jntu hyderabad': 'jntuh.ac.in',
    'andhra university': 'andhrauniversity.edu.in',
    'sri venkateswara university': 'svuniversity.edu.in',
    'krishna university': 'krishnauniversity.edu.in',
    'yogi vemana university': 'yogivemanauniversity.ac.in',
    'dravidian university': 'dravidianuniversity.ac.in',
    'sri krishnadevaraya university': 'skuniversity.ac.in',
    'acharya nagarjuna university': 'anu.ac.in',
    'nagarjuna university': 'anu.ac.in',
    'adikavi nannaya university': 'nannaya.ac.in',
    'vignan university': 'vignan.ac.in',
    'kl university': 'kluniversity.in',
    'koneru lakshmaiah education foundation': 'kluniversity.in',
    'k l university': 'kluniversity.in',
    'gitam university': 'gitam.edu',
    'gandhi institute of technology and management': 'gitam.edu',
    'centurion university of technology and management': 'cutm.ac.in',
    'shiksha o anusandhan': 'soa.ac.in',
    'siksha o anusandhan': 'soa.ac.in',
    'kiit university': 'kiit.ac.in',
    'kalinga institute of industrial technology': 'kiit.ac.in',
    'veer surendra sai university of technology': 'vssut.ac.in',
    'biju patnaik university of technology': 'bput.ac.in',
    'utkal university': 'utkaluniversity.ac.in',
    'berhampur university': 'buodisha.edu.in',
    'sambalpur university': 'suniv.ac.in',
    'fakir mohan university': 'fmuniversity.ac.in',
    'ravenshaw university': 'ravenshawuniversity.ac.in',
    'north orissa university': 'nou.ac.in',
    'orissa university of agriculture': 'ouat.ac.in',
    'uttarakhand technical university': 'uktech.ac.in',
    'kumaun university': 'kumaun.ac.in',
    'hemvati nandan bahuguna garhwal university': 'hnbgu.ac.in',
    'gb pant university of agriculture': 'gbpuat.ac.in',
    'pantnagar university': 'gbpuat.ac.in',
    'gurukula kangri university': 'gkv.ac.in',
    'gurukul kangri vishwavidyalaya': 'gkv.ac.in',
    'assam agricultural university': 'aau.ac.in',
    'assam rajiv gandhi university': 'argu.ac.in',
    'assam science and technology': 'astu.ac.in',
    'kumar bhaskar varma sanskrit': 'kbvsasu.ac.in',
    'krishna kanta handique': 'kkhsou.in',
    'cotton college state university': 'cottonstateuniversity.ac.in',
    'bhatkhande music institute': 'bhatkhandemusic.edu.in',
    'integrity university': 'integraluniversity.ac.in',
    'babu banarasi das university': 'bbdu.ac.in',
    'jai narain vyas university': 'jnvu.edu.in',
    'jnvu jodhpur': 'jnvu.edu.in',
    'mohan lal sukhadia university': 'mlsu.ac.in',
    'maharaja ganga singh university': 'mgsubikaner.ac.in',
    'maharishi dayanand saraswati university': 'mdsuajmer.ac.in',
    'university of rajasthan': 'uniraj.ac.in',
    'rajasthan university': 'uniraj.ac.in',
    'university of kota': 'uok.ac.in',
    'government engineering college ajmer': 'gecajmer.ac.in',
    'maharaja surajmal brij university': 'msbrijuniversity.ac.in',
    'bikaner technical university': 'btu.ac.in',
    'rajasthan technical university': 'rtu.ac.in',
    'university of engineering and management jaipur': 'uem.edu.in',
    'poornima university': 'poornima.org',
  };
  const norm = s.replace(/[^a-z0-9 ]/g, '').trim();
  for (const [key, domain] of Object.entries(knownDomains)) {
    if (norm.includes(key)) return `https://${domain}`;
  }
  const slug = slugify(properName);
  return `https://${slug}.ac.in`;
}

interface UniRow {
  properName: string;
  type: string;
  state: string;
  established: number | null;
}

async function main() {
  const csvPath = path.join(__dirname, '..', 'temp_uni_data.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found. Download it first.');
    process.exit(1);
  }

  const rows: UniRow[] = [];
  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n');
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV parse (handles basic cases)
    const parts = line.split(',');
    if (parts.length >= 4) {
      const properName = parts[0].replace(/^"|"$/g, '').trim();
      const type = parts[2].replace(/^"|"$/g, '').trim();
      const state = parts[3].replace(/^"|"$/g, '').trim();
      const yearStr = parts[5] ? parts[5].replace(/^"|"$/g, '').trim() : '';
      rows.push({
        properName,
        type,
        state,
        established: yearStr ? parseInt(yearStr, 10) || null : null,
      });
    }
  }

  console.log(`Parsed ${rows.length} universities from CSV`);

  // Find India's country ID
  const india = await prisma.country.findFirst({ where: { code: 'IN' } });
  if (!india) {
    console.error('India country not found. Please seed countries first.');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Get all existing Indian universities
  const existingUnis = await prisma.university.findMany({
    where: { countryId: india.id },
    select: { id: true, name: true, website: true, universityType: true, state: true },
  });

  const existingMap = new Map<string, typeof existingUnis[0]>();
  for (const u of existingUnis) {
    existingMap.set(u.name.toLowerCase().trim(), u);
    // Also index by normalized name
    const normalized = u.name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (!existingMap.has(normalized)) {
      existingMap.set(normalized, u);
    }
  }

  for (const row of rows) {
    try {
      const normalizedName = row.properName.toLowerCase().trim();
      const normalizedSearch = normalizedName.replace(/[^a-z0-9]/g, '');
      
      // Try to find existing
      let existing = existingMap.get(normalizedName) || existingMap.get(normalizedSearch);
      
      // Try partial match
      if (!existing) {
        for (const [key, val] of existingMap.entries()) {
          if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
            existing = val;
            break;
          }
        }
      }

      const uniType = mapType(row.type);
      const website = generateWebsite(row.properName);

      if (existing) {
        // Update existing
        const updateData: any = {};
        if (!existing.universityType) updateData.universityType = uniType;
        if (!existing.state) updateData.state = row.state;
        if (!existing.website) updateData.website = website;

        if (Object.keys(updateData).length > 0) {
          await prisma.university.update({
            where: { id: existing.id },
            data: updateData,
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new university
        await prisma.university.create({
          data: {
            name: row.properName,
            countryId: india.id,
            state: row.state,
            city: row.state,
            website,
            universityType: uniType,
            ranking: null,
            rankingSource: 'UGC',
            intakePeriods: ['Fall', 'Spring'],
            isActive: true,
            status: 'PUBLISHED',
            visibility: 'GLOBAL',
          },
        });
        created++;
      }
    } catch (err) {
      console.error(`Error processing "${row.properName}":`, err instanceof Error ? err.message : err);
      errors++;
    }
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log(`Total Indian universities now: ${await prisma.university.count({ where: { countryId: india.id } })}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
