import { NextResponse } from 'next/server';
import { getLaunchBlockers } from '@/config/launch-gate';
import { isContactFormEnabled } from '@/lib/features';
import { getPriceTable } from '@/lib/price-source';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { source } = await getPriceTable();
  // « assisted »: orders are sent with the website form and handled by the team (WhatsApp, activation, then
  // payment). « prelaunch » (phase 11B): online requests are closed (FEATURE_CONTACT_FORM=false), the windows say
  // « Orders opening soon ». Informational label only — nothing reads it. salesEnabled stays false: there is no
  // automatic online payment (POST /api/checkout is locked by the launch gate).
  return NextResponse.json({
    status: 'ok',
    mode: isContactFormEnabled() ? 'assisted' : 'prelaunch',
    salesEnabled: getLaunchBlockers().length === 0,
    priceSource: source,
  });
}
