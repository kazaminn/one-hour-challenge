import type { Metadata } from 'next';
import { GyozaClicker } from './GyozaClicker';

export const metadata: Metadata = { title: '餃子クリッカー' };

export default function Page() {
  return (
    <main>
      <GyozaClicker />
    </main>
  );
}
