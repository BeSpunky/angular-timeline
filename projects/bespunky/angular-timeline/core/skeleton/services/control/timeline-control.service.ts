import { Key } from 'ts-key-enum';
import { ClassProvider, ElementRef, Injectable } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, combineLatest, fromEvent, merge, Observable } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';
import { ViewBounds } from '../render/models/view-bounds';
import { TimelineState } from '../state/timeline-state';
import { useActivationSwitch } from '../../rxjs/activation-switch';
import { TimelineControl } from './timeline-control';

// TODO: Reverse deltas for RTL rendering
@Injectable()
export class TimelineControlService extends TimelineControl
{
    private readonly wheel  : Observable<WheelEvent>;
    private readonly keydown: Observable<KeyboardEvent>;
    
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
        
        this.wheel   = this.wheelFeed();
        this.keydown = this.keydownFeed();

        this.subscribe(this.zoomOnWheelFeed());
        this.subscribe(this.moveOnWheelFeed());
        this.subscribe(this.zoomOnKeyboardFeed());
        this.subscribe(this.moveOnKeyboardFeed());
        this.subscribe(this.viewBoundsFeed());
    }

    private wheelFeed(): Observable<WheelEvent>
    {
        return fromEvent<WheelEvent>(this.element.nativeElement, 'wheel');
    }

    private keydownFeed(): Observable<KeyboardEvent>
    {
        return fromEvent<KeyboardEvent>(document, 'keydown');
    }

    private zoomOnWheelFeed(): Observable<number>
    {
        return this.wheel.pipe(
            useActivationSwitch(this.zoomOnWheel),
            filter(e => e.deltaY !== 0),
            // -delta reverses zooming so in is positive and out is negative
            map(e => [-Math.sign(e.deltaY), e.offsetX]),
            // Movement factor is calculated based on the last size.
            // Zoom factor is calculated based on the zoom level.
            map(([zoomDirection, screenMouseX]) => [zoomDirection, this.calculateViewCenterZoomedToPoint(zoomDirection, screenMouseX)]),
            tap(([, newViewCenter]) => this.state.viewCenter.next(newViewCenter)),
            map(([zoomDirection]) => zoomDirection),
            tap(zoomDirection => this.state.addZoom(zoomDirection)),
        );
    }

    private moveOnWheelFeed(): Observable<number>
    {
        return this.wheel.pipe(
            useActivationSwitch(this.moveOnWheel),
            filter(e => e.deltaX !== 0),
            map(e => Math.round(e.deltaX * this.state.moveDeltaFactor.value)),
            tap(delta => this.state.addViewCenter(delta))
        );
    }

    private zoomOnKeyboardFeed(): Observable<number>
    {
        const keydown = this.keydown.pipe(
            useActivationSwitch(this.zoomOnKeyboard),
            tap(console.log)
        );

        const zoomIn  = keydown.pipe(filter(e => e.key === Key.ArrowUp  ), mapTo(1));
        const zoomOut = keydown.pipe(filter(e => e.key === Key.ArrowDown), mapTo(-1));

        return merge(zoomIn, zoomOut).pipe(
            map(zoomDirection => [zoomDirection, this.calculateViewCenterZoomedToPoint(zoomDirection)]),
            tap(([, newViewCenter]) => this.state.viewCenter.next(newViewCenter)),
            map(([zoomDirection]) => zoomDirection),
            tap(zoomDirection => this.state.addZoom(zoomDirection))
        );
    }    

    private moveOnKeyboardFeed(): Observable<number>
    {
        const keydown = this.keydown.pipe(
            useActivationSwitch(this.moveOnKeyboard)
        );

        const moveRight = keydown.pipe(filter(e => e.key === Key.ArrowLeft ), map(e => -this.getKeyboardModifiedFactor(e)));
        const moveLeft  = keydown.pipe(filter(e => e.key === Key.ArrowRight), map(e => this.getKeyboardModifiedFactor(e)));

        return merge(moveLeft, moveRight).pipe(
            tap(movement => this.state.addViewCenter(movement * 5)) // TODO: Replace 5 with configurable factor subject
        );
    }
    
    private viewBoundsFeed(): Observable<ViewBounds>
    {
        return combineLatest([this.state.viewPortWidth, this.state.viewPortHeight, this.state.zoom, this.state.viewCenter]).pipe(
            map(([viewPortWidth, viewPortHeight, zoom, viewCenter]) => new ViewBounds(viewPortWidth, viewPortHeight, zoom, viewCenter)),
            tap(viewBounds => this.state.viewBounds.next(viewBounds))
        );
    }
    
    private calculateViewCenterZoomedToPoint(zoomDirection: number, zoomedScreenX: number = this.state.viewPortWidth.value / 2): number
    {
        /** The idea is to:
         * 1. Calculate the current distance between the mouse and the viewCenter, so the same distance could be applied later-on.
         * 2. Calculate where the pixel that was under the mouse will be AFTER zooming. This will be the position multiplied by the factor.
         *    If the image grew by 15%, the pixel under the mouse did the same.
         * 3. Subtract the current distance from the new mouse position to receive the new viewCenter.
         */

        let factor = this.state.zoomDeltaFactor.value;
        
        // When zooming out, flip the factor to shrink instead of grow
        if (zoomDirection < 0) factor = 1 / factor;

        /** The current left position of the viewbox relative to the complete drawing. */
        const cameraX = this.state.viewBounds.value.left;
        /** The current center position of the viewbox relative to the complete drawing. */
        const viewCenter = this.state.viewCenter.value;

        /** The mouse position relative to the full drawing. */
        const drawingMouseX   = cameraX + zoomedScreenX;
        /** The distance between the mouse and the center before zooming. This should be kept after zoom. */
        const dxMouseToCenter = drawingMouseX - viewCenter;
        /** The mouse position after zooming. */
        const newMouseX       = drawingMouseX * factor;
        // The new center be relative to the new mouse position after zooming?
        return newMouseX - dxMouseToCenter;
    }

    // TODO: Refactor to make configurable factors as subjects
    private getKeyboardModifiedFactor(event: KeyboardEvent): number
    {
        let factor = 1;

        if (event.altKey  ) factor *= 0.5;
        if (event.ctrlKey ) factor *= 1.5;
        if (event.shiftKey) factor *= 2;

        return factor;
    }
}