import { PrismaClient, UniversityType } from "@prisma/client";

const prisma = new PrismaClient();

function guessIndianType(name: string): UniversityType {
  const l = name.toLowerCase();
  if (l.includes("indian institute of technology") || l.includes("national institute of technology") || l.startsWith("nit ") || l.includes("iit ")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("indian institute of information technology") || l.includes("iiit")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("indian institute of science education and research") || l.includes("iiser")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("indian institute of management") || l.includes("iim ")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("national law school") || l.includes("national law university") || l.includes("nalsar")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("all india institute of medical sciences") || l.includes("aiims")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("pgimer") || l.includes("nimhans") || l.includes("jipmer")) return UniversityType.INSTITUTE_OF_NATIONAL_IMPORTANCE;
  if (l.includes("central university")) return UniversityType.CENTRAL;
  if (l.includes("university of hyderabad") || l.includes("tezpur university") || l.includes("pondicherry university") || l.includes("university of allahabad")) return UniversityType.CENTRAL;
  if (l.includes("jamia millia") || l.includes("jawaharlal nehru university") || l.includes("banaras hindu") || l.includes("aligarh muslim") || l.includes("university of delhi") || l.includes("university of kashmir") || l.includes("visva bharati")) return UniversityType.CENTRAL;
  if (l.includes("university of ") || l.includes(" university") && (l.includes("state") || l.endsWith("university"))) {
    if (l.includes("chandigarh university") || l.includes("lovely professional") || l.includes("srm ") || l.includes("vit ") || l.includes("amity ") || l.includes("sharda ") || l.includes("kiit ") || l.includes("christ university") || l.includes("jain university") || l.includes("pes university") || l.includes("symbiosis") || l.includes("bits pilani") || l.includes("ashoka university") || l.includes("shiv nadar") || l.includes("ahmedabad university") || l.includes("amrita ") || l.includes("manipal ") || l.includes("thapar ") || l.includes("gitam") || l.includes("koneru") || l.includes("jss ") || l.includes("saveetha") || l.includes("kalasalingam") || l.includes("gandhi institute") || l.includes("siksha o anusandhan") || l.includes("niit university") || l.includes("jio institute")) return UniversityType.PRIVATE;
    return UniversityType.STATE;
  }
  if (l.includes("college") || l.includes("institute") || l.includes("school")) return UniversityType.AUTONOMOUS;
  return UniversityType.PRIVATE;
}

const indianUniversities = [
  // IITs (23)
  { name: "Indian Institute of Technology Bombay", city: "Mumbai", website: "https://iitb.ac.in", ranking: 1 },
  { name: "Indian Institute of Technology Delhi", city: "New Delhi", website: "https://iitd.ac.in", ranking: 2 },
  { name: "Indian Institute of Technology Madras", city: "Chennai", website: "https://iitm.ac.in", ranking: 3 },
  { name: "Indian Institute of Technology Kanpur", city: "Kanpur", website: "https://iitk.ac.in", ranking: 4 },
  { name: "Indian Institute of Technology Kharagpur", city: "Kharagpur", website: "https://iitkgp.ac.in", ranking: 5 },
  { name: "Indian Institute of Technology Roorkee", city: "Roorkee", website: "https://iitr.ac.in", ranking: 6 },
  { name: "Indian Institute of Technology Guwahati", city: "Guwahati", website: "https://iitg.ac.in", ranking: 7 },
  { name: "Indian Institute of Technology Hyderabad", city: "Hyderabad", website: "https://iith.ac.in", ranking: 8 },
  { name: "Indian Institute of Technology Jodhpur", city: "Jodhpur", website: "https://iitj.ac.in", ranking: 9 },
  { name: "Indian Institute of Technology Patna", city: "Patna", website: "https://iitp.ac.in", ranking: 10 },
  { name: "Indian Institute of Technology Indore", city: "Indore", website: "https://iiti.ac.in", ranking: 11 },
  { name: "Indian Institute of Technology Mandi", city: "Mandi", website: "https://iitmandi.ac.in", ranking: 12 },
  { name: "Indian Institute of Technology (BHU) Varanasi", city: "Varanasi", website: "https://iitbhu.ac.in", ranking: 13 },
  { name: "Indian Institute of Technology Gandhinagar", city: "Gandhinagar", website: "https://iitgn.ac.in", ranking: 14 },
  { name: "Indian Institute of Technology Ropar", city: "Rupnagar", website: "https://iitrpr.ac.in", ranking: 15 },
  { name: "Indian Institute of Technology Bhubaneswar", city: "Bhubaneswar", website: "https://iitbbs.ac.in", ranking: 16 },
  { name: "Indian Institute of Technology Palakkad", city: "Palakkad", website: "https://iitpkd.ac.in", ranking: 17 },
  { name: "Indian Institute of Technology Tirupati", city: "Tirupati", website: "https://iittp.ac.in", ranking: 18 },
  { name: "Indian Institute of Technology Dhanbad (ISM)", city: "Dhanbad", website: "https://iitism.ac.in", ranking: 19 },
  { name: "Indian Institute of Technology Bhilai", city: "Bhilai", website: "https://iitbhilai.ac.in", ranking: 20 },
  { name: "Indian Institute of Technology Goa", city: "Goa", website: "https://iitgoa.ac.in", ranking: 21 },
  { name: "Indian Institute of Technology Jammu", city: "Jammu", website: "https://iitjammu.ac.in", ranking: 22 },
  { name: "Indian Institute of Technology Dharwad", city: "Dharwad", website: "https://iitdh.ac.in", ranking: 23 },

  // NITs (31)
  { name: "National Institute of Technology Tiruchirappalli", city: "Tiruchirappalli", website: "https://nitt.edu", ranking: 24 },
  { name: "National Institute of Technology Karnataka", city: "Mangalore", website: "https://nitk.ac.in", ranking: 25 },
  { name: "National Institute of Technology Rourkela", city: "Rourkela", website: "https://nitrkl.ac.in", ranking: 26 },
  { name: "National Institute of Technology Warangal", city: "Warangal", website: "https://nitw.ac.in", ranking: 27 },
  { name: "National Institute of Technology Calicut", city: "Calicut", website: "https://nitc.ac.in", ranking: 28 },
  { name: "National Institute of Technology Durgapur", city: "Durgapur", website: "https://nitdgp.ac.in", ranking: 29 },
  { name: "National Institute of Technology Silchar", city: "Silchar", website: "https://nits.ac.in", ranking: 30 },
  { name: "National Institute of Technology Hamirpur", city: "Hamirpur", website: "https://nith.ac.in", ranking: 31 },
  { name: "National Institute of Technology Kurukshetra", city: "Kurukshetra", website: "https://nitkkr.ac.in", ranking: 32 },
  { name: "National Institute of Technology Jamshedpur", city: "Jamshedpur", website: "https://nitjsr.ac.in", ranking: 33 },
  { name: "National Institute of Technology Patna", city: "Patna", website: "https://nitp.ac.in", ranking: 34 },
  { name: "National Institute of Technology Raipur", city: "Raipur", website: "https://nitrr.ac.in", ranking: 35 },
  { name: "National Institute of Technology Srinagar", city: "Srinagar", website: "https://nitsri.ac.in", ranking: 36 },
  { name: "National Institute of Technology Surat", city: "Surat", website: "https://svnit.ac.in", ranking: 37 },
  { name: "National Institute of Technology Allahabad", city: "Prayagraj", website: "https://mnnit.ac.in", ranking: 38 },
  { name: "National Institute of Technology Bhopal", city: "Bhopal", website: "https://manit.ac.in", ranking: 39 },
  { name: "National Institute of Technology Nagpur", city: "Nagpur", website: "https://vnit.ac.in", ranking: 40 },
  { name: "National Institute of Technology Agartala", city: "Agartala", website: "https://nita.ac.in", ranking: 41 },
  { name: "National Institute of Technology Delhi", city: "New Delhi", website: "https://nitdelhi.ac.in", ranking: 42 },
  { name: "National Institute of Technology Goa", city: "Goa", website: "https://nitgoa.ac.in", ranking: 43 },
  { name: "National Institute of Technology Mizoram", city: "Aizawl", website: "https://nitmz.ac.in", ranking: 44 },
  { name: "National Institute of Technology Meghalaya", city: "Shillong", website: "https://nitm.ac.in", ranking: 45 },
  { name: "National Institute of Technology Nagaland", city: "Dimapur", website: "https://nitnagaland.ac.in", ranking: 46 },
  { name: "National Institute of Technology Arunachal Pradesh", city: "Yupia", website: "https://nitap.ac.in", ranking: 47 },
  { name: "National Institute of Technology Sikkim", city: "Ravangla", website: "https://nitsikkim.ac.in", ranking: 48 },
  { name: "National Institute of Technology Manipur", city: "Imphal", website: "https://nitmanipur.ac.in", ranking: 49 },
  { name: "National Institute of Technology Uttarakhand", city: "Srinagar", website: "https://nituk.ac.in", ranking: 50 },
  { name: "National Institute of Technology Puducherry", city: "Karaikal", website: "https://nitpy.ac.in", ranking: 51 },
  { name: "National Institute of Technology Tripura", city: "Agartala", website: "https://nittagartala.ac.in", ranking: 52 },
  { name: "National Institute of Technology Mizoram", city: "Aizawl", website: "https://nitmz.ac.in", ranking: 53 },
  { name: "Sant Longowal Institute of Engineering and Technology", city: "Longowal", website: "https://sliet.ac.in", ranking: 54 },

  // Top Central Universities
  { name: "University of Hyderabad", city: "Hyderabad", website: "https://uohyd.ac.in", ranking: 55 },
  { name: "Tezpur University", city: "Tezpur", website: "https://tezu.ernet.in", ranking: 56 },
  { name: "Pondicherry University", city: "Puducherry", website: "https://pondiuni.edu.in", ranking: 57 },
  { name: "University of Allahabad", city: "Prayagraj", website: "https://allduniv.ac.in", ranking: 58 },
  { name: "Central University of Rajasthan", city: "Ajmer", website: "https://curaj.ac.in", ranking: 59 },
  { name: "Central University of Punjab", city: "Bathinda", website: "https://cup.edu.in", ranking: 60 },
  { name: "Central University of Karnataka", city: "Kalaburagi", website: "https://cuk.ac.in", ranking: 61 },
  { name: "Central University of Tamil Nadu", city: "Thiruvarur", website: "https://cutn.ac.in", ranking: 62 },
  { name: "Central University of Haryana", city: "Mahendragarh", website: "https://cuh.ac.in", ranking: 63 },
  { name: "Central University of Gujarat", city: "Gandhinagar", website: "https://cug.ac.in", ranking: 64 },
  { name: "Central University of Jharkhand", city: "Ranchi", website: "https://cuj.ac.in", ranking: 65 },
  { name: "Central University of Kashmir", city: "Ganderbal", website: "https://cukashmir.ac.in", ranking: 66 },
  { name: "Central University of Kerala", city: "Kasaragod", website: "https://cukerala.ac.in", ranking: 67 },
  { name: "Central University of Odisha", city: "Koraput", website: "https://cuo.ac.in", ranking: 68 },
  { name: "Central University of Rajasthan", city: "Ajmer", website: "https://curaj.ac.in", ranking: 69 },

  // Top State Universities
  { name: "Anna University", city: "Chennai", website: "https://annauniv.edu", ranking: 70 },
  { name: "University of Mumbai", city: "Mumbai", website: "https://mu.ac.in", ranking: 71 },
  { name: "University of Calcutta", city: "Kolkata", website: "https://caluniv.ac.in", ranking: 72 },
  { name: "University of Madras", city: "Chennai", website: "https://unom.ac.in", ranking: 73 },
  { name: "University of Pune", city: "Pune", website: "https://unipune.ac.in", ranking: 74 },
  { name: "Panjab University", city: "Chandigarh", website: "https://puchd.ac.in", ranking: 75 },
  { name: "University of Mysore", city: "Mysuru", website: "https://uni-mysore.ac.in", ranking: 76 },
  { name: "University of Lucknow", city: "Lucknow", website: "https://lkouniv.ac.in", ranking: 77 },
  { name: "University of Kerala", city: "Thiruvananthapuram", website: "https://keralauniversity.ac.in", ranking: 78 },
  { name: "Osmania University", city: "Hyderabad", website: "https://osmania.ac.in", ranking: 79 },
  { name: "University of Jammu", city: "Jammu", website: "https://jammuuniversity.ac.in", ranking: 80 },
  { name: "Gujarat University", city: "Ahmedabad", website: "https://gujaratuniversity.ac.in", ranking: 81 },
  { name: "Andhra University", city: "Visakhapatnam", website: "https://andhrauniversity.edu.in", ranking: 82 },
  { name: "Bangalore University", city: "Bengaluru", website: "https://bub.ernet.in", ranking: 83 },
  { name: "University of Rajasthan", city: "Jaipur", website: "https://uniraj.ac.in", ranking: 84 },
  { name: "Savitribai Phule Pune University", city: "Pune", website: "https://unipune.ac.in", ranking: 85 },

  // Top Private Universities
  { name: "Chandigarh University", city: "Mohali", website: "https://cum.edu.in", ranking: 86 },
  { name: "Lovely Professional University", city: "Phagwara", website: "https://lpu.in", ranking: 87 },
  { name: "SRM Institute of Science and Technology", city: "Chennai", website: "https://srmist.edu.in", ranking: 88 },
  { name: "VIT University", city: "Vellore", website: "https://vit.ac.in", ranking: 89 },
  { name: "Amity University Noida", city: "Noida", website: "https://amity.edu", ranking: 90 },
  { name: "Sharda University", city: "Greater Noida", website: "https://sharda.ac.in", ranking: 91 },
  { name: "KIIT University", city: "Bhubaneswar", website: "https://kiit.ac.in", ranking: 92 },
  { name: "Siksha O Anusandhan University", city: "Bhubaneswar", website: "https://soa.ac.in", ranking: 93 },
  { name: "Amrita Vishwa Vidyapeetham", city: "Coimbatore", website: "https://amrita.edu", ranking: 94 },
  { name: "Manipal Academy of Higher Education", city: "Manipal", website: "https://manipal.edu", ranking: 95 },
  { name: "JSS Academy of Higher Education and Research", city: "Mysuru", website: "https://jssuni.edu.in", ranking: 96 },
  { name: "Kalasalingam Academy of Research and Education", city: "Sriviliputhur", website: "https://kalasalingam.ac.in", ranking: 97 },
  { name: "Saveetha Institute of Medical and Technical Sciences", city: "Chennai", website: "https://saveetha.com", ranking: 98 },
  { name: "Thapar Institute of Engineering and Technology", city: "Patiala", website: "https://thapar.edu", ranking: 99 },
  { name: "Koneru Lakshmaiah Education Foundation", city: "Vaddeswaram", website: "https://kluniversity.in", ranking: 100 },
  { name: "Gandhi Institute of Technology and Management", city: "Visakhapatnam", website: "https://gitam.edu", ranking: 101 },
  { name: "Christ University", city: "Bengaluru", website: "https://christuniversity.in", ranking: 102 },
  { name: "Jain University", city: "Bengaluru", website: "https://jainuniversity.ac.in", ranking: 103 },
  { name: "PES University", city: "Bengaluru", website: "https://pes.edu", ranking: 104 },
  { name: "Symbiosis International University", city: "Pune", website: "https://siu.edu.in", ranking: 105 },
  { name: "BITS Pilani", city: "Pilani", website: "https://bits-pilani.ac.in", ranking: 106 },
  { name: "BITS Pilani Dubai Campus", city: "Dubai", website: "https://bits-pilani.ac.in", ranking: 107 },
  { name: "BITS Pilani Hyderabad Campus", city: "Hyderabad", website: "https://bits-pilani.ac.in", ranking: 108 },
  { name: "BITS Pilani Goa Campus", city: "Goa", website: "https://bits-pilani.ac.in", ranking: 109 },
  { name: "NIIT University", city: "Neemrana", website: "https://niituniversity.in", ranking: 110 },
  { name: "Ashoka University", city: "Sonipat", website: "https://ashoka.edu.in", ranking: 111 },
  { name: "Shiv Nadar University", city: "Noida", website: "https://snu.edu.in", ranking: 112 },
  { name: "Ahmedabad University", city: "Ahmedabad", website: "https://ahmedabaduniversity.edu.in", ranking: 113 },
  { name: "Jio Institute", city: "Navi Mumbai", website: "https://jioinstitute.edu.in", ranking: 114 },

  // Medical & Research
  { name: "All India Institute of Medical Sciences Delhi", city: "New Delhi", website: "https://aiims.edu", ranking: 115 },
  { name: "Post Graduate Institute of Medical Education and Research", city: "Chandigarh", website: "https://pgimer.edu.in", ranking: 116 },
  { name: "Christian Medical College Vellore", city: "Vellore", website: "https://cmch-vellore.edu", ranking: 117 },
  { name: "National Institute of Mental Health and Neurosciences", city: "Bengaluru", website: "https://nimhans.ac.in", ranking: 118 },
  { name: "Jawaharlal Institute of Postgraduate Medical Education and Research", city: "Puducherry", website: "https://jipmer.edu.in", ranking: 119 },
  { name: "King George's Medical University", city: "Lucknow", website: "https://kgmu.org", ranking: 120 },
  { name: "Maulana Azad Medical College", city: "New Delhi", website: "https://mamc.ac.in", ranking: 121 },
  { name: "Grant Medical College Mumbai", city: "Mumbai", website: "https://gmcgh.org", ranking: 122 },
  { name: "Stanley Medical College", city: "Chennai", website: "https://stanleymedicalcollege.edu.in", ranking: 123 },
  { name: "Madras Medical College", city: "Chennai", website: "https://mmc.ac.in", ranking: 124 },

  // IISERs
  { name: "Indian Institute of Science Education and Research Pune", city: "Pune", website: "https://iiserpune.ac.in", ranking: 125 },
  { name: "Indian Institute of Science Education and Research Kolkata", city: "Kolkata", website: "https://iiserkol.ac.in", ranking: 126 },
  { name: "Indian Institute of Science Education and Research Mohali", city: "Mohali", website: "https://iisermohali.ac.in", ranking: 127 },
  { name: "Indian Institute of Science Education and Research Bhopal", city: "Bhopal", website: "https://iiserb.ac.in", ranking: 128 },
  { name: "Indian Institute of Science Education and Research Thiruvananthapuram", city: "Thiruvananthapuram", website: "https://iisertvm.ac.in", ranking: 129 },
  { name: "Indian Institute of Science Education and Research Berhampur", city: "Berhampur", website: "https://iiserbpr.ac.in", ranking: 130 },
  { name: "Indian Institute of Science Education and Research Tirupati", city: "Tirupati", website: "https://iisertirupati.ac.in", ranking: 131 },

  // IIITs
  { name: "International Institute of Information Technology Hyderabad", city: "Hyderabad", website: "https://iiit.ac.in", ranking: 132 },
  { name: "Indraprastha Institute of Information Technology Delhi", city: "New Delhi", website: "https://iiitd.ac.in", ranking: 133 },
  { name: "Indian Institute of Information Technology Allahabad", city: "Prayagraj", website: "https://iiita.ac.in", ranking: 134 },
  { name: "Indian Institute of Information Technology Sri City", city: "Sri City", website: "https://iiits.ac.in", ranking: 135 },
  { name: "Indian Institute of Information Technology Bangalore", city: "Bengaluru", website: "https://iiitb.ac.in", ranking: 136 },
  { name: "Indian Institute of Information Technology Guwahati", city: "Guwahati", website: "https://iiitg.ac.in", ranking: 137 },
  { name: "Indian Institute of Information Technology Kancheepuram", city: "Chennai", website: "https://iiitdm.ac.in", ranking: 138 },
  { name: "Indian Institute of Information Technology Design and Manufacturing Jabalpur", city: "Jabalpur", website: "https://iiitdmj.ac.in", ranking: 139 },
  { name: "Indian Institute of Information Technology Kalyani", city: "Kalyani", website: "https://iiitkalyani.ac.in", ranking: 140 },
  { name: "Indian Institute of Information Technology Lucknow", city: "Lucknow", website: "https://iiitl.ac.in", ranking: 141 },
  { name: "Indian Institute of Information Technology Nagpur", city: "Nagpur", website: "https://iiitn.ac.in", ranking: 142 },
  { name: "Indian Institute of Information Technology Pune", city: "Pune", website: "https://isquareit.edu.in", ranking: 143 },
  { name: "Indian Institute of Information Technology Vadodara", city: "Vadodara", website: "https://iiitvadodara.ac.in", ranking: 144 },
  { name: "Indian Institute of Information Technology Kota", city: "Kota", website: "https://iiitkota.ac.in", ranking: 145 },
  { name: "Indian Institute of Information Technology Bhopal", city: "Bhopal", website: "https://iiitbhopal.ac.in", ranking: 146 },
  { name: "Indian Institute of Information Technology Ranchi", city: "Ranchi", website: "https://iiitranchi.ac.in", ranking: 147 },

  // NLUs
  { name: "National Law School of India University", city: "Bengaluru", website: "https://nls.ac.in", ranking: 148 },
  { name: "National Law University Delhi", city: "New Delhi", website: "https://nludelhi.ac.in", ranking: 149 },
  { name: "NALSAR University of Law", city: "Hyderabad", website: "https://nalsar.ac.in", ranking: 150 },
  { name: "National Law University Jodhpur", city: "Jodhpur", website: "https://nlujodhpur.ac.in", ranking: 151 },
  { name: "West Bengal National University of Juridical Sciences", city: "Kolkata", website: "https://nujs.edu", ranking: 152 },
  { name: "National Law University Bhopal", city: "Bhopal", website: "https://nlubhopal.ac.in", ranking: 153 },
  { name: "Gujarat National Law University", city: "Gandhinagar", website: "https://gnlu.ac.in", ranking: 154 },
  { name: "National Law University Odisha", city: "Cuttack", website: "https://nluo.ac.in", ranking: 155 },
  { name: "National University of Advanced Legal Studies", city: "Kochi", website: "https://nuals.ac.in", ranking: 156 },
  { name: "Hidayatullah National Law University", city: "Raipur", website: "https://hnlu.ac.in", ranking: 157 },

  // IIMs
  { name: "Indian Institute of Management Ahmedabad", city: "Ahmedabad", website: "https://iima.ac.in", ranking: 158 },
  { name: "Indian Institute of Management Bangalore", city: "Bengaluru", website: "https://iimb.ac.in", ranking: 159 },
  { name: "Indian Institute of Management Calcutta", city: "Kolkata", website: "https://iimcal.ac.in", ranking: 160 },
  { name: "Indian Institute of Management Lucknow", city: "Lucknow", website: "https://iiml.ac.in", ranking: 161 },
  { name: "Indian Institute of Management Kozhikode", city: "Kozhikode", website: "https://iimk.ac.in", ranking: 162 },
  { name: "Indian Institute of Management Indore", city: "Indore", website: "https://iimidr.ac.in", ranking: 163 },
  { name: "Indian Institute of Management Shillong", city: "Shillong", website: "https://iimshillong.ac.in", ranking: 164 },
  { name: "Indian Institute of Management Raipur", city: "Raipur", website: "https://iimraipur.ac.in", ranking: 165 },
  { name: "Indian Institute of Management Ranchi", city: "Ranchi", website: "https://iimranchi.ac.in", ranking: 166 },
  { name: "Indian Institute of Management Rohtak", city: "Rohtak", website: "https://iimrohtak.ac.in", ranking: 167 },
  { name: "Indian Institute of Management Udaipur", city: "Udaipur", website: "https://iimu.ac.in", ranking: 168 },
  { name: "Indian Institute of Management Nagpur", city: "Nagpur", website: "https://iimnagpur.ac.in", ranking: 169 },
  { name: "Indian Institute of Management Trichy", city: "Tiruchirappalli", website: "https://iimtrichy.ac.in", ranking: 170 },
  { name: "Indian Institute of Management Kashipur", city: "Kashipur", website: "https://iimkashipur.ac.in", ranking: 171 },
  { name: "Indian Institute of Management Bodh Gaya", city: "Bodh Gaya", website: "https://iimbg.ac.in", ranking: 172 },
  { name: "Indian Institute of Management Jammu", city: "Jammu", website: "https://iimjammu.ac.in", ranking: 173 },
  { name: "Indian Institute of Management Sirmaur", city: "Sirmaur", website: "https://iimsirmaur.ac.in", ranking: 174 },
  { name: "Indian Institute of Management Visakhapatnam", city: "Visakhapatnam", website: "https://iimv.ac.in", ranking: 175 },
  { name: "Indian Institute of Management Amritsar", city: "Amritsar", website: "https://iimamritsar.ac.in", ranking: 176 },
  { name: "Indian Institute of Management Sambalpur", city: "Sambalpur", website: "https://iimsambalpur.ac.in", ranking: 177 },

  // Additional Top Colleges
  { name: "Hindu College University of Delhi", city: "New Delhi", website: "https://hinducollege.ac.in", ranking: 178 },
  { name: "Miranda House University of Delhi", city: "New Delhi", website: "https://mirandahouse.ac.in", ranking: 179 },
  { name: "St. Stephen's College Delhi", city: "New Delhi", website: "https://ststephens.edu", ranking: 180 },
  { name: "Hansraj College Delhi", city: "New Delhi", website: "https://hansrajcollege.ac.in", ranking: 181 },
  { name: "Lady Shri Ram College Delhi", city: "New Delhi", website: "https://lsr.edu.in", ranking: 182 },
  { name: "Loyola College Chennai", city: "Chennai", website: "https://loyolacollege.edu", ranking: 183 },
  { name: "St. Xavier's College Mumbai", city: "Mumbai", website: "https://xaviers.edu", ranking: 184 },
  { name: "Presidency College Chennai", city: "Chennai", website: "https://presidencycollegechennai.in", ranking: 185 },
  { name: "Scottish Church College Kolkata", city: "Kolkata", website: "https://scottishchurch.ac.in", ranking: 186 },
  { name: "Fergusson College Pune", city: "Pune", website: "https://fergusson.edu", ranking: 187 },
  { name: "Ramjas College Delhi", city: "New Delhi", website: "https://ramjas.du.ac.in", ranking: 188 },
  { name: "Kirori Mal College Delhi", city: "New Delhi", website: "https://kmcollege.ac.in", ranking: 189 },
  { name: "Ramakrishna Mission Vivekananda Centenary College", city: "Kolkata", website: "https://rkmvccrahara.org", ranking: 190 },
  { name: "Acharya Narendra Dev College Delhi", city: "New Delhi", website: "https://andc.du.ac.in", ranking: 191 },
  { name: "Atma Ram Sanatan Dharma College Delhi", city: "New Delhi", website: "https://arsd.du.ac.in", ranking: 192 },
  { name: "PSGR Krishnammal College for Women", city: "Coimbatore", website: "https://psgrkcw.ac.in", ranking: 193 },
  { name: "PSG College of Arts and Science", city: "Coimbatore", website: "https://psgcas.ac.in", ranking: 194 },
  { name: "Bishop Heber College", city: "Tiruchirappalli", website: "https://bhc.edu.in", ranking: 195 },
  { name: "Madras Christian College", city: "Chennai", website: "https://mcc.edu.in", ranking: 196 },
  { name: "MOP Vaishnav College for Women", city: "Chennai", website: "https://mopvc.edu.in", ranking: 197 },
  { name: "Stella Maris College Chennai", city: "Chennai", website: "https://stellamariscollege.org", ranking: 198 },
  { name: "Mount Carmel College Bangalore", city: "Bengaluru", website: "https://mccblr.ac.in", ranking: 199 },
  { name: "St. Joseph's College Bangalore", city: "Bengaluru", website: "https://sjc.ac.in", ranking: 200 },
  { name: "Ethiraj College for Women Chennai", city: "Chennai", website: "https://ethirajcollege.edu.in", ranking: 201 },
  { name: "S.I.E.S. College of Arts Science and Commerce", city: "Mumbai", website: "https://siesascs.edu.in", ranking: 202 },
  { name: "Thiagarajar College of Engineering", city: "Madurai", website: "https://tce.edu", ranking: 203 },
  { name: "PSG College of Technology", city: "Coimbatore", website: "https://psgtech.edu", ranking: 204 },
  { name: "Coimbatore Institute of Technology", city: "Coimbatore", website: "https://cit.edu.in", ranking: 205 },
];

const internationalUniversities = [
  // More US universities
  { name: "University of California Santa Cruz", countryCode: "US", city: "Santa Cruz", ranking: 47, website: "https://ucsc.edu" },
  { name: "University of Texas Dallas", countryCode: "US", city: "Richardson", ranking: 48, website: "https://utdallas.edu" },
  { name: "University at Buffalo SUNY", countryCode: "US", city: "Buffalo", ranking: 49, website: "https://buffalo.edu" },
  { name: "North Carolina State University", countryCode: "US", city: "Raleigh", ranking: 50, website: "https://ncsu.edu" },
  { name: "Indiana University Bloomington", countryCode: "US", city: "Bloomington", ranking: 51, website: "https://indiana.edu" },
  { name: "University of Utah", countryCode: "US", city: "Salt Lake City", ranking: 52, website: "https://utah.edu" },
  { name: "University of Rochester", countryCode: "US", city: "Rochester", ranking: 53, website: "https://rochester.edu" },
  { name: "Tufts University", countryCode: "US", city: "Medford", ranking: 54, website: "https://tufts.edu" },
  { name: "Dartmouth College", countryCode: "US", city: "Hanover", ranking: 55, website: "https://dartmouth.edu" },
  { name: "Brown University", countryCode: "US", city: "Providence", ranking: 56, website: "https://brown.edu" },
  { name: "University of Miami", countryCode: "US", city: "Coral Gables", ranking: 57, website: "https://miami.edu" },
  { name: "Georgetown University", countryCode: "US", city: "Washington DC", ranking: 58, website: "https://georgetown.edu" },
  { name: "University of Notre Dame", countryCode: "US", city: "Notre Dame", ranking: 59, website: "https://nd.edu" },
  { name: "Tulane University", countryCode: "US", city: "New Orleans", ranking: 60, website: "https://tulane.edu" },
  { name: "Northeastern University", countryCode: "US", city: "Boston", ranking: 61, website: "https://northeastern.edu" },
  { name: "Boston College", countryCode: "US", city: "Chestnut Hill", ranking: 62, website: "https://bc.edu" },
  { name: "University of Pittsburgh", countryCode: "US", city: "Pittsburgh", ranking: 63, website: "https://pitt.edu" },
  { name: "Rutgers University New Brunswick", countryCode: "US", city: "New Brunswick", ranking: 64, website: "https://rutgers.edu" },
  { name: "University of Connecticut", countryCode: "US", city: "Storrs", ranking: 65, website: "https://uconn.edu" },
  { name: "George Mason University", countryCode: "US", city: "Fairfax", ranking: 66, website: "https://gmu.edu" },
  { name: "SUNY Stony Brook University", countryCode: "US", city: "Stony Brook", ranking: 67, website: "https://stonybrook.edu" },
  { name: "University at Albany SUNY", countryCode: "US", city: "Albany", ranking: 68, website: "https://albany.edu" },
  { name: "Virginia Tech", countryCode: "US", city: "Blacksburg", ranking: 69, website: "https://vt.edu" },
  { name: "Clemson University", countryCode: "US", city: "Clemson", ranking: 70, website: "https://clemson.edu" },

  // More UK universities
  { name: "University of Leicester", countryCode: "GB", city: "Leicester", ranking: 36, website: "https://le.ac.uk" },
  { name: "University of Aberdeen", countryCode: "GB", city: "Aberdeen", ranking: 37, website: "https://abdn.ac.uk" },
  { name: "University of Strathclyde", countryCode: "GB", city: "Glasgow", ranking: 38, website: "https://strath.ac.uk" },
  { name: "University of Reading", countryCode: "GB", city: "Reading", ranking: 39, website: "https://reading.ac.uk" },
  { name: "University of Kent", countryCode: "GB", city: "Canterbury", ranking: 40, website: "https://kent.ac.uk" },
  { name: "University of Essex", countryCode: "GB", city: "Colchester", ranking: 41, website: "https://essex.ac.uk" },
  { name: "University of Stirling", countryCode: "GB", city: "Stirling", ranking: 42, website: "https://stir.ac.uk" },
  { name: "Aston University", countryCode: "GB", city: "Birmingham", ranking: 43, website: "https://aston.ac.uk" },
  { name: "University of Hull", countryCode: "GB", city: "Hull", ranking: 44, website: "https://hull.ac.uk" },
  { name: "University of Bradford", countryCode: "GB", city: "Bradford", ranking: 45, website: "https://bradford.ac.uk" },
  { name: "City University London", countryCode: "GB", city: "London", ranking: 46, website: "https://city.ac.uk" },
  { name: "Brunel University London", countryCode: "GB", city: "Uxbridge", ranking: 47, website: "https://brunel.ac.uk" },
  { name: "University of Portsmouth", countryCode: "GB", city: "Portsmouth", ranking: 48, website: "https://port.ac.uk" },
  { name: "Oxford Brookes University", countryCode: "GB", city: "Oxford", ranking: 49, website: "https://brookes.ac.uk" },
  { name: "University of Westminster", countryCode: "GB", city: "London", ranking: 50, website: "https://westminster.ac.uk" },

  // More Canadian universities
  { name: "University of Ontario Institute of Technology", countryCode: "CA", city: "Oshawa", ranking: 23, website: "https://ontariotechu.ca" },
  { name: "Brock University", countryCode: "CA", city: "St. Catharines", ranking: 24, website: "https://brocku.ca" },
  { name: "University of Lethbridge", countryCode: "CA", city: "Lethbridge", ranking: 25, website: "https://uleth.ca" },
  { name: "University of Prince Edward Island", countryCode: "CA", city: "Charlottetown", ranking: 26, website: "https://upei.ca" },
  { name: "Brandon University", countryCode: "CA", city: "Brandon", ranking: 27, website: "https://brandonu.ca" },
  { name: "Royal Roads University", countryCode: "CA", city: "Victoria", ranking: 28, website: "https://royalroads.ca" },
  { name: "Thompson Rivers University", countryCode: "CA", city: "Kamloops", ranking: 29, website: "https://tru.ca" },
  { name: "University of the Fraser Valley", countryCode: "CA", city: "Abbotsford", ranking: 30, website: "https://ufv.ca" },

  // More Australian universities
  { name: "James Cook University", countryCode: "AU", city: "Townsville", ranking: 23, website: "https://jcu.edu.au" },
  { name: "University of New England Australia", countryCode: "AU", city: "Armidale", ranking: 24, website: "https://une.edu.au" },
  { name: "University of Southern Queensland", countryCode: "AU", city: "Toowoomba", ranking: 25, website: "https://unisq.edu.au" },
  { name: "University of the Sunshine Coast", countryCode: "AU", city: "Sippy Downs", ranking: 26, website: "https://usc.edu.au" },
  { name: "Murdoch University", countryCode: "AU", city: "Perth", ranking: 27, website: "https://murdoch.edu.au" },
  { name: "Edith Cowan University", countryCode: "AU", city: "Joondalup", ranking: 28, website: "https://ecu.edu.au" },
  { name: "Southern Cross University", countryCode: "AU", city: "Lismore", ranking: 29, website: "https://scu.edu.au" },
  { name: "Central Queensland University", countryCode: "AU", city: "Rockhampton", ranking: 30, website: "https://cqu.edu.au" },

  // More German universities
  { name: "University of Bayreuth", countryCode: "DE", city: "Bayreuth", ranking: 23, website: "https://uni-bayreuth.de" },
  { name: "University of Siegen", countryCode: "DE", city: "Siegen", ranking: 24, website: "https://uni-siegen.de" },
  { name: "University of Kassel", countryCode: "DE", city: "Kassel", ranking: 25, website: "https://uni-kassel.de" },
  { name: "University of Ulm", countryCode: "DE", city: "Ulm", ranking: 26, website: "https://uni-ulm.de" },
  { name: "University of Konstanz", countryCode: "DE", city: "Konstanz", ranking: 27, website: "https://uni-konstanz.de" },
  { name: "University of Hohenheim", countryCode: "DE", city: "Stuttgart", ranking: 28, website: "https://uni-hohenheim.de" },
  { name: "TU Dortmund University", countryCode: "DE", city: "Dortmund", ranking: 29, website: "https://tu-dortmund.de" },
  { name: "University of Bremen", countryCode: "DE", city: "Bremen", ranking: 30, website: "https://uni-bremen.de" },

  // More Netherlands universities
  { name: "Radboud University", countryCode: "NL", city: "Nijmegen", ranking: 11, website: "https://ru.nl" },
  { name: "Tilburg University", countryCode: "NL", city: "Tilburg", ranking: 12, website: "https://tilburguniversity.edu" },
  { name: "Open University Netherlands", countryCode: "NL", city: "Heerlen", ranking: 13, website: "https://ou.nl" },

  // More Swedish universities
  { name: "Chalmers University of Technology", countryCode: "SE", city: "Gothenburg", ranking: 6, website: "https://chalmers.se" },
  { name: "Linkoping University", countryCode: "SE", city: "Linkoping", ranking: 7, website: "https://liu.se" },
  { name: "Umea University", countryCode: "SE", city: "Umea", ranking: 8, website: "https://umu.se" },
  { name: "Swedish University of Agricultural Sciences", countryCode: "SE", city: "Uppsala", ranking: 9, website: "https://slu.se" },

  // More countries
  { name: "University of Southern Denmark", countryCode: "DK", city: "Odense", ranking: 3, website: "https://sdu.dk" },
  { name: "Aalborg University", countryCode: "DK", city: "Aalborg", ranking: 4, website: "https://aau.dk" },
  { name: "Vrije Universiteit Brussel", countryCode: "BE", city: "Brussels", ranking: 3, website: "https://vub.be" },
  { name: "University of Antwerp", countryCode: "BE", city: "Antwerp", ranking: 4, website: "https://uantwerpen.be" },
  { name: "University of Bologna", countryCode: "IT", city: "Bologna", ranking: 4, website: "https://unibo.it" },
  { name: "Politecnico di Torino", countryCode: "IT", city: "Turin", ranking: 5, website: "https://polito.it" },
  { name: "University of Padua", countryCode: "IT", city: "Padua", ranking: 6, website: "https://unipd.it" },
  { name: "University of Milano Bicocca", countryCode: "IT", city: "Milan", ranking: 7, website: "https://unimib.it" },
  { name: "University of Alicante", countryCode: "ES", city: "Alicante", ranking: 3, website: "https://ua.es" },
  { name: "University of Navarra", countryCode: "ES", city: "Pamplona", ranking: 4, website: "https://unav.edu" },
  { name: "University of Granada", countryCode: "ES", city: "Granada", ranking: 5, website: "https://ugr.es" },
  { name: "University of Zurich", countryCode: "CH", city: "Zurich", ranking: 4, website: "https://uzh.ch" },
  { name: "University of Bern", countryCode: "CH", city: "Bern", ranking: 5, website: "https://unibe.ch" },
  { name: "University of Basel", countryCode: "CH", city: "Basel", ranking: 6, website: "https://unibas.ch" },
  { name: "University of Lausanne", countryCode: "CH", city: "Lausanne", ranking: 7, website: "https://unil.ch" },
  { name: "University of Geneva", countryCode: "CH", city: "Geneva", ranking: 8, website: "https://unige.ch" },
  { name: "University of Innsbruck", countryCode: "AT", city: "Innsbruck", ranking: 3, website: "https://uibk.ac.at" },
  { name: "Graz University of Technology", countryCode: "AT", city: "Graz", ranking: 4, website: "https://tugraz.at" },
  { name: "Johannes Kepler University Linz", countryCode: "AT", city: "Linz", ranking: 5, website: "https://jku.at" },
  { name: "University of Eastern Finland", countryCode: "FI", city: "Joensuu", ranking: 3, website: "https://uef.fi" },
  { name: "Tampere University", countryCode: "FI", city: "Tampere", ranking: 4, website: "https://tuni.fi" },
  { name: "University of Turku", countryCode: "FI", city: "Turku", ranking: 5, website: "https://utu.fi" },
  { name: "University of Bergen", countryCode: "NO", city: "Bergen", ranking: 3, website: "https://uib.no" },
  { name: "University of Stavanger", countryCode: "NO", city: "Stavanger", ranking: 4, website: "https://uis.no" },
  { name: "Auckland University of Technology", countryCode: "NZ", city: "Auckland", ranking: 3, website: "https://aut.ac.nz" },
  { name: "Massey University", countryCode: "NZ", city: "Palmerston North", ranking: 4, website: "https://massey.ac.nz" },
  { name: "Victoria University of Wellington", countryCode: "NZ", city: "Wellington", ranking: 5, website: "https://wgtn.ac.nz" },
  { name: "University of Canterbury", countryCode: "NZ", city: "Christchurch", ranking: 6, website: "https://canterbury.ac.nz" },
  { name: "University of Notre Dame Australia", countryCode: "AU", city: "Fremantle", ranking: 31, website: "https://nd.edu.au" },
  { name: "University of Limerick", countryCode: "IE", city: "Limerick", ranking: 3, website: "https://ul.ie" },
  { name: "Dublin City University", countryCode: "IE", city: "Dublin", ranking: 4, website: "https://dcu.ie" },
  { name: "University of Galway", countryCode: "IE", city: "Galway", ranking: 5, website: "https://universityofgalway.ie" },
  { name: "University College Cork", countryCode: "IE", city: "Cork", ranking: 6, website: "https://ucc.ie" },
  { name: "Universiti Sains Malaysia", countryCode: "MY", city: "Penang", ranking: 4, website: "https://usm.my" },
  { name: "Universiti Teknologi Malaysia", countryCode: "MY", city: "Johor Bahru", ranking: 5, website: "https://utm.my" },
  { name: "Universiti Putra Malaysia", countryCode: "MY", city: "Serdang", ranking: 6, website: "https://upm.edu.my" },
  { name: "University of Tokyo", countryCode: "JP", city: "Tokyo", ranking: 5, website: "https://u-tokyo.ac.jp" },
  { name: "Waseda University", countryCode: "JP", city: "Tokyo", ranking: 6, website: "https://waseda.jp" },
  { name: "Keio University", countryCode: "JP", city: "Tokyo", ranking: 7, website: "https://keio.ac.jp" },
  { name: "Tohoku University", countryCode: "JP", city: "Sendai", ranking: 8, website: "https://tohoku.ac.jp" },
  { name: "Nagoya University", countryCode: "JP", city: "Nagoya", ranking: 9, website: "https://nagoya-u.ac.jp" },
  { name: "Kyushu University", countryCode: "JP", city: "Fukuoka", ranking: 10, website: "https://kyushu-u.ac.jp" },
  { name: "Hokkaido University", countryCode: "JP", city: "Sapporo", ranking: 11, website: "https://hokudai.ac.jp" },
  { name: "Pohang University of Science and Technology", countryCode: "KR", city: "Pohang", ranking: 5, website: "https://postech.ac.kr" },
  { name: "Sungkyunkwan University", countryCode: "KR", city: "Seoul", ranking: 6, website: "https://skku.edu" },
  { name: "Hanyang University", countryCode: "KR", city: "Seoul", ranking: 7, website: "https://hanyang.ac.kr" },
  { name: "Sogang University", countryCode: "KR", city: "Seoul", ranking: 8, website: "https://sogang.ac.kr" },
  { name: "City University of Hong Kong", countryCode: "HK", city: "Hong Kong", ranking: 4, website: "https://cityu.edu.hk" },
  { name: "Hong Kong Polytechnic University", countryCode: "HK", city: "Hong Kong", ranking: 5, website: "https://polyu.edu.hk" },
  { name: "Hong Kong Baptist University", countryCode: "HK", city: "Hong Kong", ranking: 6, website: "https://hkbu.edu.hk" },
  { name: "Universiti Brunei Darussalam", countryCode: "MY", city: "Gadong", ranking: 7, website: "https://ubd.edu.bn" },
  { name: "University of Macau", countryCode: "CN", city: "Macau", ranking: 7, website: "https://um.edu.mo" },
  { name: "Warsaw University", countryCode: "DE", city: "Warsaw", ranking: 31, website: "https://uw.edu.pl" },
  { name: "Jagiellonian University", countryCode: "DE", city: "Krakow", ranking: 32, website: "https://uj.edu.pl" },
];

async function main() {
  console.log("Starting university import...");

  // Get all countries
  const allCountries = await prisma.country.findMany();
  const countryMap = new Map(allCountries.map(c => [c.code, c]));

  console.log(`Found ${allCountries.length} countries in database`);

  let created = 0;
  let skipped = 0;

  // Import Indian universities
  for (const u of indianUniversities) {
    const country = countryMap.get("IN");
    if (!country) {
      console.log("Error: India (IN) country not found in database. Run seed first.");
      return;
    }

    const existing = await prisma.university.findFirst({
      where: { name: u.name, countryId: country.id },
    });

    if (existing) {
      // Update website if missing
      if (!existing.website && u.website) {
        await prisma.university.update({
          where: { id: existing.id },
          data: { website: u.website },
        });
        console.log(`  Updated website for: ${u.name}`);
      }
      skipped++;
      continue;
    }

    await prisma.university.create({
      data: {
        name: u.name,
        countryId: country.id,
        city: u.city,
        ranking: u.ranking,
        rankingSource: "NIRF",
        website: u.website,
        intakePeriods: ["Fall", "Spring"],
        applicationFee: 0,
        universityType: guessIndianType(u.name),
      },
    });
    created++;
    console.log(`  Created: ${u.name}`);
  }

  // Import international universities
  for (const u of internationalUniversities) {
    const country = countryMap.get(u.countryCode);
    if (!country) {
      console.log(`  Skipping ${u.name}: country ${u.countryCode} not found`);
      continue;
    }

    const existing = await prisma.university.findFirst({
      where: { name: u.name, countryId: country.id },
    });

    if (existing) {
      if (!existing.website && u.website) {
        await prisma.university.update({
          where: { id: existing.id },
          data: { website: u.website },
        });
        console.log(`  Updated website for: ${u.name}`);
      }
      skipped++;
      continue;
    }

    await prisma.university.create({
      data: {
        name: u.name,
        countryId: country.id,
        city: u.city,
        ranking: u.ranking,
        rankingSource: "QS World University Rankings",
        website: u.website,
        intakePeriods: ["Fall", "Spring"],
        applicationFee: 0,
      },
    });
    created++;
    console.log(`  Created: ${u.name}`);
  }

  console.log(`\nDone! Created: ${created}, Skipped/Updated: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
