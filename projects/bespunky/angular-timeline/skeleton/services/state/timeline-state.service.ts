import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { TimelineState } from './timeline-state';

@Injectable()
export class TimelineStateService extends TimelineState
{     
    public readonly dayWidth: Observable<number>;

    constructor()
    {
        super();

        this.dayWidth = this.dayWidthFeed();
    }

    private dayWidthFeed(): Observable<number>
    {
        return combineLatest([this.baseTickSize, this.zoom, this.zoomDeltaFactor]).pipe(
            map(([baseTickSize, zoom, zoomDeltaFactor]) => baseTickSize * Math.pow(zoomDeltaFactor, zoom - 1))
        );
    }

    public debouncedZoom(dueTime: number = 200): Observable<number>
    {
        return this.zoom.pipe(
            debounceTime(dueTime),
            distinctUntilChanged()
        );
    }

    public addZoom(delta: number): void
    {
        this.addDelta(this.zoom, delta);
    }

    public addViewCenter(delta: number): void
    {
        this.addDelta(this.viewCenter, delta);
    }

    private addDelta(observable: BehaviorSubject<number>, delta: number): void
    {
        observable.next(observable.value + delta);
    }
}
