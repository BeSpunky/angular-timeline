import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineModule    } from '@bespunky/angular-timeline/core';
import { TimelineComponent } from './timeline/timeline.component';

@NgModule({
    imports     : [CommonModule, TimelineModule],
    declarations: [TimelineComponent],
    exports     : [TimelineComponent]
})
export class AppTimelineModule { }
