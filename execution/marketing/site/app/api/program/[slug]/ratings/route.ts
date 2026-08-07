export const runtime = 'nodejs';

/** Platform votes removed — upvotes live in GitHub review issues (`Vote: up`). */
export async function POST() {
  return Response.json(
    {
      error:
        'Platform votes are retired. File a GitHub review issue and optionally include Vote: up, then refresh your progress on the project page.',
    },
    { status: 410 }
  );
}
