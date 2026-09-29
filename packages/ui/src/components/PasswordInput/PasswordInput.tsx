'use client';

// The default `translations` carry a function (the toggle's name depends
// on the visibility), which a Server Component could not pass down.
import type { ReactNode } from 'react';
import { PasswordInput as ArkPasswordInput } from '@ark-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';
import { inputStyles } from '../Input';

// A password box on the shared text-control recipe with a show/hide toggle
// at the end. Ark swaps the input type and names the toggle.
const passwordInputStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'relative',
    input: [
      'pe-10',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    visibilityTrigger: [
      'absolute inset-y-0 end-0 inline-flex w-10 items-center justify-center rounded-control base-fg-muted [&>svg]:size-4',
      'hover:base-fg-strong',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing({ className: 'focus-visible:-outline-offset-2' }),
    ],
    indicator: 'inline-flex',
  },
  variants: {
    size: {
      sm: { input: inputStyles({ size: 'sm' }) },
      md: { input: inputStyles({ size: 'md' }) },
      lg: { input: inputStyles({ size: 'lg' }) },
    },
  },
  defaultVariants: { size: 'md' },
});

const defaultTranslations: ArkPasswordInput.RootProps['translations'] = {
  visibilityTrigger: (visible) =>
    visible ? 'パスワードを隠す' : 'パスワードを表示',
};

type PasswordInputProps = Omit<ArkPasswordInput.RootProps, 'children'> &
  VariantProps<typeof passwordInputStyles> & {
    label?: ReactNode;
    placeholder?: string;
  };

export const PasswordInput = ({
  label,
  placeholder,
  size,
  translations,
  className,
  ...props
}: PasswordInputProps) => {
  const styles = passwordInputStyles({ size });
  return (
    <ArkPasswordInput.Root
      className={styles.root({ className })}
      translations={{ ...defaultTranslations, ...translations }}
      {...props}
    >
      {label !== undefined && (
        <ArkPasswordInput.Label className={styles.label()}>
          {label}
        </ArkPasswordInput.Label>
      )}
      <ArkPasswordInput.Control className={styles.control()}>
        <ArkPasswordInput.Input
          placeholder={placeholder}
          className={styles.input()}
        />
        <ArkPasswordInput.VisibilityTrigger
          className={styles.visibilityTrigger()}
        >
          <ArkPasswordInput.Indicator
            className={styles.indicator()}
            fallback={<Eye aria-hidden="true" />}
          >
            <EyeOff aria-hidden="true" />
          </ArkPasswordInput.Indicator>
        </ArkPasswordInput.VisibilityTrigger>
      </ArkPasswordInput.Control>
    </ArkPasswordInput.Root>
  );
};
