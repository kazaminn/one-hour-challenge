import { getState } from '@/lib/db';
import { Dashboard } from './Dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Server time seeds the clock so the taunt, progress and result screen are
  // in the HTML itself — readable by crawlers and AIs that don't run JS.
  return <Dashboard initialState={await getState()} serverNow={Date.now()} />;
}
