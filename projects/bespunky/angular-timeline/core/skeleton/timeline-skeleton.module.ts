import { CUSTOM_ELEMENTS_SCHEMA, NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineDirective } from './directives/timeline.directive';
import { TimelineTickDirective } from './modules/ticks/directives/timeline-tick.directive';

@NgModule({
    imports     : [CommonModule],
    exports     : [TimelineTickDirective, TimelineDirective],
    declarations: [TimelineTickDirective, TimelineDirective],
    schemas     : [CUSTOM_ELEMENTS_SCHEMA]
})
export class TimelineSkeletonModule { }
