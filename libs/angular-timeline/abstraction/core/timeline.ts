import { Observable  } from 'rxjs';
import { Destroyable } from '@bespunky/angular-zen/core';

import { TimelineConfig } from '../config/timeline-config';
import { TimelineCamera } from '../control/timeline-camera';

export abstract class Timeline extends Destroyable
{
    abstract readonly currentDate: Observable<Date>;
    abstract readonly config     : TimelineConfig;
    abstract readonly camera     : TimelineCamera;
}