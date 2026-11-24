import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALL_LANGUAGE_CODES } from '@/i18n/locales';

/**
 * Database language compatibility (docs/release/final/db-locale-migration.md), without a database:
 * the effective CHECK of every locale column, after all migrations in order, equals the site registry.
 */
const ROOT = join(__dirname, '..', '..');
const MIGRATIONS = join(ROOT, 'supabase', 'migrations');
const files = readdirSync(MIGRATIONS).filter((f) => /^\d{14}_.+\.sql$/.test(f)).sort();
const sql = (f: string) => readFileSync(join(MIGRATIONS, f), 'utf8').replace(/--[^\n]*/g, '');

/** Allowed values of the LAST `check (<column> in (...))` found in the migration history, and the file it is in. */
function effectiveCheck(column: string): { file: string; values: string[] } | null {
  const re = new RegExp(`check\\s*\\(\\s*${column}\\s+in\\s*\\(([^)]*)\\)`, 'gi');
  let found: { file: string; values: string[] } | null = null;
  for (const f of files) {
    for (const m of sql(f).matchAll(re)) found = { file: f, values: [...(m[1] ?? '').matchAll(/'([^']*)'/g)].map((v) => v[1] ?? '') };
  }
  return found;
}

describe('database locale constraints follow the language registry', () => {
  for (const column of ['locale', 'default_locale', 'preferred_locale']) {
    it(`${column}: allows exactly the ${ALL_LANGUAGE_CODES.length} site languages`, () => {
      const check = effectiveCheck(column);
      expect(check, column).not.toBeNull();
      expect([...check!.values].sort()).toEqual([...ALL_LANGUAGE_CODES].sort());
      expect(new Set(check!.values).size).toBe(check!.values.length);
    });
  }

  it('the widening migration is the latest locale change, re-adds each check NOT VALID then validates it', () => {
    const f = '20261124120000_locales_8_languages.sql';
    expect(files).toContain(f);
    expect(effectiveCheck('locale')?.file).toBe(f);
    const text = sql(f);
    for (const c of ['contact_requests_locale_check', 'markets_default_locale_check', 'customers_preferred_locale_check']) {
      expect(text).toMatch(new RegExp(`drop constraint if exists ${c};`));
      expect(text).toMatch(new RegExp(`add constraint ${c}\\s+check \\([a-z_]+ in \\([^)]*\\)\\) not valid;`));
      expect(text).toMatch(new RegExp(`validate constraint ${c};`));
    }
    // Widening only: no row is rewritten, no other table or flag is touched.
    expect(text).not.toMatch(/\b(update|delete|insert|truncate)\b/i);
    expect(text).not.toMatch(/licensed|sales_enabled|price|tax/i);
  });

  it('documents both rollbacks (strict and map-to-en)', () => {
    const strict = readFileSync(join(ROOT, 'supabase/rollback/20261124120000_locales_8_languages.rollback.sql'), 'utf8');
    const safe = readFileSync(join(ROOT, 'supabase/rollback/20261124120000_locales_8_languages.rollback_map_to_en.sql'), 'utf8');
    expect(strict).toMatch(/rollback refused/);
    expect(strict).not.toMatch(/^\s*update /im);
    expect(safe).toMatch(/update public\.contact_requests set locale = 'en' where locale not in \('en', 'fr'\);/);
  });
});

describe('contact form validation and the locales', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  const body = (locale: string) => ({ kind: 'launch_waitlist', email: 'wl@example.test', locale, consent: true });

  it('preview build: every site language is accepted (and the database now accepts it too)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_MODE', 'preview');
    vi.resetModules();
    const { contactSchema } = await import('@/lib/validation');
    for (const l of ALL_LANGUAGE_CODES) expect(contactSchema.safeParse(body(l)).success, l).toBe(true);
    expect(contactSchema.safeParse(body('pt')).success).toBe(false);
  });

  it('production build: unchanged, only the built (enabled) languages are accepted', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_MODE', '');
    vi.stubEnv('NEXT_PUBLIC_RELEASED_LANGUAGES', '');
    vi.resetModules();
    const { contactSchema } = await import('@/lib/validation');
    expect(contactSchema.safeParse(body('en')).success).toBe(true);
    expect(contactSchema.safeParse(body('de')).success).toBe(false);
  });
});
