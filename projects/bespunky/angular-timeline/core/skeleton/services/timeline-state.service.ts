import { ClassProvider, Injectable, ViewRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TickItem } from '../directives/timeline-tick.directive';
import { TickContext, ViewBounds } from './timeline-renderer.service';

export interface CreatedView
{
    item   : TickItem;
    context: TickContext;
    view   : ViewRef;
}
    
export abstract class TimelineState
{
    abstract readonly viewPortWidth  : BehaviorSubject<number>;
    abstract readonly viewPortHeight : BehaviorSubject<number>;
    abstract readonly zoom           : BehaviorSubject<number>;
    abstract readonly zoomDeltaFactor: BehaviorSubject<number>;
    abstract readonly baseTickSize   : BehaviorSubject<number>;
    abstract readonly bufferedTicks  : BehaviorSubject<number>;
    abstract readonly viewCenter     : BehaviorSubject<number>;
    abstract readonly viewBounds     : BehaviorSubject<ViewBounds>;
    abstract readonly moveDeltaFactor: BehaviorSubject<number>;

    abstract readonly ticksInView: { [tickLevel: number]: CreatedView[] };

    abstract debouncedZoom(dueTime?: number): Observable<number>;

    abstract addZoom(delta: number)      : void;
    abstract addViewCenter(delta: number): void;
}

@Injectable()
export class TimelineStateService extends TimelineState
{
    public readonly viewPortWidth  : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly viewPortHeight : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly zoom           : BehaviorSubject<number>     = new BehaviorSubject(1);
    public readonly zoomDeltaFactor: BehaviorSubject<number>     = new BehaviorSubject(1.01);
    public readonly baseTickSize   : BehaviorSubject<number>     = new BehaviorSubject(300);
    public readonly bufferedTicks  : BehaviorSubject<number>     = new BehaviorSubject(2);
    public readonly viewCenter     : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly viewBounds     : BehaviorSubject<ViewBounds> = new BehaviorSubject(new ViewBounds(0, 0, 0, 0));
    public readonly moveDeltaFactor: BehaviorSubject<number>     = new BehaviorSubject(0.2);
    
    public readonly ticksInView: { [tickLevel: number]: CreatedView[] } = { };

    constructor()
    {
        super();
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

export const TimelineStateProvider: ClassProvider = {
    provide : TimelineState,
    useClass: TimelineStateService
};