import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, Input, QueryList, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { TimelineRenderer, TimelineRendererService } from '../services/timeline-renderer.service';
import { TimelineState, TimelineStateService } from '../services/timeline-state.service';
import { TimelineTicks, TimelineTicksDirective } from './timeline-ticks.directive';

@Directive({
    selector : '[timeline]',
    exportAs : 'timeline'
})
export class TimelineDirective extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTicksDirective) public tickDefinitions!: QueryList<TimelineTicks>;
    
    constructor(
        public  state   : TimelineState,
        private renderer: TimelineRenderer
    )
    {
        super();
    }

    ngAfterViewInit()
    {
        setTimeout(() => this.tickDefinitions.forEach((ticks, index) => this.observeTick(ticks, index)), 0);
    }

    private observeTick(ticks: TimelineTicks, tickLevel: number): void
    {
        this.subscribe(ticks.render, ([items, shouldRender]) => this.updateTicks(ticks, tickLevel, items, shouldRender));
    }

    private updateTicks(ticks: TimelineTicks, tickLevel: number, items: any[], shouldRender: boolean): void
    {
        shouldRender ? this.renderer.renderTicks(ticks, tickLevel, items) 
                     : this.renderer.unrenderTicks(tickLevel);
    }

    /** The width of the top level tick in zero-zoom mode. */
    @Input() public set baseTickSize(value: number | string)
    {
        this.state.baseTickSize.next(value);
    }
}