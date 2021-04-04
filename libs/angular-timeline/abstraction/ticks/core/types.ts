export type TickLabeler           = (value: any) => string | number;

export type DatesBetweenGenerator = (start: Date, end: Date) => Date[];

export type DayFactor             = number | ((date: Date) => number);

export type WidthCalculator       = (date: Date) => number;