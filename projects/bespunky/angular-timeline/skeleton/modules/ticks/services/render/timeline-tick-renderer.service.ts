import { Injectable } from '@angular/core';
import { TimelineState } from '../../../../services/state/timeline-state';
import { TimelineTick } from '../../directives/timeline-tick';
import { RenderedTick } from '../../view-models/rendered-tick';
import { TickContext, TickViewContext } from '../../view-models/tick-context';
import { TickItem } from '../../view-models/tick-item';
import { TimelineTickRenderer } from './timeline-tick-renderer';

@Injectable()
export class TimelineTickRendererService extends TimelineTickRenderer
{
    constructor(private state: TimelineState)
    {
        super();
    }
    
    public renderTicks(tick: TimelineTick, tickLevel: number, newTickItems: TickItem[]): void
    {
        const renderedViews = this.ticksInView[tickLevel] || [];

        // Update state with created views
        this.ticksInView[tickLevel] = this.recycleViewsAndAggregateChanges(tick, renderedViews , newTickItems);
    }

    public unrenderTicks(tickLevel: number): void
    {
        if (!this.ticksInView[tickLevel]) return;

        this.ticksInView[tickLevel].forEach(viewRef => viewRef.view.destroy());

        delete this.ticksInView[tickLevel];
    }

    private renderTick(tick: TimelineTick, item: TickItem): RenderedTick
    {
        const viewContext = this.createViewContext(item);
        const view        = tick.view!.createEmbeddedView(tick.template, viewContext);
        
        return { item, view, context: viewContext.$implicit } as RenderedTick;
    }

    private unrenderTick(tickView: RenderedTick): void
    {
        tickView?.view.destroy();
    }

    private updateRenderedTicks(renderedTicks: RenderedTick[], newTickItems: TickItem[], count: number)
    {
        for (let i = 0; i < count; ++i)
        {
            const renderedTick = renderedTicks[i];
            const newTickItem  = newTickItems [i];

            renderedTick.item = newTickItem;
            renderedTick.context.update(newTickItem);
        }
    }

    private recycleViewsAndAggregateChanges(tick: TimelineTick, renderedTicks: RenderedTick[], newTickItems: TickItem[]): RenderedTick[]
    {
        const changed = renderedTicks.length - newTickItems.length;

        let updateCount = renderedTicks.length;

        if (changed > 0) // Items were removed
        {
            this.unrenderRemovedTicks(renderedTicks, changed);

            updateCount = renderedTicks.length;
        }
        else if (changed < 0) // Items were added
        {
            const addedTicks = this.renderMissingTicks(newTickItems, changed, tick);

            updateCount = renderedTicks.length;
                
            renderedTicks.push(...addedTicks);
        }
        
        this.updateRenderedTicks(renderedTicks, newTickItems, updateCount);

        return renderedTicks;
    }

    private renderMissingTicks(newTickItems: TickItem[], changed: number, tick: TimelineTick)
    {
        return newTickItems.slice(changed).map(item => this.renderTick(tick, item));
    }

    private unrenderRemovedTicks(renderedTicks: RenderedTick[], removedCount: number)
    {
        renderedTicks.splice(-removedCount).forEach(tick => this.unrenderTick(tick));
    }

    private createViewContext(item: TickItem): TickViewContext
    {
        const context = new TickContext(item);

        return {
            // Enable `let-context` 
            $implicit: context,
            // Enable specific variables (e.g. `let-position`, `let-index`)
            ...context
        };
    }
}