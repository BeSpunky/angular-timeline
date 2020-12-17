import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineSkeletonModule } from './modules/skeleton/timeline-skeleton.module';
import { TimelineComponent } from './timeline.component';

@NgModule({
    imports: [
        CommonModule,
        TimelineSkeletonModule
    ],
    declarations: [TimelineComponent],
    exports     : [TimelineComponent]
})
export class TimelineModule { }
