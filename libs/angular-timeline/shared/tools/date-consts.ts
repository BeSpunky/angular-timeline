import { UnfuckedDate } from './unfucked-date';

export const MillisecondsInADay       = 24 * 60 * 60 * 1000;
export const YearZeroJanuaryFirst     = new UnfuckedDate(0);
export const YearZeroJanuaryFirstInMs = YearZeroJanuaryFirst.getTime();

/**
 * The largest value of milliseconds an ECMAScript Date object can work with.
 * See https://262.ecma-international.org/5.1/#sec-15.9.1.1
 */
export const MaxDateInMs = 8_640_000_000_000_000;
/**
 * The lowest value of milliseconds an ECMAScript Date object can work with.
 * See https://262.ecma-international.org/5.1/#sec-15.9.1.1
 */
export const MinDateInMs = -MaxDateInMs;