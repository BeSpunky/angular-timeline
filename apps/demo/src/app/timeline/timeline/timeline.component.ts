import { eachYearOfInterval, getDaysInMonth, getDaysInYear, eachMonthOfInterval, eachHourOfInterval, differenceInMinutes, addMinutes, addSeconds, differenceInSeconds, eachDayOfInterval, startOfMinute, startOfSecond } from 'date-fns';
import { Component, Input, ViewEncapsulation } from '@angular/core';

import { DatesBetweenGenerator, DayFactor, TickLabeler } from '@bespunky/angular-timeline/abstraction/ticks';

@Component({
    selector     : 'app-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent
{
    x = 0;
    y = 0;

    @Input() public date?        : Date;
    @Input() public zoom?        : number;
    @Input() public baseTickSize?: number;

    public readonly dayFactors: { [scale: string]: DayFactor } = {
        daysInYear  : getDaysInYear,
        daysInMonth : getDaysInMonth,
        hoursInDay  : 24,
        minutesInDay: 24 * 60,
        secondsInDay: 24 * 60 * 60
    };

    public readonly datesBetween: { [scale: string]: DatesBetweenGenerator } = {
        years  : (start, end) => eachYearOfInterval({start,end}),
        months : (start, end) => eachMonthOfInterval({start, end}),
        hours  : (start, end) => eachHourOfInterval({start, end}),
        days   : (start, end) => eachDayOfInterval({ start, end }),
        minutes: (start, end) => Array.from({ length: Math.abs(differenceInMinutes(start, end)) }, (_, minIndex) => startOfMinute(addMinutes(start, minIndex))),
        seconds: (start, end) => Array.from({ length: Math.abs(differenceInSeconds(start, end)) }, (_, secIndex) => startOfSecond(addSeconds(start, secIndex)))
    };

    public readonly label: { [scale: string]: TickLabeler } = {
        years  : (value: Date) => value.getFullYear(),
        months : (value: Date) => value.getMonth() + 1,
        days   : (value: Date) => value.getDate(),
        hours  : (value: Date) => value.getHours(),
        minutes: (value: Date) => value.getMinutes(),
    };

    ddd(e: MouseEvent): void
    {
        this.x = e.offsetX;
        this.y = e.offsetY;
    }
}
