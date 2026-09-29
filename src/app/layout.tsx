import type { Metadata } from 'next';
import { UIProvider } from '@kazamitte/kazamitte-ui';
import { CHALLENGE } from '@/lib/challenge';
import './globals.css';

export const metadata: Metadata = {
  title: `LIVE: ${CHALLENGE.title}`,
  description: '60分でアプリを作ってデプロイするまでの実況ページ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <UIProvider locale="ja-JP">{children}</UIProvider>
      </body>
    </html>
  );
}
