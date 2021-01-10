import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TimelineToolsService
{
    public range(from: number, to: number): number[]
    {
        return Array.from({ length: to - from }, (_, index) => from + index);
    }

    public duplicateMap<T extends any, R extends any>(items: T[], times: number, map: (item: T, index: number) => R): R[]
    {
        // The first generated item in the range is 1 (not 0) to accomodadte the accumulated index calculation.
        // That's why the last item should be `times + 1`
        return this.range(1, times + 1).reduce(all =>
        {
            return [...all, ...items.map((item, index) => map(item, all.length + index))]
        }, [] as R[]);
    }
}
