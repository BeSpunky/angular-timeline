import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { TimelineLocationService } from '../location/timeline-location.service';
import { TimelineState } from '../state/timeline-state';
import { TimelineCamera } from './timeline-camera';

@Injectable()
export class TimelineCameraService extends TimelineCamera
{
    constructor(private state: TimelineState, private location: TimelineLocationService)
    {
        super();
    }
    
    public move(amount: number): void
    {
        this.state.addViewCenter(amount);
    }
    
    public moveTo(date: Date): void;
    public moveTo(position: number): void;
    public moveTo(dateOrPosition: number | Date): void
    {
        dateOrPosition instanceof Date ? this.moveToDate(dateOrPosition) : this.moveToPosition(dateOrPosition);
    }
    
    private moveToPosition(position: number): void
    {
        this.state.viewCenter.next(position);
    }

    private moveToDate(date: Date): void
    {
        this.dateToPosition(date).subscribe(this.moveToPosition.bind(this));
    }

    public zoom(amount: number): void
    {
        this.state.addZoom(amount);
    }
    
    public zoomOn(date: Date, amount: number): void;
    public zoomOn(position: number, amount: number): void;
    public zoomOn(positionOrDate: number | Date, amount: number): void
    {
        positionOrDate instanceof Date ? this.zoomOnDate(positionOrDate, amount) : this.zoomOnPosition(positionOrDate, amount);
    }

    private zoomOnPosition(position: number, amount: number): void
    {
        this.zoom(amount);

        const zoomFactor = this.calculateZoomFactor(Math.sign(amount));
        
        this.moveToPosition(this.calculateViewCenterZoomedToPosition(position, zoomFactor * amount));
    }

    private zoomOnDate(date: Date, amount: number): void
    {
        this.dateToPosition(date).subscribe(position => this.zoomOnPosition(position, amount));
    }

    private calculateZoomFactor(zoomDirection: number): number
    {
        let zoomFactor = this.state.zoomDeltaFactor.value;
        
        // When zooming out, flip the factor to shrink instead of grow
        if (zoomDirection < 0) zoomFactor = 1 / zoomFactor;

        return zoomFactor;
    }

    private calculateViewCenterZoomedToPosition(position: number, zoomedBy: number): number
    {
        /** The idea is to:
         * 1. Calculate the current distance between the mouse and the viewCenter, so the same distance could be applied later-on.
         * 2. Calculate where the pixel that was under the mouse will be AFTER zooming. This will be the position multiplied by the factor.
         *    If the image grew by 15%, the pixel under the mouse did the same.
         * 3. Subtract the current distance from the new mouse position to receive the new viewCenter.
         */

        /** The current left position of the viewbox relative to the complete drawing. */
        const cameraX    = this.state.viewBounds.value.left;
        /** The current center position of the viewbox relative to the complete drawing. */
        const viewCenter = this.state.viewCenter.value;

        /** The mouse position relative to the full drawing. */
        const drawingMouseX   = cameraX + position;
        /** The distance between the mouse and the center before zooming. This should be kept after zoom. */
        const dxMouseToCenter = drawingMouseX - viewCenter;
        /** The mouse position after zooming. */
        const newMouseX       = drawingMouseX * zoomedBy;
        // The new center be relative to the new mouse position after zooming?
        return newMouseX - dxMouseToCenter;
    }

    private dateToPosition(date: Date): Observable<number>
    {
        return this.state.dayWidth.pipe(
            take(1),
            map(dayWidth => this.location.dateToPosition(dayWidth, date))
        );
    }
}
