import { Injectable } from '@angular/core';

import { ViewBounds                                                             } from '@bespunky/angular-timeline/abstraction';
import { MillisecondsInADay, YearZeroJanuaryFirstInMs, MinDateInMs, MaxDateInMs } from '../../tools/date-consts';
import { daysSinceYearZero                                                      } from '../../tools/date-functions';

/**
 * Provides methods for orientation on the timeline.
 * 
 * The service takes into account that:
 * - All dates and positions are relative to 1/1/0000 00:00, which is pixel 0 of the timeline drawing.
 * - The width (in pixels) of a day is the base unit for positioning and rendering on the timeline.
 * 
 * @export
 * @class TimelineLocationService
 */
@Injectable({ providedIn: 'root' })
export class TimelineLocationService
{
    /**
     * Determines the date that a position on the timeline (in pixels) refers to.
     *
     * @param {number} dayWidth The width (in pixels) of a single day on the timeline.
     * @param {number} position The position for which to calculate the date.
     * @returns {Date} The date corresponding to the position.
     */
    public positionToDate(dayWidth: number, position: number): Date
    {
        let positionInMs = position * MillisecondsInADay / dayWidth + YearZeroJanuaryFirstInMs;

        if      (positionInMs > MaxDateInMs) positionInMs = MaxDateInMs;
        else if (positionInMs < MinDateInMs) positionInMs = MinDateInMs;

        return new Date(positionInMs);
    }

    /**
     * Determines the position on the timeline (in pixels) that corresponds to a specific date.
     *
     * @param {number} dayWidth The width (in pixels) of a single day on the timeline.
     * @param {number} y The year part of the date.
     * @param {number} [m] (Optional) The month part of the date. Default is 0 (January).
     * @param {number} [d] (Optional) The day part of the date. Default is 1.
     * @param {number} [h] (Optional) The hourpart of the date. Default is 0.
     * @param {number} [mm] (Optional) The minute part of the date. Default is 0.
     * @param {number} [s] (Optional) The second part of the date. Default is 0.
     * @param {number} [ms] (Optional) The millisecond part of the date. Default is 0.
     * @returns The position (in pixels) corresponding to the specified date.
     */
    public dateToPosition(dayWidth: number, y: number, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number): number;
    /**
     * Determines the position on the timeline (in pixels) that corresponds to a specific date.
     *
     * @param {number} dayWidth The width (in pixels) of a single day on the timeline.
     * @param {Date} date The date to convert to position.
     * @returns The position (in pixels) corresponding to the specified date.
     */
    public dateToPosition(dayWidth: number, date: Date): number;
    /**
     * Determines the position on the timeline (in pixels) that corresponds to a specific date.
     *
     * @param {number} dayWidth The width (in pixels) of a single day on the timeline.
     * @param {(number | Date)} yOrDate 
     * @param {number} [m] (Optional) The month part of the date. Default is 0 (January).
     * @param {number} [d] (Optional) The day part of the date. Default is 1.
     * @param {number} [h] (Optional) The hourpart of the date. Default is 0.
     * @param {number} [mm] (Optional) The minute part of the date. Default is 0.
     * @param {number} [s] (Optional) The second part of the date. Default is 0.
     * @param {number} [ms] (Optional) The millisecond part of the date. Default is 0.
     * @returns The position (in pixels) corresponding to the specified date.
     */
    public dateToPosition(
        dayWidth: number,
        yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number
    ): number
    {
        return daysSinceYearZero(yOrDate, m, d, h, mm, s, ms) * dayWidth;
    }

    public toScreenPosition(position: number, { left: viewLeft }: ViewBounds): number
    {
        return position - viewLeft;
    }
}
