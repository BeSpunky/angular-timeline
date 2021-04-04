import { NgModule } from '@angular/core';

import { TimelineTickDirective } from './directives/timeline-tick.directive';

@NgModule({
    declarations: [TimelineTickDirective],
    exports     : [TimelineTickDirective]
})
export class TimelineTicksModule { }
