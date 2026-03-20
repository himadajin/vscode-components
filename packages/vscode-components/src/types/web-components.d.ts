import type * as React from 'react';

type HTMLElementProps<T> = React.DetailedHTMLProps<React.HTMLAttributes<T>, T>;

interface VSCodeIntrinsicElements {
  'vscode-badge': HTMLElementProps<HTMLElement> & {
    variant?: 'counter' | 'activity-bar-counter';
  };
  'vscode-button': HTMLElementProps<HTMLElement> & {
    secondary?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    icon?: string;
    'icon-after'?: string;
  };
  'vscode-checkbox': HTMLElementProps<HTMLElement> & {
    checked?: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
  };
  'vscode-divider': HTMLElementProps<HTMLElement> & {
    role?: 'separator' | 'presentation';
  };
  'vscode-option': HTMLElementProps<HTMLOptionElement> & {
    value?: string;
    selected?: boolean;
  };
  'vscode-single-select': HTMLElementProps<HTMLElement> & {
    value?: string;
    disabled?: boolean;
  };
  'vscode-textfield': HTMLElementProps<HTMLElement> & {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    type?: string;
    pattern?: string;
    maxlength?: number;
    minlength?: number;
  };
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends VSCodeIntrinsicElements {}
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends VSCodeIntrinsicElements {}
  }
}

export {};
