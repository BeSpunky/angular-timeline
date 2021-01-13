import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { filter, map, mergeMap, tap, windowToggle } from 'rxjs/operators';
import { TimelineState } from './timeline-state.service';

export abstract class TimelineControl
{
    abstract readonly zoomOnWheel    : BehaviorSubject<boolean>;
    abstract readonly zoomDeltaFactor: BehaviorSubject<number>;
}

@Injectable()
export class TimelineControlService extends Destroyable
{
    private readonly wheel: Observable<WheelEvent>;
    
    public readonly zoomOnWheel    : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly zoomDeltaFactor: BehaviorSubject<number>  = new BehaviorSubject(0.1);

    constructor(private state: TimelineState, private element: ElementRef)
    {
        super();

        this.wheel = this.wheelFeed();

        this.subscribe(this.zoomOnWheelFeed());
    }

    // const hWheelEvent = wheelEvent.pipe(filter(e => e.deltaX !== 0), pluck('deltaX'), map(delta => -delta));

    private wheelFeed(): Observable<WheelEvent>
    {
        return fromEvent<WheelEvent>(this.element.nativeElement, 'wheel');
    }

    private zoomOnWheelFeed(): Observable<number>
    {
        const on  = this.zoomOnWheel.pipe(filter(activate => activate));
        const off = this.zoomOnWheel.pipe(filter(activate => !activate));

        return this.wheel.pipe(
            windowToggle(on, () => off),
            mergeMap    (wheel  => wheel),
            filter      (e      => e.deltaY !== 0),
            // -delta reverses zooming so in is positive and out is negative
            map         (e      => Math.round(-e.deltaY * this.zoomDeltaFactor.value)),
            tap         (delta  => this.state.addZoom(delta))
        );
    }
}

export const TimelineControlProvider: ClassProvider = {
    provide : TimelineControl,
    useClass: TimelineControlService
};