import { Key } from 'ts-key-enum';
import { ElementRef, Injectable } from '@angular/core';
import { combineLatest, fromEvent, merge, Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

import { useActivationSwitch } from '@bespunky/angular-timeline/helpers';
import { ViewBounds } from '../../view-models/view-bounds';
import { TimelineState } from '../state/timeline-state';
import { TimelineControl } from './timeline-control';
import { TimelineCamera } from '../camera/timeline-camera';

type EventWithModifiers                             = { ctrlKey: boolean, altKey: boolean, shiftKey: boolean, [value: string]: any };
type AcceleratedEvent<T extends EventWithModifiers> = [event: T, amount: number];
type CameraZoomParams                               = [position: number | Date, amount: number];

/**
 ** Read Readme.md to understand how zooming works.
 **/

// TODO: Reverse deltas for RTL rendering
@Injectable()
export class TimelineControlService extends TimelineControl
{
    private readonly wheel  : Observable<WheelEvent>;
    private readonly keydown: Observable<KeyboardEvent>;
    
    constructor(private state: TimelineState, private camera: TimelineCamera, private element: ElementRef)
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
        
        this.wheel   = this.wheelFeed();
        this.keydown = this.keydownFeed();

        this.subscribe(this.zoomOnWheelFeed());
        this.subscribe(this.moveOnWheelFeed());
        this.subscribe(this.zoomOnKeyboardFeed());
        this.subscribe(this.moveOnKeyboardFeed());
        this.subscribe(this.viewBoundsFeed());
    }

    private moveCamera<T extends EventWithModifiers>(getAmount: (event: T) => number): UnaryFunction<Observable<T>, Observable<AcceleratedEvent<T>>>
    {
        return pipe(
            this.accelerateWithKeyboard<T>(getAmount),
            tap(([e, amount]) => this.camera.move(amount))
        );
    }

    private zoomCamera<T extends EventWithModifiers>(getPosition: (event: T, viewBounds: ViewBounds) => number, getAmount: (event: T) => number): UnaryFunction<Observable<T>, Observable<CameraZoomParams>>
    {
        return pipe(
            this.accelerateWithKeyboard<T>(getAmount),
            withLatestFrom(this.state.viewBounds),
            map(([[e, amount], viewBounds]) => [getPosition(e, viewBounds), amount] as CameraZoomParams),
            tap(([position, amount]) => this.camera.zoomOn(position, amount))
        );
    }

    private accelerateWithKeyboard<T extends EventWithModifiers>(getAmount: (event: T) => number): OperatorFunction<T, AcceleratedEvent<T>>
    {
        return map<T, AcceleratedEvent<T>>(event =>
        {
            let amount = getAmount(event);
                
            // TODO: Refactor to make configurable factors as subjects
            if (event.altKey  ) amount *= 0.5;
            if (event.ctrlKey ) amount *= 1.5;
            if (event.shiftKey) amount *= 2;
            
            return [event, amount];
        });
    }

    private wheelFeed(): Observable<WheelEvent>
    {
        return fromEvent<WheelEvent>(this.element.nativeElement, 'wheel');
    }

    private keydownFeed(): Observable<KeyboardEvent>
    {
        return fromEvent<KeyboardEvent>(document, 'keydown');
    }

    private zoomOnWheelFeed(): Observable<CameraZoomParams>
    {
        return this.wheel.pipe(
            useActivationSwitch(this.zoomOnWheel),
            filter(e => e.deltaY !== 0),
            this.zoomCamera(
                // Calculate the mouse position relative to the drawing (not the viewport).
                (e, viewBounds) => viewBounds.left + e.offsetX,
                // Reverse deltaY so zooming in is positive and out is negative.
                e               => -Math.sign(e.deltaY))
        );
    }

    private moveOnWheelFeed(): Observable<AcceleratedEvent<WheelEvent>>
    {
        return this.wheel.pipe(
            useActivationSwitch(this.moveOnWheel),
            filter(e => e.deltaX !== 0),
            this.moveCamera(e => Math.sign(e.deltaX) * this.state.moveAmount.value)
        );
    }

    private zoomOnKeyboardFeed(): Observable<CameraZoomParams>
    {
        const keydown = this.keydown.pipe(useActivationSwitch(this.zoomOnKeyboard));

        const zoomIn  = keydown.pipe(filter(e => e.key === Key.ArrowUp  ), tap((e: any) => e.zoomAmount =  1));
        const zoomOut = keydown.pipe(filter(e => e.key === Key.ArrowDown), tap((e: any) => e.zoomAmount = -1));
        
        return merge(zoomIn, zoomOut).pipe(
            this.zoomCamera(
                // There is no mouse point or anything so zoom around the center of the view
                (_, viewBounds) => viewBounds.viewCenter,
                e               => e.zoomAmount
            )
        );
    }

    private moveOnKeyboardFeed(): Observable<AcceleratedEvent<KeyboardEvent>>
    {
        const keydown = this.keydown.pipe(
            useActivationSwitch(this.moveOnKeyboard)
        );

        const moveRight = keydown.pipe(filter(e => e.key === Key.ArrowLeft ), tap((e: any) => e.moveAmount = -this.state.moveAmount.value));
        const moveLeft  = keydown.pipe(filter(e => e.key === Key.ArrowRight), tap((e: any) => e.moveAmount =  this.state.moveAmount.value));

        return merge(moveLeft, moveRight).pipe(
            this.moveCamera((e: any) => e.moveAmount * this.state.moveAmount.value)
        );
    }
    
    private viewBoundsFeed(): Observable<ViewBounds>
    {
        return combineLatest([this.state.viewPortWidth, this.state.viewPortHeight, this.state.zoom, this.state.viewCenter]).pipe(
            map(([viewPortWidth, viewPortHeight, zoom, viewCenter]) => new ViewBounds(viewPortWidth, viewPortHeight, zoom, viewCenter)),
            tap(viewBounds => this.state.viewBounds.next(viewBounds))
        );
    }
}