import { createTV, type VariantProps } from 'tailwind-variants';
import { configs } from '@kazamitte/kazamitte-ui/twmerge-config';

export const tv = createTV({
  twMerge: true,
  // importしたconfigはdefault値、
  // app固有のconfigを追加する場合はobjectをmergeする
  twMergeConfig: configs,
});

export type { VariantProps };
