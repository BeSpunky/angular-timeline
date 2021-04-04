import { NgModule } from '@angular/core';

import { TimelineTicksModule } from './modules/ticks/timeline-ticks.module';
import { TimelineDirective   } from './directives/timeline.directive';

@NgModule({
    imports     : [TimelineTicksModule],
    declarations: [TimelineDirective],
    exports     : [TimelineDirective, TimelineTicksModule],
})
export class TimelineModule {}
