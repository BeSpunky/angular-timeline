import { ClassProvider } from '@angular/core';

import { TimelineConfig        } from '@bespunky/angular-timeline/abstraction';
import { TimelineConfigService } from './timeline-config.service';

/**
 * Provides the default implementation for the `TimelineConfig` class.
 *
 * Provided by the timeline directive.
 */
export const TimelineConfigProvider: ClassProvider = {
    provide : TimelineConfig,
    useClass: TimelineConfigService
};