import { AfterViewInit, ChangeDetectorRef, Component,  ContentChildren,  ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { TimelineRangeDefinitionDirective } from '../../../../dist/bespunky/angular-timeline/core/modules/skeleton/directives/timeline-range-definition.directive';
import { TimelineTicksDefinition, TimelineTicksDefinitionDirective } from './modules/skeleton/directives/timeline-ticks-definition.directive';

// export interface TimelinePeriod
// {
//     id?       : string;
//     ticks     : number;
//     minZoom?  : number;
//     tickLabel?: string | ((index: number) => string);
// }

// const x: TimelinePeriod[] = [
//     { id: 'centuries'   , ticks: 100  },
//     { id: 'decades'     , ticks: 10   },
//     { id: 'years'       , ticks: 10   },
//     { id: 'months'      , ticks: 12   },
//     { id: 'days'        , ticks: 30   },
//     { id: 'hours'       , ticks: 24   },
//     { id: 'minutes'     , ticks: 60   },
//     { id: 'seconds'     , ticks: 60   },
//     { id: 'milliseconds', ticks: 1000 },
// ];

export class TimelineTick
{
    constructor(
        public definition: TimelineTicksDefinition,
        public parent?   : TimelineTick | null,
        public child?    : TimelineTick | null
    ) { }
}

@Component({
    selector     : 'bs-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent extends Destroyable implements AfterViewInit
{
    @Input() public zoom: number = 0;

    @ContentChildren(TimelineTicksDefinitionDirective) public tickDefinitions!: QueryList<TimelineTicksDefinitionDirective>;

    public topTick!: TimelineTick;

    constructor(private changes: ChangeDetectorRef)
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
            tick.parent = index === 0                  ? null : ticks[index - 1];
            tick.child  = index === ticks.length - 1 ? null : ticks[index + 1];
        });

        this.topTick = ticks[0];
    }
}
