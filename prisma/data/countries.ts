export interface CountrySeed {
  name: string;
  code: string;
  currency: string;
  language: string;
  livingCost: number;
  flagUrl?: string;
  visaInfo?: string;
}

export const countries: CountrySeed[] = [
  { name: "United States", code: "US", currency: "USD", language: "English", livingCost: 15000, visaInfo: "F-1 student visa required. Optional Practical Training (OPT) available for 12-36 months." },
  { name: "United Kingdom", code: "GB", currency: "GBP", language: "English", livingCost: 12000, visaInfo: "Tier 4 (General) student visa. Graduate Route visa allows 2 years work after study." },
  { name: "Canada", code: "CA", currency: "CAD", language: "English, French", livingCost: 13000, visaInfo: "Study permit required. Post-Graduation Work Permit (PGWP) available." },
  { name: "Australia", code: "AU", currency: "AUD", language: "English", livingCost: 14000, visaInfo: "Subclass 500 student visa. Temporary Graduate visa (Subclass 485) available." },
  { name: "Germany", code: "DE", currency: "EUR", language: "German, English", livingCost: 10000, visaInfo: "Student visa required. 18-month job seeker visa after graduation." },
  { name: "India", code: "IN", currency: "INR", language: "Hindi, English", livingCost: 5000 },
  { name: "Switzerland", code: "CH", currency: "CHF", language: "German, French, Italian, English", livingCost: 18000 },
  { name: "Singapore", code: "SG", currency: "SGD", language: "English, Mandarin, Malay, Tamil", livingCost: 16000 },
  { name: "China", code: "CN", currency: "CNY", language: "Mandarin", livingCost: 7000 },
  { name: "Japan", code: "JP", currency: "JPY", language: "Japanese", livingCost: 11000 },
  { name: "South Korea", code: "KR", currency: "KRW", language: "Korean", livingCost: 10000 },
  { name: "Denmark", code: "DK", currency: "DKK", language: "Danish, English", livingCost: 15000 },
  { name: "Sweden", code: "SE", currency: "SEK", language: "Swedish, English", livingCost: 12000 },
  { name: "Netherlands", code: "NL", currency: "EUR", language: "Dutch, English", livingCost: 13000 },
  { name: "Belgium", code: "BE", currency: "EUR", language: "Dutch, French, German", livingCost: 11000 },
  { name: "Finland", code: "FI", currency: "EUR", language: "Finnish, Swedish, English", livingCost: 11000 },
  { name: "Norway", code: "NO", currency: "NOK", language: "Norwegian, English", livingCost: 16000 },
  { name: "Spain", code: "ES", currency: "EUR", language: "Spanish", livingCost: 9000 },
  { name: "Italy", code: "IT", currency: "EUR", language: "Italian", livingCost: 10000 },
  { name: "Ireland", code: "IE", currency: "EUR", language: "English, Irish", livingCost: 13000 },
  { name: "Austria", code: "AT", currency: "EUR", language: "German", livingCost: 11000 },
  { name: "New Zealand", code: "NZ", currency: "NZD", language: "English, Māori", livingCost: 13000 },
  { name: "United Arab Emirates", code: "AE", currency: "AED", language: "Arabic, English", livingCost: 14000 },
  { name: "France", code: "FR", currency: "EUR", language: "French", livingCost: 11000 },
  { name: "Malaysia", code: "MY", currency: "MYR", language: "Malay, English", livingCost: 6000 },
  { name: "Hong Kong", code: "HK", currency: "HKD", language: "Chinese, English", livingCost: 15000 },
];
