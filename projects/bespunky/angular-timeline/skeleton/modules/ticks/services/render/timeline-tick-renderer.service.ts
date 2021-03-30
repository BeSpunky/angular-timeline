import { Injectable } from '@angular/core';
import { TimelineTick } from '../../directives/timeline-tick';
import { RenderedTick } from '../../view-models/rendered-tick';
import { TickContext, TickViewContext } from '../../view-models/tick-context';
import { TickItem } from '../../view-models/tick-item';
import { TimelineTickRenderer } from './timeline-tick-renderer';

/**
 * Provides tools for handling tick rendering.
 *
 * @export
 * @class TimelineTickRendererService
 * @extends {TimelineTickRenderer}
 */
@Injectable()
export class TimelineTickRendererService extends TimelineTickRenderer
{
    /**
     * Renders the provided tick items and stores them in the `ticksInView` map.
     * Existing views are recycled and their context gets updated.
     *
     * @param {TimelineTick} tick The tick definition to use when rendering.
     * @param {number} tickLevel A zero-based number representing the level of the ticks to render. Zero represents the
     * top level tick. 
     * @param {TickItem[]} newTickItems The new items representing the ticks to render.
     */
    public renderTicks(tick: TimelineTick, tickLevel: number, newTickItems: TickItem[]): void
    {
        const renderedViews = this.ticksInView[tickLevel] || [];

        // Update state with created views
        this.ticksInView[tickLevel] = this.AggregateChangesAndRecycleViews(tick, renderedViews , newTickItems);
    }

    /**
     * Unrenders all previously rendered ticks for the specified tick level.
     *
     * @param {number} tickLevel A zero-based number representing the level of ticks to unrender.
     * @returns {void}
     */
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

    /**
     * Creates the context to provide when rendering a tick.
     *
     * @private
     * @param {TickItem} item The item representing the tick.
     * @returns {TickViewContext} The template context containing the tick information.
     */
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
    
    /**
     * Renderes the new tick items efficiently by reusing and updating previously rendered views.
     * 
     * ```text
     *          0  1  2  3  4  5  6
     * views:  [x, x, x, x, x]
     * items:  [y, y, y, y, y, y, y]
     * result: [y, y, y, y, y]
     * 
     * Exeeding items be rendered in new views:
     *          0  1  2  3  4  5  6
     * views:  [x, x, x, x, x]
     * items:  [y, y, y, y, y, y, y]
     * result: [y, y, y, y, y, y, y]
     * 
     * Unused views will be unrendered:
     *          0  1  2  3  4  5  6
     * views:  [x, x, x, x, x]
     * items:  [y, y, y]
     * result: [y, y, y]
     * ```
     * 
     * @private
     * @param {TimelineTick} tick The tick definition to render.
     * @param {RenderedTick[]} renderedTicks The existing tick with their previously rendered views.
     * @param {TickItem[]} newTickItems The new tick items to render.
     * @returns {RenderedTick[]} The new rendered items with their views.
     */
    private AggregateChangesAndRecycleViews(tick: TimelineTick, renderedTicks: RenderedTick[], newTickItems: TickItem[]): RenderedTick[]
    {
        // Get the difference between existing and new items
        const changed = newTickItems.length - renderedTicks.length;

        // Use all existing views as the limit for view recycling
        let updateCount = renderedTicks.length;

        if (changed > 0) // New tick count is greater than the existing one
        {
            // Render new views with the last items from the new ticks
            this.renderMissingTicks(renderedTicks, newTickItems, changed, tick);
        }
        else if (changed < 0) // New tick count is lower than the existing one
        {
            // Unrender exeeding ticks
            this.unrenderUnusedTicks(renderedTicks, changed);
            // Use the new length as the limit for view recycling
            updateCount = renderedTicks.length;
        }
        
        // Run the update from start to the upper limit
        this.updateRenderedTicks(renderedTicks, newTickItems, updateCount);

        return renderedTicks;
    }

    /**
     * Grabs new tick items from the end, renders new views for them and adds them to the `renderedTicks` array.
     *
     * @private
     * @param {TickItem[]} newTickItems The new tick items to be rendered.
     * @param {number} addedCount The number of items to take from the end of the array.
     * @param {TimelineTick} tick The tick definition to render.
     */
    private renderMissingTicks(renderedTicks: RenderedTick[], newTickItems: TickItem[], addedCount: number, tick: TimelineTick)
    {
        const addedItems = newTickItems.slice(-addedCount).map(item => this.renderTick(tick, item));
        
        // Add the newly rendered ticks to the rendered views array
        renderedTicks.push(...addedItems);
    }

    /**
     * Grabs existing ticks from the end of the array and unrenders them.
     *
     * @private
     * @param {RenderedTick[]} renderedTicks The existing ticks and their views.
     * @param {number} removedCount The number of items to unrender from the end of the array. **Must be negative**.
     */
    private unrenderUnusedTicks(renderedTicks: RenderedTick[], removedCount: number): void
    {
        renderedTicks.splice(removedCount).forEach(tick => this.unrenderTick(tick));
    }

    /**
     * Walks through existing ticks and updates their template context with a new information from the new ticks.
     * Ticks are updated from left to right until the `count` items have been updated.
     *
     * @private
     * @param {RenderedTick[]} renderedTicks The existing ticks to updated.
     * @param {TickItem[]} newTickItems The new tick items to take new information from.
     * @param {number} count The number of items to copy from the new ticks to the existing ones.
     */
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
}