import { ClassProvider } from '@angular/core';

import { TimelineTickRenderer        } from './timeline-tick-renderer';
import { TimelineTickRendererService } from './timeline-tick-renderer.service';

/**
 * Provides the default implementation for the `TimelineTickRenderer` class.
 *
 * Provided by the timeline directive.
 */
export const TimelineTickRendererProvider: ClassProvider = {
    provide : TimelineTickRenderer,
    useClass: TimelineTickRendererService
};