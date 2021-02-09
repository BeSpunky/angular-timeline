import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, merge, of, zip } from 'rxjs';
import { map, mergeMap, pluck, switchMap, take, tap } from 'rxjs/operators';
import { TimelineState } from '../services/timeline-state.service';
import { TimelineToolsService } from '../services/timeline-tools.service';

export class TickItem
{
    public readonly position: number;

    constructor(
        public readonly index   : number,
        public readonly width   : number,
        public readonly label   : string,
        public readonly value   : any
    )
    {
        this.position = index * width;
    }
}

export type TickLabelFn = (tickIndex: number, value: any) => string;

export interface TimelineTick
{
    readonly id     : BehaviorSubject<string>;
    readonly items  : BehaviorSubject<number | any[]>;
    readonly minZoom: BehaviorSubject<number>;
    readonly maxZoom: BehaviorSubject<number>;
    readonly label  : BehaviorSubject<TickLabelFn>;

    readonly view    : ViewContainerRef;
    readonly template: TemplateRef<any>;

    readonly itemCount     : Observable<number>;
    readonly width         : Observable<number>;
    readonly renderedItems : Observable<TickItem[]>;
    readonly shouldRender  : Observable<boolean>;
    readonly render        : Observable<[TickItem[], boolean]>;
    
    readonly parent: BehaviorSubject<TimelineTick | null>;
    readonly child : BehaviorSubject<TimelineTick | null>;
}

@Directive({
    selector: '[timelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective implements TimelineTick
{
    public readonly id     : BehaviorSubject<string>         = new BehaviorSubject('');
    public readonly items  : BehaviorSubject<number | any[]> = new BehaviorSubject(1 as number | any[]);
    public readonly minZoom: BehaviorSubject<number>         = new BehaviorSubject(0);
    public readonly maxZoom: BehaviorSubject<number>         = new BehaviorSubject(100);
    public readonly label  : BehaviorSubject<TickLabelFn>    = new BehaviorSubject((index, value) => value);
    
    public readonly itemCount     : Observable<number>;
    public readonly renderedItems : Observable<TickItem[]>;
    public readonly width         : Observable<number>;
    public readonly shouldRender  : Observable<boolean>;
    public readonly render        : Observable<[TickItem[], boolean]>;

    public readonly parent: BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);
    public readonly child : BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);

    constructor(
        public  readonly view    : ViewContainerRef,
        public  readonly template: TemplateRef<any>,
        private readonly state   : TimelineState,
        private readonly tools   : TimelineToolsService
    )
    {
        this.itemCount      = this.itemCountFeed();
        this.width          = this.widthFeed();
        this.renderedItems  = this.renderedItemsFeed();
        this.shouldRender   = this.shouldRenderFeed();
        this.render         = this.renderFeed();
    }

    @Input() public set timelineTick       (value: string)         { this.id.next(value); }
    @Input() public set timelineTickItems  (value: number | any[]) { this.items.next(value); }
    @Input() public set timelineTickMinZoom(value: number)         { this.minZoom.next(value); }
    @Input() public set timelineTickMaxZoom(value: number)         { this.maxZoom.next(value); }
    @Input() public set timelineTickLabel  (value: TickLabelFn)    { this.label.next(value); }

    // TODO: What's the point in having this separated if `this.items` can be the item count itself?
    // Consider separating `this.items` and allowing only an array of items, while `this.itemCount` will be set by the user
    // as an alternative to `this.items`.
    private itemCountFeed(): Observable<number>
    {
        return this.items.pipe(map(items => items instanceof Array ? items.length : items));
    }

    private widthFeed(): Observable<number>
    {
        // combineLatest so that all values will be emitted each time any of the observables emits.
        return combineLatest([this.parent, this.itemCount, this.state.baseTickSize, this.state.zoom]).pipe(
            mergeMap(([parent, itemCount, baseTickSize, zoom]) => 
                // The width of the top most parent will increase and decrease depending on the zoom.
                // Other child ticks will calculate width based on their parent's width and item count.
                // This ensures zooming can be infinite and ticks will still maintain their size and proportions.
                parent ? parent.width.pipe(map(parentWidth => parentWidth / itemCount))
                       : of(baseTickSize * Math.pow(1.01, zoom - 1)) // TODO: Refactor and take delta factor from state?
            )
        );
    }

    private renderedItemsFeed(): Observable<TickItem[]>
    {
        // TODO: Add a virtualization switch to allow rendering all items always
        return combineLatest([this.items, this.width, this.label, this.state.viewBounds, this.state.bufferedTicks]).pipe(
            map(([items, tickWidth, label, viewBounds, bufferedTicks]) =>
            {
                const closestLeftTickIndex  = Math.floor(viewBounds.left / tickWidth);
                const closestRightTickIndex = Math.ceil(viewBounds.right / tickWidth);
    
                const startTickIndex = closestLeftTickIndex  - bufferedTicks;
                const endTickIndex   = closestRightTickIndex + bufferedTicks;
                
                if (items)
                {
                    const values = items instanceof Array ? items : this.tools.range(0, items);
                    
                    return this.tools.range(startTickIndex, endTickIndex).map(tickIndex =>
                    {
                        const valueRelativeIndex = tickIndex % values.length;
                        const valueIndex         = tickIndex > 0 ? valueRelativeIndex : values.length + valueRelativeIndex - 1;
                        const value              = values[valueIndex];
                        const itemLabel          = label(tickIndex, value);
                        
                        return new TickItem(tickIndex, tickWidth, itemLabel, value);
                    });
                }
                else
                {
                    // items is undefined
                    throw 'Should not have reached here';
                }

                return [];
            })
        );
    }

    private shouldRenderFeed(): Observable<boolean>
    {
        return merge(this.state.zoom, this.minZoom, this.maxZoom).pipe(
        // return merge(this.state.debouncedZoom(180), this.minZoom, this.maxZoom).pipe(
            map(_ => this.tickMatchesZoom(this.state.zoom.value))
        );
    }
    
    private renderFeed(): Observable<[TickItem[], boolean]>
    {
        return combineLatest([this.renderedItems, this.shouldRender]);
    }

    // TODO: Move to tools
    public tickMatchesZoom(zoom: number): boolean
    {
        return this.minZoom.value <= zoom && zoom <= this.maxZoom.value;
    }
}
