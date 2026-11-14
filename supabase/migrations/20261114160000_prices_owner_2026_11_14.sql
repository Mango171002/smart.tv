-- Owner price list of 14/11/2026 (USD, before taxes, still illustrative / never chargeable):
-- Starter 59, Plus 69, Ultra+ 99 per year; 24 months -20 %, 36 months -30 %; extra devices +10/+18/+25 per year.
-- Non-destructive: the current US prices are closed (valid_to) and kept as history; the new ones start at the same instant.
update public.prices set valid_to = now()
 where market_code = 'US' and valid_to is null and status <> 'retired';

insert into public.prices (market_code, plan_id, currency, amount_minor, status, valid_from)
select 'US', p.id, 'USD', v.amount_minor, 'illustrative', now()
from (values
  ('starter', '12m', 1, 5900),
  ('starter', '12m', 2, 6900),
  ('starter', '12m', 3, 7700),
  ('starter', '12m', 4, 8400),
  ('starter', '24m', 1, 9399),
  ('starter', '24m', 2, 10999),
  ('starter', '24m', 3, 12299),
  ('starter', '24m', 4, 13399),
  ('starter', '36m', 1, 12299),
  ('starter', '36m', 2, 14399),
  ('starter', '36m', 3, 16099),
  ('starter', '36m', 4, 17599),
  ('starter', 'lifetime', 1, 14099),
  ('starter', 'lifetime', 2, 16499),
  ('starter', 'lifetime', 3, 18399),
  ('starter', 'lifetime', 4, 20099),
  ('plus', '12m', 1, 6900),
  ('plus', '12m', 2, 7900),
  ('plus', '12m', 3, 8700),
  ('plus', '12m', 4, 9400),
  ('plus', '24m', 1, 10999),
  ('plus', '24m', 2, 12599),
  ('plus', '24m', 3, 13899),
  ('plus', '24m', 4, 14999),
  ('plus', '36m', 1, 14399),
  ('plus', '36m', 2, 16499),
  ('plus', '36m', 3, 18199),
  ('plus', '36m', 4, 19699),
  ('plus', 'lifetime', 1, 16499),
  ('plus', 'lifetime', 2, 18899),
  ('plus', 'lifetime', 3, 20799),
  ('plus', 'lifetime', 4, 22499),
  ('ultra', '12m', 1, 9900),
  ('ultra', '12m', 2, 10900),
  ('ultra', '12m', 3, 11700),
  ('ultra', '12m', 4, 12400),
  ('ultra', '24m', 1, 15799),
  ('ultra', '24m', 2, 17399),
  ('ultra', '24m', 3, 18699),
  ('ultra', '24m', 4, 19799),
  ('ultra', '36m', 1, 20699),
  ('ultra', '36m', 2, 22799),
  ('ultra', '36m', 3, 24499),
  ('ultra', '36m', 4, 25999),
  ('ultra', 'lifetime', 1, 23699),
  ('ultra', 'lifetime', 2, 26099),
  ('ultra', 'lifetime', 3, 27999),
  ('ultra', 'lifetime', 4, 29699)
) as v (tier_code, term, streams, amount_minor)
join public.plans p on p.tier_code = v.tier_code and p.term = v.term and p.streams = v.streams;
