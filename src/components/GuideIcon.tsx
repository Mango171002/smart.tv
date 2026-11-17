import { Flame, Laptop, MonitorPlay, Smartphone, Tv, TvMinimalPlay, type LucideIcon } from 'lucide-react';
import type { GuideIcon as GuideIconName } from '@/content/fr/guides';

const ICONS: Record<GuideIconName, LucideIcon> = { tv: Tv, android: TvMinimalPlay, fire: Flame, apple: MonitorPlay, phone: Smartphone, laptop: Laptop };

/** Generic device icon of a guide (Lucide line icons — no brand logo). */
export function GuideIcon({ name, size = 24 }: { name: GuideIconName; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}
