import { combineLatest, Observable                                                      } from 'rxjs';
import { filter, map, startWith, takeUntil                                              } from 'rxjs/operators';
import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, Input, QueryList } from '@angular/core';
import { Destroyable                                                                    } from '@bespunky/angular-zen/core';

import { TimelineState, TimelineStateProvider                                                    } from '@bespunky/angular-timeline/state';
import { TimelineCamera, TimelineCameraProvider, TimelineControl, TimelineControlProvider        } from '@bespunky/angular-timeline/control';
import { TimelineRenderer, TimelineRendererProvider                                              } from '@bespunky/angular-timeline/render';
import { TimelineTick, TimelineTickDirective, TimelineTickRenderer, TimelineTickRendererProvider } from '@bespunky/angular-timeline/ticks';
import { TimelineLocationService                                                                 } from '@bespunky/angular-timeline/shared';

const providers = [
    TimelineStateProvider,
    TimelineCameraProvider,
    TimelineControlProvider,
    TimelineRendererProvider,
    TimelineTickRendererProvider
];

/**
 * Adds timeline functionality to an element.
 *
 * @export
 * @class TimelineDirective
 * @extends {Destroyable}
 * @implements {AfterViewInit}
 */
@Directive({
    selector : '[bsTimeline]',
    exportAs : 'timeline',
    providers: providers,
})
export class TimelineDirective extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTickDirective) private ticks!: QueryList<TimelineTick>;
    
    public readonly currentDate: Observable<Date>;
    
    /**
     * Creates an instance of TimelineDirective.
     * 
     * @param {ChangeDetectorRef} changes
     * @param {TimelineState} state The state of the timeline.
     * @param {TimelineControl} control
     * @param {TimelineRenderer} renderer
     * @param {TimelineTickRenderer} tickRenderer
     */
    constructor(
        private changes     : ChangeDetectorRef,
        public  state       : TimelineState,
        private control     : TimelineControl,
        private camera      : TimelineCamera,
        private location    : TimelineLocationService,
        private renderer    : TimelineRenderer,
        private tickRenderer: TimelineTickRenderer
    )
    {
        super();

        this.currentDate = combineLatest([this.state.dayWidth, this.state.viewCenter]).pipe(
            map(([dayWidth, viewCenter]) => this.location.positionToDate(dayWidth, viewCenter))
        );
    }

    ngAfterViewInit()
    {
        this.observeTicks();

        this.camera.moveTo(new Date());

        this.changes.detectChanges();
    }

    private observeTicks(): void
    {
        const tickUpdates = this.ticks.changes.pipe(startWith(0), map(() => this.ticks.toArray()));

        this.subscribe(tickUpdates, ticks =>
        {
            ticks.forEach((tick, index) => this.observeTick(tick, index));
        });
    }

    private observeTick(tick: TimelineTick, tickLevel: number): void
    {
        // If ticks were changes (e.g. an ngIf or ngFor creates them) then takeUntil will unsubscribe from the render observable
        const render = tick.itemsToRender.pipe(
            takeUntil(this.ticks.changes)
        );

        const unrender = tick.shouldRender.pipe(
            takeUntil(this.ticks.changes),
            filter(shouldRender => !shouldRender)
        );

        this.subscribe(render  , renderedItems => this.tickRenderer.renderTicks  (tick, tickLevel, renderedItems));
        this.subscribe(unrender, ()            => this.tickRenderer.unrenderTicks(tickLevel));
    }

    /**
     * Sets the width of the the day level tick. All tick width and position calculations are based on this size.
     * Default is 1. A larger size means the initial size of your ticks will be larger.    
     */
    @Input() public set baseTickSize(value: number)
    {
        this.state.baseTickSize.next(value);
    }

    @Input() public set viewCenter(value: number)
    {
        this.state.viewCenter.next(value);
    }

    public get viewCenter(): number
    {
        return this.state.viewCenter.value;
    }

    /**
     * The level of zoom to apply to when rendering the timeline. Default is 1.
     * A larger number means zooming-in; A smaller number means zooming-out.
     */
    @Input() public set zoom(value: number)
    {
        this.state.zoom.next(value);
    }

    /** Activates or deactivates zoom on wheel events. Default is `true`. */
    @Input() public set zoomOnWheel(active: boolean)
    {
        this.control.zoomOnWheel.next(active);
    }
}