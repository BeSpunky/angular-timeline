import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { TimelineTick } from '../directives/timeline-tick.directive';
import { CreatedView, TimelineState } from './timeline-state.service';
import { TimelineToolsService } from './timeline-tools.service';

export interface TickContext
{
    state    : TimelineState;
    tickLevel: number;
    value    : any;
    index    : number;
    width    : Observable<number>;
    position : Observable<number>;
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
        /*
         *             viewPortWidth
         *     ------------------------------
         *    |            width     <-zoom->|
         *    |       ---------------        |
         *    |      |               |       |
         *    |      |               |height | viewPortHeight
         *    |      |               |       |
         *    |       ---------------        |
         *    |                              |
         *     ------------------------------
         * 
         * The idea is to use the zoom to calculate the new bounds, while maintaining aspect ratio and keeping the bounds centered in the viewport.
         */

        // // Use the new zoom level to directly calculate the new width
        // this.width  = viewPortWidth - zoom;
        // // Check the new ratio between the viewport and the viewbox width, then apply the same ratio to the height
        // this.height = viewPortHeight * (this.width / viewPortWidth);
        // this.left   = ViewBounds.startOfAlignedCenters(viewPortWidth , this.width);
        // this.top    = ViewBounds.startOfAlignedCenters(viewPortHeight, this.height);
        // this.right  = this.left + this.width;
        // this.bottom = this.top  + this.height;

        this.top    = 0;
        this.left   = viewCenter + viewCenter / 2;
        this.width  = viewPortWidth;
        this.height = viewPortHeight;
        this.right  = this.left + this.width;
        this.bottom = this.top + this.height;
    }

    private static startOfAlignedCenters(fullLength: number, part: number): number
    {
        return part > fullLength ? 0 : (fullLength - part) / 2;
    }

    public toSvgViewBox(): string
    {
        return `${this.left} ${this.top} ${this.width} ${this.height}`
    }
}

export abstract class TimelineRenderer extends Destroyable
{
    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: any[], duplicateCount: number): void;
    abstract unrenderTicks(tickLevel: number): void;

    abstract viewBounds(): Observable<ViewBounds>;
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
    public renderTicks(tick: TimelineTick, tickLevel: number, items: any[], duplicateCount: number): void
    {
        // If already rendered, do not render again
        if (this.state.ticksInView[tickLevel]) return;
        
        const createdViews = this.tools.duplicateMap(items, duplicateCount, (item, index) =>
        {
            const context = this.createViewContext(tick, item, tickLevel, index);
            const view    = tick.view!.createEmbeddedView(tick.template, context);
            
            return { item, index, context, view } as CreatedView;
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

    private createViewContext(tick: TimelineTick, value: any, tickLevel: number, index: number): any
    {
        const context = {
            state: this.state,
            tickLevel,
            value,
            index,
            width   : tick.width,
            position: tick.positionFeed(index)
        } as TickContext;

        return {
            $implicit: context,
            ...context
        };
    }

    public viewBounds(): Observable<ViewBounds>
    {
        const { nativeElement: element } = this.element;

        // TODO: Hook to element resize event
        return combineLatest([this.state.viewPortWidth, this.state.viewPortHeight, this.state.zoom, this.state.viewCenter]).pipe(
            map(([viewPortWidth, viewPortHeight, zoom, viewCenter]) => new ViewBounds(viewPortWidth, viewPortHeight, zoom, viewCenter))
        );
    }
}

export const TimelineRendererProvider: ClassProvider = {
    provide : TimelineRenderer,
    useClass: TimelineRendererService
};