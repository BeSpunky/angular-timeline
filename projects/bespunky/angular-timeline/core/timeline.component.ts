import { AfterViewInit, ChangeDetectorRef, Component,  ContentChildren, EventEmitter, ElementRef, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TimelineTicksDefinition, TimelineTicksDefinitionDirective } from './modules/skeleton/directives/timeline-ticks-definition.directive';
import { TimelineStateService } from './services/timeline-state.service';

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
        public parent?   : TimelineTick,
        public child?    : TimelineTick
    ) { }
}

@Component({
    selector     : 'bs-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    providers    : [TimelineStateService],
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent extends Destroyable implements AfterViewInit
{
    @ContentChildren(TimelineTicksDefinitionDirective) public tickDefinitions!: QueryList<TimelineTicksDefinitionDirective>;

    public topTick!: TimelineTick;

    //temp
    public zoom: number = 0;
    
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
}
