import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineSkeletonModule } from './modules/skeleton/timeline-skeleton.module';
import { TimelineComponent } from './timeline.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        TimelineSkeletonModule,
        FormsModule
    ],
    declarations: [TimelineComponent],
    exports     : [TimelineComponent, TimelineSkeletonModule]
})
export class TimelineModule { }
