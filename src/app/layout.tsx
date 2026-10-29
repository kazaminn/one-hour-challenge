import type { Metadata } from 'next';
import { UIProvider } from '@kazamitte/kazamitte-ui';
import { themeScript } from './theme';
import './globals.css';

export const metadata: Metadata = {
  title: '60分チャレンジ',
  description: '60分でアプリを作ってデプロイするまでの実況ページ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-mode is set by themeScript before hydration.
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <UIProvider locale="ja-JP">{children}</UIProvider>
      </body>
    </html>
  );
}
