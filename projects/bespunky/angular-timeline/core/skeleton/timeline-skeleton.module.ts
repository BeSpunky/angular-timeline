import { CUSTOM_ELEMENTS_SCHEMA, NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineTickDirective } from './directives/timeline-tick.directive';
import { TimelineDirective } from './directives/timeline.directive';

@NgModule({
    imports     : [CommonModule],
    exports     : [TimelineTickDirective, TimelineDirective],
    declarations: [TimelineTickDirective, TimelineDirective],
    schemas     : [CUSTOM_ELEMENTS_SCHEMA]
})
export class TimelineSkeletonModule { }
