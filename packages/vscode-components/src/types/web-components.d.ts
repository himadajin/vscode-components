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
    description?: string;
    selected?: boolean;
    disabled?: boolean;
  };
  'vscode-multi-select': HTMLElementProps<HTMLElement> & {
    value?: string[];
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    label?: string;
    combobox?: boolean;
    creatable?: boolean;
  };
  'vscode-single-select': HTMLElementProps<HTMLElement> & {
    value?: string;
    disabled?: boolean;
  };
  'vscode-split-layout': HTMLElementProps<HTMLElement> & {
    split?: 'horizontal' | 'vertical';
    'reset-on-dbl-click'?: boolean;
    'handle-size'?: number;
    'initial-handle-position'?: string;
    'handle-position'?: string;
    'fixed-pane'?: 'start' | 'end' | 'none';
  };
  'vscode-tab-header': HTMLElementProps<HTMLElement> & {
    active?: boolean;
    panel?: boolean;
    'aria-controls'?: string;
    'tab-id'?: number;
  };
  'vscode-tab-panel': HTMLElementProps<HTMLElement> & {
    hidden?: boolean;
    panel?: boolean;
    'aria-labelledby'?: string;
    tabindex?: number;
  };
  'vscode-tabs': HTMLElementProps<HTMLElement> & {
    panel?: boolean;
    'selected-index'?: number;
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
