import { ClassProvider } from '@angular/core';

import { TimelineCamera        } from '@bespunky/angular-timeline/abstraction';
import { TimelineCameraService } from './timeline-camera.service';

/**
 * Provides the default implementation for the `TimelineCamera` class.
 *
 * Provided by the timeline directive.
 */
export const TimelineCameraProvider: ClassProvider = {
    provide : TimelineCamera,
    useClass: TimelineCameraService
};