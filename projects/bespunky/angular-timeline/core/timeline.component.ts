import { Component,  Input,  ViewEncapsulation } from '@angular/core';
import { TimelineState } from './skeleton/services/timeline-state.service';
import { TimelineRenderer } from './skeleton/services/timeline-renderer.service';
import { TimelineToolsService } from './skeleton/services/timeline-tools.service';
import { Interval, eachYearOfInterval, getDaysInMonth, getDaysInYear, eachMonthOfInterval, eachHourOfInterval, differenceInMinutes, addMinutes, addSeconds, differenceInSeconds } from 'date-fns';
import { DayFactor } from './skeleton/directives/timeline-tick.directive';

@Component({
    selector     : 'bs-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent
{
    x: number = 0;
    y: number = 0;

    public readonly dayFactors: { [scale: string]: DayFactor } = {
        daysInYear  : getDaysInYear,
        daysInMonth : getDaysInMonth,
        hoursInDay  : 24,
        minutesInDay: 24 * 60,
        secondsInDay: 24 * 60 * 60
    };

    public readonly datesBetween: { [scale: string]: (interval: Interval) => Date[] } = {
        years  : eachYearOfInterval,
        months : eachMonthOfInterval,
        hours  : eachHourOfInterval,
        minutes: ({ start, end }) => Array.from({ length: (differenceInMinutes(start, end)) }, (_, minIndex) => addMinutes(start, minIndex)),
        seconds: ({ start, end }) => Array.from({ length: (differenceInSeconds(start, end)) }, (_, secIndex) => addSeconds(start, secIndex))
    };

    ddd(e: MouseEvent): void
    {
        this.x = e.offsetX;
        this.y = e.offsetY;
    }
}
