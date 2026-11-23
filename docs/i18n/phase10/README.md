# Phase 10A — translation quality review (23 November 2026)

**Status: automated (AI) review, not native-speaker validation.** Each `review-<lang>.md` lists every change made
(before → after → reason), the terminology enforced, the wording left unchanged because it needs owner / legal
approval (with proposed text), and the points a native reviewer should check.

| Language | Changes | Items for approval | Report |
|---|---|---|---|
| French (fr) | 24 | 7 | [review-fr.md](review-fr.md) |
| German (de) | 91 | 13 | [review-de.md](review-de.md) |
| Spanish (es) | 70 | 8 | [review-es.md](review-es.md) |
| Italian (it) | 35 | 5 | [review-it.md](review-it.md) |
| Dutch (nl) | 53 | 14 | [review-nl.md](review-nl.md) |
| Swedish (sv) | 43 | 12 | [review-sv.md](review-sv.md) |
| Norwegian Bokmål (nb) | 60 | 6 | [review-nb.md](review-nb.md) |

Rules applied: no change of meaning, promise, price, figure, placeholder, link or key; no length-limited UI string
made longer (checked automatically against 28a8d1a); quality gate `tests/unit/translations.test.ts` green.

Adjustments made after these reports (commit 8946645):
- German plan cards: « Verlängert sich nicht » (read as « cannot be renewed ») → « Endet automatisch » (no automatic
  renewal). The report's proposal « Läuft automatisch aus » wrapped at 1024 px.
- Owner decision « no universal device compatibility claim », all 8 languages: « on every screen / on all your
  screens / for every device » replaced by « on TV, computer and mobile » / « for popular devices ».

Next step: native-speaker review per language (priority de, nl, sv, nb), then the owner's decisions on the
« Needs owner/legal approval » sections.
