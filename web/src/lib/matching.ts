/**
 * Shared matching engine for server components and API routes.
 * Mirrors the Python scorer logic in src/matching/scorer.py
 */

// ── Synonym matching ───────────────────────────────────────────────────

const SYNONYM_GROUPS: string[][] = [
  ['digitalisierung', 'digital', 'it', 'software', 'cloud', 'ki', 'künstliche intelligenz', 'machine learning', 'industrie 4.0', 'iot', 'smart'],
  ['innovation', 'innovativ', 'forschung', 'entwicklung', 'f&e', 'prototype', 'pilotprojekt', 'neuentwicklung'],
  ['energie', 'klima', 'erneuerbar', 'solar', 'photovoltaik', 'wasserstoff', 'energieeffizienz', 'dekarbonisierung', 'co2', 'nachhaltigkeit'],
  ['umwelt', 'ökolog', 'recycling', 'kreislaufwirtschaft', 'ressourceneffizienz', 'biodiversität'],
  ['gründung', 'startup', 'gründer', 'jungunternehmen', 'spin-off', 'existenzgründung'],
  ['export', 'internationalisierung', 'international', 'ausland', 'markterschließung'],
  ['kmu', 'mittelstand', 'kleinunternehmen', 'familienunternehmen', 'handwerk'],
  ['bildung', 'weiterbildung', 'qualifizierung', 'schulung', 'kompetenz', 'ausbildung'],
  ['produktion', 'fertigung', 'manufacturing', 'industrieproduktion', 'verarbeitung'],
  ['gesundheit', 'medizin', 'pharma', 'biotech', 'medtech', 'gesundheitswesen'],
  ['bau', 'gebäude', 'immobilie', 'sanierung', 'modernisierung', 'energetisch'],
];

function expandKeywords(keywords: string[]): Set<string> {
  const expanded = new Set<string>();
  const kwLower = keywords.map(k => k.toLowerCase().trim());
  for (const kw of kwLower) {
    expanded.add(kw);
    for (const group of SYNONYM_GROUPS) {
      if (group.includes(kw)) {
        for (const syn of group) expanded.add(syn);
      }
    }
  }
  return expanded;
}

function semanticScore(companyKeywords: string[], programText: string): number {
  if (!companyKeywords.length) return 50;
  const expanded = Array.from(expandKeywords(companyKeywords));
  const text = programText.toLowerCase();
  let hits = 0;
  let directHits = 0;
  const kwLower = companyKeywords.map(k => k.toLowerCase().trim());
  for (const kw of expanded) {
    if (text.includes(kw)) {
      hits++;
      if (kwLower.includes(kw)) directHits++;
    }
  }
  if (hits === 0) return 0;
  const directWeight = directHits * 2.0;
  const synonymWeight = (hits - directHits) * 1.0;
  const totalWeight = directWeight + synonymWeight;
  const maxPossible = companyKeywords.length * 2.0;
  return Math.min(100, (totalWeight / Math.max(maxPossible, 1)) * 100);
}

// ── Scoring ────────────────────────────────────────────────────────────

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  size: string;
  region: string;
  focus_areas: string[];
  employee_count?: number;
  annual_revenue?: number;
}

export interface ProgramLike {
  id: string;
  title: string;
  description: string;
  provider: string;
  country: string;
  category: string;
  max_funding: number | null;
  funding_rate: number | null;
  deadline: string | null;
  url: string;
  status: string;
  target_groups: string[] | null;
  requirements: string[] | null;
  created_at: string;
}

export interface MatchResult {
  program: ProgramLike;
  total_score: number;
  industry_score: number;
  size_score: number;
  region_score: number;
  focus_score: number;
  urgency_score: number;
  semantic_score: number;
}

const INDUSTRY_CATEGORY_MAP: Record<string, string[]> = {
  'IT': ['Innovation', 'Digitalisierung', 'Forschung'],
  'Software': ['Innovation', 'Digitalisierung'],
  'Handwerk': ['Innovation', 'Digitalisierung', 'Gründung'],
  'Produktion': ['Innovation', 'Umwelt', 'Energie', 'Digitalisierung'],
  'Forschung': ['Forschung', 'Innovation'],
  'Gesundheit': ['Forschung', 'Innovation'],
  'Bau': ['Energie', 'Umwelt', 'Innovation'],
  'Landwirtschaft': ['Umwelt', 'Energie', 'Forschung'],
  'Handel': ['Digitalisierung', 'Export', 'Gründung'],
  'Dienstleistung': ['Digitalisierung', 'Innovation', 'Gründung'],
  'Logistik': ['Digitalisierung', 'Innovation', 'Umwelt'],
  'Energie': ['Energie', 'Umwelt', 'Innovation'],
  'Bildung': ['Bildung', 'Forschung'],
};

const SIZE_TARGET_MAP: Record<string, string[]> = {
  'Klein': ['KMU', 'Startup', 'Kleinunternehmen', 'Jungunternehmen'],
  'KMU': ['KMU', 'Mittelstand', 'Startup', 'Kleinunternehmen'],
  'Mittelstand': ['KMU', 'Mittelstand', 'Großunternehmen'],
  'Großunternehmen': ['Großunternehmen', 'Mittelstand'],
};

function scoreIndustry(c: CompanyProfile, p: ProgramLike): number {
  if (c.industry.toLowerCase() === p.title.toLowerCase()) return 100;
  const cats = INDUSTRY_CATEGORY_MAP[c.industry] || [];
  if (cats.includes(p.category)) return 80;
  if (p.description.toLowerCase().includes(c.industry.toLowerCase())) return 60;
  for (const f of (c.focus_areas || [])) {
    if (p.description.toLowerCase().includes(f.toLowerCase()) || p.title.toLowerCase().includes(f.toLowerCase())) return 70;
  }
  if (p.category === 'Allgemein') return 30;
  return 0;
}

function scoreSize(c: CompanyProfile, p: ProgramLike): number {
  if (!p.target_groups?.length) return 50;
  const groups = SIZE_TARGET_MAP[c.size] || [];
  for (const g of groups) { if (p.target_groups.includes(g)) return 100; }
  for (const tg of p.target_groups) { if (['alle', 'allgemein', ''].includes(tg.toLowerCase())) return 50; }
  return 0;
}

function scoreRegion(c: CompanyProfile, p: ProgramLike): number {
  if (p.country === 'EU') return 90;
  if (p.country === 'DE' && ['Bund', 'KfW'].includes(p.provider)) return 85;
  if (p.country === 'DE' && p.provider === 'Land') {
    if (p.title.includes(c.region) || p.description.includes(c.region)) return 100;
    return 40;
  }
  return 50;
}

function scoreFocus(c: CompanyProfile, p: ProgramLike): number {
  if (!c.focus_areas?.length) return 50;
  const text = `${p.title} ${p.description}`.toLowerCase();
  let matches = 0;
  for (const f of c.focus_areas) { if (text.includes(f.toLowerCase())) matches++; }
  if (matches === 0) return 20;
  return Math.min(100, (matches / c.focus_areas.length) * 100);
}

function scoreUrgency(p: ProgramLike): number {
  if (!p.deadline) return 30;
  const dl = new Date(p.deadline);
  const now = new Date();
  const days = Math.ceil((dl.getTime() - now.getTime()) / (86400000));
  if (days < 0) return 0;
  if (days <= 14) return 100;
  if (days <= 30) return 80;
  if (days <= 60) return 60;
  if (days <= 90) return 40;
  return 20;
}

function fundingFit(revenue: number | undefined, maxFunding: number | null): number {
  if (!revenue || !maxFunding || revenue <= 0) return 50;
  const ratio = maxFunding / revenue;
  if (0.05 <= ratio && ratio <= 0.5) return 100;
  if (ratio < 0.05) return 40 + (ratio / 0.05) * 60;
  if (ratio <= 2.0) return 80;
  return 60;
}

export function scoreMatch(company: CompanyProfile, program: ProgramLike): MatchResult {
  const industry = scoreIndustry(company, program);
  const size = scoreSize(company, program);
  const region = scoreRegion(company, program);
  const focus = scoreFocus(company, program);
  const urgency = scoreUrgency(program);
  const text = `${program.title} ${program.description} ${(program.target_groups || []).join(' ')} ${(program.requirements || []).join(' ')}`;
  const semantic = semanticScore(company.focus_areas || [], text);
  const fit = fundingFit(company.annual_revenue, program.max_funding);

  const total = industry * 0.25 + size * 0.15 + region * 0.10 + focus * 0.20 +
                semantic * 0.15 + urgency * 0.10 + fit * 0.05;

  return {
    program,
    total_score: Math.round(total * 100) / 100,
    industry_score: Math.round(industry * 100) / 100,
    size_score: Math.round(size * 100) / 100,
    region_score: Math.round(region * 100) / 100,
    focus_score: Math.round(focus * 100) / 100,
    urgency_score: Math.round(urgency * 100) / 100,
    semantic_score: Math.round(semantic * 100) / 100,
  };
}

/** Demo company profile for homepage/programme scoring */
export const DEMO_COMPANY: CompanyProfile = {
  id: 'demo',
  name: 'Demo Unternehmen',
  industry: 'IT',
  size: 'KMU',
  region: 'Bayern',
  focus_areas: ['Innovation', 'Digitalisierung', 'KI'],
  employee_count: 45,
  annual_revenue: 5_000_000,
};
