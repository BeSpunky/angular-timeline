import { eachYearOfInterval, eachMonthOfInterval, eachDayOfInterval, eachHourOfInterval, subYears, differenceInMinutes, addMinutes } from 'date-fns';

(function dynamicTickItemsReverse()
{
    const date = (yOrDate: number | Date, m: number = 0, d: number = 1, h: number = 0, mm: number = 0, s: number = 0, ms: number = 0) =>
    {
        let x = yOrDate instanceof Date ? yOrDate : new Date(Date.UTC(yOrDate, m, d, h, mm, s, ms));
        
        if (0 <= yOrDate && yOrDate <= 99)
            return subYears(x, 1900);
            
        return x;
    };
    
    const zero = date(0).getTime();  /*? new Date($)*/
    
    function testDateGenerator()
    {
        const mini = -9000;
        const max = 8000;

        // Generates dates using date() and checks that the result matches the specified values
        const va = Array.from({ length: max - mini }, (_, index) =>
        {
            const y = mini + index;
            const m = 11;
            const d = 15;

            return ({ date: date(y, m, d), y, m, d });
        })
            .filter(x => x.date.getDate() !== x.d || x.date.getMonth() !== x.m || x.date.getFullYear() !== x.y)
            .map(bug => ({ d: bug.d, day: bug.date.getDate(), m: bug.m, month: bug.date.getMonth(), y: bug.y, year: bug.date.getFullYear() }));
    
        // Should be empty
        va;
    }

    const daysSinceZero = (yOrDate: number | Date, m: number = 0, d: number = 1, h: number = 0, mm: number = 0, s: number = 0, ms: number = 0) => ((date(yOrDate, m, d, h, mm, s, ms).getTime() - zero) / 1000 / 60 / 60 / 24);
    const daysInMonth   = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const daysInYear    = (y: number) => y % 400 === 0 || (y % 100 !== 0 && y % 4 === 0) ? 366 : 365;

    daysSinceZero(0)/*?*/;
    daysSinceZero(1)/*?*/;
    daysSinceZero(2)/*?*/;

    const dayWidth = 1;
    const year     = 0;
    const day      = 15;
    const hr       = 12;
    const min      = 30;

    const minuteWidth = ()                     => hourWidth() / 60;
    const hourWidth   = ()                     => dayWidth / 24;
    const monthWidth  = (y: number, m: number) => dayWidth * daysInMonth(y, m);
    const yearWidth   = (y: number)            => dayWidth * daysInYear(y);

    const dateToPosition = (yOrDate: number | Date, m?: number, d?: number, h?: number, mm?: number, s?: number, ms?: number) => dayWidth * daysSinceZero(yOrDate, m, d, h, mm, s, ms);

    const positionToDate = (position: number) => new Date(new Date(position * 24 * 60 * 60 * 1000 / dayWidth).getTime() + zero);
    
    positionToDate(0);/*?*/
    
    const closestMinuteDaysFromZero = (position: number) =>
    {
        const date = positionToDate(position);
        return dateToPosition(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
    };
    const closestHourDaysFromZero   = (position: number) =>
    {
        const date = positionToDate(position);
        return dateToPosition(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
    };
    const closestDayDaysFromZero    = (position: number) =>
    {
        const date = positionToDate(position);
        return dateToPosition(date.getFullYear(), date.getMonth(), date.getDate());
    };
    const closestMonthDaysFromZero  = (position: number) =>
    {
        const date = positionToDate(position);
        return dateToPosition(date.getFullYear(), date.getMonth());
    };
    const closestYearDaysFromZero   = (position: number) =>
    {
        const date = positionToDate(position);
        return dateToPosition(date.getFullYear());
    };
    
    const r = (x: number) => Math.round(x * 1000) / 1000;

    const testDateToPosition = (month: number) =>
    {
        r(yearWidth  (year));/*?*/
        r(monthWidth (year, month));/*?*/
        r(dayWidth   );/*?*/
        r(hourWidth  ());/*?*/
        r(minuteWidth());/*?*/

        r(dateToPosition(year                     ));/*?*/
        r(dateToPosition(year, month              ));/*?*/
        r(dateToPosition(year, month, day         ));/*?*/
        r(dateToPosition(year, month, day, hr     ));/*?*/
        r(dateToPosition(year, month, day, hr, min));/*?*/
    };

    const testClosets = (position: number) =>
    {
        positionToDate             (position )/*? $.toISOString()*/;
        r(closestYearDaysFromZero  (position))/*?*/;
        r(closestMonthDaysFromZero (position))/*?*/;
        r(closestDayDaysFromZero   (position))/*?*/;
        r(closestHourDaysFromZero  (position))/*?*/;
        r(closestMinuteDaysFromZero(position))/*?*/;
    };

    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(month => testDateToPosition(month));

    [-3, -2, -1, 0, 1, 2, 3].forEach(position => testClosets(position));

    const screenWidth  = 10;
    const daysOnScreen = screenWidth / dayWidth;      /*?*/
    const position     = 5;
    const left         = position - screenWidth / 2;  /*?*/
    const right        = position + screenWidth / 2;  /*?*/
    
    // ! Buffer should be expressed in percentage of screen width. 50% of buffer means twice as much ticks (50% to the left, 50% to the right)
    const virtualize = (each: (interval: Interval) => Date[]) =>
    {
        return each({
            start: positionToDate(left)/*? */,
            end  : positionToDate(right)/*? */
        })/*? */.map(date => r(dateToPosition(date)));
    };

    virtualize(eachYearOfInterval); /*?*/
    virtualize(eachMonthOfInterval);/*?*/
    virtualize(eachDayOfInterval);  /*?*/
    virtualize(eachHourOfInterval); /*?*/
    virtualize(({ start, end }) => Array.from({ length: (differenceInMinutes(start, end)) }, (_, minIndex) => addMinutes(start, minIndex)));/*?*/
})();