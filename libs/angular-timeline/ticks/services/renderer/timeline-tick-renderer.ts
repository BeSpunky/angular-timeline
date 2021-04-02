import { Destroyable } from '@bespunky/angular-zen/core';

import { RenderedTick, TickItem } from '@bespunky/angular-timeline/ticks/models';
import { TimelineTick           } from '../../directives/timeline-tick';

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