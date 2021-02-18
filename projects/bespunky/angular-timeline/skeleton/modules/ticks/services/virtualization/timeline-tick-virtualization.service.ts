import { Injectable } from '@angular/core';
import { animationFrameScheduler, combineLatest, Observable } from 'rxjs';
import { useActivationSwitch, valueInRange } from '@bespunky/angular-timeline/helpers';
import { TimelineLocationService } from '../../../../services/location/timeline-location.service';
import { TickItem } from '../../view-models/tick-item';
import { DatesBetweenGenerator, TickLabeler, WidthCalculator } from '../../view-models/types';
import { distinctUntilChanged, map, observeOn } from 'rxjs/operators';
import { TimelineTick } from '../../directives/timeline-tick';

/**
 * Provides methods for virtualizing tick rendering. This service is designed to determine what ticks should
 * be displayed on the screen according to screen size, zoom, view center and other factors.
 *
 * @export
 * @class TimelineTickVirtualizationService
 */
@Injectable({ providedIn: 'root' })
export class TimelineTickVirtualizationService
{
    constructor(private location: TimelineLocationService) { }

    /**
     * Creates a stream that notifies subscribers when the specified tick scale should render or unrender.
     * Render state is determined by the current zoom level and the min/max zoom defined for the tick scale.
     *
     * @param {TimelineTick} tick The tick scale for which to create the stream.
     * @returns {Observable<boolean>} An observable that notifies subscribers when to render and unrender the tick.
     */
    public shouldRenderFeed(tick: TimelineTick): Observable<boolean>
    {
        return combineLatest([tick.state.zoom, tick.minZoom, tick.maxZoom]).pipe(
            valueInRange(),
            distinctUntilChanged()
        );
    }

    public widthFeed(tick: TimelineTick): Observable<WidthCalculator>
    {
        return combineLatest([tick.dayFactor, tick.state.dayWidth]).pipe(
            map(([dayFactor, dayWidth]) => dayFactor instanceof Function 
                                            ? (date: Date) => dayFactor(date) * dayWidth
                                            : () => dayWidth
            )
        );
    }

    /**
     * Creates a stream that notifies subscribers when the ticks that should be displayed on the screen have changed.
     * A new item array will be generated any time one of the following occurs:
     * - The tick label function has been replaced
     * - The tick dateBetween function has been replaced
     * - The tick dayFactor has been updated
     * - The timeline zoom level has changed
     * - The timeline view center has changed
     * - The timeline virtualization buffer size has changed
     *
     * @param {TimelineTick} tick The tick scale for which to create the stream.
     * @returns {Observable<TickItem[]>} A stream that notifies subscribers when the ticks that should be displayed on the screen have changed.
     */
    public itemsToRenderFeed(tick: TimelineTick): Observable<TickItem[]>
    {
        return combineLatest([tick.label, tick.datesBetween, tick.width, tick.state.dayWidth, tick.state.viewBounds, tick.state.virtualizationBuffer]).pipe(
            // As item generation depends on multiple subjects, generation might be triggered multiple times for the same change.
            // When zooming, for example, viewBounds + width are changed causing at least 2 notifications.
            // The animationFrameScheduler calculates changes just before next browser content repaint, which prevents flickering and hangs,
            // creating a smoother animation.
            observeOn(animationFrameScheduler),
            useActivationSwitch(tick.shouldRender),
            map(([label, datesBetween, width, dayWidth, viewBounds, virtualizationBuffer]) =>
            {
                const bufferWidth   = viewBounds.width * virtualizationBuffer;
                const startPosition = viewBounds.left  - bufferWidth;
                const endPosition   = viewBounds.right + bufferWidth;
                
                return this.ticksOnScreen(dayWidth, width, startPosition, endPosition, datesBetween!, label);
            })
        );
    }

    /**
     * Generates an array of tick items representing the ticks that should be displayed on the screen given
     * the specified state.
     *
     * @param {number} dayWidth The width (in pixels) representing one single day on the timeline.
     * @param {DayFactor} dayFactor The multiplier specifying what part of a single day (or how many days) this tick scale represents.
     * @param {number} startPosition The start position (in pixels) from which ticks should start. This should include any buffer width.
     * @param {number} endPosition The end position (in pixels) from which ticks should end. This should include any buffer width.
     * @param {DatesBetweenGenerator} datesBetween The function that generates all tick scale-level dates between two given dates.
     * @param {TickLabeler} label The function to use for labeling the items.
     * @returns {TickItem[]} An array of tick items representing the ticks that should be displayed on the screen.
     */
    public ticksOnScreen(dayWidth: number, width: WidthCalculator, startPosition: number, endPosition: number, datesBetween: DatesBetweenGenerator, label: TickLabeler): TickItem[]
    {
        // Find the dates corresponding to the bounds of the screen
        const start = this.location.positionToDate(dayWidth, startPosition);
        const end   = this.location.positionToDate(dayWidth, endPosition);

        // Generate all scale-level dates inside the screen bounds and create a tick item for each
        return datesBetween(start, end).map(date => new TickItem(this.location.dateToPosition(dayWidth, date), date, width(date), label(date)));
    };
}