// Module hooks for loading the site's TypeScript sources with `node --experimental-strip-types`:
// resolves the « @/ » alias to $REVIEW_SRC and extension-less relative imports.
import { existsSync, statSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const SRC = path.resolve(process.env.REVIEW_SRC || 'src') + '/';
export async function resolve(spec, ctx, next) {
  let p = null;
  if (spec.startsWith('@/')) p = SRC + spec.slice(2);
  else if ((spec.startsWith('./') || spec.startsWith('../')) && ctx.parentURL?.startsWith('file:')) p = path.resolve(path.dirname(fileURLToPath(ctx.parentURL)), spec);
  if (p) for (const c of [p, p + '.ts', p + '.tsx', p + '/index.ts']) if (existsSync(c) && statSync(c).isFile() && /\.tsx?$/.test(c)) return next(pathToFileURL(c).href, ctx);
  return next(spec, ctx);
}
