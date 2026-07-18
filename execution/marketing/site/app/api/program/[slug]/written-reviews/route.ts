export const runtime = 'nodejs';

/** Review URLs are discovered from GitHub — no paste-and-save on the platform. */
export async function POST() {
  return Response.json(
    {
      error:
        'Review URLs are no longer saved on the platform. File the GitHub issue (title Review by @you: @peer), then refresh your progress — discovery is automatic.',
    },
    { status: 410 }
  );
}
