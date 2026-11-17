'use client';

import { Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import countries from '@/config/countries.json';

export interface Country {
  code: string;
  name: string;
  dial: string;
  /** English name (always searchable, whatever the display language). */
  en?: string;
}

const ALL: Country[] = [...countries].sort((a, b) => a.name.localeCompare(b.name, 'en'));

/** Flag emoji from an ISO 3166-1 alpha-2 code. */
export const countryFlag = (code: string) => String.fromCodePoint(...[...code].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
export const countryByCode = (code: string) => ALL.find((c) => c.code === code);

/**
 * Country list in a display language (« fr-FR »…): names from the browser (Intl.DisplayNames), sorted
 * the local way; English names stay searchable. Without a language (English home): the list is unchanged.
 */
const localized = new Map<string, Country[]>();
export function countriesFor(lang?: string): Country[] {
  if (!lang || lang.startsWith('en')) return ALL;
  const hit = localized.get(lang);
  if (hit) return hit;
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([lang], { type: 'region' });
  } catch {
    names = null;
  }
  const list = ALL.map((c) => ({ ...c, en: c.name, name: names?.of(c.code) ?? c.name })).sort((a, b) => a.name.localeCompare(b.name, lang));
  localized.set(lang, list);
  return list;
}
export const countryIn = (code: string, lang?: string) => countriesFor(lang).find((c) => c.code === code);

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Countries matching the query: names starting with it first, then a word starting with it, then names containing it, codes and dial codes. */
function search(q: string, all: Country[] = ALL): Country[] {
  const n = norm(q).replace(/^\+/, '');
  if (!n) return all;
  const starts: Country[] = [];
  const words: Country[] = [];
  const other: Country[] = [];
  for (const c of all) {
    const name = norm(c.name);
    const en = c.en ? norm(c.en) : '';
    if (name.startsWith(n)) starts.push(c);
    else if (name.split(/[\s&(),.-]+/).some((w) => w.startsWith(n))) words.push(c);
    else if (name.includes(n) || (en && (en.startsWith(n) || en.includes(n))) || c.code.toLowerCase() === n || c.dial.startsWith(n)) other.push(c);
  }
  return [...starts, ...words, ...other];
}

/**
 * Country picker with a search field at the top of the list (type to find a country quickly).
 * Button + popup listbox; the search field is a combobox driving the list (arrows, Enter, Escape).
 */
export function CountryPicker({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
  searchLabel,
  noResult,
  listLabel,
  withDial = false,
  icon,
  invalid,
  describedBy,
  lang,
}: {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  searchLabel: string;
  noResult: string;
  listLabel: string;
  withDial?: boolean;
  icon?: ReactNode;
  invalid?: boolean;
  describedBy?: string;
  /** Display language of the country names (other versions than the English home). */
  lang?: string;
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const all = useMemo(() => countriesFor(lang), [lang]);
  const results = useMemo(() => search(query, all), [query, all]);
  const selected = all.find((c) => c.code === value);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep the active option visible.
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function openList() {
    setQuery('');
    const i = value ? all.findIndex((c) => c.code === value) : 0;
    setActive(Math.max(0, i));
    setOpen(true);
  }

  function pick(c: Country) {
    onChange(c.code);
    setOpen(false);
    button.current?.focus();
  }

  const label = (c: Country) => `${countryFlag(c.code)} ${c.name}${withDial ? ` (+${c.dial})` : ''}`;

  return (
    <div className="cpick" ref={root}>
      <button
        ref={button}
        id={id}
        type="button"
        className="input cpick-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            openList();
          }
        }}
      >
        {icon}
        <span className={selected ? 'cpick-value' : 'cpick-value cpick-placeholder'}>{selected ? label(selected) : placeholder}</span>
      </button>
      {open && (
        <div className="cpick-pop">
          <div className="cpick-search">
            <Search size={18} strokeWidth={1.75} aria-hidden="true" />
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-label={searchLabel}
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? `${uid}-o-${results[active].code}` : undefined}
              placeholder={searchLabel}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  const c = results[active];
                  if (c) pick(c);
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                  button.current?.focus();
                } else if (e.key === 'Tab') {
                  setOpen(false);
                }
              }}
            />
          </div>
          <ul ref={list} id={listId} role="listbox" aria-label={listLabel} className="cpick-list">
            {results.map((c, i) => (
              <li
                key={c.code}
                id={`${uid}-o-${c.code}`}
                role="option"
                aria-selected={c.code === value}
                data-i={i}
                data-active={i === active || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(c)}
              >
                {label(c)}
              </li>
            ))}
            {results.length === 0 && <li className="cpick-empty" role="option" aria-selected="false" aria-disabled="true">{noResult}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
