import { NgModule } from '@angular/core';

import { TimelineDirective } from './directives/timeline.directive';

@NgModule({
  declarations: [TimelineDirective],
  exports     : [TimelineDirective]
})
export class TimelineModule { }
