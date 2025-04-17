import {
    draggable,
    dropTargetForElements,
  } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
  import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
  import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
  import { MutableRefObject, useEffect, useRef, useState } from 'react';
  import { createPortal } from 'react-dom';
  import invariant from 'tiny-invariant';
  import { cn } from '@/lib/utils';
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  
  import { isSafari } from './is-safari';
  import {
    type Edge,
    attachClosestEdge,
    extractClosestEdge,
  } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
  import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
  import { getCardData, getCardDropTargetData, isCardData, isDraggingACard, TCard } from './data';
  import { isShallowEqual } from './is-shallow-equal';
  import { Task, TaskStatus } from '@/lib/db/schema';
  
  type TCardState =
    | {
        type: 'idle';
      }
    | {
        type: 'is-dragging';
      }
    | {
        type: 'is-dragging-and-left-self';
      }
    | {
        type: 'is-over';
        dragging: DOMRect;
        closestEdge: Edge;
      }
    | {
        type: 'preview';
        container: HTMLElement;
        dragging: DOMRect;
      };
  
  const idle: TCardState = { type: 'idle' };
  
  const innerStyles: { [Key in TCardState['type']]?: string } = {
    idle: 'hover:bg-gray-50 cursor-grab',
    'is-dragging': 'opacity-40',
  };
  
  const outerStyles: { [Key in TCardState['type']]?: string } = {
    // We no longer render the draggable item after we have left it
    // as it's space will be taken up by a shadow on adjacent items.
    // Using `display:none` rather than returning `null` so we can always
    // return refs from this component.
    // Keeping the refs allows us to continue to receive events during the drag.
    'is-dragging-and-left-self': 'hidden',
  };
  
  export function CardShadow({ dragging }: { dragging: DOMRect }) {
    return <div className="flex-shrink-0 rounded bg-gray-300 rounded-lg" style={{ height: dragging.height }} />;
  }
  
  export function CardDisplay({
    card,
    state,
    outerRef,
    innerRef,
    onClick,
  }: {
    card: TCard;
    state: TCardState;
    outerRef?: React.MutableRefObject<HTMLDivElement | null>;
    innerRef?: MutableRefObject<HTMLDivElement | null>;
    onClick?: () => void;
  }) {
    const task = card.data as Task;

    return (
      <div
        ref={outerRef}
        className={`flex flex-shrink-0 flex-col gap-2 ${outerStyles[state.type]}`}
        onClick={onClick}
      >
        {state.type === 'is-over' && state.closestEdge === 'top' ? (
          <CardShadow dragging={state.dragging} />
        ) : null}
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 space-y-3",
            innerStyles[state.type]
          )}
          ref={innerRef}
          style={
            state.type === 'preview'
              ? {
                  width: state.dragging.width,
                  height: state.dragging.height,
                  transform: !isSafari() ? 'rotate(4deg)' : undefined,
                }
              : undefined
          }
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                {`${task.description}`}
              </p>
            </div>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs",
              {
                "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400": task.status === TaskStatus.TODO,
                "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400": task.status === TaskStatus.IN_PROGRESS,
                "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400": task.status === TaskStatus.DONE,
              }
            )}>
              {task.status === TaskStatus.TODO ? 'To do' : 
               task.status === TaskStatus.IN_PROGRESS ? 'In progress' : 'Done'}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {task.dueDate ? `Due: ${format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}` : ''}
              </span>
            </div>
          </div>
        </div>
        {state.type === 'is-over' && state.closestEdge === 'bottom' ? (
          <CardShadow dragging={state.dragging} />
        ) : null}
      </div>
    );
  }
  
  export function Card({ card, columnId }: { card: TCard; columnId: string }) {
    const outerRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [state, setState] = useState<TCardState>(idle);

    useEffect(() => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      invariant(outer && inner);
  
      return combine(
        draggable({
          element: inner,
          getInitialData: ({ element }) =>
            getCardData({ card, columnId, rect: element.getBoundingClientRect() }),
          onGenerateDragPreview({ nativeSetDragImage, location, source }) {
            const data = source.data;
            invariant(isCardData(data));
            setCustomNativeDragPreview({
              nativeSetDragImage,
              getOffset: preserveOffsetOnSource({ element: inner, input: location.current.input }),
              render({ container }) {
                // Demonstrating using a react portal to generate a preview
                setState({
                  type: 'preview',
                  container,
                  dragging: inner.getBoundingClientRect(),
                });
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
          getIsSticky: () => true,
          canDrop: isDraggingACard,
          getData: ({ element, input }) => {
            const data = getCardDropTargetData({ card, columnId });
            return attachClosestEdge(data, { element, input, allowedEdges: ['top', 'bottom'] });
          },
          onDragEnter({ source, self }) {
            if (!isCardData(source.data)) {
              return;
            }
            if (source.data.card.id === card.id) {
              return;
            }
            const closestEdge = extractClosestEdge(self.data);
            if (!closestEdge) {
              return;
            }
  
            setState({ type: 'is-over', dragging: source.data.rect, closestEdge });
          },
          onDrag({ source, self }) {
            if (!isCardData(source.data)) {
              return;
            }
            if (source.data.card.id === card.id) {
              return;
            }
            const closestEdge = extractClosestEdge(self.data);
            if (!closestEdge) {
              return;
            }
            // optimization - Don't update react state if we don't need to.
            const proposed: TCardState = { type: 'is-over', dragging: source.data.rect, closestEdge };
            setState((current) => {
              if (isShallowEqual(proposed, current)) {
                return current;
              }
              return proposed;
            });
          },
          onDragLeave({ source }) {
            if (!isCardData(source.data)) {
              return;
            }
            if (source.data.card.id === card.id) {
              setState({ type: 'is-dragging-and-left-self' });
              return;
            }
            setState(idle);
          },
          onDrop() {
            setState(idle);
          },
        }),
      );
    }, [card, columnId]);
    return (
      <>
        <CardDisplay outerRef={outerRef} innerRef={innerRef} state={state} card={card} onClick={card.onClick} />
        {state.type === 'preview'
          ? createPortal(<CardDisplay state={state} card={card} />, state.container)
          : null}
      </>
    );
  }