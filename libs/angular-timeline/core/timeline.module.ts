import { NgModule } from '@angular/core';

import { TimelineTicksModule } from './modules/ticks/timeline-ticks.module';
import { TimelineDirective   } from './directives/timeline.directive';

@NgModule({
  declarations: [TimelineDirective],
  exports     : [TimelineDirective]
})
export class TimelineModule { }
