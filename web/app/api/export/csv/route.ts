import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  const { data: programs, error } = await supabase
    .from('funding_programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    'id',
    'title',
    'description',
    'provider',
    'country',
    'category',
    'max_funding',
    'funding_rate',
    'deadline',
    'url',
    'status',
    'created_at',
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = (programs || []).map((p) =>
    headers.map((h) => escapeCsv(p[h])).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="foerderprogramme.csv"',
    },
  });
}
