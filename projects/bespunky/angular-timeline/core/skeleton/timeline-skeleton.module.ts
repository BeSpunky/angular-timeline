import { CUSTOM_ELEMENTS_SCHEMA, NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineTicksDirective } from './directives/timeline-ticks.directive';
import { TimelineDirective } from './directives/timeline.directive';

@NgModule({
    imports     : [CommonModule],
    exports     : [TimelineTicksDirective, TimelineDirective],
    declarations: [TimelineTicksDirective, TimelineDirective],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TimelineSkeletonModule { }
