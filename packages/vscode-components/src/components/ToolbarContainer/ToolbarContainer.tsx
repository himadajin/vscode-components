import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
} from 'react';
import { mergeRefs } from '../../hooks/useWebComponent';
import styles from './ToolbarContainer.module.css';

export interface ToolbarContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
  ariaRole?: 'toolbar' | 'group' | 'tablist';
  preventLoopNavigation?: boolean;
  focusOnlyEnabledItems?: boolean;
  grouped?: boolean;
}

function isButtonDisabled(button: HTMLButtonElement) {
  return button.disabled || button.getAttribute('aria-disabled') === 'true';
}

export const ToolbarContainer = forwardRef<
  HTMLDivElement,
  ToolbarContainerProps
>(function ToolbarContainer(
  {
    orientation = 'horizontal',
    ariaLabel,
    ariaRole = 'toolbar',
    preventLoopNavigation = false,
    focusOnlyEnabledItems = true,
    grouped = false,
    children,
    className,
    onKeyDown,
    ...props
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = innerRef.current;
    if (!root) {
      return;
    }

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        'button[data-toolbar-button="true"]',
      ),
    );

    const focusableButtons = focusOnlyEnabledItems
      ? buttons.filter((button) => !isButtonDisabled(button))
      : buttons;

    buttons.forEach((button, index) => {
      const isActive = focusableButtons[0]
        ? button === focusableButtons[0]
        : index === 0;
      button.tabIndex = isActive ? 0 : -1;
    });
  }, [children, focusOnlyEnabledItems]);

  const moveFocus = (direction: 1 | -1, absolute?: 'first' | 'last') => {
    const root = innerRef.current;
    if (!root) {
      return false;
    }

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        'button[data-toolbar-button="true"]',
      ),
    );
    const focusableButtons = focusOnlyEnabledItems
      ? buttons.filter((button) => !isButtonDisabled(button))
      : buttons;

    if (focusableButtons.length === 0) {
      return false;
    }

    const activeElement = document.activeElement;
    const currentIndex = focusableButtons.findIndex(
      (button) => button === activeElement,
    );

    let nextIndex = currentIndex;
    if (absolute === 'first') {
      nextIndex = 0;
    } else if (absolute === 'last') {
      nextIndex = focusableButtons.length - 1;
    } else if (currentIndex === -1) {
      nextIndex = direction === 1 ? 0 : focusableButtons.length - 1;
    } else {
      nextIndex = currentIndex + direction;
      if (nextIndex >= focusableButtons.length) {
        if (preventLoopNavigation) {
          return false;
        }
        nextIndex = 0;
      }
      if (nextIndex < 0) {
        if (preventLoopNavigation) {
          return false;
        }
        nextIndex = focusableButtons.length - 1;
      }
    }

    buttons.forEach((button) => {
      button.tabIndex = button === focusableButtons[nextIndex] ? 0 : -1;
    });
    focusableButtons[nextIndex]?.focus();
    return true;
  };

  const wrappedChildren = Children.toArray(children).map((child, index) => {
    if (!isValidElement(child)) {
      return null;
    }

    const childDisabled =
      typeof child.props === 'object' &&
      child.props !== null &&
      'disabled' in child.props &&
      Boolean(child.props.disabled);

    return (
      <li
        key={child.key ?? index}
        className={[
          styles.actionItem,
          childDisabled ? styles.actionItemDisabled : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="presentation"
      >
        {cloneElement(child)}
      </li>
    );
  });

  return (
    <div
      ref={mergeRefs(innerRef, forwardedRef)}
      className={[
        styles.root,
        orientation === 'vertical' ? styles.vertical : '',
        grouped ? styles.grouped : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onKeyDown={(event) => {
        let handled = false;

        if (orientation === 'horizontal') {
          if (event.key === 'ArrowRight') {
            handled = moveFocus(1);
          } else if (event.key === 'ArrowLeft') {
            handled = moveFocus(-1);
          }
        } else if (event.key === 'ArrowDown') {
          handled = moveFocus(1);
        } else if (event.key === 'ArrowUp') {
          handled = moveFocus(-1);
        }

        if (!handled && event.key === 'Home') {
          handled = moveFocus(1, 'first');
        }

        if (!handled && event.key === 'End') {
          handled = moveFocus(-1, 'last');
        }

        if (handled) {
          event.preventDefault();
          event.stopPropagation();
        }

        onKeyDown?.(event);
      }}
      {...props}
    >
      <ul
        className={styles.actionsContainer}
        role={wrappedChildren.length > 0 ? ariaRole : 'presentation'}
        aria-label={ariaLabel}
      >
        {wrappedChildren}
      </ul>
    </div>
  );
});
