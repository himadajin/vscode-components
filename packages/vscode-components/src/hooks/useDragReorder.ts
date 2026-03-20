import { useMemo, useState } from 'react';

interface DragHandlers {
  draggable: boolean;
  onDragStart: React.DragEventHandler<HTMLElement>;
  onDragOver: React.DragEventHandler<HTMLElement>;
  onDrop: React.DragEventHandler<HTMLElement>;
  onDragEnd: React.DragEventHandler<HTMLElement>;
}

export function useDragReorder<T>(
  items: T[],
  onReorder: (next: T[], from: number, to: number) => void,
  enabled = true,
) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const getDragProps = useMemo(
    () =>
      (index: number): DragHandlers => ({
        draggable: enabled,
        onDragStart: (event) => {
          if (!enabled) {
            return;
          }
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', String(index));
          setDragIndex(index);
          setDropIndex(index);
        },
        onDragOver: (event) => {
          if (!enabled) {
            return;
          }
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          setDropIndex(index);
        },
        onDrop: (event) => {
          if (!enabled) {
            return;
          }
          event.preventDefault();
          const from =
            dragIndex ?? Number(event.dataTransfer.getData('text/plain'));
          const to = index;
          if (
            !Number.isInteger(from) ||
            from === to ||
            from < 0 ||
            from >= items.length
          ) {
            setDragIndex(null);
            setDropIndex(null);
            return;
          }

          const next = [...items];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          onReorder(next, from, to);
          setDragIndex(null);
          setDropIndex(null);
        },
        onDragEnd: () => {
          setDragIndex(null);
          setDropIndex(null);
        },
      }),
    [dragIndex, enabled, items, onReorder],
  );

  return {
    dragIndex,
    dropIndex,
    getDragProps,
  };
}
