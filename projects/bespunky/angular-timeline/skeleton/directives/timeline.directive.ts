import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, Input, QueryList } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { Observable } from 'rxjs';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { TimelineState } from '../services/state/timeline-state';
import { TimelineStateProvider } from '../services/state/timeline-state.provider';
import { TimelineRendererProvider } from '../services/render/timeline-renderer.provider';
import { TimelineRenderer } from '../services/render/timeline-renderer';
import { TimelineControl } from '../services/control/timeline-control';
import { TimelineControlProvider } from '../services/control/timeline-control.provider';
import { TimelineTickRendererProvider } from '../modules/ticks/services/render/timeline-tick-renderer.provider';
import { TimelineTickDirective } from '../modules/ticks/directives/timeline-tick.directive';
import { TimelineTick } from '../modules/ticks/directives/timeline-tick';
import { TimelineTickRenderer } from '../modules/ticks/services/render/timeline-tick-renderer';

/**
 * Adds timeline functionality to an element.
 *
 * @export
 * @class TimelineDirective
 * @extends {Destroyable}
 * @implements {AfterViewInit}
 */
@Directive({
    selector : '[timeline]',
    exportAs : 'timeline',
    providers: [TimelineStateProvider, TimelineControlProvider, TimelineRendererProvider, TimelineTickRendererProvider],
})
export class TimelineDirective extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTickDirective) private ticks!: QueryList<TimelineTick>;
    
    /**
     * The view bounds currently focused on by the user represented in a format compatible with an SVG viewBox.
     *
     * @type {Observable<string>}
     */
    public readonly svgViewBox: Observable<string>;
    
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
        private renderer    : TimelineRenderer,
        private tickRenderer: TimelineTickRenderer
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
        this.subscribe(unrender, _             => this.tickRenderer.unrenderTicks(tickLevel));
    }

    /**
     * Sets the width of the the day level tick. All tick width and position calculations are based on this size.
     * Default is 1. A larger size means the initial size of your ticks will be larger.    
     */
    @Input() public set baseTickSize(value: number)
    {
        this.state.baseTickSize.next(value);
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