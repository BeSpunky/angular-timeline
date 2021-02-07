import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, Input, QueryList } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { TimelineControl, TimelineControlProvider } from '../services/timeline-control.service';
import { TimelineRenderer, TimelineRendererProvider } from '../services/timeline-renderer.service';
import { TimelineState, TimelineStateProvider } from '../services/timeline-state.service';
import { TimelineTick, TimelineTickDirective } from './timeline-tick.directive';

@Directive({
    selector : '[timeline]',
    exportAs : 'timeline',
    providers: [TimelineStateProvider, TimelineRendererProvider, TimelineControlProvider],
})
export class TimelineDirective extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTickDirective) public ticks!: QueryList<TimelineTick>;
    
    public readonly svgViewBox : Observable<string>;

    constructor(
        private changes : ChangeDetectorRef,
        public  state   : TimelineState,
        private renderer: TimelineRenderer,
        private control : TimelineControl
    )
    {
        super();

        this.svgViewBox = this.state.viewBounds.pipe(map(viewBounds => viewBounds.toSvgViewBox()));
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

    /** Activates or deactivates zoom on wheel events. Default is `true`. */
    @Input() public set zoomOnWheel(active: boolean)
    {
        this.control.zoomOnWheel.next(active);
    }
}