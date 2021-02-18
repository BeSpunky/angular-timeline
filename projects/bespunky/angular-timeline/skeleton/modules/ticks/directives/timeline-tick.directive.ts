import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { TickItem } from '../view-models/tick-item';
import { DatesBetweenGenerator, DayFactor, TickLabeler, WidthCalculator } from '../view-models/types';
import { TimelineTickVirtualizationService } from '../services/virtualization/timeline-tick-virtualization.service';
import { TimelineTick } from './timeline-tick';
import { TimelineState } from '../../../services/state/timeline-state';

/**
 * Converts an element to a tick template and provides tools for timelines to easily render ticks with
 * automatic virtualization.
 *
 * @export
 * @class TimelineTickDirective
 * @extends {TimelineTick}
 */
@Directive({
    selector: '[timelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective extends TimelineTick
{
    public readonly shouldRender : Observable<boolean>;
    public readonly width        : Observable<WidthCalculator>;
    public readonly itemsToRender: Observable<TickItem[]>;
    
    constructor(
        public  readonly view      : ViewContainerRef,
        public  readonly template  : TemplateRef<any>,
        public  readonly state     : TimelineState,
        private readonly virtualize: TimelineTickVirtualizationService
    )
    {
        super();

        this.shouldRender  = this.virtualize.shouldRenderFeed(this);
        this.width         = this.virtualize.widthFeed(this);
        this.itemsToRender = this.virtualize.itemsToRenderFeed(this);
    }

    @Input() public set timelineTick            (value: string)                { this.id          .next(value); }
    @Input() public set timelineTickDayFactor   (value: DayFactor)             { this.dayFactor   .next(value); }
    @Input() public set timelineTickDatesBetween(value: DatesBetweenGenerator) { this.datesBetween.next(value); }
    @Input() public set timelineTickMinZoom     (value: number)                { this.minZoom     .next(value); }
    @Input() public set timelineTickMaxZoom     (value: number)                { this.maxZoom     .next(value); }
    @Input() public set timelineTickLabel       (value: TickLabeler)           { this.label       .next(value); }
}
