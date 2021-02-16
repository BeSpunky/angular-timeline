import { Injectable } from '@angular/core';
import { TimelineLocationService } from '../../../../services/location/timeline-location.service';
import { TickItem } from '../../view-models/tick-item';
import { DatesBetweenGenerator, DayFactor, TickLabeler } from '../../view-models/types';

@Injectable({ providedIn: 'root' })
export class TimelineTickVirtualizationService
{
    constructor(private location: TimelineLocationService) { }

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