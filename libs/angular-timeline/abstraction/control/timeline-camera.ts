import { BehaviorSubject, Observable } from 'rxjs';

import { ViewBounds } from './view-bounds';

export abstract class TimelineCamera
{
    public readonly zoomLevel : BehaviorSubject<number>     = new BehaviorSubject(0);
    public readonly viewCenter: BehaviorSubject<number>     = new BehaviorSubject(0);
    
    abstract readonly viewBounds: Observable<ViewBounds>;
    abstract readonly dayWidth  : Observable<number>;
    
    abstract move  (amount: number)                               : void;
    abstract moveTo(date: Date)                                   : void;
    abstract moveTo(position: number)                             : void;
    abstract moveTo(positionOrDate: number | Date)                : void;
    abstract zoom  (amount: number)                               : void;
    abstract zoomOn(date: Date, amount: number)                   : void;
    abstract zoomOn(position: number, amount: number)             : void;
    abstract zoomOn(positionOrDate: number | Date, amount: number): void;
    
    public setZoom(zoomLevel: number): void
    {
        this.zoomLevel.next(zoomLevel);
    }

    public setViewCenter(viewCenter: number): void
    {
        this.viewCenter.next(viewCenter);
    }

    protected addAmount(subject: BehaviorSubject<number>, amount: number): void
    {
        subject.next(subject.value + amount);
    }
}
