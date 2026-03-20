import { forwardRef } from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'default' | 'counter' | 'activity-bar-counter';
}

export const Badge = forwardRef<HTMLElement, BadgeProps>(function Badge(
  { children, variant = 'default', ...props },
  ref,
) {
  return (
    <vscode-badge
      ref={ref}
      variant={variant === 'default' ? undefined : variant}
      {...props}
    >
      {children}
    </vscode-badge>
  );
});
