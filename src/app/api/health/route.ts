import { NextResponse } from 'next/server';
import { getLaunchBlockers } from '@/config/launch-gate';
import { getPriceTable } from '@/lib/price-source';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { source } = await getPriceTable();
  return NextResponse.json({
    status: 'ok',
    mode: 'prelaunch',
    salesEnabled: getLaunchBlockers().length === 0,
    priceSource: source,
  });
}
