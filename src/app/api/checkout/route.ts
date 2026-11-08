import { getLaunchBlockers } from '@/config/launch-gate';
import { checkSameOrigin, jsonError, readJson } from '@/lib/http';
import { checkoutSchema } from '@/lib/validation';

/**
 * Real checkout entry point. LOCKED: it refuses every request while any launch
 * blocker remains. Even once unlocked, it must create a `draft` order server-side
 * and hand off to a provider-hosted checkout — not implemented until a payment
 * provider is approved (see docs/ARCHITECTURE.md).
 */
export async function POST(req: Request) {
  if (!checkSameOrigin(req)) return jsonError(403, 'forbidden_origin');
  const blockers = getLaunchBlockers();
  if (blockers.length > 0) return jsonError(403, 'sales_disabled', { blockers });

  let body: unknown;
  try {
    body = await readJson(req, 4096);
  } catch {
    return jsonError(400, 'invalid_json');
  }
  if (!checkoutSchema.safeParse(body).success) return jsonError(400, 'invalid_input');
  return jsonError(501, 'payment_provider_not_integrated');
}
