import { NgModule     } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './components/timeline/timeline.component';
import { SpaceComponent } from './components/space/space.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [TimelineComponent, SpaceComponent],
    exports     : [TimelineComponent]
})
export class TimelineSkeletonModule { }
