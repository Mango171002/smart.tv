import { describe, expect, it } from 'vitest';
import { sameAsProfiles } from '@/components/StructuredData';
import { siteConfig } from '@/config/site';

describe('Organization sameAs (structured data)', () => {
  it('never lists a Telegram invite link as an identity', () => {
    expect(sameAsProfiles({ telegram: 'https://t.me/+AbCdEf123', old: 'https://t.me/joinchat/XyZ', none: null })).toEqual([]);
  });

  it('keeps public profiles, including a public Telegram channel', () => {
    expect(sameAsProfiles({ youtube: 'https://www.youtube.com/@SYGMATV', telegram: 'https://t.me/sygma_public' })).toEqual([
      'https://www.youtube.com/@SYGMATV',
      'https://t.me/sygma_public',
    ]);
  });

  it('current configuration: every profile except the Telegram invite link', () => {
    const list = sameAsProfiles(siteConfig.social);
    expect(list.some((u) => u.startsWith('https://t.me/+'))).toBe(false);
    expect(list).toHaveLength(Object.values(siteConfig.social).filter(Boolean).length - 1);
  });
});
