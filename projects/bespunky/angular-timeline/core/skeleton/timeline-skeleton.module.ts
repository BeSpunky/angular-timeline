import { CUSTOM_ELEMENTS_SCHEMA, NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineTicksDefinitionDirective } from './directives/timeline-ticks-definition.directive';
import { TimelineDefinitionDirective } from './directives/timeline-definition.directive';

@NgModule({
    imports     : [CommonModule],
    exports     : [TimelineTicksDefinitionDirective, TimelineDefinitionDirective],
    declarations: [TimelineTicksDefinitionDirective, TimelineDefinitionDirective],
})
export class TimelineSkeletonModule { }
