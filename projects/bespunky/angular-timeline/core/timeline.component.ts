import { Component,  Input,  ViewEncapsulation } from '@angular/core';
import { TimelineState, TimelineStateProvider } from './skeleton/services/timeline-state.service';
import { TimelineRenderer, TimelineRendererProvider } from './skeleton/services/timeline-renderer.service';
import { TimelineToolsService } from './skeleton/services/timeline-tools.service';

@Component({
    selector     : 'bs-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    providers    : [TimelineStateProvider, TimelineRendererProvider],
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent
{
    constructor(private state: TimelineState, private renderer: TimelineRenderer, private tools: TimelineToolsService) { }

    @Input() set zoom(value: number)
    {
        this.state.zoom.next(value);
    }
}
