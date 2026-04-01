import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

function calculateMatchScore(program: any, profile: any): number {
  let score = 0;
  
  // Category match (0-30)
  if (profile.categories && program.category) {
    if (profile.categories.includes(program.category)) score += 30;
    else if (profile.categories.some((c: string) => program.category?.toLowerCase().includes(c.toLowerCase()))) score += 15;
  }
  
  // Country match (0-20)
  if (profile.country === program.country) score += 20;
  else if (program.country?.startsWith('DE') && profile.country === 'DE') score += 15;
  
  // Keyword match (0-25)
  if (profile.keywords) {
    const text = ((program.title || '') + ' ' + (program.description || '')).toLowerCase();
    const hits = profile.keywords.filter((k: string) => text.includes(k.toLowerCase())).length;
    score += Math.min(25, hits * 5);
  }
  
  // Funding range (0-15)
  if (program.max_funding && profile.min_funding && profile.max_funding) {
    if (profile.min_funding <= program.max_funding && program.max_funding <= profile.max_funding) score += 15;
    else if (program.max_funding >= profile.min_funding) score += 10;
  } else if (program.max_funding) {
    score += 8;
  }
  
  // Size match (0-10)
  if (profile.size === 'Klein' || profile.size === 'Mikro') {
    const desc = (program.description || '').toLowerCase();
    if (desc.includes('kmu') || desc.includes('klein') || desc.includes('mittelstand')) score += 10;
  }
  
  return Math.min(100, score);
}

export async function POST(request: NextRequest) {
  const profile = await request.json();
  
  // Get all programs
  const { data: programs } = await supabase
    .from('funding_programs')
    .select('*')
    .eq('status', 'active');
  
  if (!programs) {
    return NextResponse.json({ error: 'No programs found' }, { status: 404 });
  }
  
  // Calculate scores
  const scored = programs.map((p) => ({
    ...p,
    match_score: calculateMatchScore(p, profile),
    recommendation: calculateMatchScore(p, profile) >= 80 ? 'Hoch' :
                    calculateMatchScore(p, profile) >= 60 ? 'Mittel' :
                    calculateMatchScore(p, profile) >= 40 ? 'Niedrig' : 'Gering',
  }));
  
  // Sort by score
  scored.sort((a, b) => b.match_score - a.match_score);
  
  return NextResponse.json({
    profile: profile.company_name,
    total: scored.length,
    high_match: scored.filter((p) => p.match_score >= 80).length,
    programs: scored.slice(0, 20),
  });
}
