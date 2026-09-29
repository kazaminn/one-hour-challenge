import { getState } from '@/lib/db';
import { Dashboard } from './Dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <Dashboard initialState={await getState()} />;
}
