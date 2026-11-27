// Locked staging page: deployed by .github/workflows/deploy-staging.yml ONLY if staging.sygmatv.com answers
// without Cloudflare Access after a deploy. Answers 503 to every request; nothing is served or stored.
const lockedStaging = {
  fetch() {
    return new Response('Staging is temporarily locked.\n', {
      status: 503,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  },
};

export default lockedStaging;
