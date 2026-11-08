import { NextResponse } from 'next/server';
import { getLaunchBlockers } from '@/config/launch-gate';
import { getPriceTables } from '@/lib/price-source';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { source } = await getPriceTables();
  return NextResponse.json({
    status: 'ok',
    mode: 'prototype',
    salesEnabled: getLaunchBlockers().length === 0,
    priceSource: source,
  });
}
