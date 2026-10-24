const names: Record<string, string> = {
  AE: "United Arab Emirates", AR: "Argentina", AU: "Australia", AT: "Austria", BE: "Belgium",
  BR: "Brazil", CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia", CR: "Costa Rica",
  CZ: "Czech Republic", DE: "Germany", DK: "Denmark", EC: "Ecuador", EG: "Egypt", ES: "Spain",
  FR: "France", GB: "United Kingdom", GR: "Greece", HU: "Hungary", ID: "Indonesia", IN: "India",
  IT: "Italy", JO: "Jordan", KE: "Kenya", MA: "Morocco", MX: "Mexico", MY: "Malaysia",
  NL: "Netherlands", NZ: "New Zealand", PE: "Peru", PH: "Philippines", PL: "Poland",
  PT: "Portugal", RO: "Romania", SA: "Saudi Arabia", SE: "Sweden", SG: "Singapore",
  TH: "Thailand", TR: "Türkiye", US: "United States", VN: "Vietnam", ZA: "South Africa",
};

export function countryName(code: string) {
  return names[code] ?? code;
}

export function flag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
