export function isComposingKeyboardEvent(event: React.KeyboardEvent): boolean {
  const nativeEvent = event.nativeEvent as KeyboardEvent & {
    keyCode?: number;
    isComposing?: boolean;
  };

  return nativeEvent.isComposing === true || nativeEvent.keyCode === 229;
}
