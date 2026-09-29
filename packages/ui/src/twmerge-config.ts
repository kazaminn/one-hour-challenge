const ROLES = [
  'base',
  'primary',
  'secondary',
  'error',
  'warning',
  'success',
  'info',
] as const;

const roleClasses = (suffixes: readonly string[]): string[] =>
  ROLES.flatMap((role) => suffixes.map((suffix) => `${role}-${suffix}`));

export const configs = {
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-64',
            'display-56',
            'display-48',
            'display-44',
            'highlight-36',
            'highlight-32',
            'highlight-28',
            'highlight-26',
            'highlight-24',
            'highlight-22',
            'body-20',
            'body-18',
            'body-16',
            'dense-18',
            'dense-16',
            'dense-14',
            'dense-18-compact',
            'dense-16-compact',
            'dense-14-compact',
            'oneline-18',
            'oneline-16',
            'oneline-14',
            'mono-18',
            'mono-16',
            'mono-14',
          ],
        },
      ],
      duration: [{ duration: ['instant', 'transition', 'enter'] }],
      rounded: [
        { rounded: ['tight', 'control', 'surface', 'overlay', 'pill'] },
      ],
      shadow: [
        {
          shadow: [
            'flat',
            'flat-hover',
            'raised',
            'raised-hover',
            'floating',
            'floating-hover',
            'overlay',
          ],
        },
      ],
      ease: [{ ease: ['standard', 'emphasized'] }],
      animate: [
        {
          animate: [
            'fade-in',
            'fade-out',
            'scale-in',
            'scale-out',
            'slide-in-from-top',
            'slide-in-from-right',
            'slide-in-from-bottom',
            'slide-in-from-left',
            'slide-out-to-top',
            'slide-out-to-right',
            'slide-out-to-bottom',
            'slide-out-to-left',
          ],
        },
      ],
      z: [
        {
          z: [
            'hide',
            'base',
            'docked',
            'dropdown',
            'sticky',
            'banner',
            'overlay',
            'modal',
            'popover',
            'skip-nav',
            'toast',
            'tooltip',
            'max',
          ],
        },
      ],
      'bg-color': roleClasses([
        'bg',
        'bg-subtle',
        'bg-muted',
        'bg-selected',
        'bg-solid',
      ]),
      'text-color': [
        ...roleClasses([
          'fg-strong',
          'fg',
          'fg-muted',
          'fg-subtle',
          'fg-contrast',
        ]),
        'link-fg',
        'link-fg-strong',
      ],
      'border-color': roleClasses([
        'border-subtle',
        'border-muted',
        'border-selected',
        'border-solid',
      ]),
      'outline-color': roleClasses(['focus-ring']),
    },
    conflictingClassGroups: {
      'font-size': ['leading'],
    },
  },
};
