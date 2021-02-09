import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { TickItem, TimelineTick } from '../directives/timeline-tick.directive';
import { CreatedView, TimelineState } from './timeline-state.service';
import { TimelineToolsService } from './timeline-tools.service';

export interface TickContext
{
    state    : TimelineState;
    tickLevel: number;
    index    : number;
    width    : number;
    position : number;
    label    : string;
    value    : any;
}

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
        return `${this.left} ${this.top} ${this.width} ${this.height}`
    }
}

export abstract class TimelineRenderer extends Destroyable
{
    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: TickItem[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}

@Injectable()
export class TimelineRendererService extends TimelineRenderer
{
    constructor(private state: TimelineState, private tools: TimelineToolsService, private element: ElementRef)
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
        // If already rendered, do not render again
        if (this.state.ticksInView[tickLevel]) this.unrenderTicks(tickLevel);
        
        const createdViews = renderedItems.map(item =>
        {
            const context = this.createViewContext(item, tickLevel);
            const view    = tick.view!.createEmbeddedView(tick.template, context);
            
            return { item, context, view } as CreatedView;
        });

        // Update state with created views
        this.state.ticksInView[tickLevel] = createdViews;
    }

    public unrenderTicks(tickLevel: number): void
    {
        if (!this.state.ticksInView[tickLevel]) return;

        this.state.ticksInView[tickLevel].forEach(viewRef => viewRef.view.destroy());

        delete this.state.ticksInView[tickLevel];
    }

    private createViewContext(item: TickItem, tickLevel: number): any
    {
        const context = {
            ...item,
            tickLevel,
            state: this.state
        } as TickContext;

        return {
            $implicit: context,
            ...context
        };
    }
}

export const TimelineRendererProvider: ClassProvider = {
    provide : TimelineRenderer,
    useClass: TimelineRendererService
};