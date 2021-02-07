import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, combineLatest, fromEvent, merge, Observable, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap, tap, windowToggle } from 'rxjs/operators';
import { ViewBounds } from './timeline-renderer.service';
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
    public readonly zoomDeltaFactor: BehaviorSubject<number>  = new BehaviorSubject(1.01);
    public readonly moveOnWheel    : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly moveDeltaFactor: BehaviorSubject<number>  = new BehaviorSubject(0.2);

    constructor(private state: TimelineState, private element: ElementRef)
    {
        super();

        /**
         * View bounds are controlled by zoom, viewCenter, and resizing of the element (or screen).
         * 
         * On user interaction (i.e. scroll, pinch, drag, etc.) the service updates the relevant subject in the state service.
         * The change in state is recognized by the viewBoundsFeed, which creates and stores the new view bounds in the state service.
         * 
         * 1. User interaction detected -> translate values -> update state
         * 2. State updated -> create new view bounds -> update state
         */
        
        this.wheel = this.wheelFeed();

        this.subscribe(this.zoomOnWheelFeed());
        this.subscribe(this.moveOnWheelFeed());
        this.subscribe(this.viewBoundsFeed());
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
            mergeMap(wheel => wheel),
            filter(e => e.deltaY !== 0),
            // -delta reverses zooming so in is positive and out is negative
            map(e => [
                -Math.sign(e.deltaY),
                this.state.viewBounds.value.left,
                this.state.viewCenter.value,
                e.offsetX,
                this.zoomDeltaFactor.value
            ]),
            map(([zoomDirection, cameraX, viewCenter, screenMouseX, zoomDeltaFactor]) =>
            {
                // Movement factor is calculated based on the last size.
                // Zoom factor is calculated based on the zoom level.

                let factor = zoomDeltaFactor;
                
                if (zoomDirection < 0) factor = 1 / factor;

                /** The mouse position relative to the full drawing. */
                const drawingMouseX   = cameraX + screenMouseX;
                // What is the current distance between the mouse and the center before zooming?
                const dxMouseToCenter = drawingMouseX - viewCenter;
                // Where will the mouse be after zooming?
                const newMouseX       = drawingMouseX * factor;
                // Where should the new center be relative to the new mouse position after zooming?
                const newViewCenter   = newMouseX - dxMouseToCenter;
                
                this.state.viewCenter.next(newViewCenter);

                return zoomDirection;
            }),
            tap(zoomDirection => this.state.addZoom(zoomDirection)),
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

        // const vScroll = wheel.pipe(
        //     filter(e => e.deltaY !== 0),
        //     map(e => Math.round(-e.deltaY * this.moveDeltaFactor.value))
        // );

        return merge(hScroll).pipe(
            tap(delta => this.state.addViewCenter(delta))
        );
    }
    
    private viewBoundsFeed(): Observable<ViewBounds>
    {
        return combineLatest([this.state.viewPortWidth, this.state.viewPortHeight, this.state.zoom, this.state.viewCenter]).pipe(
            map(([viewPortWidth, viewPortHeight, zoom, viewCenter]) => new ViewBounds(viewPortWidth, viewPortHeight, zoom, viewCenter)),
            tap(viewBounds => this.state.viewBounds.next(viewBounds))
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