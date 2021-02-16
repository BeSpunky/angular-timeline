import { ClassProvider } from '@angular/core';
import { TimelineControl } from './timeline-control';
import { TimelineControlService } from './timeline-control.service';

export const TimelineControlProvider: ClassProvider = {
    provide : TimelineControl,
    useClass: TimelineControlService
};