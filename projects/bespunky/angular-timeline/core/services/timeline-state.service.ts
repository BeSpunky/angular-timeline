import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Injectable()
export class TimelineStateService
{
    public zoom: BehaviorSubject<number> = new BehaviorSubject(0);

    public debouncedZoom(dueTime: number = 200): Observable<number>
    {
        return this.zoom.pipe(
            debounceTime(dueTime),
            distinctUntilChanged()
        );
    }
}
