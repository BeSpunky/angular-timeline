import { Destroyable } from '@bespunky/angular-zen/core';
import { TimelineTick } from '../../modules/ticks/directives/timeline-tick';
import { RenderedTick } from '../../modules/ticks/view-models/rendered-tick';
import { TickItem } from '../../modules/ticks/view-models/tick-item';

export abstract class TimelineRenderer extends Destroyable
{
}