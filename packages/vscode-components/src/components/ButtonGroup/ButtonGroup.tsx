import { forwardRef } from 'react';
import {
  ToolbarContainer,
  type ToolbarContainerProps,
} from '../ToolbarContainer';

export type ButtonGroupProps = Omit<
  ToolbarContainerProps,
  'ariaRole' | 'grouped'
>;

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(props, forwardedRef) {
    return (
      <ToolbarContainer
        ref={forwardedRef}
        ariaRole="group"
        grouped
        {...props}
      />
    );
  },
);
