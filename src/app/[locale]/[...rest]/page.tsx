import { notFound } from 'next/navigation';

/** Any unknown path below a locale renders the localized 404 page. */
export default function CatchAll() {
  notFound();
}
