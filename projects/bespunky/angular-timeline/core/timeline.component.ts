import { AfterViewInit, ChangeDetectorRef, Component,  ContentChildren,  ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { TimelineTicksDefinitionDirective } from './modules/skeleton/directives/timeline-ticks-definition.directive';

export interface TimelinePeriod
{
    id?       : string;
    ticks     : number;
    minZoom?  : number;
    tickLabel?: string | ((index: number) => string);
}

const x: TimelinePeriod[] = [
    { id: 'centuries'   , ticks: 100  },
    { id: 'decades'     , ticks: 10   },
    { id: 'years'       , ticks: 10   },
    { id: 'months'      , ticks: 12   },
    { id: 'days'        , ticks: 30   },
    { id: 'hours'       , ticks: 24   },
    { id: 'minutes'     , ticks: 60   },
    { id: 'seconds'     , ticks: 60   },
    { id: 'milliseconds', ticks: 1000 },
];

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

    @ContentChildren(TimelineTicksDefinitionDirective) public rangeChildren!: QueryList<TimelineTicksDefinitionDirective>;

    private _ranges!: TimelineTicksDefinitionDirective[];
    private _inView!: TimelineTicksDefinitionDirective[];

    constructor(element: ElementRef, private changes: ChangeDetectorRef)
    {
        super();
    }

    ngAfterViewInit()
    {
        this.initRanges(this.rangeChildren.toArray());
        this.updateView();
        
        this.changes.detectChanges();
    }

    public initRanges(ranges: TimelineTicksDefinitionDirective[]): void
    {
        this._ranges = ranges;
    }

    public updateView(): void
    {
        this._inView = this.ranges.filter(range => range.minZoom <= this.zoom && this.zoom <= range.maxZoom);
    }

    public get ranges(): TimelineTicksDefinitionDirective[]
    {
        return this._ranges;
    }

    public get inView(): TimelineTicksDefinitionDirective[]
    {
        return this._inView;
    }
}
