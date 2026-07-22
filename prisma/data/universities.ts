export interface UniversitySeed {
  name: string;
  countryCode: string;
  city: string;
  ranking: number;
  intakePeriods: string[];
  applicationFee: number;
  description?: string;
  website?: string;
  logoUrl?: string;
}

export const universities: UniversitySeed[] = [
  // United States (45)
  { name: "Massachusetts Institute of Technology", countryCode: "US", city: "Cambridge", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "World-leading STEM and research institution." },
  { name: "Harvard University", countryCode: "US", city: "Cambridge", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 85, description: "Ivy League research university with global reputation." },
  { name: "Stanford University", countryCode: "US", city: "Stanford", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 90, description: "Leading research and entrepreneurial university in Silicon Valley." },
  { name: "California Institute of Technology", countryCode: "US", city: "Pasadena", ranking: 4, intakePeriods: ["Fall"], applicationFee: 75, description: "Top-ranked STEM-focused research institute." },
  { name: "University of California Berkeley", countryCode: "US", city: "Berkeley", ranking: 5, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Flagship public research university." },
  { name: "University of Chicago", countryCode: "US", city: "Chicago", ranking: 6, intakePeriods: ["Fall", "Spring"], applicationFee: 85, description: "Private research university known for economics and law." },
  { name: "University of Pennsylvania", countryCode: "US", city: "Philadelphia", ranking: 7, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Ivy League university with Wharton School." },
  { name: "Cornell University", countryCode: "US", city: "Ithaca", ranking: 8, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Ivy League land-grant university." },
  { name: "Yale University", countryCode: "US", city: "New Haven", ranking: 9, intakePeriods: ["Fall"], applicationFee: 80, description: "Ivy League research university." },
  { name: "Princeton University", countryCode: "US", city: "Princeton", ranking: 10, intakePeriods: ["Fall"], applicationFee: 70, description: "Ivy League research university." },
  { name: "Columbia University", countryCode: "US", city: "New York", ranking: 11, intakePeriods: ["Fall", "Spring"], applicationFee: 85, description: "Ivy League university in New York City." },
  { name: "Johns Hopkins University", countryCode: "US", city: "Baltimore", ranking: 12, intakePeriods: ["Fall", "Spring"], applicationFee: 70, description: "Leading research university with renowned medical school." },
  { name: "University of Michigan Ann Arbor", countryCode: "US", city: "Ann Arbor", ranking: 13, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 75, description: "Top public research university." },
  { name: "University of California Los Angeles", countryCode: "US", city: "Los Angeles", ranking: 14, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Top public research university." },
  { name: "Northwestern University", countryCode: "US", city: "Evanston", ranking: 15, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Private research university near Chicago." },
  { name: "New York University", countryCode: "US", city: "New York", ranking: 16, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Global private research university in NYC." },
  { name: "University of Washington", countryCode: "US", city: "Seattle", ranking: 17, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 65, description: "Top public research university." },
  { name: "Duke University", countryCode: "US", city: "Durham", ranking: 18, intakePeriods: ["Fall", "Spring"], applicationFee: 85, description: "Private research university." },
  { name: "Carnegie Mellon University", countryCode: "US", city: "Pittsburgh", ranking: 19, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Leading CS and engineering school." },
  { name: "University of Texas at Austin", countryCode: "US", city: "Austin", ranking: 20, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 75, description: "Flagship public university in Texas." },
  { name: "University of California San Diego", countryCode: "US", city: "La Jolla", ranking: 21, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Top public research university." },
  { name: "University of Southern California", countryCode: "US", city: "Los Angeles", ranking: 22, intakePeriods: ["Fall", "Spring"], applicationFee: 85, description: "Private research university." },
  { name: "Boston University", countryCode: "US", city: "Boston", ranking: 23, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Private research university." },
  { name: "Georgia Institute of Technology", countryCode: "US", city: "Atlanta", ranking: 24, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Leading public tech institute." },
  { name: "University of Illinois Urbana-Champaign", countryCode: "US", city: "Champaign", ranking: 25, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top public research university." },
  { name: "University of Wisconsin-Madison", countryCode: "US", city: "Madison", ranking: 26, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Flagship public research university." },
  { name: "University of California Davis", countryCode: "US", city: "Davis", ranking: 27, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Top public research university." },
  { name: "University of California Santa Barbara", countryCode: "US", city: "Santa Barbara", ranking: 28, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Public research university." },
  { name: "Purdue University", countryCode: "US", city: "West Lafayette", ranking: 29, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 60, description: "Top public engineering and aviation school." },
  { name: "Rice University", countryCode: "US", city: "Houston", ranking: 30, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Private research university." },
  { name: "University of North Carolina Chapel Hill", countryCode: "US", city: "Chapel Hill", ranking: 31, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Top public research university." },
  { name: "Washington University in St. Louis", countryCode: "US", city: "St. Louis", ranking: 32, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Private research university." },
  { name: "University of Minnesota Twin Cities", countryCode: "US", city: "Minneapolis", ranking: 33, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 55, description: "Top public research university." },
  { name: "University of Florida", countryCode: "US", city: "Gainesville", ranking: 34, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 30, description: "Flagship public research university." },
  { name: "Ohio State University", countryCode: "US", city: "Columbus", ranking: 35, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 60, description: "Top public research university." },
  { name: "Pennsylvania State University", countryCode: "US", city: "University Park", ranking: 36, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 65, description: "Land-grant public research university." },
  { name: "Michigan State University", countryCode: "US", city: "East Lansing", ranking: 37, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 50, description: "Top public research university." },
  { name: "Texas A&M University", countryCode: "US", city: "College Station", ranking: 38, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 60, description: "Flagship public research university." },
  { name: "University of Maryland College Park", countryCode: "US", city: "College Park", ranking: 39, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 65, description: "Top public research university." },
  { name: "University of Colorado Boulder", countryCode: "US", city: "Boulder", ranking: 40, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 65, description: "Public research university." },
  { name: "Arizona State University", countryCode: "US", city: "Tempe", ranking: 41, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 70, description: "Top public research university." },
  { name: "University of Arizona", countryCode: "US", city: "Tucson", ranking: 42, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "University of Virginia", countryCode: "US", city: "Charlottesville", ranking: 43, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Top public research university." },
  { name: "Vanderbilt University", countryCode: "US", city: "Nashville", ranking: 44, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Private research university." },
  { name: "Emory University", countryCode: "US", city: "Atlanta", ranking: 45, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Private research university." },
  { name: "University of California Irvine", countryCode: "US", city: "Irvine", ranking: 46, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Top public research university." },

  // United Kingdom (35)
  { name: "University of Cambridge", countryCode: "GB", city: "Cambridge", ranking: 1, intakePeriods: ["Fall"], applicationFee: 60, description: "Collegiate public research university." },
  { name: "University of Oxford", countryCode: "GB", city: "Oxford", ranking: 2, intakePeriods: ["Fall"], applicationFee: 75, description: "Collegiate research university." },
  { name: "Imperial College London", countryCode: "GB", city: "London", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 80, description: "Top STEM-focused public research university." },
  { name: "University College London", countryCode: "GB", city: "London", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Multi-disciplinary public research university." },
  { name: "University of Edinburgh", countryCode: "GB", city: "Edinburgh", ranking: 5, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Ancient public research university." },
  { name: "University of Manchester", countryCode: "GB", city: "Manchester", ranking: 6, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick public research university." },
  { name: "King's College London", countryCode: "GB", city: "London", ranking: 7, intakePeriods: ["Fall", "Spring"], applicationFee: 70, description: "Public research university." },
  { name: "London School of Economics and Political Science", countryCode: "GB", city: "London", ranking: 8, intakePeriods: ["Fall"], applicationFee: 80, description: "Specialist social sciences university." },
  { name: "University of Bristol", countryCode: "GB", city: "Bristol", ranking: 9, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick research university." },
  { name: "University of Warwick", countryCode: "GB", city: "Coventry", ranking: 10, intakePeriods: ["Fall", "Spring"], applicationFee: 55, description: "Plate glass research university." },
  { name: "University of Glasgow", countryCode: "GB", city: "Glasgow", ranking: 11, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Ancient public research university." },
  { name: "University of Birmingham", countryCode: "GB", city: "Birmingham", ranking: 12, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick research university." },
  { name: "University of Southampton", countryCode: "GB", city: "Southampton", ranking: 13, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Public research university." },
  { name: "University of Sheffield", countryCode: "GB", city: "Sheffield", ranking: 14, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick research university." },
  { name: "University of Leeds", countryCode: "GB", city: "Leeds", ranking: 15, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick research university." },
  { name: "University of Nottingham", countryCode: "GB", city: "Nottingham", ranking: 16, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Public research university." },
  { name: "Queen Mary University of London", countryCode: "GB", city: "London", ranking: 17, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Public research university." },
  { name: "University of York", countryCode: "GB", city: "York", ranking: 18, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Plate glass research university." },
  { name: "Newcastle University", countryCode: "GB", city: "Newcastle upon Tyne", ranking: 19, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick research university." },
  { name: "University of Liverpool", countryCode: "GB", city: "Liverpool", ranking: 20, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Red brick research university." },
  { name: "University of St Andrews", countryCode: "GB", city: "St Andrews", ranking: 21, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Ancient public research university." },
  { name: "Durham University", countryCode: "GB", city: "Durham", ranking: 22, intakePeriods: ["Fall"], applicationFee: 60, description: "Collegiate public research university." },
  { name: "University of Exeter", countryCode: "GB", city: "Exeter", ranking: 23, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Public research university." },
  { name: "Lancaster University", countryCode: "GB", city: "Lancaster", ranking: 24, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Plate glass research university." },
  { name: "University of Bath", countryCode: "GB", city: "Bath", ranking: 25, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Public research university." },
  { name: "University of Leicester", countryCode: "GB", city: "Leicester", ranking: 26, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },
  { name: "University of Aberdeen", countryCode: "GB", city: "Aberdeen", ranking: 27, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Ancient public research university." },
  { name: "University of Strathclyde", countryCode: "GB", city: "Glasgow", ranking: 28, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },
  { name: "University of Reading", countryCode: "GB", city: "Reading", ranking: 29, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },
  { name: "University of Sussex", countryCode: "GB", city: "Brighton", ranking: 30, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Plate glass research university." },
  { name: "Loughborough University", countryCode: "GB", city: "Loughborough", ranking: 31, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },
  { name: "Cardiff University", countryCode: "GB", city: "Cardiff", ranking: 32, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Public research university in Wales." },
  { name: "University of East Anglia", countryCode: "GB", city: "Norwich", ranking: 33, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },
  { name: "Royal Holloway University of London", countryCode: "GB", city: "Egham", ranking: 34, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },
  { name: "University of Surrey", countryCode: "GB", city: "Guildford", ranking: 35, intakePeriods: ["Fall", "Spring"], applicationFee: 40, description: "Public research university." },

  // Canada (22)
  { name: "University of Toronto", countryCode: "CA", city: "Toronto", ranking: 1, intakePeriods: ["Fall", "Winter", "Summer"], applicationFee: 90, description: "Top public research university." },
  { name: "McGill University", countryCode: "CA", city: "Montreal", ranking: 2, intakePeriods: ["Fall", "Winter"], applicationFee: 85, description: "Public research university." },
  { name: "University of British Columbia", countryCode: "CA", city: "Vancouver", ranking: 3, intakePeriods: ["Fall", "Winter", "Summer"], applicationFee: 90, description: "Top public research university." },
  { name: "University of Alberta", countryCode: "CA", city: "Edmonton", ranking: 4, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 75, description: "Public research university." },
  { name: "Universit\u00e9 de Montr\u00e9al", countryCode: "CA", city: "Montreal", ranking: 5, intakePeriods: ["Fall", "Winter"], applicationFee: 75, description: "French-language public research university." },
  { name: "McMaster University", countryCode: "CA", city: "Hamilton", ranking: 6, intakePeriods: ["Fall", "Winter"], applicationFee: 75, description: "Public research university." },
  { name: "University of Waterloo", countryCode: "CA", city: "Waterloo", ranking: 7, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 85, description: "Leading co-op and STEM university." },
  { name: "Western University", countryCode: "CA", city: "London", ranking: 8, intakePeriods: ["Fall", "Winter"], applicationFee: 80, description: "Public research university." },
  { name: "University of Calgary", countryCode: "CA", city: "Calgary", ranking: 9, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 75, description: "Public research university." },
  { name: "Queen's University", countryCode: "CA", city: "Kingston", ranking: 10, intakePeriods: ["Fall", "Winter"], applicationFee: 85, description: "Public research university." },
  { name: "Simon Fraser University", countryCode: "CA", city: "Burnaby", ranking: 11, intakePeriods: ["Fall", "Spring", "Summer"], applicationFee: 70, description: "Public research university." },
  { name: "Dalhousie University", countryCode: "CA", city: "Halifax", ranking: 12, intakePeriods: ["Fall", "Winter"], applicationFee: 70, description: "Public research university." },
  { name: "University of Ottawa", countryCode: "CA", city: "Ottawa", ranking: 13, intakePeriods: ["Fall", "Winter"], applicationFee: 75, description: "Bilingual public research university." },
  { name: "University of Victoria", countryCode: "CA", city: "Victoria", ranking: 14, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 70, description: "Public research university." },
  { name: "York University", countryCode: "CA", city: "Toronto", ranking: 15, intakePeriods: ["Fall", "Winter", "Summer"], applicationFee: 70, description: "Public research university." },
  { name: "University of Guelph", countryCode: "CA", city: "Guelph", ranking: 16, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 65, description: "Public research university." },
  { name: "University of Saskatchewan", countryCode: "CA", city: "Saskatoon", ranking: 17, intakePeriods: ["Fall", "Winter"], applicationFee: 65, description: "Public research university." },
  { name: "University of Manitoba", countryCode: "CA", city: "Winnipeg", ranking: 18, intakePeriods: ["Fall", "Winter", "Summer"], applicationFee: 65, description: "Public research university." },
  { name: "Memorial University of Newfoundland", countryCode: "CA", city: "St. John's", ranking: 19, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 60, description: "Public research university." },
  { name: "University of Windsor", countryCode: "CA", city: "Windsor", ranking: 20, intakePeriods: ["Fall", "Winter", "Spring"], applicationFee: 65, description: "Public comprehensive university." },
  { name: "Carleton University", countryCode: "CA", city: "Ottawa", ranking: 21, intakePeriods: ["Fall", "Winter"], applicationFee: 70, description: "Public comprehensive university." },
  { name: "Concordia University", countryCode: "CA", city: "Montreal", ranking: 22, intakePeriods: ["Fall", "Winter", "Summer"], applicationFee: 70, description: "Public comprehensive university." },

  // Australia (22)
  { name: "University of Melbourne", countryCode: "AU", city: "Melbourne", ranking: 1, intakePeriods: ["February", "July"], applicationFee: 100, description: "Top Australian research university." },
  { name: "University of Sydney", countryCode: "AU", city: "Sydney", ranking: 2, intakePeriods: ["February", "July"], applicationFee: 100, description: "Flagship research university." },
  { name: "University of New South Wales", countryCode: "AU", city: "Sydney", ranking: 3, intakePeriods: ["February", "May", "September"], applicationFee: 100, description: "Top STEM and business university." },
  { name: "Australian National University", countryCode: "AU", city: "Canberra", ranking: 4, intakePeriods: ["February", "July"], applicationFee: 75, description: "National research university." },
  { name: "Monash University", countryCode: "AU", city: "Melbourne", ranking: 5, intakePeriods: ["February", "July", "October"], applicationFee: 100, description: "Major research university." },
  { name: "University of Queensland", countryCode: "AU", city: "Brisbane", ranking: 6, intakePeriods: ["February", "July"], applicationFee: 100, description: "Sandstone research university." },
  { name: "University of Western Australia", countryCode: "AU", city: "Perth", ranking: 7, intakePeriods: ["February", "July"], applicationFee: 75, description: "Sandstone research university." },
  { name: "University of Adelaide", countryCode: "AU", city: "Adelaide", ranking: 8, intakePeriods: ["February", "July"], applicationFee: 75, description: "Sandstone research university." },
  { name: "University of Technology Sydney", countryCode: "AU", city: "Sydney", ranking: 9, intakePeriods: ["February", "July", "November"], applicationFee: 75, description: "Leading technology university." },
  { name: "University of Wollongong", countryCode: "AU", city: "Wollongong", ranking: 10, intakePeriods: ["February", "July"], applicationFee: 75, description: "Public research university." },
  { name: "RMIT University", countryCode: "AU", city: "Melbourne", ranking: 11, intakePeriods: ["February", "July", "November"], applicationFee: 75, description: "Global technology and design university." },
  { name: "Queensland University of Technology", countryCode: "AU", city: "Brisbane", ranking: 12, intakePeriods: ["February", "July", "November"], applicationFee: 75, description: "Real-world focused university." },
  { name: "Curtin University", countryCode: "AU", city: "Perth", ranking: 13, intakePeriods: ["February", "July"], applicationFee: 75, description: "Public research university." },
  { name: "Deakin University", countryCode: "AU", city: "Melbourne", ranking: 14, intakePeriods: ["March", "July", "November"], applicationFee: 55, description: "Public research university." },
  { name: "Griffith University", countryCode: "AU", city: "Brisbane", ranking: 15, intakePeriods: ["February", "July", "October"], applicationFee: 55, description: "Public research university." },
  { name: "Macquarie University", countryCode: "AU", city: "Sydney", ranking: 16, intakePeriods: ["February", "July", "October"], applicationFee: 75, description: "Public research university." },
  { name: "Swinburne University of Technology", countryCode: "AU", city: "Melbourne", ranking: 17, intakePeriods: ["February", "July", "November"], applicationFee: 55, description: "Technology-focused university." },
  { name: "University of South Australia", countryCode: "AU", city: "Adelaide", ranking: 18, intakePeriods: ["February", "July", "November"], applicationFee: 55, description: "Public research university." },
  { name: "La Trobe University", countryCode: "AU", city: "Melbourne", ranking: 19, intakePeriods: ["February", "July", "November"], applicationFee: 55, description: "Public research university." },
  { name: "University of Tasmania", countryCode: "AU", city: "Hobart", ranking: 20, intakePeriods: ["February", "July"], applicationFee: 50, description: "Public research university." },
  { name: "University of Newcastle", countryCode: "AU", city: "Newcastle", ranking: 21, intakePeriods: ["February", "July"], applicationFee: 55, description: "Public research university." },
  { name: "Flinders University", countryCode: "AU", city: "Adelaide", ranking: 22, intakePeriods: ["February", "July", "October"], applicationFee: 55, description: "Public research university." },

  // Germany (22)
  { name: "Technical University of Munich", countryCode: "DE", city: "Munich", ranking: 1, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Top German technical university." },
  { name: "LMU Munich", countryCode: "DE", city: "Munich", ranking: 2, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Leading traditional research university." },
  { name: "Heidelberg University", countryCode: "DE", city: "Heidelberg", ranking: 3, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Oldest German university." },
  { name: "University of Freiburg", countryCode: "DE", city: "Freiburg", ranking: 4, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Traditional research university." },
  { name: "University of T\u00fcbingen", countryCode: "DE", city: "T\u00fcbingen", ranking: 5, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Traditional research university." },
  { name: "Humboldt University of Berlin", countryCode: "DE", city: "Berlin", ranking: 6, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Historic Berlin research university." },
  { name: "Free University of Berlin", countryCode: "DE", city: "Berlin", ranking: 7, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "RWTH Aachen University", countryCode: "DE", city: "Aachen", ranking: 8, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Top engineering university." },
  { name: "University of Bonn", countryCode: "DE", city: "Bonn", ranking: 9, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "Karlsruhe Institute of Technology", countryCode: "DE", city: "Karlsruhe", ranking: 10, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Research and education institution." },
  { name: "University of Hamburg", countryCode: "DE", city: "Hamburg", ranking: 11, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Major public research university." },
  { name: "University of Cologne", countryCode: "DE", city: "Cologne", ranking: 12, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "Goethe University Frankfurt", countryCode: "DE", city: "Frankfurt", ranking: 13, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "University of Stuttgart", countryCode: "DE", city: "Stuttgart", ranking: 14, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Technical university." },
  { name: "Technical University of Berlin", countryCode: "DE", city: "Berlin", ranking: 15, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public technical university." },
  { name: "University of G\u00f6ttingen", countryCode: "DE", city: "G\u00f6ttingen", ranking: 16, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Historic research university." },
  { name: "University of M\u00fcnster", countryCode: "DE", city: "M\u00fcnster", ranking: 17, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "TU Dresden", countryCode: "DE", city: "Dresden", ranking: 18, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Technical university." },
  { name: "University of Duisburg-Essen", countryCode: "DE", city: "Duisburg", ranking: 19, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "University of Mannheim", countryCode: "DE", city: "Mannheim", ranking: 20, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Top business and social sciences university." },
  { name: "University of Potsdam", countryCode: "DE", city: "Potsdam", ranking: 21, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },
  { name: "University of Regensburg", countryCode: "DE", city: "Regensburg", ranking: 22, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Public research university." },

  // India (22)
  { name: "Indian Institute of Technology Bombay", countryCode: "IN", city: "Mumbai", ranking: 1, intakePeriods: ["Fall"], applicationFee: 20, description: "Premier engineering institute." },
  { name: "Indian Institute of Technology Delhi", countryCode: "IN", city: "New Delhi", ranking: 2, intakePeriods: ["Fall"], applicationFee: 20, description: "Premier engineering institute." },
  { name: "Indian Institute of Technology Madras", countryCode: "IN", city: "Chennai", ranking: 3, intakePeriods: ["Fall"], applicationFee: 20, description: "Premier engineering institute." },
  { name: "Indian Institute of Technology Kanpur", countryCode: "IN", city: "Kanpur", ranking: 4, intakePeriods: ["Fall"], applicationFee: 20, description: "Premier engineering institute." },
  { name: "Indian Institute of Technology Kharagpur", countryCode: "IN", city: "Kharagpur", ranking: 5, intakePeriods: ["Fall"], applicationFee: 20, description: "Premier engineering institute." },
  { name: "Indian Institute of Technology Roorkee", countryCode: "IN", city: "Roorkee", ranking: 6, intakePeriods: ["Fall"], applicationFee: 20, description: "Premier engineering institute." },
  { name: "Indian Institute of Science Bangalore", countryCode: "IN", city: "Bangalore", ranking: 7, intakePeriods: ["Fall", "Spring"], applicationFee: 20, description: "Premier research institute." },
  { name: "University of Delhi", countryCode: "IN", city: "New Delhi", ranking: 8, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "Central university." },
  { name: "University of Mumbai", countryCode: "IN", city: "Mumbai", ranking: 9, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },
  { name: "University of Calcutta", countryCode: "IN", city: "Kolkata", ranking: 10, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },
  { name: "Jawaharlal Nehru University", countryCode: "IN", city: "New Delhi", ranking: 11, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "Central research university." },
  { name: "Banaras Hindu University", countryCode: "IN", city: "Varanasi", ranking: 12, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "Central university." },
  { name: "Aligarh Muslim University", countryCode: "IN", city: "Aligarh", ranking: 13, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "Central university." },
  { name: "University of Hyderabad", countryCode: "IN", city: "Hyderabad", ranking: 14, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "Central research university." },
  { name: "Jadavpur University", countryCode: "IN", city: "Kolkata", ranking: 15, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },
  { name: "Anna University", countryCode: "IN", city: "Chennai", ranking: 16, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },
  { name: "University of Pune", countryCode: "IN", city: "Pune", ranking: 17, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },
  { name: "Manipal Academy of Higher Education", countryCode: "IN", city: "Manipal", ranking: 18, intakePeriods: ["Fall", "Spring"], applicationFee: 15, description: "Private deemed university." },
  { name: "VIT University", countryCode: "IN", city: "Vellore", ranking: 19, intakePeriods: ["Fall", "Spring"], applicationFee: 15, description: "Private engineering university." },
  { name: "Amrita Vishwa Vidyapeetham", countryCode: "IN", city: "Coimbatore", ranking: 20, intakePeriods: ["Fall", "Spring"], applicationFee: 15, description: "Private deemed university." },
  { name: "University of Kashmir", countryCode: "IN", city: "Srinagar", ranking: 21, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },
  { name: "Panjab University", countryCode: "IN", city: "Chandigarh", ranking: 22, intakePeriods: ["Fall", "Spring"], applicationFee: 10, description: "State public university." },

  // Switzerland (3)
  { name: "ETH Zurich", countryCode: "CH", city: "Zurich", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Top European science and technology university." },
  { name: "EPFL", countryCode: "CH", city: "Lausanne", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Leading engineering and technology institute." },
  { name: "University of Zurich", countryCode: "CH", city: "Zurich", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Largest Swiss university." },

  // Singapore (2)
  { name: "National University of Singapore", countryCode: "SG", city: "Singapore", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top Asian research university." },
  { name: "Nanyang Technological University", countryCode: "SG", city: "Singapore", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading research university." },

  // China (6)
  { name: "Tsinghua University", countryCode: "CN", city: "Beijing", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Top Chinese research university." },
  { name: "Peking University", countryCode: "CN", city: "Beijing", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Leading comprehensive university." },
  { name: "Fudan University", countryCode: "CN", city: "Shanghai", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Top research university in Shanghai." },
  { name: "Shanghai Jiao Tong University", countryCode: "CN", city: "Shanghai", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Leading engineering university." },
  { name: "Zhejiang University", countryCode: "CN", city: "Hangzhou", ranking: 5, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Top comprehensive university." },
  { name: "Nanjing University", countryCode: "CN", city: "Nanjing", ranking: 6, intakePeriods: ["Fall", "Spring"], applicationFee: 60, description: "Leading research university." },

  // Japan (4)
  { name: "University of Tokyo", countryCode: "JP", city: "Tokyo", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Top Japanese research university." },
  { name: "Kyoto University", countryCode: "JP", city: "Kyoto", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Leading research university." },
  { name: "Tokyo Institute of Technology", countryCode: "JP", city: "Tokyo", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Top STEM university." },
  { name: "Osaka University", countryCode: "JP", city: "Osaka", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Major research university." },

  // South Korea (4)
  { name: "Seoul National University", countryCode: "KR", city: "Seoul", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top Korean research university." },
  { name: "KAIST", countryCode: "KR", city: "Daejeon", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading science and technology institute." },
  { name: "Yonsei University", countryCode: "KR", city: "Seoul", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top private research university." },
  { name: "Korea University", countryCode: "KR", city: "Seoul", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading private research university." },

  // Scandinavia & Northern Europe (13)
  { name: "University of Copenhagen", countryCode: "DK", city: "Copenhagen", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Top Danish research university." },
  { name: "Technical University of Denmark", countryCode: "DK", city: "Kongens Lyngby", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 75, description: "Leading engineering university." },
  { name: "Karolinska Institute", countryCode: "SE", city: "Stockholm", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 90, description: "World-leading medical university." },
  { name: "Lund University", countryCode: "SE", city: "Lund", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 90, description: "Top Swedish comprehensive university." },
  { name: "Uppsala University", countryCode: "SE", city: "Uppsala", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 90, description: "Oldest Swedish university." },
  { name: "KTH Royal Institute of Technology", countryCode: "SE", city: "Stockholm", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 90, description: "Leading Swedish technical university." },
  { name: "Stockholm University", countryCode: "SE", city: "Stockholm", ranking: 5, intakePeriods: ["Fall", "Spring"], applicationFee: 90, description: "Major public research university." },
  { name: "University of Helsinki", countryCode: "FI", city: "Helsinki", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top Finnish research university." },
  { name: "Aalto University", countryCode: "FI", city: "Espoo", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading Finnish technology and business university." },
  { name: "University of Oslo", countryCode: "NO", city: "Oslo", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top Norwegian research university." },
  { name: "Norwegian University of Science and Technology", countryCode: "NO", city: "Trondheim", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading Norwegian STEM university." },

  // Netherlands (10)
  { name: "University of Amsterdam", countryCode: "NL", city: "Amsterdam", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Top Dutch research university." },
  { name: "Delft University of Technology", countryCode: "NL", city: "Delft", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Leading Dutch technical university." },
  { name: "Utrecht University", countryCode: "NL", city: "Utrecht", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Major research university." },
  { name: "Leiden University", countryCode: "NL", city: "Leiden", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Oldest Dutch university." },
  { name: "Erasmus University Rotterdam", countryCode: "NL", city: "Rotterdam", ranking: 5, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Top business and economics university." },
  { name: "University of Groningen", countryCode: "NL", city: "Groningen", ranking: 6, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Major research university." },
  { name: "Wageningen University & Research", countryCode: "NL", city: "Wageningen", ranking: 7, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Top agricultural and environmental science university." },
  { name: "Eindhoven University of Technology", countryCode: "NL", city: "Eindhoven", ranking: 8, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Leading technical university." },
  { name: "Vrije Universiteit Amsterdam", countryCode: "NL", city: "Amsterdam", ranking: 9, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Public research university." },
  { name: "Maastricht University", countryCode: "NL", city: "Maastricht", ranking: 10, intakePeriods: ["Fall", "Spring"], applicationFee: 100, description: "Innovative problem-based learning university." },

  // Belgium (2)
  { name: "KU Leuven", countryCode: "BE", city: "Leuven", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top Belgian research university." },
  { name: "Ghent University", countryCode: "BE", city: "Ghent", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Major Belgian public research university." },

  // Ireland (2)
  { name: "Trinity College Dublin", countryCode: "IE", city: "Dublin", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 55, description: "Oldest Irish university." },
  { name: "University College Dublin", countryCode: "IE", city: "Dublin", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 55, description: "Largest Irish university." },

  // New Zealand (2)
  { name: "University of Auckland", countryCode: "NZ", city: "Auckland", ranking: 1, intakePeriods: ["February", "July"], applicationFee: 75, description: "Top New Zealand research university." },
  { name: "University of Otago", countryCode: "NZ", city: "Dunedin", ranking: 2, intakePeriods: ["February", "July"], applicationFee: 75, description: "Oldest New Zealand university." },

  // UAE (2)
  { name: "University of Sharjah", countryCode: "AE", city: "Sharjah", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading UAE comprehensive university." },
  { name: "American University of Sharjah", countryCode: "AE", city: "Sharjah", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "American-style liberal arts university." },

  // France (4)
  { name: "Sorbonne Universit\u00e9", countryCode: "FR", city: "Paris", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading French research university." },
  { name: "Universit\u00e9 Paris-Saclay", countryCode: "FR", city: "Orsay", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top French research-intensive university." },
  { name: "Universit\u00e9 PSL", countryCode: "FR", city: "Paris", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Research university in Paris." },
  { name: "Institut Polytechnique de Paris", countryCode: "FR", city: "Palaiseau", ranking: 4, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading engineering institution." },

  // Austria (2)
  { name: "University of Vienna", countryCode: "AT", city: "Vienna", ranking: 1, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Oldest Austrian university." },
  { name: "Vienna University of Technology", countryCode: "AT", city: "Vienna", ranking: 2, intakePeriods: ["Winter", "Summer"], applicationFee: 50, description: "Leading Austrian technical university." },

  // Italy (3)
  { name: "Sapienza University of Rome", countryCode: "IT", city: "Rome", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Oldest continuing Italian university." },
  { name: "Politecnico di Milano", countryCode: "IT", city: "Milan", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Leading Italian technical university." },
  { name: "University of Bologna", countryCode: "IT", city: "Bologna", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Oldest university in the world." },

  // Spain (2)
  { name: "University of Barcelona", countryCode: "ES", city: "Barcelona", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Leading Spanish research university." },
  { name: "Autonomous University of Madrid", countryCode: "ES", city: "Madrid", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 30, description: "Top Spanish public university." },

  // Malaysia (3)
  { name: "University of Malaya", countryCode: "MY", city: "Kuala Lumpur", ranking: 1, intakePeriods: ["February", "September"], applicationFee: 30, description: "Top Malaysian research university." },
  { name: "Universiti Putra Malaysia", countryCode: "MY", city: "Serdang", ranking: 2, intakePeriods: ["February", "September"], applicationFee: 30, description: "Leading Malaysian research university." },
  { name: "Universiti Teknologi Malaysia", countryCode: "MY", city: "Johor Bahru", ranking: 3, intakePeriods: ["February", "September"], applicationFee: 30, description: "Leading Malaysian technical university." },

  // Hong Kong (3)
  { name: "University of Hong Kong", countryCode: "HK", city: "Hong Kong", ranking: 1, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top Hong Kong research university." },
  { name: "Chinese University of Hong Kong", countryCode: "HK", city: "Hong Kong", ranking: 2, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Leading comprehensive university." },
  { name: "Hong Kong University of Science and Technology", countryCode: "HK", city: "Hong Kong", ranking: 3, intakePeriods: ["Fall", "Spring"], applicationFee: 50, description: "Top STEM and business university." },
];
