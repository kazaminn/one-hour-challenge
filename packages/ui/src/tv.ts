import { createTV, type VariantProps } from 'tailwind-variants';
import { configs } from './twmerge-config';

// The components' tv. An app builds its own from the same `configs`
// (exported as '@kazamitte/kazamitte-ui/twmerge-config') and merges its
// app-only groups into that object.
export const tv = createTV({
  twMerge: true,
  twMergeConfig: configs,
});

export type { VariantProps };
