import { ClassProvider } from '@angular/core';

import { TimelineTickRenderer        } from '@bespunky/angular-timeline/abstraction/ticks';
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