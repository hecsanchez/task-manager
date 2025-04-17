import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';
import { cn } from '@/lib/utils';

import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Card, CardShadow } from './card';
import {
  getColumnData,
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TCardData,
  TColumn,
  cardDropTargetKey,
} from './data';
import { blockBoardPanningAttr } from './data-attributes';
import { isSafari } from './is-safari';
import { isShallowEqual } from './is-shallow-equal';
import { SettingsContext } from './settings-context';
import { TaskStatus } from '@/lib/db/schema';

type TColumnState =
  | {
      type: 'is-card-over';
      isOverChildCard: boolean;
      dragging: DOMRect;
    }
  | {
      type: 'is-column-over';
    }
  | {
      type: 'idle';
    }
  | {
      type: 'is-dragging';
    };

const stateStyles: { [Key in TColumnState['type']]: string } = {
  idle: 'cursor-grab',
  'is-card-over': 'ring-2 ring-primary/20',
  'is-dragging': 'opacity-40',
  'is-column-over': 'bg-gray-50',
};

const statusColors = {
  [TaskStatus.TODO]: 'bg-red-100 dark:bg-red-900/20',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 dark:bg-blue-900/20',
  [TaskStatus.DONE]: 'bg-green-100 dark:bg-green-900/20',
} as const;

const statusDotColors = {
  [TaskStatus.TODO]: 'bg-red-500',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-500',
  [TaskStatus.DONE]: 'bg-green-500',
} as const;

const idle = { type: 'idle' } satisfies TColumnState;

/**
 * A memoized component for rendering out the card.
 *
 * Created so that state changes to the column don't require all cards to be rendered
 */
const CardList = memo(function CardList({ column }: { column: TColumn }) {
  return column.cards.map((card) => <Card key={card.id} card={card} columnId={column.id} />);
});

export function Column({ column }: { column: TColumn }) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerFullHeightRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useContext(SettingsContext);
  const [state, setState] = useState<TColumnState>(idle);

  useEffect(() => {
    const outer = outerFullHeightRef.current;
    const inner = innerRef.current;
    const header = headerRef.current;
    const scrollable = scrollableRef.current;
    invariant(outer && inner && header && scrollable);

    const data = getColumnData({ column });

    function setIsCardOver({ data, location }: { data: TCardData; location: DragLocationHistory }) {
      const innerMost = location.current.dropTargets[0];
      const isOverChildCard = Boolean(innerMost && isCardDropTargetData(innerMost.data));

      const proposed: TColumnState = {
        type: 'is-card-over',
        dragging: data.rect,
        isOverChildCard,
      };
      // optimization - don't update state if we don't need to.
      setState((current) => {
        if (isShallowEqual(proposed, current)) {
          return current;
        }
        return proposed;
      });
    }

    function isInvalidDropPosition(location: DragLocationHistory) {
      if (location.current.dropTargets.length === 0) return false;
      
      const dropTarget = location.current.dropTargets[0];
      if (!dropTarget.data[cardDropTargetKey]) return false;
      
      // Only allow dropping at the top or bottom of the column
      // This will prevent hovering at any specific index
      return true;
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => data,
        onGenerateDragPreview({ source, location, nativeSetDragImage }) {
          const data = source.data;
          invariant(isColumnData(data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element: header, input: location.current.input }),
            render({ container }) {
              // Simple drag preview generation: just cloning the current element.
              // Not using react for this.
              const rect = inner.getBoundingClientRect();
              const preview = inner.cloneNode(true);
              invariant(preview instanceof HTMLElement);
              preview.style.width = `${rect.width}px`;
              preview.style.height = `${rect.height}px`;

              // rotation of native drag previews does not work in safari
              if (!isSafari()) {
                preview.style.transform = 'rotate(4deg)';
              }

              container.appendChild(preview);
            },
          });
        },
        onDragStart() {
          setState({ type: 'is-dragging' });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element: outer,
        getData: () => data,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isCardData(source.data)) {
            if (!isInvalidDropPosition(location)) {
              setIsCardOver({ data: source.data, location });
            }
          }
        },
        onDragEnter({ source, location }) {
          if (isCardData(source.data)) {
            if (!isInvalidDropPosition(location)) {
              setIsCardOver({ data: source.data, location });
            }
            return;
          }
          if (isColumnData(source.data) && source.data.column.id !== column.id) {
            setState({ type: 'is-column-over' });
          }
        },
        onDropTargetChange({ source, location }) {
          if (isCardData(source.data)) {
            if (!isInvalidDropPosition(location)) {
              setIsCardOver({ data: source.data, location });
            }
            return;
          }
        },
        onDragLeave({ source }) {
          if (isColumnData(source.data) && source.data.column.id === column.id) {
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          return isDraggingACard({ source });
        },
        getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
        element: scrollable,
      }),
      unsafeOverflowAutoScrollForElements({
        element: scrollable,
        getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          if (!settings.isOverflowScrollingEnabled) {
            return false;
          }

          return isDraggingACard({ source });
        },
        getOverflow() {
          return {
            forTopEdge: {
              top: 1000,
            },
            forBottomEdge: {
              bottom: 1000,
            },
          };
        },
      }),
    );
  }, [column, settings]);

  return (
    <div className="flex w-[300px] flex-shrink-0 select-none flex-col" ref={outerFullHeightRef}>
      <div
        className={cn(
          "flex max-h-full flex-col rounded-lg",
          stateStyles[state.type],
          statusColors[column.id as TaskStatus]
        )}
        ref={innerRef}
        {...{ [blockBoardPanningAttr]: true }}
      >
        <div className={`flex max-h-full flex-col ${state.type === 'is-column-over' ? 'invisible' : ''}`}>
          <div className="flex items-center gap-2 p-4" ref={headerRef}>
            <div className={cn("w-2 h-2 rounded-full", statusDotColors[column.id as TaskStatus])} />
            <h2 className="font-medium">{column.title}</h2>
            <span className="text-sm text-black bg-white rounded-[8px] border px-2 py-1 w-7 h-7 flex items-center justify-center">{column.cards.length}</span>
          </div>
          <div
            className="flex flex-col overflow-y-auto p-3 space-y-3 min-h-[500px]"
            ref={scrollableRef}
          >
            <CardList column={column} />
            {state.type === 'is-card-over' && !state.isOverChildCard ? (
              <div className="flex-shrink-0">
                <CardShadow dragging={state.dragging} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}