import { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';

type FixedPane = 'start' | 'end' | 'none';
type Orientation = 'horizontal' | 'vertical';

type VscodeSplitLayoutElement = HTMLElement & {
  split?: Orientation;
  resetOnDblClick?: boolean;
  handleSize?: number;
  initialHandlePosition?: string;
  handlePosition?: string;
  fixedPane?: FixedPane;
};

export interface SplitLayoutProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onChange'
> {
  split?: Orientation;
  resetOnDblClick?: boolean;
  handleSize?: number;
  initialHandlePosition?: string;
  handlePosition?: string;
  fixedPane?: FixedPane;
  start?: React.ReactNode;
  end?: React.ReactNode;
  onChange?: (detail: {
    position: number;
    positionInPercentage: number;
  }) => void;
}

export const SplitLayout = forwardRef<HTMLElement, SplitLayoutProps>(
  function SplitLayout(
    {
      split = 'vertical',
      resetOnDblClick,
      handleSize,
      initialHandlePosition,
      handlePosition,
      fixedPane = 'none',
      start,
      end,
      onChange,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<VscodeSplitLayoutElement | null>(null);

    useEffect(() => {
      const element = innerRef.current;
      if (!element) {
        return;
      }

      element.split = split;
      element.resetOnDblClick = Boolean(resetOnDblClick);
      if (handleSize !== undefined) {
        element.handleSize = handleSize;
      }
      if (initialHandlePosition !== undefined) {
        element.initialHandlePosition = initialHandlePosition;
      }
      element.handlePosition = handlePosition;
      element.fixedPane = fixedPane;
    }, [
      fixedPane,
      handlePosition,
      handleSize,
      initialHandlePosition,
      resetOnDblClick,
      split,
    ]);

    useWebComponentEvent(
      innerRef,
      'vsc-split-layout-change',
      (_, event) =>
        (
          event as CustomEvent<{
            position: number;
            positionInPercentage: number;
          }>
        ).detail,
      (detail) => onChange?.(detail),
    );

    return (
      <vscode-split-layout
        ref={mergeRefs(innerRef, forwardedRef)}
        split={split}
        reset-on-dbl-click={resetOnDblClick}
        handle-size={handleSize}
        initial-handle-position={initialHandlePosition}
        handle-position={handlePosition}
        fixed-pane={fixedPane}
        style={{ width: '100%', height: '100%', ...style }}
        {...props}
      >
        {start ? <div slot="start">{start}</div> : null}
        {end ? <div slot="end">{end}</div> : null}
      </vscode-split-layout>
    );
  },
);
