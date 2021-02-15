import { MillisecondsInADay, YearZeroJanuaryFirstInMs } from './date-consts';
import { UnfuckedDate } from './unfucked-date';

export function daysSinceYearZero(yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number)
{
    const date = yOrDate instanceof Date ? yOrDate : new UnfuckedDate(yOrDate, m, d, h, mm, s, ms);

    return (date.getTime() - YearZeroJanuaryFirstInMs) / MillisecondsInADay;
}
