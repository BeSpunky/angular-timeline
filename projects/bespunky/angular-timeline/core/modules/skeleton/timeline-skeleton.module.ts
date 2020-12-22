import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineTicksDefinitionDirective } from './directives/timeline-ticks-definition.directive';

@NgModule({
    imports     : [CommonModule],
    declarations: [TimelineTicksDefinitionDirective],
    exports     : [TimelineTicksDefinitionDirective]
})
export class TimelineSkeletonModule { }
