import { Destroyable } from '@bespunky/angular-zen/core';

import { TimelineTick } from '../core/timeline-tick';
import { TickItem     } from './tick-item';
import { RenderedTick } from './rendered-tick';

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
    /**
     * A map of all rendered tick views for each tick level. Used for view recycling.
     *
     * @type {{ [tickLevel: number]: RenderedTick[] }}
     */
    public readonly ticksInView: { [tickLevel: number]: RenderedTick[] } = {};
    
    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: TickItem[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}