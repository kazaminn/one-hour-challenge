import type { Metadata } from 'next';
import { GyozaClicker } from './GyozaClicker';

export const metadata: Metadata = {
  title: '餃子クリッカー',
  icons: { icon: '/gyoza/app-icon.webp', apple: '/gyoza/app-icon.webp' },
};

export default function Page() {
  return (
    <main>
      <GyozaClicker />
    </main>
  );
}
