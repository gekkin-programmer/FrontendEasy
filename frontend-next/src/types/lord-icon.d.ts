import type { HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': HTMLAttributes<HTMLElement> & {
        src?: string;
        trigger?: string;
        colors?: string;
      };
    }
  }
}
