import { CUSTOM_ELEMENTS_SCHEMA, NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineComponent      } from './timeline.component';
import { TimelineSkeletonModule } from './skeleton/timeline-skeleton.module';

@NgModule({
    imports: [
        CommonModule,
        TimelineSkeletonModule
    ],
    declarations: [TimelineComponent],
    exports: [TimelineComponent, TimelineSkeletonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TimelineModule { }
