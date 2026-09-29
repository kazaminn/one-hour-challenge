'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';
import { Clipboard } from '../Clipboard';

const codeBlockStyles = tv({
  slots: {
    root: 'overflow-hidden rounded-surface border base-border-muted',
    header:
      'flex min-h-9 items-center justify-between gap-2 border-b base-border-muted base-bg-subtle py-1 pr-1 pl-3',
    language: 'font-mono text-mono-14 base-fg-muted',
    trigger: [
      'inline-flex size-7 items-center justify-center rounded-control base-fg-muted transition-colors',
      'hover:base-bg-muted hover:base-fg-strong',
      'ark-copied:success-fg',
      focusRing(),
    ],
    indicator: 'inline-flex [&>svg]:size-4',
    // Highlighted markup may carry its own inline background and colors
    // (rehype-pretty-code); these are the fallback for plain code.
    pre: 'overflow-x-auto base-bg-muted px-5 py-4 font-mono text-mono-14 base-fg-strong',
  },
});

const styles = codeBlockStyles();

type CodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  // The plain source that the copy button writes to the clipboard.
  code: string;
  language?: string;
};

// `children` is the highlighted markup; without it the plain code is shown.
export const CodeBlock = ({
  code,
  language,
  className,
  children,
  ...props
}: CodeBlockProps) => (
  <figure className={styles.root({ className })}>
    <div className={styles.header()}>
      <span className={styles.language()}>{language}</span>
      <Clipboard.Root value={code}>
        <Clipboard.Trigger className={styles.trigger()}>
          <Clipboard.Indicator
            className={styles.indicator()}
            copied={<Check aria-hidden="true" />}
          >
            <Copy aria-hidden="true" />
          </Clipboard.Indicator>
        </Clipboard.Trigger>
      </Clipboard.Root>
    </div>
    <pre className={styles.pre()} tabIndex={0} {...props}>
      {children ?? <code>{code}</code>}
    </pre>
  </figure>
);
