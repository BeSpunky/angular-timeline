(function dynamicTickItems()
{
    const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

    const baseYearWidth = 2000;
    const year = 2021;
    // const month         = 1;
    const day = 2;
    const hr = 11;
    const min = 11;

    const yearWidth   = (yW: number) => yW;
    const monthWidth  = (yW: number) => yW / 12;
    const dayWidth    = (y: number, m: number, yW: number) => monthWidth(yW) / daysInMonth(y, m);
    const hourWidth   = (y: number, m: number, yW: number) => dayWidth(y, m, yW) / 24;
    const minuteWidth = (y: number, m: number, yW: number) => hourWidth(y, m, yW) / 60;

    const yearPosition   = (y: number, yW: number) => yearWidth(yW) * y;
    const monthPosition  = (y: number, m: number, yW: number) => yearPosition(y, yW) + monthWidth(yW) * m
    const dayPosition    = (y: number, m: number, d: number, yW: number) => monthPosition(y, m, yW) + dayWidth(y, m, yW) * d;
    const hourPosition   = (y: number, m: number, d: number, hr: number, yW: number) => dayPosition(y, m, d, yW) + hourWidth(y, m, yW) * hr;
    const minutePosition = (y: number, m: number, d: number, hr: number, min: number, yW: number) => hourPosition(y, m, d, hr, yW) + minuteWidth(y, m, yW) * min;

    const test = (month: number) =>
    {
        Math.round(yearWidth(baseYearWidth) * 100) / 100;/*?*/
        Math.round(monthWidth(baseYearWidth) * 100) / 100;/*?*/
        Math.round(dayWidth(year, month, baseYearWidth) * 100) / 100;/*?*/
        Math.round(hourWidth(year, month, baseYearWidth) * 100) / 100;/*?*/
        Math.round(minuteWidth(year, month, baseYearWidth) * 100) / 100;/*?*/

        Math.round(yearPosition(year, baseYearWidth) * 100) / 100;/*?*/
        Math.round(monthPosition(year, month, baseYearWidth) * 100) / 100;/*?*/
        Math.round(dayPosition(year, month, day, baseYearWidth) * 100) / 100;/*?*/
        Math.round(hourPosition(year, month, day, hr, baseYearWidth) * 100) / 100;/*?*/
        Math.round(minutePosition(year, month, day, hr, min, baseYearWidth) * 100) / 100;/*?*/
    }

    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(month => test(month));

    /*
        width =
            if !parent -> baseWidth / (itemCount(...) -> 1)
            else       -> parentWidth(...) / itemCount(...)
    
    
        position = 
            if !parent -> width() * index
            else       -> parentPosition(index) + width(..., index)
    */
})()