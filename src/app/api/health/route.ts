import { NextResponse } from 'next/server';
import { getLaunchBlockers } from '@/config/launch-gate';
import { getPriceTable } from '@/lib/price-source';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { source } = await getPriceTable();
  // « assisted »: orders are sent with the website form and handled by the team (WhatsApp, activation, then
  // payment). Informational label only — nothing reads it. salesEnabled stays false: there is no automatic
  // online payment (POST /api/checkout is locked by the launch gate).
  return NextResponse.json({
    status: 'ok',
    mode: 'assisted',
    salesEnabled: getLaunchBlockers().length === 0,
    priceSource: source,
  });
}
