import { subYears } from 'date-fns';

export class UnfuckedDate extends Date
{
    constructor(y: number, m: number = 0, d: number = 1, h: number = 0, mm: number = 0, s: number = 0, ms: number = 0)
    {
        super(Date.UTC(y, m, d, h, mm, s, ms));

        // If the Date object fucked me with the years, compensate. Otherwise, return the date as created.
        return 0 <= y && y <= 99 ? subYears(this, 1900) : this;
    }
}