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

    /**
     * Creates a stream that notifies of changes to the width of the one day in pixels.
     * The width is determined by `baseTickSize`, `zoom` and `zoomDeltaFactor`.
     * 
     * @see /skeleton/services/control/readme.md for more information about zooming.
     *
     * @private
     * @param {TimelineTick} tick The tick scale for which to create the stream.
     * @returns {Observable<number>} A stream that notifies of changes to the width of the one day in pixels.
     */
    private dayWidthFeed(): Observable<number>
    {
        return combineLatest([this.baseTickSize, this.zoom, this.zoomDeltaFactor]).pipe(
            map(([baseTickSize, zoom, zoomDeltaFactor]) => baseTickSize * Math.pow(zoomDeltaFactor, zoom))
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
