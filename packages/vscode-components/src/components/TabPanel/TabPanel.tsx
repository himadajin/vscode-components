import { forwardRef } from 'react';

export interface TabPanelProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  hidden?: boolean;
  panel?: boolean;
}

export const TabPanel = forwardRef<HTMLElement, TabPanelProps>(
  function TabPanel({ children, hidden, panel, ...props }, forwardedRef) {
    return (
      <vscode-tab-panel
        ref={forwardedRef}
        hidden={hidden}
        panel={panel}
        {...props}
      >
        {children}
      </vscode-tab-panel>
    );
  },
);
