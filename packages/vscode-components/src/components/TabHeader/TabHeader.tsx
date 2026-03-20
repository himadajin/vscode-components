import { Children, cloneElement, forwardRef, isValidElement } from 'react';

function withSlot(children: React.ReactNode, slot: string) {
  return Children.map(children, (child) =>
    isValidElement(child)
      ? cloneElement(child as React.ReactElement<{ slot?: string }>, { slot })
      : child,
  );
}

export interface TabHeaderProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  active?: boolean;
  panel?: boolean;
  before?: React.ReactNode;
  after?: React.ReactNode;
}

export const TabHeader = forwardRef<HTMLElement, TabHeaderProps>(
  function TabHeader(
    { children, active, panel, before, after, ...props },
    forwardedRef,
  ) {
    return (
      <vscode-tab-header
        ref={forwardedRef}
        active={active}
        panel={panel}
        {...props}
      >
        {before ? withSlot(before, 'content-before') : null}
        {children}
        {after ? withSlot(after, 'content-after') : null}
      </vscode-tab-header>
    );
  },
);
