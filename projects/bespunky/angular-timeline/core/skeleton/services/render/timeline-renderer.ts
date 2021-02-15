import { Destroyable } from '@bespunky/angular-zen/core';
import { TickItem } from '../../abstraction/tick-item';
import { TimelineTick } from '../../directives/timeline-tick';
import { RenderedTick } from './models/rendered-tick';

export abstract class TimelineRenderer extends Destroyable
{
    public readonly ticksInView: { [tickLevel: number]: RenderedTick[] } = { };

    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: TickItem[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}