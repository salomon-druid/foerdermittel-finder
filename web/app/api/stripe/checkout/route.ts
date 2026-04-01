import { NextRequest, NextResponse } from 'next/server';

const PRICES: Record<string, { name: string; amount: number; currency: string }> = {
  starter: { name: 'FörderFinder Starter', amount: 4900, currency: 'eur' },    // 49€
  professional: { name: 'FörderFinder Professional', amount: 9900, currency: 'eur' },  // 99€
  enterprise: { name: 'FörderFinder Enterprise', amount: 19900, currency: 'eur' },     // 199€
};

export async function POST(request: NextRequest) {
  const { plan, email } = await request.json();

  if (!plan || !PRICES[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const priceInfo = PRICES[plan];

  try {
    // Create Stripe checkout session via API
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price_data][currency]': priceInfo.currency,
        'line_items[0][price_data][product_data][name]': priceInfo.name,
        'line_items[0][price_data][unit_amount]': String(priceInfo.amount),
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][quantity]': '1',
        'success_url': `${request.headers.get('origin') || 'https://foerdermittel-finder-tan.vercel.app'}/dashboard?success=true`,
        'cancel_url': `${request.headers.get('origin') || 'https://foerdermittel-finder-tan.vercel.app'}/profil?canceled=true`,
        ...(email && { 'customer_email': email }),
      }),
    });

    const session = await response.json();

    if (session.url) {
      return NextResponse.json({ url: session.url });
    } else {
      return NextResponse.json({ error: 'Failed to create checkout session', details: session }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
