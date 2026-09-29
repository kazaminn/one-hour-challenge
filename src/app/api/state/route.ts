import { getState } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await getState(), {
    headers: {
      // Shared at the CDN: however many viewers poll, the function (and Turso)
      // is hit about once per 5s.
      'Cache-Control': 'public, max-age=0, s-maxage=5, stale-while-revalidate=30',
    },
  });
}
