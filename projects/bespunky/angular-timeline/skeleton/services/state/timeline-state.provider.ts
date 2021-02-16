import { ClassProvider } from '@angular/core';
import { TimelineState } from './timeline-state';
import { TimelineStateService } from './timeline-state.service';

/**
 * Provides the default implementation for the `TimelineTickRender` class.
 *
 * Provided by the timeline directive.
 */
export const TimelineStateProvider: ClassProvider = {
    provide : TimelineState,
    useClass: TimelineStateService
};