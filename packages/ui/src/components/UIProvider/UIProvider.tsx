'use client';

import type { ReactNode } from 'react';
import { LocaleProvider } from '@ark-ui/react/locale';

export type UIProviderProps = {
  // BCP 47 tag Ark reads for dates, numbers, sorting and text direction.
  locale: string;
  children: ReactNode;
};

// Wraps an app once, at its root, with what the components need to work.
// Theme switching stays with the app: the components only read the
// [data-mode] the app sets.
export const UIProvider = ({ locale, children }: UIProviderProps) => (
  <LocaleProvider locale={locale}>{children}</LocaleProvider>
);
