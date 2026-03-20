import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import '@vscode-elements/elements';
import '../src/theme/defaults.css';
import '../src/theme/storybook.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'vscode-dark',
      values: [
        { name: 'vscode-dark', value: '#1f1f1f' },
        { name: 'vscode-light', value: '#ffffff' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'light' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;

      if (context.parameters.vscodePreview === 'settings') {
        return createElement(
          'div',
          { className: 'storybook-vscode-settings-shell' },
          createElement(
            'div',
            { className: 'storybook-vscode-settings-row' },
            createElement(Story),
          ),
        );
      }

      return Story();
    },
  ],
};

export default preview;
