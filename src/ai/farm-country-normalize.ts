/**
 * Vinomio stores `Farm.country` as the English `label` from onboarding (e.g. "Argentina"),
 * not ISO codes. Document chunks must use the same canonical label for SQL equality.
 * We also match ISO in search for legacy rows ingested as "AR".
 */

const ISO_TO_LABEL: Record<string, string> = {
  AR: 'Argentina',
  ES: 'Spain',
  CL: 'Chile',
  US: 'United States',
  FR: 'France',
  IT: 'Italy',
  PT: 'Portugal',
  AU: 'Australia',
  ZA: 'South Africa',
  MX: 'Mexico',
  UY: 'Uruguay',
  PE: 'Peru',
  BR: 'Brazil',
  CO: 'Colombia',
  NZ: 'New Zealand',
  DE: 'Germany',
  GR: 'Greece',
  AT: 'Austria',
  CH: 'Switzerland',
  BO: 'Bolivia',
  CR: 'Costa Rica',
  SV: 'El Salvador',
  GT: 'Guatemala',
  HN: 'Honduras',
  NI: 'Nicaragua',
  PA: 'Panama',
  EC: 'Ecuador',
  PY: 'Paraguay',
  GB: 'United Kingdom',
};

/** Formal / local names from official PDFs → exact `Farm.country` label (Vinomio UI). */
const COUNTRY_ALIASES: Record<string, string> = {
  'costa rica': 'Costa Rica',
  'república de costa rica': 'Costa Rica',
  'republica de costa rica': 'Costa Rica',
  'el salvador': 'El Salvador',
  'república de el salvador': 'El Salvador',
  'republica de el salvador': 'El Salvador',
  guatemala: 'Guatemala',
  'república de guatemala': 'Guatemala',
  'republica de guatemala': 'Guatemala',
  honduras: 'Honduras',
  'república de honduras': 'Honduras',
  'republica de honduras': 'Honduras',
  nicaragua: 'Nicaragua',
  panama: 'Panama',
  panamá: 'Panama',
  'república de panamá': 'Panama',
  'republica de panama': 'Panama',
  'república de panama': 'Panama',
  ecuador: 'Ecuador',
  'república del ecuador': 'Ecuador',
  'republica del ecuador': 'Ecuador',
  paraguay: 'Paraguay',
  'república del paraguay': 'Paraguay',
  'republica del paraguay': 'Paraguay',
  uk: 'United Kingdom',
  'reino unido': 'United Kingdom',
};

const ALIASES_TO_ISO: Record<string, string> = {
  argentina: 'AR',
  'república argentina': 'AR',
  'republica argentina': 'AR',
  españa: 'ES',
  espana: 'ES',
  spain: 'ES',
  chile: 'CL',
  'united states': 'US',
  usa: 'US',
  france: 'FR',
  italy: 'IT',
  italia: 'IT',
  portugal: 'PT',
  australia: 'AU',
  'south africa': 'ZA',
  mexico: 'MX',
  méxico: 'MX',
  uruguay: 'UY',
  brazil: 'BR',
  brasil: 'BR',
  colombia: 'CO',
  peru: 'PE',
  perú: 'PE',
  'new zealand': 'NZ',
  germany: 'DE',
  deutschland: 'DE',
  greece: 'GR',
  austria: 'AT',
  österreich: 'AT',
  switzerland: 'CH',
  bolivia: 'BO',
  'costa rica': 'CR',
  'el salvador': 'SV',
  guatemala: 'GT',
  honduras: 'HN',
  nicaragua: 'NI',
  panama: 'PA',
  panamá: 'PA',
  ecuador: 'EC',
  paraguay: 'PY',
  'united kingdom': 'GB',
  'uk': 'GB',
  england: 'GB',
};

const ALLOWED_CATEGORIES = new Set([
  'NORMATIVA',
  'VADEMECUM',
  'MANUAL',
  'CERTIFICACION',
  'OTHER',
]);

function isoFromCanonicalLabel(canonicalLabel: string): string {
  for (const [iso, label] of Object.entries(ISO_TO_LABEL)) {
    if (label === canonicalLabel) return iso;
  }
  return canonicalLabel;
}

export function resolveCountryForFarmMatch(
  input: string | null | undefined,
): { label: string; iso: string } {
  if (input == null || !String(input).trim()) {
    return { label: 'Argentina', iso: 'AR' };
  }
  const t = String(input).trim();
  const upper = t.toUpperCase();
  if (upper === 'GLOBAL') {
    return { label: 'GLOBAL', iso: 'GLOBAL' };
  }
  if (/^[A-Za-z]{2}$/.test(t)) {
    const iso = t.toUpperCase();
    const label = ISO_TO_LABEL[iso] ?? iso;
    return { label, iso };
  }
  const lower = t.toLowerCase();
  const countryAliasLabel = COUNTRY_ALIASES[lower];
  if (countryAliasLabel) {
    return {
      label: countryAliasLabel,
      iso: isoFromCanonicalLabel(countryAliasLabel),
    };
  }
  const aliasIso = ALIASES_TO_ISO[lower];
  if (aliasIso) {
    return { label: ISO_TO_LABEL[aliasIso], iso: aliasIso };
  }
  for (const [iso, label] of Object.entries(ISO_TO_LABEL)) {
    if (label.toLowerCase() === t.toLowerCase()) {
      return { label, iso };
    }
  }
  return { label: t, iso: t };
}

/** Single value stored on `document_chunks.country` (label, ISO legacy, or GLOBAL). */
export function normalizeCountryForChunkStorage(
  input: string | null | undefined,
): string {
  const { label } = resolveCountryForFarmMatch(input);
  return label;
}

export function normalizeDocumentCategory(raw: string | undefined): string {
  const c = (raw ?? 'VADEMECUM').trim().toUpperCase().replace(/\s+/g, '_');
  if (ALLOWED_CATEGORIES.has(c)) return c;
  return 'VADEMECUM';
}
