import { Observable } from 'rxjs';
import { map, take  } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { TimelineState           } from '@bespunky/angular-timeline/state';
import { TimelineLocationService } from '@bespunky/angular-timeline/shared';
import { TimelineCamera          } from './timeline-camera';

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
    public zoomOn(positionOrDate: number | Date, amount: number): void;
    public zoomOn(positionOrDate: number | Date, amount: number): void
    {
        positionOrDate instanceof Date ? this.zoomOnDate(positionOrDate, amount) : this.zoomOnPosition(positionOrDate, amount);
    }

    private zoomOnPosition(position: number, amount: number): void
    {
        this.zoom(amount);

        const zoomFactor = this.calculateZoomFactor(Math.sign(amount));
        
        this.moveToPosition(this.calculateViewCenterZoomedToPosition(position, zoomFactor * Math.abs(amount)));
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
         * 1. Calculate the current distance between the position and the viewCenter, so the same distance could be applied later-on.
         * 2. Calculate where the pixel that was under the position will be AFTER zooming.
         *    This will be the position multiplied by the factor.
         *    If the image grew by 15%, the pixel under the position did the same.
         * 3. Subtract the current distance from the new position to receive the new viewCenter.
         */

        /** The current center position of the viewbox relative to the complete drawing. */
        const viewCenter = this.state.viewCenter.value;

        /** The distance between the position and the center before zooming. This should be kept after zoom. */
        const dxPositionToCenter = position - viewCenter;
        /** The new position of the pixel under the specified point AFTER zooming. */
        const newPosition        = position * zoomedBy;
        // The new center be relative to the new position after zooming
        return newPosition - dxPositionToCenter;
    }

    private dateToPosition(date: Date): Observable<number>
    {
        return this.state.dayWidth.pipe(
            take(1),
            map(dayWidth => this.location.dateToPosition(dayWidth, date))
        );
    }
}
