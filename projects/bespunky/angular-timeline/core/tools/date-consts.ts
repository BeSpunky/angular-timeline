import { UnfuckedDate } from './unfucked-date';

export const MillisecondsInADay       = 24 * 60 * 60 * 1000;
export const YearZeroJanuaryFirst     = new UnfuckedDate(0);
export const YearZeroJanuaryFirstInMs = YearZeroJanuaryFirst.getTime();