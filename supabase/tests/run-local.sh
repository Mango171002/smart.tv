#!/usr/bin/env bash
# Applies all migrations + seed (twice, to prove idempotency) on a throw-away
# local PostgreSQL database that emulates the Supabase roles, then runs the SQL
# security tests. Usage: npm run db:test   (requires a local postgres server)
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${SMARTTV_TEST_DB:-smarttv_test}"
if [ "$(id -un)" = "root" ]; then RUN=(su postgres -c); else RUN=(bash -c); fi
run() { "${RUN[@]}" "$*"; }
run "dropdb --if-exists $DB" >/dev/null 2>&1
run "createdb $DB"
cat tests/local-supabase-shim.sql migrations/*.sql seed.sql seed.sql \
  | run "psql -v ON_ERROR_STOP=1 -q -X -d $DB" >/dev/null
run "psql -v ON_ERROR_STOP=1 -q -X -t -A -d $DB" < tests/rls_and_privileges.test.sql | grep -v '^$' | tail -n 1
