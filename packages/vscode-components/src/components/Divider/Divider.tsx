import { forwardRef } from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  role?: 'separator' | 'presentation';
}

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { role = 'separator', ...props },
  ref,
) {
  return <vscode-divider ref={ref} role={role} {...props} />;
});
