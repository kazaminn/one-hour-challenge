import type { Metadata } from 'next';
import { CURRENT_ROUND } from '@/lib/challenge';
import { getState } from '@/lib/db';
import { Dashboard } from './_hub/Dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: `LIVE: ${CURRENT_ROUND.title}` };

export default async function Page() {
  // Server time seeds the clock so the taunt, progress and result screen are
  // in the HTML itself — readable by crawlers and AIs that don't run JS.
  return (
    <Dashboard
      round={CURRENT_ROUND.round}
      initialState={await getState(CURRENT_ROUND.round)}
      serverNow={Date.now()}
    />
  );
}
