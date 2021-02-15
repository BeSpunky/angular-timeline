import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { eachDayOfInterval } from 'date-fns';
import { Observable, BehaviorSubject, combineLatest, merge, of, zip, asyncScheduler, animationFrameScheduler, queueScheduler } from 'rxjs';
import { debounce, debounceTime, distinctUntilChanged, filter, map, mergeMap, multicast, observeOn, pluck, publish, refCount, shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { useActivationSwitch } from '../rxjs/activation-switch';
import { debug } from '../rxjs/debug';
import { valueInRange } from '../rxjs/value-in-range';
import { TimelineState } from '../services/timeline-state.service';
import { TimelineTickVirtualizationService } from '../services/timeline-tick-virtualization.service';

export class TickItem
{
    constructor(
        public readonly position: number,
        public readonly value   : Date,
        public readonly width   : number,
        public readonly label   : string | number
    ) { }
}

export type TickLabeler           = (value: any) => string | number;
export type DatesBetweenGenerator = (start: Date, end: Date) => Date[];
export type DayFactor             = number | ((date: Date) => number);

export abstract class TimelineTick
{
    public readonly id          : BehaviorSubject<string>                = new BehaviorSubject('');
    public readonly minZoom     : BehaviorSubject<number>                = new BehaviorSubject(0);
    public readonly maxZoom     : BehaviorSubject<number>                = new BehaviorSubject(100);
    public readonly label       : BehaviorSubject<TickLabeler>           = new BehaviorSubject(value => value);
    public readonly datesBetween: BehaviorSubject<DatesBetweenGenerator> = new BehaviorSubject((() => []) as DatesBetweenGenerator);
    public readonly dayFactor   : BehaviorSubject<DayFactor>             = new BehaviorSubject(1 as DayFactor);
    
    public readonly parent: BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);
    public readonly child : BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);

    abstract readonly view    : ViewContainerRef;
    abstract readonly template: TemplateRef<any>;

    abstract readonly renderedItems: Observable<TickItem[]>;
    abstract readonly shouldRender : Observable<boolean>;
}

@Directive({
    selector: '[timelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective extends TimelineTick
{
    public readonly renderedItems: Observable<TickItem[]>;
    public readonly shouldRender : Observable<boolean>;

    constructor(
        public  readonly view      : ViewContainerRef,
        public  readonly template  : TemplateRef<any>,
        private readonly state     : TimelineState,
        private readonly virtualize: TimelineTickVirtualizationService
    )
    {
        super();

        this.shouldRender  = this.shouldRenderFeed();
        this.renderedItems = this.renderedItemsFeed();
    }

    @Input() public set timelineTick            (value: string)                { this.id          .next(value); }
    @Input() public set timelineTickDayFactor   (value: DayFactor)             { this.dayFactor   .next(value); }
    @Input() public set timelineTickDatesBetween(value: DatesBetweenGenerator) { this.datesBetween.next(value); }
    @Input() public set timelineTickMinZoom     (value: number)                { this.minZoom     .next(value); }
    @Input() public set timelineTickMaxZoom     (value: number)                { this.maxZoom     .next(value); }
    @Input() public set timelineTickLabel       (value: TickLabeler)           { this.label       .next(value); }

    private shouldRenderFeed(): Observable<boolean>
    {
        return combineLatest([this.state.zoom, this.minZoom, this.maxZoom]).pipe(
            valueInRange(),
            distinctUntilChanged()
        );
    }

    private renderedItemsFeed(): Observable<TickItem[]>
    {
        return combineLatest([this.label, this.datesBetween, this.dayFactor, this.state.dayWidth, this.state.viewBounds, this.state.ticksBuffer]).pipe(
            // As item generation depends on multiple subjects, generation might be triggered multiple times for the same change.
            // When zooming, for example, viewBounds + width are changed causing at least 2 notifications.
            // The animationFrameScheduler calculates changes just before next browser content repaint, which prevents flickering and hangs,
            // creating a smoother animation.
            observeOn(animationFrameScheduler),
            useActivationSwitch(this.shouldRender),
            map(([label, datesBetween, dayFactor, dayWidth, viewBounds, bufferedTicks]) =>
            {
                const bufferWidth   = viewBounds.width * bufferedTicks;
                const startPosition = viewBounds.left  - bufferWidth;
                const endPosition   = viewBounds.right + bufferWidth;
                
                return this.virtualize.ticksOnScreen(dayWidth, dayFactor, startPosition, endPosition, datesBetween!, label);
            })
        );
    }
}
