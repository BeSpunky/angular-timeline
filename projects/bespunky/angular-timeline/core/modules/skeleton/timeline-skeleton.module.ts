import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineTicksDefinitionDirective } from './directives/timeline-ticks-definition.directive';
import { TimelineTicksComponent } from './components/timeline-ticks/timeline-ticks.component';

@NgModule({
    imports     : [CommonModule],
    declarations: [TimelineTicksDefinitionDirective, TimelineTicksComponent],
    exports     : [TimelineTicksDefinitionDirective, TimelineTicksComponent]
})
export class TimelineSkeletonModule { }
