import { Component,  Input,  ViewEncapsulation } from '@angular/core';
import { TimelineStateService } from './skeleton/services/timeline-state.service';
import { TimelineToolsService } from './skeleton/services/timeline-tools.service';

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

@Component({
    selector     : 'bs-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    providers    : [TimelineStateService],
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent
{
    constructor(private state: TimelineStateService, private tools: TimelineToolsService) { }

    @Input() set zoom(value: number)
    {
        this.state.zoom.next(value);
    }
}
