import { Destroyable } from '@bespunky/angular-zen/core';
import { TimelineTick } from '../../directives/timeline-tick';
import { RenderedTick } from '../../view-models/rendered-tick';
import { TickItem } from '../../view-models/tick-item';

/**
 * Provides the bases for a services that handles tick rendering.
 *
 * @export
 * @abstract
 * @class TimelineTickRenderer
 * @extends {Destroyable}
 */
export abstract class TimelineTickRenderer extends Destroyable
{
    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: TickItem[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}