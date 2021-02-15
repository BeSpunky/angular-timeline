import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { TickItem, TimelineTick } from '../directives/timeline-tick.directive';
import { RenderedTick, TimelineState } from './timeline-state.service';

export class TickContext
{
    public readonly index   : number;
    public readonly width   : BehaviorSubject<number>;
    public readonly position: BehaviorSubject<number>;
    public readonly label   : BehaviorSubject<string>;
    public readonly value   : BehaviorSubject<Date>;
    
    constructor(
        public readonly state: TimelineState,
        item: TickItem
    )
    {
        this.index    = item.index;
        this.position = new BehaviorSubject(item.position);
        this.value    = new BehaviorSubject(item.value   );
        this.width    = new BehaviorSubject(item.width   );
        this.label    = new BehaviorSubject(item.label   );
    }

    public update(item: TickItem)
    {
        this.position.next(item.position);
        this.value   .next(item.value   );
        this.width   .next(item.width   );
        this.label   .next(item.label   );
    }
}

export type TickViewContext = { $implicit: TickContext } & Partial<TickContext>;

export class ViewBounds
{
    public readonly left!  : number;
    public readonly top!   : number;
    public readonly right! : number;
    public readonly bottom!: number;

    public readonly width! : number;
    public readonly height!: number;
    
    constructor(
        public readonly viewPortWidth : number,
        public readonly viewPortHeight: number,
        public readonly zoom          : number,
        public readonly viewCenter    : number
    )
    {
        this.top    = 0;
        this.left   = viewCenter - viewPortWidth / 2;
        this.width  = viewPortWidth;
        this.height = viewPortHeight;
        this.right  = this.left + this.width;
        this.bottom = this.top + this.height;
    }

    public toSvgViewBox(): string
    {
        return `${this.left} ${this.top} ${this.width} ${this.height}`;
    }
}

export interface TickVisualizationChanges
{
    addPrefixCount?: number;
    addSuffixCount?: number;
    
    removePrefixCount?: number;
    removeSuffixCount?: number;

    updateFrom      : number;
    updateTo        : number;
    updateSourceFrom: number;

    replaceAll: boolean;
}

export abstract class TimelineRenderer extends Destroyable
{
    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: TickItem[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}

@Injectable()
export class TimelineRendererService extends TimelineRenderer
{
    constructor(private state: TimelineState, private element: ElementRef)
    {
        super();

        this.subscribe(this.viewPortSizeFeed());
    }

    private viewPortSizeFeed(): Observable<{ width: number, height: number }>
    {
        const element: HTMLElement = this.element.nativeElement;

        return fromEvent<UIEvent>(element, 'resize').pipe(
            startWith(null),
            map(_ => ({ width: element.clientWidth, height: element.clientHeight })),
            tap(viewPort =>
            {
                this.state.viewPortWidth .next(viewPort.width);
                this.state.viewPortHeight.next(viewPort.height);
            })
        );
    }
    
    // TODO: Aggregate changes instead of clearing and recreating views
    public renderTicks(tick: TimelineTick, tickLevel: number, renderedItems: TickItem[]): void
    {
        // Update state with created views
        this.state.ticksInView[tickLevel] = this.aggragateTickChanges(tick, tickLevel, renderedItems);
    }

    public unrenderTicks(tickLevel: number): void
    {
        if (!this.state.ticksInView[tickLevel]) return;

        this.state.ticksInView[tickLevel].forEach(viewRef => viewRef.view.destroy());

        delete this.state.ticksInView[tickLevel];
    }

    private renderTick(tick: TimelineTick, item: TickItem): RenderedTick
    {
        const viewContext = this.createViewContext(item);
        const view        = tick.view!.createEmbeddedView(tick.template, viewContext);
        
        return { item, view, context: viewContext.$implicit } as RenderedTick;
    }

    private unrenderTick(tickView: RenderedTick): void
    {
        tickView?.view.destroy();
    }

    private aggragateTickChanges(tick: TimelineTick, tickLevel: number, renderedItems: TickItem[])
    {
        const currentViews = this.state.ticksInView[tickLevel];

        if (!currentViews) return renderedItems.map(item => this.renderTick(tick, item));

        const changes = this.detectTickChanges(currentViews, renderedItems);

        if (changes.replaceAll)
        {
            this.unrenderTicks(tickLevel);
            return renderedItems.map(item => this.renderTick(tick, item));
        }

        // Update views which stay on the screen before removing or adding items to ensure correct index access
        this.updateTicks(currentViews, renderedItems, changes.updateFrom, changes.updateTo, changes.updateSourceFrom);

        // Handle suffix changes before prefixes so that indexes will fit correctly. If prefix changes would have been handled before, the array would grow/shrink
        // from the left, rendering the indexes received from the detectTickChanges() method useless.
        if (changes.removeSuffixCount) this.removeSuffix(currentViews, changes.removeSuffixCount);
        if (changes.addSuffixCount   ) this.suffix      (currentViews, renderedItems,tick, changes.addSuffixCount);
        
        if (changes.removePrefixCount) this.removePrefix(currentViews, changes.removePrefixCount);
        if (changes.addPrefixCount   ) this.prefix      (currentViews, renderedItems, tick, changes.addPrefixCount);

        return currentViews;
    }
    
    private updateTicks(currentViews: RenderedTick[], renderedItems: TickItem[], from: number, to: number, sourceIndex: number)
    {
        for (let destIndex = from; destIndex <= to; ++destIndex)
        {
            const view = currentViews[destIndex];
            const item = renderedItems[sourceIndex++];

            view.item = item;
            view.context.update(item);
        }
    }

    private defineTickChangeBounds(currentViews: RenderedTick[], renderedItems: TickItem[]): { oldFirstIndex: number; newFirstIndex: number; oldLastIndex: number; newLastIndex: number; isNewTickBatch: boolean; }
    {
        const oldFirstIndex = currentViews [0].item.index;
        const newFirstIndex = renderedItems[0].index;
        
        const oldLastIndex = currentViews [currentViews .length - 1].item.index;
        const newLastIndex = renderedItems[renderedItems.length - 1].index;

        const isNewTickBatch = newFirstIndex > oldLastIndex || newLastIndex < oldFirstIndex;

        return { oldFirstIndex, newFirstIndex, oldLastIndex, newLastIndex, isNewTickBatch };
    }

    private detectTickChanges(currentViews: RenderedTick[], renderedItems: TickItem[]): TickVisualizationChanges
    {
        const { oldFirstIndex, newFirstIndex, oldLastIndex, newLastIndex, isNewTickBatch } = this.defineTickChangeBounds(currentViews, renderedItems);
                
        if (isNewTickBatch) return { replaceAll: true, updateFrom: 0, updateTo: 0, updateSourceFrom: 0 };

        const prefixChanges = oldFirstIndex - newFirstIndex;
        const suffixChanges = newLastIndex  - oldLastIndex;

        let changes: TickVisualizationChanges = { replaceAll: false, updateFrom: 0, updateTo: 0, updateSourceFrom: 0 };

        if (prefixChanges < 0)
        {
            changes.removePrefixCount = -prefixChanges;
            changes.updateFrom        = -prefixChanges;
            changes.updateSourceFrom  = 0;
        }
        else
        {
            changes.addPrefixCount   = prefixChanges;
            changes.updateFrom       = 0;
            changes.updateSourceFrom = prefixChanges;
        }

        if (suffixChanges < 0)
        {
            changes.removeSuffixCount = -suffixChanges;
            changes.updateTo          = currentViews.length - 1 + suffixChanges ;
        }
        else
        {
            changes.addSuffixCount   = suffixChanges;
            changes.updateTo         = currentViews.length - 1;
        }

        return changes;
    }

    private removePrefix(currentViews: RenderedTick[], itemCount: number): void
    {
        this.removeTicks(currentViews, itemCount);
    }
    
    private removeSuffix(currentViews: RenderedTick[], itemCount: number): void
    {
        this.removeTicks(currentViews, -itemCount);
    }
    
    /**
     *
     *
     * @private
     * @param {RenderedTick[]} currentViews
     * @param {number} itemCount Positive to remove prefix, negative to remove suffix.
     */
    private removeTicks(currentViews: RenderedTick[], itemCount: number): void
    {
        const removed = currentViews.splice(itemCount);
        
        removed.forEach(view => this.unrenderTick(view));
    }

    private prefix(currentViews: RenderedTick[], renderedItems: TickItem[], tick: TimelineTick, itemCount: number): void
    {
        const newItems = renderedItems.slice(0, itemCount);
        const newViews = newItems.map(item => this.renderTick(tick, item));

        currentViews.unshift(...newViews);
    }

    private suffix(currentViews: RenderedTick[], renderedItems: TickItem[], tick: TimelineTick, itemCount: number): void
    {
        const newItems = renderedItems.slice(renderedItems.length - itemCount);
        const newViews = newItems.map(item => this.renderTick(tick, item));

        currentViews.push(...newViews);
    }

    private createViewContext(item: TickItem): TickViewContext
    {
        const context = new TickContext(this.state, item);

        return {
            // Enable `let-context` 
            $implicit: context,
            // Enable specific variables (e.g. `let-position`, `let-index`)
            ...context
        };
    }
}

export const TimelineRendererProvider: ClassProvider = {
    provide : TimelineRenderer,
    useClass: TimelineRendererService
};