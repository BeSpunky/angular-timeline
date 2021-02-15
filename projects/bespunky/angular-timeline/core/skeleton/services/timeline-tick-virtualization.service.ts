import { ClassProvider, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { subYears, Interval } from 'date-fns';
import { DayFactor, TickItem, TickLabeler } from '../directives/timeline-tick.directive';

// export type PositionToValueFn<T> = (position: number) => T;
// export type ValueToPositionFn<T> = (value: T) => number;

export abstract class TimelineTickVirtualization
{
    // abstract readonly positionToValue: BehaviorSubject<PositionToValueFn<any>>;
    // abstract readonly valueToPosition: BehaviorSubject<ValueToPositionFn<any>>;
    public abstract positionToDate(dayWidth: number, position: number)                                                                                   : Date;
    public abstract dateToPosition(dayWidth: number, yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number)   : number;
    public abstract ticksOnScreen (dayWidth: number, dayFactor: DayFactor, startPosition: number, endPosition: number, each: (interval: Interval) => Date[], label: TickLabeler): TickItem[];
}


class UnfuckedDate extends Date
{
    constructor(y: number, m: number = 0, d: number = 1, h: number = 0, mm: number = 0, s: number = 0, ms: number = 0)
    {
        super(Date.UTC(y, m, d, h, mm, s, ms));

        // If the Date object fucked me with the years, compensate. Otherwise, return the date as created.
        return 0 <= y && y <= 99 ? subYears(this, 1900) : this;
    }
}

export const MillisecondsInADay       = 24 * 60 * 60 * 1000;
export const YearZeroJanuaryFirst     = new UnfuckedDate(0);
export const YearZeroJanuaryFirstInMs = YearZeroJanuaryFirst.getTime();

export function daysSinceYearZero(yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number)
{
    const date = yOrDate instanceof Date ? yOrDate : new UnfuckedDate(yOrDate, m, d, h, mm, s, ms);

    return (date.getTime() - YearZeroJanuaryFirstInMs) / MillisecondsInADay;
}

@Injectable()
export class TimelineTickVirtualizationService extends TimelineTickVirtualization
{
    // public readonly positionToValue: BehaviorSubject<PositionToValueFn<any>> = new BehaviorSubject(this.positionToDate);
    // public readonly valueToPosition: BehaviorSubject<ValueToPositionFn<any>> = new BehaviorSubject(this.dateToPosition);

    public positionToDate(dayWidth: number, position: number): Date
    {
        return new Date(position * MillisecondsInADay / dayWidth + YearZeroJanuaryFirstInMs);
    }

    public dateToPosition(dayWidth: number, yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number)
    {
        return daysSinceYearZero(yOrDate, m, d, h, mm, s, ms) * dayWidth;
    }

    public ticksOnScreen(dayWidth: number, dayFactor: DayFactor, startPosition: number, endPosition: number, datesBetween: (interval: Interval) => Date[], label: TickLabeler): TickItem[]
    {
        const width = dayFactor instanceof Function
            ? (date: Date) => dayFactor(date) * dayWidth
            : (          ) => dayWidth;
        
        return datesBetween({
            start: this.positionToDate(dayWidth, startPosition),
            end  : this.positionToDate(dayWidth, endPosition)
        }).map(date =>
        {
            const position = this.dateToPosition(dayWidth, date);
            const index    = position / dayWidth;
            return new TickItem(index, position, date, width(date), label(date));
        });
    };
}

export const TimelineTickVirtualizationProvider: ClassProvider = {
    provide : TimelineTickVirtualization,
    useClass: TimelineTickVirtualizationService
};
