import { supabase } from '@/src/lib/supabase';

export default async function DashboardPage() {
  const { count: total } = await supabase
    .from('funding_programs')
    .select('*', { count: 'exact', head: true });

  const { count: active } = await supabase
    .from('funding_programs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: euCount } = await supabase
    .from('funding_programs')
    .select('*', { count: 'exact', head: true })
    .eq('provider', 'EU');

  const { count: kfwCount } = await supabase
    .from('funding_programs')
    .select('*', { count: 'exact', head: true })
    .eq('provider', 'KfW');

  const { data: recent } = await supabase
    .from('funding_programs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1F2933] mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Programme gesamt', value: total || 0 },
          { label: 'Aktiv', value: active || 0 },
          { label: 'EU-Programme', value: euCount || 0 },
          { label: 'KfW-Programme', value: kfwCount || 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-[#1F2933]">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-bold text-[#1F2933] mb-4">Zuletzt hinzugefügt</h2>
        <div className="space-y-3">
          {(recent || []).map((p) => (
            <a
              key={p.id}
              href={`/programme/${p.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-[#1F2933]">{p.title}</p>
                <p className="text-xs text-gray-400">{p.provider} · {p.category}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(p.created_at).toLocaleDateString('de-DE')}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
