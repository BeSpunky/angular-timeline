import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineSkeletonModule } from './modules/skeleton/timeline-skeleton.module';

@NgModule({
    imports: [
        CommonModule,
        TimelineSkeletonModule
    ],
    declarations: []
})
export class TimelineModule { }
