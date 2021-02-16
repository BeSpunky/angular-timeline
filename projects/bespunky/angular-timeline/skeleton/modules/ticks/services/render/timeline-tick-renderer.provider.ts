import { ClassProvider } from '@angular/core';
import { TimelineTickRenderer } from './timeline-tick-renderer';
import { TimelineTickRendererService } from './timeline-tick-renderer.service';

export const TimelineTickRendererProvider: ClassProvider = {
    provide : TimelineTickRenderer,
    useClass: TimelineTickRendererService
};