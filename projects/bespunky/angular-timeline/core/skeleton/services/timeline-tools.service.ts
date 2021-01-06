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
}
