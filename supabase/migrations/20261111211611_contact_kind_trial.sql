-- Trial requests (owner decision 12/11/2026): new kind of contact request.
-- Kept in its own migration: a new enum value cannot be used in the same transaction.
alter type public.contact_kind add value if not exists 'trial_request';
