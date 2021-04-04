import { BehaviorSubject } from 'rxjs';
    
export abstract class TimelineConfig
{
    public readonly viewPortWidth       : BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly viewPortHeight      : BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly zoomDeltaFactor     : BehaviorSubject<number> = new BehaviorSubject(1.06);
    public readonly baseTickSize        : BehaviorSubject<number> = new BehaviorSubject(1);
    public readonly virtualizationBuffer: BehaviorSubject<number> = new BehaviorSubject(0.5);
    public readonly moveAmount          : BehaviorSubject<number> = new BehaviorSubject(3);
    
    public readonly zoomOnWheel   : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly moveOnWheel   : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly zoomOnKeyboard: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly moveOnKeyboard: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
}
