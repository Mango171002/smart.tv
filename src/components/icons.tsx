/**
 * Icon system — ELECTRIC FUSION NEON / "Outline Premium".
 * Lucide only, 1.75px stroke, rounded caps & joins (Lucide default), no fill.
 * The four category → icon → colour assignments are fixed by the design system.
 */
import {
  Cast,
  CirclePlay,
  Clapperboard,
  Film,
  FlagTriangleRight,
  Globe,
  Headset,
  Layers,
  Rocket,
  Users,
  Laptop,
  Monitor,
  MonitorPlay,
  MonitorSmartphone,
  Popcorn,
  RadioTower,
  ShieldCheck,
  Smartphone,
  Trophy,
  Tv,
  type LucideIcon,
} from 'lucide-react';

export const ICON_STROKE = 1.75;

export type CategoryKey = 'sports' | 'movies' | 'live' | 'streaming';

/** Official category order (cards 1–4) and assignments. Colours live in CSS (.cat-*). */
export const CATEGORIES: Array<{ key: CategoryKey; icon: LucideIcon; support: LucideIcon[] }> = [
  // Live Sports — trophy — #D1FE17 (Lucide no longer ships the "dribbble" brand icon)
  { key: 'sports', icon: Trophy, support: [Trophy, FlagTriangleRight] },
  // Movies & Series — clapperboard — #F044C4
  { key: 'movies', icon: Clapperboard, support: [Film, Popcorn, CirclePlay] },
  // Live TV — tv — #19D3F3
  { key: 'live', icon: Tv, support: [RadioTower, MonitorPlay, Globe] },
  // Smart Streaming — monitor-smartphone — #6878FF
  { key: 'streaming', icon: MonitorSmartphone, support: [Smartphone, Monitor, Cast] },
];

/** Features bar (5 items, primary cyan). */
export const BENEFIT_ICONS: LucideIcon[] = [Rocket, Users, Layers, ShieldCheck, Headset];

/** Device cards belong to Smart Streaming (violet). */
export const DEVICE_ICONS: LucideIcon[] = [Monitor, Cast, Smartphone, Laptop];
