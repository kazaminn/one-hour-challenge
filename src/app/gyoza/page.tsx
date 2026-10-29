import type { Metadata } from 'next';
import { Heading, Text } from '@kazamitte/kazamitte-ui';

export const metadata: Metadata = { title: '餃子クリッカー' };

/**
 * Round 2's app. A placeholder until the challenge starts: the game itself is
 * built during the hour. Keep its state inside this app; nothing here talks to
 * the hub or its database.
 */
export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-4 py-8">
      <Heading level={1} size="display-44">
        餃子クリッカー
      </Heading>
      <img src="/gyoza/gyoza.svg" alt="餃子" width={240} height={160} />
      <Text tone="muted">準備中。60分チャレンジの本番で作ります</Text>
    </main>
  );
}
