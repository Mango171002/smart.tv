# Prelaunch team procedure (A6, decision D14)

Applies from now until the owner reopens online requests (`FEATURE_CONTACT_FORM=true`, owner approval section B).
For everyone who answers customers or uses the SYGMA Operations Bot (Telegram), WhatsApp, the support mailbox or the
social accounts.

## 1. The rule

While the forms are closed, the team does **not**:

- take orders, quote a personal price or confirm a plan to a customer;
- give free trials (no « Essai envoyé »);
- activate a subscription or confirm a payment (no « Converti »), by any channel or payment method;
- send promotional or sales messages — WhatsApp broadcasts, social posts, stories, ads or DMs offering orders, trials,
  discounts or « +30 days free »;
- promise a launch date, a price, a channel, a sports competition or a country availability.

Rights per country (`licensedTerritories`), tax rules, payment and activation providers are not in place yet: nothing
may be sold or given in the meantime.

## 2. How to answer an inquiry (by e-mail)

Answer from **support@sygmatv.com** only, in the customer's language if you can, otherwise in English. Keep it short,
factual, and never ask for payment details.

Template (adapt the first line):

> Hello,
>
> Thank you for your interest in SYGMA TV+. Online orders and free trials are not open yet, so we cannot take an
> order, give a trial or accept a payment at the moment. We have noted your message; when orders open, the website
> sygmatv.com will say so.
>
> If you already have a subscription and need help with it, reply to this e-mail with your order number.
>
> SYGMA TV+ — support@sygmatv.com
> Sygma TV LLC, 1209 Mountain Road Pl NE, Ste H, Albuquerque, NM 87110, United States

Do not add: prices, plan advice, launch dates, « reserved for you » promises, payment instructions, links other than
sygmatv.com.

WhatsApp messages and social comments: reply once, briefly, « Orders and trials are not open yet — please write to
support@sygmatv.com », then continue by e-mail. Do not start a sale or a trial in the chat.

Existing customers (activated before the closure): support questions are answered as usual by e-mail; no renewal,
upgrade or new payment is taken.

## 3. What the code now blocks (for information)

| Action | What happens while the forms are closed | Where |
|---|---|---|
| Website order, trial and support forms | No form; the API answers `503 contact_unavailable` | `src/app/api/contact/route.ts` |
| Order / trial from a country without documented rights (after reopening too) | Refused `403 territory_not_licensed`; the list is empty today, so every order and trial would be refused | `src/lib/validation.ts` `isOrderTerritoryAllowed` |
| Bot button « 🎁 Essai envoyé » (trial requests) | Refused with « ⛔ Prélancement … Rien n’a changé »: no status change, no e-mail | `src/lib/telegram/ops.ts` |
| Bot button « Converti » (orders and trials) | Refused the same way: no order number, no « subscription active » e-mail | `src/lib/telegram/ops.ts` |
| Scheduled e-mails (Trustpilot invitation 3 days after « Converti », trial follow-up 24 h after « Essai envoyé ») | Not sent and not marked as sent; a count line is logged | `src/app/api/cron/review-invites/route.ts` |
| Any other customer e-mail through Brevo | Refused by the sender (`prelaunch_blocked`); only `/testemail` to support@sygmatv.com works | `src/lib/email/send.ts` |
| Online payment (`/api/checkout`) | Always `403 sales_disabled` (launch gate) | `src/config/launch-gate.ts` |
| Terms other than 12 / 24 / 36 months, more than 4 devices, « lifetime » | Refused by every API | `src/lib/validation.ts` |

Still allowed in the bot: « Contacté » on a pre-registration, « Sans suite », « Rouvrir », « Répondu » / « Clôturer » on support
tickets, undo, `/attente`, `/stats`, `/testemail` (team mailbox only).

The code cannot block what happens outside it (WhatsApp, social media, bank transfers, manual activations): this
procedure covers those.

## 4. Escalation

| Situation | Who | When |
|---|---|---|
| A customer says they paid, or asks for a refund | Owner (Sygma TV LLC) | As soon as possible; do not promise anything before the owner answers |
| Legal letter, rights-holder or platform complaint, regulator, press | Owner, who involves counsel | Immediately; do not reply yourself |
| Personal-data request (access, deletion) | Owner (privacy) | Forward at once; acknowledge receipt only, the owner answers |
| The bot accepts « Essai envoyé » / « Converti », or a customer receives an activation e-mail | Owner + engineering | Immediately: it means the guard is off (check `FEATURE_CONTACT_FORM`) |
| Doubt about what you may say | Owner | Before answering |

## 5. Record

Team members briefed (name, date): ______________________ · Approved by the owner: ______ (date, initials)
