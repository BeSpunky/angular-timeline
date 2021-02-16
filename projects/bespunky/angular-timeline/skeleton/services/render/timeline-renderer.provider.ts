import { ClassProvider } from '@angular/core';
import { TimelineRenderer } from './timeline-renderer';
import { TimelineRendererService } from './timeline-renderer.service';

/**
 * Provides the default implementation for the `TimelineRenderer` class.
 *
 * Provided by the timeline directive.
 */
export const TimelineRendererProvider: ClassProvider = {
    provide : TimelineRenderer,
    useClass: TimelineRendererService
};