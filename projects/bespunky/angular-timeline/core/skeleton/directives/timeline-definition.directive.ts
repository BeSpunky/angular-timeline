import { AfterViewInit, ChangeDetectorRef, ContentChildren, Directive, Input, QueryList, ViewEncapsulation } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { TimelineStateService } from '../services/timeline-state.service';
import { TimelineTicksDefinition, TimelineTicksDefinitionDirective } from './timeline-ticks-definition.directive';

export class TimelineTick
{
    constructor(
        public definition: TimelineTicksDefinition,
        public parent?   : TimelineTick,
        public child?    : TimelineTick
    ) { }
}

@Directive({
    selector : '[bsTimelineDef]',
    exportAs : 'timelineDef'
})
export class TimelineDefinitionDirective extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTicksDefinitionDirective) public tickDefinitions!: QueryList<TimelineTicksDefinitionDirective>;

    public topTick!: TimelineTick;
    
    constructor(private changes: ChangeDetectorRef, public state: TimelineStateService)
    {
        super();
    }

    ngAfterViewInit()
    {
        this.initNestedPeriodDefinitions();

        this.changes.detectChanges();
    }

    private initNestedPeriodDefinitions(): void
    {
        const ticks = this.tickDefinitions.map(def => new TimelineTick(def));

        ticks.forEach((tick, index) =>
        {
            if (index > 0               ) tick.parent = ticks[index - 1];
            if (index < ticks.length - 1) tick.child  = ticks[index + 1];
        });

        this.topTick = ticks[0];
    }

    /** The width of the top level tick in zero-zoom mode. */
    @Input() public set baseTickSize(value: number | string)
    {
        this.state.baseTickSize.next(value);
    }
}