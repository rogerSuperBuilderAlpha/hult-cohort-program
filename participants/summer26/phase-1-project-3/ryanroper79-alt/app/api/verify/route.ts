import { runVerification } from '@/lib/verify';

export const runtime = 'nodejs';
export const revalidate = 600;

export async function GET() {
  const { results, stale } = await runVerification();
  return Response.json(
    {
      checkedAt: new Date().toISOString(),
      stale,
      entries: results,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
      },
    },
  );
}
