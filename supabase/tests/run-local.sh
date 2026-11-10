#!/usr/bin/env bash
# Reproduces the real database history on a throw-away local PostgreSQL that
# emulates the Supabase roles: migrations before the tier offer, the legacy seed,
# the remaining migrations, then the current seed (twice, to prove idempotency).
# Finally runs the SQL security tests. Usage: npm run db:test
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${SMARTTV_TEST_DB:-smarttv_test}"
SPLIT=20261110230034
if [ "$(id -un)" = "root" ]; then RUN=(su postgres -c); else RUN=(bash -c); fi
run() { "${RUN[@]}" "$*"; }
run "dropdb --if-exists $DB" >/dev/null 2>&1
run "createdb $DB"
before=(); after=()
for f in migrations/*.sql; do
  v=$(basename "$f" | cut -d_ -f1)
  if [ "$v" -lt "$SPLIT" ]; then before+=("$f"); else after+=("$f"); fi
done
cat tests/local-supabase-shim.sql "${before[@]}" tests/legacy-seed.sql "${after[@]}" seed.sql seed.sql \
  | run "psql -v ON_ERROR_STOP=1 -q -X -d $DB" >/dev/null
run "psql -v ON_ERROR_STOP=1 -q -X -t -A -d $DB" < tests/rls_and_privileges.test.sql | grep -v '^$' | tail -n 1
