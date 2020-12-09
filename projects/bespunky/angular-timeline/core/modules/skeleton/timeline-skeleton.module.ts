import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineRangeDirective } from './directives/timeline-range.directive';

@NgModule({
    imports     : [CommonModule],
    declarations: [TimelineRangeDirective],
    exports     : [TimelineRangeDirective]
})
export class TimelineSkeletonModule { }
