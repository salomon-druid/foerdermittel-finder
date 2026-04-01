/**
 * POST /api/match — Score a company profile against all active programs.
 *
 * Request body:
 * {
 *   "company": { "id", "name", "industry", "size", "region", "focus_areas", ... },
 *   "min_score": 20,
 *   "max_results": 20
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scoreMatch, CompanyProfile } from '@/src/lib/matching';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const company: CompanyProfile = body.company;
    const minScore: number = body.min_score ?? 20;
    const maxResults: number = body.max_results ?? 20;

    if (!company || !company.industry || !company.size) {
      return NextResponse.json({ error: 'company with industry and size required' }, { status: 400 });
    }

    const { data: programs, error } = await supabase
      .from('funding_programs')
      .select('*')
      .eq('status', 'active');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = (programs || [])
      .map(p => scoreMatch(company, p))
      .filter(r => r.total_score >= minScore)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, maxResults);

    return NextResponse.json({
      company_id: company.id,
      total_programs: programs?.length || 0,
      matched: results.length,
      matches: results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
