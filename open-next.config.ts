// OpenNext adapter configuration for Cloudflare Workers.
// Pages are pre-rendered at build time and served from the static-assets cache:
// no R2 bucket / KV namespace is required (no extra Cloudflare billing setup).
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
