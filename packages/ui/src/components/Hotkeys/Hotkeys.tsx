'use client';

// Keyboard shortcuts for an app: `useHotkey` registers one, `HotkeyText`
// prints one the way the platform writes it (⌘K on macOS, Ctrl+K
// elsewhere) inside Kbd elements.
import { useFormatHotkey, useHotkey } from '@ark-ui/react';
import { Kbd } from '../Kbd';

export { useHotkey };

type HotkeyTextProps = {
  // A combo in Ark's notation, e.g. "mod+k" or "shift+?". A sequence
  // chains combos with the word "then", e.g. "g then i".
  hotkey: string;
  className?: string;
};

export const HotkeyText = ({ hotkey, className }: HotkeyTextProps) => {
  const format = useFormatHotkey();
  // Split the sequence into its combo steps first, so each combo is
  // formatted (and its keys uppercased/symbolized) on its own — otherwise
  // "then" would be parsed as part of a single, meaningless key.
  const steps = hotkey.split(/\s+then\s+/i);
  return (
    <span className={className}>
      {steps.map((step, stepIndex) => {
        // Ark joins a combo's keys with '+' or a space depending on the
        // platform.
        const keys = format(step).split(/\s*\+\s*|\s+/);
        return (
          <span key={stepIndex}>
            {stepIndex > 0 && (
              // Order matters here, unlike a combo's '+', so this stays
              // visible and readable rather than aria-hidden.
              <span className="mx-1 base-fg-muted">の次に</span>
            )}
            {keys.map((key, index) => (
              <span key={index}>
                {index > 0 && <span aria-hidden="true">+</span>}
                <Kbd>{key}</Kbd>
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
};
