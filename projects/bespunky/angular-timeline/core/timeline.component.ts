import { Component,  Input,  ViewEncapsulation } from '@angular/core';
import { TimelineState } from './skeleton/services/timeline-state.service';
import { TimelineRenderer } from './skeleton/services/timeline-renderer.service';
import { TimelineToolsService } from './skeleton/services/timeline-tools.service';

@Component({
    selector     : 'bs-timeline',
    templateUrl  : './timeline.component.html',
    styleUrls    : ['./timeline.component.css'],
    exportAs     : 'timeline',
    encapsulation: ViewEncapsulation.None
})
export class TimelineComponent
{
    x: number = 0;
    y: number = 0;

    ddd(e: MouseEvent): void
    {
        this.x = e.offsetX;
        this.y = e.offsetY;
    }
}
