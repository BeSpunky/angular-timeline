import { BehaviorSubject, Observable } from 'rxjs';
import { ViewBounds } from '../../view-models/view-bounds';
    
export abstract class TimelineState
{
    public readonly viewPortWidth       : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly viewPortHeight      : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly zoom                : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly zoomDeltaFactor     : BehaviorSubject<number>     = new BehaviorSubject(1.06);
    public readonly baseTickSize        : BehaviorSubject<number>     = new BehaviorSubject(1);
    public readonly virtualizationBuffer: BehaviorSubject<number>     = new BehaviorSubject(0.5);
    public readonly viewCenter          : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly viewBounds          : BehaviorSubject<ViewBounds> = new BehaviorSubject(new ViewBounds(0, 0, 0, 0));
    public readonly moveDeltaFactor     : BehaviorSubject<number>     = new BehaviorSubject(0.2);
    
    abstract readonly dayWidth: Observable<number>;

    abstract debouncedZoom(dueTime?: number): Observable<number>;

    abstract addZoom(delta: number)      : void;
    abstract addViewCenter(delta: number): void;
}
