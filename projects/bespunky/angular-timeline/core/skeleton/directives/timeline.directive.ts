import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, ElementRef, Input, QueryList } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, map, pluck, startWith, takeUntil, tap } from 'rxjs/operators';
import { TimelineRenderer, ViewBounds } from '../services/timeline-renderer.service';
import { TimelineState } from '../services/timeline-state.service';
import { TimelineTick, TimelineTickDirective } from './timeline-tick.directive';

@Directive({
    selector : '[timeline]',
    exportAs : 'timeline'
})
export class TimelineDirective extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTickDirective) public ticks!: QueryList<TimelineTick>;
    
    public readonly viewChanged: Observable<ViewBounds>;
    public readonly svgViewBox : Observable<string>;

    constructor(
        private changes : ChangeDetectorRef,
        public  state   : TimelineState,
        private renderer: TimelineRenderer,
        private element : ElementRef
    )
    {
        super();

        // TODO: Move to a new TimelineControlsService
        const wheelEvent  = fromEvent<WheelEvent>(this.element.nativeElement, 'wheel');
        // const hWheelEvent = wheelEvent.pipe(filter(e => e.deltaX !== 0), pluck('deltaX'), map(delta => -delta));
        const vWheelEvent = wheelEvent.pipe(filter(e => e.deltaY !== 0), pluck('deltaY'), map(delta => -delta));

        this.viewChanged = this.renderer.viewBoundsFor(this.element);
        this.svgViewBox  = this.viewChanged.pipe(map(viewBounds => viewBounds.toSvgViewBox()));

        this.subscribe(vWheelEvent, delta => this.state.addZoom(Math.round(delta * 0.1)));
    }

    ngAfterViewInit()
    {
        this.observeTicks();

        this.changes.detectChanges();
    }

    private observeTicks(): void
    {
        const tickUpdates = this.ticks.changes.pipe(startWith(0), map(() => this.ticks.toArray()));

        this.subscribe(tickUpdates, ticks =>
        {
            ticks.forEach((tick, index) =>
            {
                this.initTickHierarchy(ticks, index);
                
                this.observeTick(tick, index);
            });
        });
    }

    private observeTick(tick: TimelineTick, tickLevel: number): void
    {
        // If ticks were changes (e.g. an ngIf or ngFor creates them) then takeUntil will unsubscribe from the render observable
        this.subscribe(tick.render.pipe(takeUntil(this.ticks.changes)), ([items, shouldRender, duplicateCount]) => this.updateTicks(tick, tickLevel, items, shouldRender, duplicateCount));
    }

    private updateTicks(tick: TimelineTick, tickLevel: number, items: any[], shouldRender: boolean, duplicateCount: number): void
    {
        shouldRender ? this.renderer.renderTicks(tick, tickLevel, items, duplicateCount) 
                     : this.renderer.unrenderTicks(tickLevel);
    }

    private initTickHierarchy(ticks: TimelineTick[], index: number): void
    {
        const tick = ticks[index];

        if (index > 0               ) tick.parent.next(ticks[index - 1]);
        if (index < ticks.length - 1) tick.child .next(ticks[index + 1]);
    }

    /** The width of the top level tick in zero-zoom mode. */
    @Input() public set baseTickSize(value: number)
    {
        this.state.baseTickSize.next(value);
    }
}