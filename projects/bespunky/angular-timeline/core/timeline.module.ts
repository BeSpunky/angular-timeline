import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineComponent } from './timeline.component';
import { TimelineSkeletonModule } from './skeleton/timeline-skeleton.module';

@NgModule({
    imports: [
        CommonModule,
        TimelineSkeletonModule
    ],
    declarations: [TimelineComponent],
    exports: [TimelineComponent, TimelineSkeletonModule],
})
export class TimelineModule { }
