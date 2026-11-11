-- Owner decision (11/11/2026): the Plus plan offers 4K Ultra HD. Non-destructive update.
update public.plan_tiers set max_quality = 'uhd' where code = 'plus' and max_quality <> 'uhd';
