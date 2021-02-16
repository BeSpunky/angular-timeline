import { Injectable } from '@angular/core';
import { daysSinceYearZero, MillisecondsInADay, YearZeroJanuaryFirstInMs } from '@bespunky/angular-timeline/helpers';

@Injectable({ providedIn: 'root' })
export class TimelineLocationService
{
    public positionToDate(dayWidth: number, position: number): Date
    {
        return new Date(position * MillisecondsInADay / dayWidth + YearZeroJanuaryFirstInMs);
    }

    public dateToPosition(dayWidth: number, yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number)
    {
        return daysSinceYearZero(yOrDate, m, d, h, mm, s, ms) * dayWidth;
    }
}
