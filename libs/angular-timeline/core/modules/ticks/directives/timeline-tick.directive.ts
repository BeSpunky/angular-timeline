import { Observable                                      } from 'rxjs';
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { TimelineCamera, TimelineConfig                                                         } from '@bespunky/angular-timeline/abstraction';
import { TimelineTick, TickItem, DatesBetweenGenerator, DayFactor, TickLabeler, WidthCalculator } from '@bespunky/angular-timeline/abstraction/ticks';
import { TimelineTickVirtualizationService                                                      } from '../services/virtualization/timeline-tick-virtualization.service';

/**
 * Converts an element to a tick template and provides tools for timelines to easily render ticks with
 * automatic virtualization.
 *
 * @export
 * @class TimelineTickDirective
 * @extends {TimelineTick}
 */
@Directive({
    selector: '[bsTimelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective extends TimelineTick
{
    public readonly shouldRender : Observable<boolean>;
    public readonly width        : Observable<WidthCalculator>;
    public readonly itemsToRender: Observable<TickItem[]>;
    
    constructor(
        public  readonly view      : ViewContainerRef,
        public  readonly template  : TemplateRef<unknown>,
        public  readonly config    : TimelineConfig,
        public  readonly camera    : TimelineCamera,
        private readonly virtualize: TimelineTickVirtualizationService
    )
    {
        super();
        
        this.shouldRender  = this.virtualize.shouldRenderFeed(this);
        this.width         = this.virtualize.widthFeed(this);
        this.itemsToRender = this.virtualize.itemsToRenderFeed(this);
    }

    @Input() public set bsTimelineTick            (value: string)                { this.id          .next(value); }
    @Input() public set bsTimelineTickDayFactor   (value: DayFactor)             { this.dayFactor   .next(value); }
    @Input() public set bsTimelineTickDatesBetween(value: DatesBetweenGenerator) { this.datesBetween.next(value); }
    @Input() public set bsTimelineTickMinZoom     (value: number)                { this.minZoom     .next(value); }
    @Input() public set bsTimelineTickMaxZoom     (value: number)                { this.maxZoom     .next(value); }
    @Input() public set bsTimelineTickLabel       (value: TickLabeler)           { this.label       .next(value); }
}
