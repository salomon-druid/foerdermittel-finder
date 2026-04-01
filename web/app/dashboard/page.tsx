import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';

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

  // Get programs with upcoming deadlines (sorted by deadline, only future)
  const { data: deadlines } = await supabase
    .from('funding_programs')
    .select('id, title, provider, deadline')
    .eq('status', 'active')
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true })
    .limit(5);

  // Filter to only future deadlines and compute days remaining
  const now = new Date();
  const upcomingDeadlines = (deadlines || [])
    .map((p) => {
      const dl = new Date(p.deadline);
      const daysLeft = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...p, daysLeft };
    })
    .filter((p) => p.daysLeft > 0)
    .slice(0, 5);

  // Top matches (hardcoded scores for now)
  const topMatches = (recent || []).slice(0, 3);
  const matchScores = [92, 87, 83];

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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Anstehende Deadlines */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-bold text-[#1F2933] mb-4">⏰ Anstehende Deadlines</h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-gray-400">Keine anstehenden Deadlines.</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((p) => {
                const badgeColor =
                  p.daysLeft < 14
                    ? 'bg-red-100 text-red-700'
                    : p.daysLeft < 30
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600';
                return (
                  <Link
                    key={p.id}
                    href={`/programme/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-[#1F2933] text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.provider}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${badgeColor}`}>
                      {p.daysLeft}d
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Matches */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-bold text-[#1F2933] mb-4">🎯 Top Matches</h2>
          {topMatches.length === 0 ? (
            <p className="text-sm text-gray-400">Noch keine Matches verfügbar.</p>
          ) : (
            <div className="space-y-3">
              {topMatches.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/programme/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-[#1F2933] text-sm">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.provider} · {p.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3e7339] rounded-full"
                        style={{ width: `${matchScores[i]}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#3e7339]">{matchScores[i]}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quellen */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8">
        <h2 className="font-bold text-[#1F2933] mb-4">📊 Quellen</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">🇪🇺</span>
            <div>
              <p className="text-lg font-bold text-[#1F2933]">{euCount || 0}</p>
              <p className="text-xs text-gray-500">EU-Programme</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="text-lg font-bold text-[#1F2933]">{kfwCount || 7}</p>
              <p className="text-xs text-gray-500">KfW-Programme</p>
            </div>
          </div>
        </div>
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
