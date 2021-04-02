import { ClassProvider } from '@angular/core';
import { TimelineControl } from './timeline-control';
import { TimelineControlService } from './timeline-control.service';

/**
 * Provides the default implementation for the `TimelineControl` class.
 *
 * Provided by the timeline directive.
 */
export const TimelineControlProvider: ClassProvider = {
    provide : TimelineControl,
    useClass: TimelineControlService
};