#!/usr/bin/env bash
# Regenerates docs/i18n/review-workbooks/review-<lang>.xlsx and .csv from the current source files, then verifies them.
# Run from anywhere inside the repository:  bash docs/i18n/review-workbooks/tools/regenerate.sh
# Needs node >= 22.6 (--experimental-strip-types) and python3 with openpyxl. Intermediate files go to tools/build/ (ignored).
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
TOOLS="$ROOT/docs/i18n/review-workbooks/tools"
BUILD="$TOOLS/build"
PACK_COMMIT=5c3635f   # source of docs/i18n/phase13 (the pack); used to mark rows new or changed since the pack
NODE=(node --experimental-strip-types --no-warnings --import "$TOOLS/register-hooks.mjs")
rm -rf "$BUILD" && mkdir -p "$BUILD/pack-src"
# 1. Rendered strings of the current files and of the pack's files.
REVIEW_SRC="$ROOT/src" "${NODE[@]}" "$TOOLS/flat.mjs" "$BUILD/flat.json"
git -C "$ROOT" archive "$PACK_COMMIT" src | tar -x -C "$BUILD/pack-src"
REVIEW_SRC="$BUILD/pack-src/src" "${NODE[@]}" "$TOOLS/flat.mjs" "$BUILD/pack-flat.json"
# 2. Rows per language (build/rows/<lang>.json, summary.json, langinfo.json).
REVIEW_BUILD="$BUILD" node "$TOOLS/build.cjs"
# 3. Workbooks and CSVs.
LABEL="${REVIEW_SOURCE_LABEL:-commit $(git -C "$ROOT" log -1 --format=%h -- src) (last change to src/)}"
python3 "$TOOLS/make_workbooks.py" "$ROOT/docs/i18n/review-workbooks" "$LABEL"
# 4. Checks against the source files.
node --experimental-strip-types --no-warnings "$ROOT/docs/i18n/review-workbooks/verify-workbooks.mjs"
