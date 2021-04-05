import { combineLatest, Observable                                                      } from 'rxjs';
import { filter, map, startWith, takeUntil                                              } from 'rxjs/operators';
import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, Input, QueryList } from '@angular/core';

import { Timeline, TimelineConfig, TimelineControl, TimelineCamera, TimelineRenderer } from '@bespunky/angular-timeline/abstraction';
import { TimelineTick, TimelineTickRenderer                                          } from '@bespunky/angular-timeline/abstraction/ticks';
import { TimelineLocationService                                                     } from '@bespunky/angular-timeline/shared';
import { TimelineTickDirective                                                       } from '../modules/ticks/directives/timeline-tick.directive';
import { TimelineTickRendererProvider                                                } from '../modules/ticks/services/renderer/timeline-tick-renderer.provider';
import { TimelineConfigProvider                                                      } from '../services/config/timeline-config.provider';
import { TimelineCameraProvider                                                      } from '../services/camera/timeline-camera.provider';
import { TimelineControlProvider                                                     } from '../services/control/timeline-control.provider';
import { TimelineRendererProvider                                                    } from '../services/renderer/timeline-renderer.provider';

const providers = [
    TimelineConfigProvider,
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
export class TimelineDirective extends Timeline implements AfterViewInit
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
        public  readonly config      : TimelineConfig,
        public  readonly camera      : TimelineCamera,
        private readonly control     : TimelineControl,
        private readonly location    : TimelineLocationService,
        private readonly renderer    : TimelineRenderer,
        private readonly tickRenderer: TimelineTickRenderer,
        private readonly changes     : ChangeDetectorRef
    )
    {
        super();

        this.currentDate = combineLatest([this.camera.dayWidth, this.camera.viewCenter]).pipe(
            map(([dayWidth, viewCenter]) => this.location.positionToDate(dayWidth, viewCenter))
        );
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
        this.subscribe(unrender, ()            => this.tickRenderer.unrenderTicks(tickLevel));
    }

    /**
     * The level of zoom to apply to when rendering the timeline. Default is 1.
     * A larger number means zooming-in; A smaller number means zooming-out.
     */
    @Input() public set zoom(value: number)
    {
        this.camera.setZoom(value);
    }

    @Input() public set position(dateOrPosition: number | Date)
    {
        this.camera.moveTo(dateOrPosition);
    }

    @Input() public set baseTickSize(value: number)
    {
        this.config.baseTickSize.next(value);
    }

    @Input() public set moveAmount(value: number)
    {
        this.config.moveAmount.next(value);
    }

    @Input() public set moveOnKeyboard(value: boolean)
    {
        this.config.moveOnKeyboard.next(value);
    }

    @Input() public set moveOnWheel(value: boolean)
    {
        this.config.moveOnWheel.next(value);
    }

    @Input() public set virtualizationBuffer(value: number)
    {
        this.config.virtualizationBuffer.next(value);
    }

    @Input() public set zoomDeltaFactor(value: number)
    {
        this.config.zoomDeltaFactor.next(value);
    }

    @Input() public set zoomOnKeyboard(value: boolean)
    {
        this.config.zoomOnKeyboard.next(value);
    }

    @Input() public set zoomOnWheel(value: boolean)
    {
        this.config.zoomOnWheel.next(value);
    }
}