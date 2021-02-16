import { Injectable } from '@angular/core';
import { animationFrameScheduler, combineLatest, Observable } from 'rxjs';
import { useActivationSwitch, valueInRange } from '@bespunky/angular-timeline/helpers';
import { TimelineLocationService } from '../../../../services/location/timeline-location.service';
import { TickItem } from '../../view-models/tick-item';
import { DatesBetweenGenerator, DayFactor, TickLabeler } from '../../view-models/types';
import { distinctUntilChanged, map, observeOn } from 'rxjs/operators';
import { TimelineTick } from '../../directives/timeline-tick';

@Injectable({ providedIn: 'root' })
export class TimelineTickVirtualizationService
{
    constructor(private location: TimelineLocationService) { }

    public shouldRenderFeed(tick: TimelineTick): Observable<boolean>
    {
        return combineLatest([tick.state.zoom, tick.minZoom, tick.maxZoom]).pipe(
            valueInRange(),
            distinctUntilChanged()
        );
    }

    public itemsToRenderFeed(tick: TimelineTick): Observable<TickItem[]>
    {
        return combineLatest([tick.label, tick.datesBetween, tick.dayFactor, tick.state.dayWidth, tick.state.viewBounds, tick.state.ticksBuffer]).pipe(
            // As item generation depends on multiple subjects, generation might be triggered multiple times for the same change.
            // When zooming, for example, viewBounds + width are changed causing at least 2 notifications.
            // The animationFrameScheduler calculates changes just before next browser content repaint, which prevents flickering and hangs,
            // creating a smoother animation.
            observeOn(animationFrameScheduler),
            useActivationSwitch(tick.shouldRender),
            map(([label, datesBetween, dayFactor, dayWidth, viewBounds, bufferedTicks]) =>
            {
                const bufferWidth   = viewBounds.width * bufferedTicks;
                const startPosition = viewBounds.left  - bufferWidth;
                const endPosition   = viewBounds.right + bufferWidth;
                
                return this.ticksOnScreen(dayWidth, dayFactor, startPosition, endPosition, datesBetween!, label);
            })
        );
    }

    public ticksOnScreen(dayWidth: number, dayFactor: DayFactor, startPosition: number, endPosition: number, datesBetween: DatesBetweenGenerator, label: TickLabeler): TickItem[]
    {
        const width = dayFactor instanceof Function
            ? (date: Date) => dayFactor(date) * dayWidth
            : (          ) => dayWidth;
        
        const start = this.location.positionToDate(dayWidth, startPosition);
        const end   = this.location.positionToDate(dayWidth, endPosition);

        return datesBetween(start, end).map(date => new TickItem(this.location.dateToPosition(dayWidth, date), date, width(date), label(date)));
    };
}