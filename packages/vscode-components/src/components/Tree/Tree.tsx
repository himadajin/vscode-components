import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '../Icon';
import styles from './Tree.module.css';

export type TreeItem = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;
  value?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  disabled?: boolean;
  collapsible?: boolean;
  children?: TreeItem[];
};

export type TreeRenderIndentGuides = 'none' | 'onHover' | 'always';

export type TreeRenderState = {
  depth: number;
  expanded: boolean;
  selected: boolean;
  focused: boolean;
  disabled: boolean;
  collapsible: boolean;
};

export type TreeRenderItem = (
  item: TreeItem,
  state: TreeRenderState,
) => React.ReactNode;

export interface TreeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  items: TreeItem[];
  ariaLabel: string;
  emptyState?: React.ReactNode;
  rowHeight?: number;
  indent?: number;
  defaultIndent?: number;
  renderIndentGuides?: TreeRenderIndentGuides;
  expandOnlyOnTwistieClick?: boolean;
  expandOnDoubleClick?: boolean;
  multipleSelection?: boolean;
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedIdsChange?: (expandedIds: string[]) => void;
  defaultSelectedIds?: string[];
  selectedIds?: string[];
  onSelectedIdsChange?: (selectedIds: string[]) => void;
  defaultFocusedId?: string | null;
  focusedId?: string | null;
  onFocusedIdChange?: (focusedId: string | null) => void;
  onItemOpen?: (item: TreeItem) => void;
  renderItem?: TreeRenderItem;
}

export type TreeHandle = {
  focus: () => void;
};

type FlatTreeItem = {
  item: TreeItem;
  depth: number;
  parentId?: string;
  expanded: boolean;
  collapsible: boolean;
  visibleChildrenCount: number;
};

type ScrollBehavior = 'auto' | 'smooth';

function useControllableState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = typeof controlledValue !== 'undefined';
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = (nextValue: T) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return [value, setValue] as const;
}

function flattenTree(
  items: TreeItem[],
  expandedIds: Set<string>,
  depth = 1,
  parentId?: string,
): FlatTreeItem[] {
  const result: FlatTreeItem[] = [];

  for (const item of items) {
    const visibleChildrenCount = item.children?.length ?? 0;
    const collapsible =
      item.collapsible ??
      (Array.isArray(item.children) && item.children.length > 0);
    const expanded = collapsible && expandedIds.has(item.id);

    result.push({
      item,
      depth,
      parentId,
      expanded,
      collapsible,
      visibleChildrenCount,
    });

    if (collapsible && expanded && item.children?.length) {
      result.push(
        ...flattenTree(item.children, expandedIds, depth + 1, item.id),
      );
    }
  }

  return result;
}

function collectAllItemIds(items: TreeItem[], ids = new Set<string>()) {
  for (const item of items) {
    ids.add(item.id);
    if (item.children?.length) {
      collectAllItemIds(item.children, ids);
    }
  }
  return ids;
}

function collectExpandableIds(items: TreeItem[], ids = new Set<string>()) {
  for (const item of items) {
    const collapsible =
      item.collapsible ??
      (Array.isArray(item.children) && item.children.length > 0);
    if (collapsible) {
      ids.add(item.id);
    }
    if (item.children?.length) {
      collectExpandableIds(item.children, ids);
    }
  }
  return ids;
}

function getRangeSelection(
  values: string[],
  startId: string,
  endId: string,
  availableIds: Set<string>,
) {
  const startIndex = values.indexOf(startId);
  const endIndex = values.indexOf(endId);

  if (startIndex < 0 || endIndex < 0) {
    return [endId];
  }

  const [from, to] =
    startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

  return values.slice(from, to + 1).filter((value) => availableIds.has(value));
}

function isPrintableCharacter(event: React.KeyboardEvent<HTMLDivElement>) {
  return (
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
  );
}

function defaultRenderItem(item: TreeItem) {
  return (
    <>
      <div className={styles.labelColumn}>
        <span className={styles.labelText}>{item.label}</span>
        {item.description ? (
          <span className={styles.description}>{item.description}</span>
        ) : null}
      </div>
      {item.value ? <span className={styles.value}>{item.value}</span> : null}
      {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
      {item.actions ? (
        <span className={styles.actions}>{item.actions}</span>
      ) : null}
    </>
  );
}

export const Tree = forwardRef<TreeHandle, TreeProps>(function Tree(
  {
    items,
    ariaLabel,
    emptyState = 'No items',
    rowHeight = 22,
    indent = 8,
    defaultIndent = 8,
    renderIndentGuides = 'none',
    expandOnlyOnTwistieClick = true,
    expandOnDoubleClick = true,
    multipleSelection = false,
    defaultExpandedIds = [],
    expandedIds: controlledExpandedIds,
    onExpandedIdsChange,
    defaultSelectedIds = [],
    selectedIds: controlledSelectedIds,
    onSelectedIdsChange,
    defaultFocusedId,
    focusedId: controlledFocusedId,
    onFocusedIdChange,
    onItemOpen,
    renderItem = defaultRenderItem,
    className,
    ...props
  },
  forwardedRef,
) {
  const treeId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const typeaheadRef = useRef('');
  const typeaheadTimerRef = useRef<number | null>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [uncontrolledFocusedId, setUncontrolledFocusedId] = useState<
    string | null
  >(defaultFocusedId ?? null);
  const [expandedIds, setExpandedIds] = useControllableState(
    controlledExpandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
  );
  const [selectedIds, setSelectedIds] = useControllableState(
    controlledSelectedIds,
    defaultSelectedIds,
    onSelectedIdsChange,
  );

  const allItemIds = useMemo(() => collectAllItemIds(items), [items]);
  const expandableIds = useMemo(() => collectExpandableIds(items), [items]);
  const expandedSet = useMemo(
    () => new Set(expandedIds.filter((id) => expandableIds.has(id))),
    [expandableIds, expandedIds],
  );
  const flatItems = useMemo(
    () => flattenTree(items, expandedSet),
    [items, expandedSet],
  );
  const visibleIds = useMemo(
    () =>
      flatItems
        .map((entry) => entry.item.id)
        .filter((id) => allItemIds.has(id)),
    [allItemIds, flatItems],
  );
  const visibleIdSet = useMemo(() => new Set(visibleIds), [visibleIds]);

  const focusedId =
    controlledFocusedId === undefined
      ? uncontrolledFocusedId
      : controlledFocusedId;
  const effectiveFocusedId =
    focusedId && visibleIdSet.has(focusedId)
      ? focusedId
      : (visibleIds[0] ?? null);
  const selectedIdSet = useMemo(
    () =>
      new Set(
        selectedIds.filter((id) => visibleIdSet.has(id) || allItemIds.has(id)),
      ),
    [allItemIds, selectedIds, visibleIdSet],
  );

  useEffect(() => {
    if (controlledFocusedId !== undefined) {
      return;
    }

    if (effectiveFocusedId !== uncontrolledFocusedId) {
      setUncontrolledFocusedId(effectiveFocusedId);
      onFocusedIdChange?.(effectiveFocusedId);
    }
  }, [
    controlledFocusedId,
    effectiveFocusedId,
    onFocusedIdChange,
    uncontrolledFocusedId,
  ]);

  useEffect(
    () => () => {
      if (typeaheadTimerRef.current !== null) {
        window.clearTimeout(typeaheadTimerRef.current);
      }
    },
    [],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      focus: () => {
        containerRef.current?.focus();
      },
    }),
    [],
  );

  const setFocusedId = (nextFocusedId: string | null) => {
    if (controlledFocusedId === undefined) {
      setUncontrolledFocusedId(nextFocusedId);
    }
    onFocusedIdChange?.(nextFocusedId);
  };

  const revealItem = (id: string, behavior: ScrollBehavior = 'auto') => {
    const row = rowRefs.current.get(id);
    row?.scrollIntoView({ block: 'nearest', behavior });
  };

  const updateExpanded = (nextExpanded: Set<string>) => {
    setExpandedIds([...nextExpanded]);
  };

  const toggleExpanded = (itemId: string, recursive = false) => {
    if (!expandableIds.has(itemId)) {
      return;
    }

    const nextExpanded = new Set(expandedSet);
    const shouldExpand = !nextExpanded.has(itemId);
    const targetItem = flatItems.find(
      (entry) => entry.item.id === itemId,
    )?.item;

    if (shouldExpand) {
      nextExpanded.add(itemId);
    } else {
      nextExpanded.delete(itemId);
    }

    if (recursive && targetItem?.children?.length) {
      const descendants = collectExpandableIds(targetItem.children);
      for (const descendantId of descendants) {
        if (shouldExpand) {
          nextExpanded.add(descendantId);
        } else {
          nextExpanded.delete(descendantId);
        }
      }
    }

    updateExpanded(nextExpanded);
  };

  const setSelection = (nextSelectedIds: string[]) => {
    const sanitized = nextSelectedIds.filter((id) => visibleIdSet.has(id));
    setSelectedIds(multipleSelection ? sanitized : sanitized.slice(0, 1));
  };

  const focusByOffset = (offset: number) => {
    if (!effectiveFocusedId) {
      return;
    }

    const currentIndex = visibleIds.indexOf(effectiveFocusedId);
    const nextIndex = Math.min(
      visibleIds.length - 1,
      Math.max(0, currentIndex + offset),
    );
    const nextId = visibleIds[nextIndex];

    if (!nextId) {
      return;
    }

    setFocusedId(nextId);
    setAnchorId(nextId);
    revealItem(nextId);
  };

  const focusByPage = (direction: -1 | 1) => {
    const container = containerRef.current;
    if (!container || !effectiveFocusedId) {
      return;
    }

    const pageSize = Math.max(
      1,
      Math.floor(container.clientHeight / rowHeight),
    );
    focusByOffset(pageSize * direction);
  };

  const focusItem = (itemId: string) => {
    setFocusedId(itemId);
    setAnchorId(itemId);
    revealItem(itemId);
  };

  const setRangeSelection = (targetId: string) => {
    const baseId = anchorId ?? effectiveFocusedId ?? targetId;
    const range = getRangeSelection(visibleIds, baseId, targetId, visibleIdSet);
    setSelection(range);
    setFocusedId(targetId);
    revealItem(targetId);
  };

  const handleSelect = (
    itemId: string,
    event:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (multipleSelection && 'shiftKey' in event && event.shiftKey) {
      setRangeSelection(itemId);
      return;
    }

    if (
      multipleSelection &&
      'metaKey' in event &&
      (event.metaKey || event.ctrlKey)
    ) {
      const nextSelected = new Set(selectedIdSet);
      if (nextSelected.has(itemId)) {
        nextSelected.delete(itemId);
      } else {
        nextSelected.add(itemId);
      }
      setSelection([...nextSelected]);
      setFocusedId(itemId);
      setAnchorId(itemId);
      revealItem(itemId);
      return;
    }

    setSelection([itemId]);
    setFocusedId(itemId);
    setAnchorId(itemId);
    revealItem(itemId);
  };

  const handleTypeahead = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isPrintableCharacter(event)) {
      return false;
    }

    const query = `${typeaheadRef.current}${event.key.toLocaleLowerCase()}`;
    typeaheadRef.current = query;

    if (typeaheadTimerRef.current !== null) {
      window.clearTimeout(typeaheadTimerRef.current);
    }

    typeaheadTimerRef.current = window.setTimeout(() => {
      typeaheadRef.current = '';
      typeaheadTimerRef.current = null;
    }, 800);

    const currentIndex = effectiveFocusedId
      ? visibleIds.indexOf(effectiveFocusedId)
      : -1;
    const searchSpace = [
      ...flatItems.slice(currentIndex + 1),
      ...flatItems,
    ].filter((entry) => visibleIdSet.has(entry.item.id));
    const match = searchSpace.find((entry) => {
      const text = typeof entry.item.label === 'string' ? entry.item.label : '';
      return text.toLocaleLowerCase().startsWith(query);
    });

    if (!match) {
      return false;
    }

    focusItem(match.item.id);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (flatItems.length === 0) {
      return;
    }

    if (handleTypeahead(event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        if (effectiveFocusedId) {
          handleSelect(effectiveFocusedId, event);
          const focusedItem = flatItems.find(
            (entry) => entry.item.id === effectiveFocusedId,
          )?.item;
          if (focusedItem) {
            onItemOpen?.(focusedItem);
          }
        }
        return;
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        focusByOffset(-1);
        return;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        focusByOffset(1);
        return;
      case 'PageUp':
        event.preventDefault();
        event.stopPropagation();
        focusByPage(-1);
        return;
      case 'PageDown':
        event.preventDefault();
        event.stopPropagation();
        focusByPage(1);
        return;
      case 'Escape':
        if (selectedIdSet.size > 0) {
          event.preventDefault();
          event.stopPropagation();
          setSelection([]);
          setAnchorId(null);
        }
        return;
      case 'a':
      case 'A':
        if (multipleSelection && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          event.stopPropagation();
          setSelection(visibleIds);
          setAnchorId(null);
        }
        return;
      case 'ArrowLeft': {
        event.preventDefault();
        event.stopPropagation();

        if (!effectiveFocusedId) {
          return;
        }

        const focusedEntry = flatItems.find(
          (entry) => entry.item.id === effectiveFocusedId,
        );
        if (!focusedEntry) {
          return;
        }

        if (focusedEntry.collapsible && focusedEntry.expanded) {
          toggleExpanded(focusedEntry.item.id);
          return;
        }

        if (focusedEntry.parentId) {
          focusItem(focusedEntry.parentId);
        }
        return;
      }
      case 'ArrowRight': {
        event.preventDefault();
        event.stopPropagation();

        if (!effectiveFocusedId) {
          return;
        }

        const focusedIndex = visibleIds.indexOf(effectiveFocusedId);
        const focusedEntry = flatItems[focusedIndex];
        if (!focusedEntry) {
          return;
        }

        if (focusedEntry.collapsible && !focusedEntry.expanded) {
          toggleExpanded(focusedEntry.item.id);
          return;
        }

        const nextEntry = flatItems[focusedIndex + 1];
        if (nextEntry && nextEntry.parentId === focusedEntry.item.id) {
          focusItem(nextEntry.item.id);
        }
        return;
      }
      case ' ': {
        event.preventDefault();
        event.stopPropagation();

        if (!effectiveFocusedId) {
          return;
        }

        toggleExpanded(effectiveFocusedId, event.altKey);
        return;
      }
      default:
        return;
    }
  };

  const rootClassName = [
    styles.root,
    hasFocus ? styles.focusedTree : '',
    renderIndentGuides === 'always' ? styles.indentGuidesAlways : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      role="tree"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-multiselectable={multipleSelection || undefined}
      aria-activedescendant={
        effectiveFocusedId ? `${treeId}-${effectiveFocusedId}` : undefined
      }
      onKeyDown={handleKeyDown}
      onFocus={() => setHasFocus(true)}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setHasFocus(false);
      }}
      {...props}
    >
      {flatItems.length === 0 ? (
        <div className={styles.empty}>{emptyState}</div>
      ) : (
        <div className={styles.rows}>
          {flatItems.map((entry) => {
            const { item, depth, expanded, collapsible, visibleChildrenCount } =
              entry;
            const selected = selectedIdSet.has(item.id);
            const focused = effectiveFocusedId === item.id;
            const twistiePaddingLeft = defaultIndent + (depth - 1) * indent;
            const indentWidth = Math.max(0, twistiePaddingLeft + indent - 16);
            const guideCount = Math.max(0, depth - 1);

            return (
              <div
                key={item.id}
                ref={(node) => {
                  if (node) {
                    rowRefs.current.set(item.id, node);
                  } else {
                    rowRefs.current.delete(item.id);
                  }
                }}
                id={`${treeId}-${item.id}`}
                role="treeitem"
                aria-level={depth}
                aria-selected={selected}
                aria-expanded={collapsible ? expanded : undefined}
                aria-disabled={item.disabled || undefined}
                className={[
                  styles.row,
                  focused ? styles.rowFocused : '',
                  selected ? styles.rowSelected : '',
                  item.disabled ? styles.rowDisabled : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    '--tree-row-height': `${rowHeight}px`,
                  } as React.CSSProperties
                }
                onMouseDown={(event) => {
                  if (event.button !== 0) {
                    return;
                  }
                  containerRef.current?.focus();
                }}
                onClick={(event) => {
                  if (item.disabled) {
                    return;
                  }

                  const target = event.target as HTMLElement;
                  const onTwistie =
                    target.closest(`.${styles.twistie}`) !== null;

                  handleSelect(item.id, event);

                  if (collapsible) {
                    if (onTwistie) {
                      toggleExpanded(item.id, event.altKey);
                      return;
                    }

                    if (!expandOnlyOnTwistieClick && event.detail === 1) {
                      toggleExpanded(item.id, event.altKey);
                    }
                  }
                }}
                onDoubleClick={(event) => {
                  if (item.disabled) {
                    return;
                  }

                  const target = event.target as HTMLElement;
                  const onTwistie =
                    target.closest(`.${styles.twistie}`) !== null;

                  if (onTwistie) {
                    return;
                  }

                  if (collapsible && expandOnDoubleClick) {
                    toggleExpanded(item.id, event.altKey);
                    return;
                  }

                  onItemOpen?.(item);
                }}
              >
                <div className={styles.treeRow}>
                  <div
                    className={styles.indent}
                    style={{ width: `${indentWidth}px` }}
                    aria-hidden="true"
                  >
                    {guideCount > 0
                      ? Array.from({ length: guideCount }, (_, guideIndex) => (
                          <span
                            key={`${item.id}-guide-${guideIndex}`}
                            className={[
                              styles.indentGuide,
                              renderIndentGuides === 'none'
                                ? styles.indentGuideHidden
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={{ width: `${indent}px` }}
                          />
                        ))
                      : null}
                  </div>
                  <span
                    className={[
                      styles.twistie,
                      collapsible && visibleChildrenCount > 0
                        ? styles.twistieCollapsible
                        : '',
                      collapsible && expanded ? '' : 'collapsed',
                      collapsible && visibleChildrenCount > 0 ? 'codicon' : '',
                      collapsible && visibleChildrenCount > 0
                        ? 'codicon-chevron-down'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ paddingLeft: `${twistiePaddingLeft}px` }}
                    aria-hidden="true"
                  />
                  <div className={styles.contents}>
                    <div className={styles.contentLayout}>
                      {item.icon ? (
                        <span className={styles.itemIcon} aria-hidden="true">
                          <Icon icon={item.icon} size={16} />
                        </span>
                      ) : null}
                      <div className={styles.contentBody}>
                        {renderItem(item, {
                          depth,
                          expanded,
                          selected,
                          focused: focused && hasFocus,
                          disabled: !!item.disabled,
                          collapsible,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
