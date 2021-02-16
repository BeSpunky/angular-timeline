import { ClassProvider } from '@angular/core';
import { TimelineRenderer } from './timeline-renderer';
import { TimelineRendererService } from './timeline-renderer.service';

export const TimelineRendererProvider: ClassProvider = {
    provide : TimelineRenderer,
    useClass: TimelineRendererService
};