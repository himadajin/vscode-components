import { useEffect, useRef } from 'react';

type EventHandler<TElement extends HTMLElement, TPayload> = (
  payload: TPayload,
  event: Event,
  element: TElement,
) => void;

export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): (value: T | null) => void {
  return (value) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === 'function') {
        ref(value);
      } else {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}

export function useWebComponentEvent<TElement extends HTMLElement, TPayload>(
  ref: React.RefObject<TElement | null>,
  eventName: string,
  getPayload: (element: TElement, event: Event) => TPayload,
  handler?: EventHandler<TElement, TPayload>,
) {
  const handlerRef = useRef<typeof handler>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !handlerRef.current) {
      return;
    }

    const listener = (event: Event) => {
      const nextHandler = handlerRef.current;
      if (!nextHandler) {
        return;
      }
      nextHandler(getPayload(element, event), event, element);
    };

    element.addEventListener(eventName, listener);
    return () => {
      element.removeEventListener(eventName, listener);
    };
  }, [eventName, getPayload, ref]);
}
