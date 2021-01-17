import { ClassProvider, Injectable, ViewRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface CreatedView
{
    item   : any;
    index  : number;
    context: any;
    view   : ViewRef;
}
    
export abstract class TimelineState
{
    abstract zoom        : BehaviorSubject<number>;
    abstract baseTickSize: BehaviorSubject<number>;
    abstract viewCenter  : BehaviorSubject<number>;

    abstract ticksInView: { [tickLevel: number]: CreatedView[] };

    abstract debouncedZoom(dueTime?: number): Observable<number>;

    abstract addZoom(delta: number)      : void;
    abstract addViewCenter(delta: number): void;
}

@Injectable()
export class TimelineStateService extends TimelineState
{
    public readonly zoom        : BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly baseTickSize: BehaviorSubject<number> = new BehaviorSubject(300);
    public readonly viewCenter  : BehaviorSubject<number> = new BehaviorSubject(0);
    
    public readonly ticksInView: { [tickLevel: number]: CreatedView[] } = { };

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

export const TimelineStateProvider: ClassProvider = {
    provide : TimelineState,
    useClass: TimelineStateService
};