'use client';

import { useState } from 'react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49€',
    period: '/Monat',
    description: 'Für Einzelunternehmer und kleine Teams',
    features: [
      'EU-Förderprogramme',
      'KfW-Förderprogramme',
      'E-Mail-Benachrichtigungen',
      '1 Branche',
      '5 Programme Watchlist',
      'CSV-Export',
    ],
    highlight: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '99€',
    period: '/Monat',
    description: 'Für wachsende Unternehmen und Berater',
    features: [
      'Alle Quellen (EU, KfW, BAFA, Bundesland)',
      'KI-Match-Scores',
      'Unbegrenzte Branchen',
      'Deadline-Warnungen',
      'KI-Zusammenfassungen',
      'PDF-Export & Reports',
      'E-Mail Alerts',
      '3 Team-Mitglieder',
    ],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '199€',
    period: '/Monat',
    description: 'Für große Teams und Beratungsunternehmen',
    features: [
      'Alles in Professional',
      'API-Zugang',
      'White-Label Reports',
      'Unbegrenzte Team-Mitglieder',
      'Dedicated Support',
      'Custom Integrations',
      'SSO',
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const startCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannt'));
      }
    } catch (err) {
      alert('Fehler beim Checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#1F2933] text-center mb-2">Einfache Preise</h1>
      <p className="text-gray-500 text-center mb-8">14 Tage kostenlos testen. Jederzeit kündbar.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl p-6 border ${plan.highlight ? 'border-[#3e7339] ring-2 ring-[#3e7339]/20' : 'border-gray-200'} bg-white`}
          >
            {plan.highlight && (
              <span className="text-xs font-bold text-[#D4AF37] uppercase">Beliebteste Wahl</span>
            )}
            <h2 className="text-xl font-bold text-[#1F2933] mt-2">{plan.name}</h2>
            <p className="text-sm text-gray-500">{plan.description}</p>
            <p className="text-4xl font-extrabold text-[#1F2933] mt-3">
              {plan.price}<span className="text-sm font-normal text-gray-400">{plan.period}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-[#3e7339]">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => startCheckout(plan.id)}
              disabled={loading === plan.id}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 ${
                plan.highlight
                  ? 'bg-[#3e7339] text-white hover:bg-[#356431]'
                  : 'bg-gray-100 text-[#1F2933] hover:bg-gray-200'
              }`}
            >
              {loading === plan.id ? 'Lädt...' : '14 Tage kostenlos testen'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
