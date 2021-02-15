import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, combineLatest, animationFrameScheduler } from 'rxjs';
import { distinctUntilChanged, map, observeOn } from 'rxjs/operators';
import { TickItem } from '../abstraction/tick-item';
import { DatesBetweenGenerator, DayFactor, TickLabeler } from '../abstraction/types';
import { useActivationSwitch } from '../rxjs/activation-switch';
import { valueInRange } from '../rxjs/value-in-range';
import { TimelineState } from '../services/timeline-state.service';
import { TimelineTickVirtualizationService } from '../services/timeline-tick-virtualization.service';
import { TimelineTick } from './timeline-tick';

@Directive({
    selector: '[timelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective extends TimelineTick
{
    public readonly renderedItems: Observable<TickItem[]>;
    public readonly shouldRender : Observable<boolean>;

    constructor(
        public  readonly view      : ViewContainerRef,
        public  readonly template  : TemplateRef<any>,
        private readonly state     : TimelineState,
        private readonly virtualize: TimelineTickVirtualizationService
    )
    {
        super();

        this.shouldRender  = this.shouldRenderFeed();
        this.renderedItems = this.renderedItemsFeed();
    }

    @Input() public set timelineTick            (value: string)                { this.id          .next(value); }
    @Input() public set timelineTickDayFactor   (value: DayFactor)             { this.dayFactor   .next(value); }
    @Input() public set timelineTickDatesBetween(value: DatesBetweenGenerator) { this.datesBetween.next(value); }
    @Input() public set timelineTickMinZoom     (value: number)                { this.minZoom     .next(value); }
    @Input() public set timelineTickMaxZoom     (value: number)                { this.maxZoom     .next(value); }
    @Input() public set timelineTickLabel       (value: TickLabeler)           { this.label       .next(value); }

    private shouldRenderFeed(): Observable<boolean>
    {
        return combineLatest([this.state.zoom, this.minZoom, this.maxZoom]).pipe(
            valueInRange(),
            distinctUntilChanged()
        );
    }

    private renderedItemsFeed(): Observable<TickItem[]>
    {
        return combineLatest([this.label, this.datesBetween, this.dayFactor, this.state.dayWidth, this.state.viewBounds, this.state.ticksBuffer]).pipe(
            // As item generation depends on multiple subjects, generation might be triggered multiple times for the same change.
            // When zooming, for example, viewBounds + width are changed causing at least 2 notifications.
            // The animationFrameScheduler calculates changes just before next browser content repaint, which prevents flickering and hangs,
            // creating a smoother animation.
            observeOn(animationFrameScheduler),
            useActivationSwitch(this.shouldRender),
            map(([label, datesBetween, dayFactor, dayWidth, viewBounds, bufferedTicks]) =>
            {
                const bufferWidth   = viewBounds.width * bufferedTicks;
                const startPosition = viewBounds.left  - bufferWidth;
                const endPosition   = viewBounds.right + bufferWidth;
                
                return this.virtualize.ticksOnScreen(dayWidth, dayFactor, startPosition, endPosition, datesBetween!, label);
            })
        );
    }
}
