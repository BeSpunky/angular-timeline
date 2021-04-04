import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, take    } from 'rxjs/operators';
import { Injectable                } from '@angular/core';

import { TimelineConfig, TimelineCamera, ViewBounds } from '@bespunky/angular-timeline/abstraction';
import { TimelineLocationService                    } from '@bespunky/angular-timeline/shared';

@Injectable()
export class TimelineCameraService extends TimelineCamera
{
    public readonly viewBounds: Observable<ViewBounds>;
    public readonly dayWidth  : Observable<number>;

    constructor(private config: TimelineConfig, private location: TimelineLocationService)
    {
        super();

        this.viewBounds = this.viewBoundsFeed();
        this.dayWidth   = this.dayWidthFeed();
    }
    
    private viewBoundsFeed(): Observable<ViewBounds>
    {
        return combineLatest([this.config.viewPortWidth, this.config.viewPortHeight, this.zoomLevel, this.viewCenter]).pipe(
            map(([viewPortWidth, viewPortHeight, zoomLevel, viewCenter]) => new ViewBounds(viewPortWidth, viewPortHeight, zoomLevel, viewCenter)),
            shareReplay(1)
        );
    }
    
    /**
     * Creates a stream that notifies of changes to the width of the one day in pixels.
     * The width is determined by `baseTickSize`, `zoom` and `zoomDeltaFactor`.
     * 
     * @see /skeleton/services/control/readme.md for more information about zooming.
     *
     * @private
     * @param {TimelineTick} tick The tick scale for which to create the stream.
     * @returns {Observable<number>} A stream that notifies of changes to the width of the one day in pixels.
     */
    private dayWidthFeed(): Observable<number>
    {
        return combineLatest([this.config.baseTickSize, this.config.zoomDeltaFactor, this.zoomLevel]).pipe(
            map(([baseTickSize, zoomDeltaFactor, zoomLevel]) => baseTickSize * Math.pow(zoomDeltaFactor, zoomLevel)),
            // Make this observable remember and stream the latest value to each new subscriber.
            // This way the width can be resolved instantly when the value is needed for some immidiate calcualtion
            // like in TimelineCamera.moveTo().
            shareReplay(1)
        );
    }
    
    public move(amount: number): void
    {
        this.addAmount(this.viewCenter, amount);
    }
    
    public moveTo(date: Date): void;
    public moveTo(position: number): void;
    public moveTo(dateOrPosition: number | Date): void
    {
        dateOrPosition instanceof Date ? this.moveToDate(dateOrPosition) : this.moveToPosition(dateOrPosition);
    }
    
    private moveToPosition(position: number): void
    {
        this.viewCenter.next(position);
    }

    private moveToDate(date: Date): void
    {
        this.dateToPosition(date).subscribe(this.moveToPosition.bind(this));
    }

    public zoom(amount: number): void
    {
        this.addAmount(this.zoomLevel, amount);
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
        let zoomFactor = this.config.zoomDeltaFactor.value;
        
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
        const viewCenter = this.viewCenter.value;

        /** The distance between the position and the center before zooming. This should be kept after zoom. */
        const dxPositionToCenter = position - viewCenter;
        /** The new position of the pixel under the specified point AFTER zooming. */
        const newPosition        = position * zoomedBy;
        // The new center be relative to the new position after zooming
        return newPosition - dxPositionToCenter;
    }

    private dateToPosition(date: Date): Observable<number>
    {
        return this.dayWidth.pipe(
            take(1),
            map(dayWidth => this.location.dateToPosition(dayWidth, date))
        );
    }
}
