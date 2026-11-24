# Cloudflare WAF rate-limiting rules — to create BEFORE reopening the forms (B11, security report D13-009)

Status: **prepared, not applied.** Engineering made no Cloudflare call. The owner creates the rules in the
Cloudflare dashboard before `FEATURE_CONTACT_FORM` is set back to `true`.

## Why

The application limiter (`src/lib/rate-limit.ts`) is in memory, per Worker isolate. On Cloudflare, requests are
spread over many isolates and locations, so its limits are not global. It stays in place (first line, cheap), and the
database still throttles contact inserts (`PT429`: 5 per e-mail per hour, 120 per minute globally). The WAF rule
makes the per-IP limits global, at the edge, before the Worker runs.

Limits in the code (the WAF rules below use the same numbers):

| Route | Code | Limit in the code |
|---|---|---|
| `POST /api/contact` (orders, trials, support) | `src/app/api/contact/route.ts:13` | 5 requests / 10 minutes / IP |
| `POST /api/quote` (server price) | `src/app/api/quote/route.ts:8` | 60 requests / 1 minute / IP |
| `POST /api/checkout` | `src/app/api/checkout/route.ts` | no limiter (always 403 `sales_disabled` today) — grouped with `/api/contact` |

## Where

Cloudflare dashboard → the `sygmatv.com` zone → **Security → WAF → Rate limiting rules → Create rule**
(called « Security rules → Rate limiting rules » in the newer dashboard). Create the rules in this order.

## Rule 1 — « Forms: contact and checkout (5 / 10 min / IP) »

- **If incoming requests match** → *Edit expression*:

```
(http.request.method eq "POST" and http.request.uri.path in {"/api/contact" "/api/checkout"})
```

- **With the same characteristics:** IP.
- **When rate exceeds:** Requests **5**, Period **10 minutes**.
- **Then take action:** Block (the visitor gets HTTP 429 from Cloudflare; the site's form shows its generic error).
- **For duration (mitigation timeout):** 10 minutes.
- Counting: default (count all matching requests). Do **not** tick « use custom counting expression ».

## Rule 2 — « Server quote (60 / min / IP) »

- **Expression:**

```
(http.request.method eq "POST" and http.request.uri.path eq "/api/quote")
```

- **Characteristics:** IP. **Requests:** 60. **Period:** 1 minute.
- **Action:** Block. **Duration:** 1 minute.

## If the plan does not offer these periods or two rules

Cloudflare plans differ in the number of rate-limiting rules and the periods offered (check the dropdowns in the
dashboard; Cloudflare's documentation « Rate limiting rules → Availability » lists them). Keep the order of priority:

1. Rule 1 is the one that matters (personal data, team workload). If only one rule is available, create Rule 1.
2. If 10 minutes is not offered, choose the longest period offered and a threshold of **2 requests** (a visitor who
   corrects a typo can still send), e.g. **2 requests / 1 minute / IP**, block for the longest duration offered. This
   is looser than the code's 5 / 10 minutes; the in-memory limiter and the database throttle still apply behind it.
   Write the values chosen in the « Record » line below.
3. Rule 2 (quote) is optional while Rule 1 is in place; the in-memory limiter keeps protecting it per isolate.

## Check (owner, after creating the rules)

The forms are closed today (`/api/contact` answers 503, `/api/checkout` 403): the check only confirms the rule
counts and blocks, without storing anything.

1. From one computer, run 6 times within a minute:
   `curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' -d '{}' https://sygmatv.com/api/contact`
2. Expected: 5 × `403` (the API refuses a request without the site's own Origin header, before anything else), then
   `429` from Cloudflare for 10 minutes.
3. Dashboard → *Security → Events*: the rule appears with action *Block*.
4. Do not run the test on `/api/quote` in a loop beyond 61 requests.

## Record

Rule names, IDs, thresholds actually used, date, initials: ______________________

Then tick in `docs/release/phase13/owner-approval.md` (B1 / B10 preparation) that the WAF rules exist.
