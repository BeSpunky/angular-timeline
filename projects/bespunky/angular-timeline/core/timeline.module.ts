import { CUSTOM_ELEMENTS_SCHEMA, NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineSkeletonModule } from '@bespunky/angular-timeline/skeleton';
import { TimelineComponent      } from './timeline.component';

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
