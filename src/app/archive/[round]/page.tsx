import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRENT_ROUND, getRound } from '@/lib/challenge';
import { getState } from '@/lib/db';
import { Dashboard } from '../../_hub/Dashboard';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ round: string }> };

/** Only finished rounds live here; the current one is at `/`. */
async function archivedRound({ params }: Props) {
  const r = getRound(Number((await params).round));
  return r && r.round !== CURRENT_ROUND.round ? r : undefined;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const r = await archivedRound(props);
  return r ? { title: `第${r.round}回: ${r.title}` } : {};
}

export default async function Page(props: Props) {
  const r = await archivedRound(props);
  if (!r) notFound();
  return (
    <Dashboard round={r.round} initialState={await getState(r.round)} serverNow={Date.now()} />
  );
}
