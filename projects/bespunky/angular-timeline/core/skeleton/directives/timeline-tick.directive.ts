import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, merge, of, zip, asyncScheduler, animationFrameScheduler, queueScheduler } from 'rxjs';
import { debounce, debounceTime, distinctUntilChanged, map, mergeMap, multicast, observeOn, pluck, publish, refCount, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { useActivationSwitch } from '../rxjs/activation-switch';
import { debug } from '../rxjs/debug';
import { valueInRange } from '../rxjs/value-in-range';
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

export type TickLabeler = (tickIndex: number, value: any) => string;

export type TickItems = number | any[];

export interface TimelineTick
{
    readonly id     : BehaviorSubject<string>;
    readonly items  : BehaviorSubject<TickItems>;
    readonly minZoom: BehaviorSubject<number>;
    readonly maxZoom: BehaviorSubject<number>;
    readonly label  : BehaviorSubject<TickLabeler>;

    readonly view    : ViewContainerRef;
    readonly template: TemplateRef<any>;

    readonly itemCount     : Observable<number>;
    readonly width         : Observable<number>;
    readonly renderedItems : Observable<TickItem[]>;
    readonly shouldRender  : Observable<boolean>;
    
    readonly parent: BehaviorSubject<TimelineTick | null>;
    readonly child : BehaviorSubject<TimelineTick | null>;
}

@Directive({
    selector: '[timelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective implements TimelineTick
{
    public readonly id     : BehaviorSubject<string>      = new BehaviorSubject('');
    public readonly items  : BehaviorSubject<TickItems>   = new BehaviorSubject(0 as TickItems);
    public readonly minZoom: BehaviorSubject<number>      = new BehaviorSubject(0);
    public readonly maxZoom: BehaviorSubject<number>      = new BehaviorSubject(100);
    public readonly label  : BehaviorSubject<TickLabeler> = new BehaviorSubject((index, value) => value);
    
    public readonly itemCount    : Observable<number>;
    public readonly renderedItems: Observable<TickItem[]>;
    public readonly width        : Observable<number>;
    public readonly shouldRender : Observable<boolean>;

    public readonly parent: BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);
    public readonly child : BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);

    constructor(
        public  readonly view    : ViewContainerRef,
        public  readonly template: TemplateRef<any>,
        private readonly state   : TimelineState,
        private readonly tools   : TimelineToolsService
    )
    {
        this.itemCount     = this.itemCountFeed();
        this.width         = this.widthFeed();
        this.shouldRender  = this.shouldRenderFeed();
        this.renderedItems = this.renderedItemsFeed();
    }

    @Input() public set timelineTick       (value: string)         { this.id.next(value); }
    @Input() public set timelineTickItems  (value: number | any[]) { this.items.next(value); }
    @Input() public set timelineTickMinZoom(value: number)         { this.minZoom.next(value); }
    @Input() public set timelineTickMaxZoom(value: number)         { this.maxZoom.next(value); }
    @Input() public set timelineTickLabel  (value: TickLabeler)    { this.label.next(value); }

    // TODO: What's the point in having this separated if `this.items` can be the item count itself?
    // ? Consider separating `this.items` and allowing only an array of items, while `this.itemCount` will be set by the user
    // ? as an alternative to `this.items`.
    private itemCountFeed(): Observable<number>
    {
        return this.items.pipe(map(items => items instanceof Array ? items.length : items));
    }

    private widthFeed(): Observable<number>
    {
        const parentWidth = this.parent.pipe(switchMap(parent => parent ? parent.width : of(null)));

        // combineLatest so that all values will be emitted each time any of the observables emits.
        return combineLatest([parentWidth, this.itemCount, this.state.baseTickSize, this.state.zoom]).pipe(
            // debug(() => `${this.id.value}: recalculating width`),
            map(([parentWidth, itemCount, baseTickSize, zoom]) => 
                // The width of the top most parent will increase and decrease depending on the zoom.
                // Other child ticks will calculate width based on their parent's width and item count.
                // This ensures zooming can be infinite and ticks will still maintain their size and proportions.
                parentWidth ? parentWidth / itemCount
                            : baseTickSize * Math.pow(1.06, zoom - 1) // TODO: Refactor and take delta factor from state?
            )
        );
    }

    private shouldRenderFeed(): Observable<boolean>
    {
        return combineLatest([this.state.zoom, this.minZoom, this.maxZoom]).pipe(
            valueInRange(),
            distinctUntilChanged()
        );
    }

    private renderedItemsFeed(): Observable<TickItem[]>
    {
        return combineLatest([this.parent, this.items, this.width, this.label, this.state.viewBounds, this.state.bufferedTicks]).pipe(
            // As item generation depends on multiple subjects, generation might be triggered multiple times for the same change.
            // When zooming, for example, viewBounds + width are changed causing at least 2 notifications.
            // The animationFrameScheduler calculates changes just before next browser content repaint, which prevents flickering and hangs,
            // creating a smoother animation.
            observeOn(animationFrameScheduler),
            useActivationSwitch(this.shouldRender),
            map(([parent, items, tickWidth, label, viewBounds, bufferedTicks]) =>
            {
                const closestLeftTickIndex  = Math.floor(viewBounds.left  / tickWidth);
                const closestRightTickIndex = Math.ceil (viewBounds.right / tickWidth);
    
                const startTickIndex = closestLeftTickIndex  - bufferedTicks;
                const endTickIndex   = closestRightTickIndex + bufferedTicks;
                
                let indexes       : number[];
                let values        : any[];
                let calcValueIndex: (values: any[], tickIndex: number, renderIndex: number) => number;

                if (parent)
                {
                    // TODO: If the parent sets fixed items (not infinite), limit indexes for the child. Otherwise,
                    // The parent will have fixed ticks but the child will have infinite ticks.

                    if (items)
                    {
                        values = items instanceof Array ? items : this.tools.range(0, items);
                        indexes = this.tools.range(startTickIndex, endTickIndex + 1);

                        calcValueIndex = (values: any[], tickIndex: number, renderIndex: number) =>
                        {
                            const valueRelativeIndex = tickIndex % values.length;
                            
                            return valueRelativeIndex >= 0 ? valueRelativeIndex : values.length + valueRelativeIndex;
                        };
                    }
                    else
                        throw new Error(`No items specified for the ${this.id} tick`);
                }
                else // No parent, this is the top level tick
                {
                    if (items)
                    {
                        values = items instanceof Array ? items : this.tools.range(0, items);
                        indexes = this.tools.range(0, values.length);

                        calcValueIndex = (values: any[], tickIndex: number, renderIndex: number) =>
                        {
                            const valueRelativeIndex = tickIndex % values.length;
                            
                            return valueRelativeIndex >= 0 ? valueRelativeIndex : values.length + valueRelativeIndex;
                        };
                    }
                    else
                    {
                        indexes = this.tools.range(startTickIndex, endTickIndex + 1);
                        values = [...indexes];

                        calcValueIndex = (values: any[], tickIndex: number, renderIndex: number) => renderIndex;
                    }
                }
                
                return indexes.map((tickIndex, renderIndex) =>
                {
                    const valueIndex = calcValueIndex(values, tickIndex, renderIndex);
                    const value      = values[valueIndex];
                    const itemLabel  = label(tickIndex, value);
                
                    return new TickItem(tickIndex, tickWidth, itemLabel, value);
                });
            })
        );
    }
}
