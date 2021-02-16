import { ClassProvider } from '@angular/core';
import { TimelineState } from './timeline-state';
import { TimelineStateService } from './timeline-state.service';

export const TimelineStateProvider: ClassProvider = {
    provide : TimelineState,
    useClass: TimelineStateService
};