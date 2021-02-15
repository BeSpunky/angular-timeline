import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { TickItem, TimelineTick } from '../directives/timeline-tick.directive';
import { RenderedTick, TimelineState } from './timeline-state.service';

export class TickContext
{
    public readonly width   : BehaviorSubject<number>;
    public readonly position: BehaviorSubject<number>;
    public readonly label   : BehaviorSubject<string | number>;
    public readonly value   : BehaviorSubject<Date>;
    
    constructor(
        public readonly state: TimelineState,
        item: TickItem
    )
    {
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
    public readonly ticksInView: { [tickLevel: number]: RenderedTick[] } = { };

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
    public renderTicks(tick: TimelineTick, tickLevel: number, newTickItems: TickItem[]): void
    {
        const renderedViews = this.ticksInView[tickLevel] || [];

        // Update state with created views
        this.ticksInView[tickLevel] = this.recycleViewsAndAggregateChanges(tick, renderedViews , newTickItems);
    }

    public unrenderTicks(tickLevel: number): void
    {
        if (!this.ticksInView[tickLevel]) return;

        this.ticksInView[tickLevel].forEach(viewRef => viewRef.view.destroy());

        delete this.ticksInView[tickLevel];
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

    private updateRenderedTicks(renderedTicks: RenderedTick[], newTickItems: TickItem[], count: number)
    {
        for (let i = 0; i < count; ++i)
        {
            const renderedTick = renderedTicks[i];
            const newTickItem  = newTickItems [i];

            renderedTick.item = newTickItem;
            renderedTick.context.update(newTickItem);
        }
    }

    private recycleViewsAndAggregateChanges(tick: TimelineTick, renderedTicks: RenderedTick[], newTickItems: TickItem[]): RenderedTick[]
    {
        const changed = renderedTicks.length - newTickItems.length;

        let updateCount = renderedTicks.length;

        if (changed > 0) // Items were removed
        {
            this.unrenderRemovedTicks(renderedTicks, changed);

            updateCount = renderedTicks.length;
        }
        else if (changed < 0) // Items were added
        {
            const addedTicks = this.renderMissingTicks(newTickItems, changed, tick);

            updateCount = renderedTicks.length;
                
            renderedTicks.push(...addedTicks);
        }
        
        this.updateRenderedTicks(renderedTicks, newTickItems, updateCount);

        return renderedTicks;
    }

    private renderMissingTicks(newTickItems: TickItem[], changed: number, tick: TimelineTick)
    {
        return newTickItems.slice(changed).map(item => this.renderTick(tick, item));
    }

    private unrenderRemovedTicks(renderedTicks: RenderedTick[], removedCount: number)
    {
        renderedTicks.splice(-removedCount).forEach(tick => this.unrenderTick(tick));
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