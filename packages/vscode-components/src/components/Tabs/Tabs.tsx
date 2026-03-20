import { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';

type VscodeTabsElement = HTMLElement & {
  selectedIndex?: number;
};

export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children' | 'onChange' | 'onSelect'
> {
  children?: React.ReactNode;
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  panel?: boolean;
  addons?: React.ReactNode;
  onSelect?: (selectedIndex: number) => void;
}

export const Tabs = forwardRef<HTMLElement, TabsProps>(function Tabs(
  {
    children,
    selectedIndex,
    defaultSelectedIndex = 0,
    panel,
    addons,
    onSelect,
    ...props
  },
  forwardedRef,
) {
  const innerRef = useRef<VscodeTabsElement | null>(null);
  const resolvedSelectedIndex = selectedIndex ?? defaultSelectedIndex;

  useEffect(() => {
    const element = innerRef.current;
    if (element) {
      element.selectedIndex = resolvedSelectedIndex;
    }
  }, [resolvedSelectedIndex]);

  useWebComponentEvent(
    innerRef,
    'vsc-tabs-select',
    (_, event) =>
      (
        event as CustomEvent<{
          selectedIndex?: number;
        }>
      ).detail?.selectedIndex ?? 0,
    (nextSelectedIndex) => onSelect?.(nextSelectedIndex),
  );

  return (
    <vscode-tabs
      ref={mergeRefs(innerRef, forwardedRef)}
      panel={panel}
      selected-index={resolvedSelectedIndex}
      {...props}
    >
      {children}
      {addons ? <div slot="addons">{addons}</div> : null}
    </vscode-tabs>
  );
});
