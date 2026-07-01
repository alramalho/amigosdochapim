// Portuguese districts keyed by their ISO 3166-2 / CAOP "DI" code.
export const PT_DISTRICTS: Record<string, string> = {
  "01": "Aveiro",
  "02": "Beja",
  "03": "Braga",
  "04": "Bragança",
  "05": "Castelo Branco",
  "06": "Coimbra",
  "07": "Évora",
  "08": "Faro",
  "09": "Guarda",
  "10": "Leiria",
  "11": "Lisboa",
  "12": "Portalegre",
  "13": "Porto",
  "14": "Santarém",
  "15": "Setúbal",
  "16": "Viana do Castelo",
  "17": "Vila Real",
  "18": "Viseu",
  "20": "Açores",
  "30": "Madeira",
};

// Vercel's x-vercel-ip-country-region returns the subdivision code (e.g. "11"
// or sometimes "PT-11"). Normalise it to the two-digit DI code.
export function ptDistrictCode(region?: string | null): string | null {
  if (!region) return null;
  const code = region.toUpperCase().replace(/^PT-?/, "").trim();
  if (/^\d+$/.test(code)) {
    const padded = code.padStart(2, "0");
    return PT_DISTRICTS[padded] ? padded : null;
  }
  return null;
}

export function districtName(region?: string | null): string | null {
  const code = ptDistrictCode(region);
  return code ? PT_DISTRICTS[code] : null;
}
