import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, fromEvent, merge, Observable, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap, tap, windowToggle } from 'rxjs/operators';
import { TimelineState } from './timeline-state.service';

export abstract class TimelineControl extends Destroyable
{
    abstract readonly zoomOnWheel    : BehaviorSubject<boolean>;
    abstract readonly zoomDeltaFactor: BehaviorSubject<number>;
    abstract readonly moveOnWheel    : BehaviorSubject<boolean>;
    abstract readonly moveDeltaFactor: BehaviorSubject<number>;
}

// TODO: Reverse deltas for RTL rendering

@Injectable()
export class TimelineControlService extends TimelineControl
{
    private readonly wheel: Observable<WheelEvent>;
    
    public readonly zoomOnWheel    : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly zoomDeltaFactor: BehaviorSubject<number>  = new BehaviorSubject(0.1);
    public readonly moveOnWheel    : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly moveDeltaFactor: BehaviorSubject<number>  = new BehaviorSubject(0.2);

    constructor(private state: TimelineState, private element: ElementRef)
    {
        super();

        this.wheel = this.wheelFeed();

        this.subscribe(this.zoomOnWheelFeed());
        this.subscribe(this.moveOnWheelFeed());
    }

    // const hWheelEvent = wheelEvent.pipe(filter(e => e.deltaX !== 0), pluck('deltaX'), map(delta => -delta));

    private wheelFeed(): Observable<WheelEvent>
    {
        return fromEvent<WheelEvent>(this.element.nativeElement, 'wheel');
    }

    private zoomOnWheelFeed(): Observable<number>
    {
        return this.wheel.pipe(
            this.useActivationSwitch(this.zoomOnWheel),
            mergeMap    (wheel  => wheel),
            filter      (e      => e.deltaY !== 0),
            // -delta reverses zooming so in is positive and out is negative
            map         (e      => Math.round(-e.deltaY * this.zoomDeltaFactor.value)),
            tap         (delta  => this.state.addZoom(delta))
        );
    }

    private moveOnWheelFeed(): Observable<number>
    {
        const wheel = this.wheel.pipe(
            this.useActivationSwitch(this.moveOnWheel),
            mergeMap(wheel => wheel)
        );

        const hScroll = wheel.pipe(
            filter(e => e.deltaX !== 0),
            map(e => Math.round(e.deltaX * this.moveDeltaFactor.value)),
        );

        const vScroll = wheel.pipe(
            filter(e => e.deltaY !== 0),
            map(e => Math.round(-e.deltaY * this.moveDeltaFactor.value))
        );

        return merge(hScroll, vScroll).pipe(
            tap(delta => this.state.addViewCenter(delta))
        );
    }

    private useActivationSwitch<T>(observable: Observable<boolean>): OperatorFunction<T, Observable<T>>
    {
        const on  = observable.pipe(filter(activate => activate));
        const off = observable.pipe(filter(activate => !activate));
        
        return windowToggle<T, boolean>(on, () => off);
    }
}

export const TimelineControlProvider: ClassProvider = {
    provide : TimelineControl,
    useClass: TimelineControlService
};