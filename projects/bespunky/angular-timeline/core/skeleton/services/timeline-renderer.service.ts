import { ClassProvider, Injectable, TemplateRef, ViewContainerRef } from '@angular/core';
import { TimelineTicks } from '../directives/timeline-ticks.directive';
import { CreatedView, TimelineState } from './timeline-state.service';

export abstract class TimelineRenderer
{
    abstract renderTicks(ticks: TimelineTicks, tickLevel: number, items: any[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}

@Injectable()
export class TimelineRendererService extends TimelineRenderer
{
    constructor(private state: TimelineState) { super(); }
    
    public renderTicks(ticks: TimelineTicks, tickLevel: number, items: any[]): void
    {
        // TODO: Aggregate changes instead of clearing and recreating views
        if (this.state.ticksInView[tickLevel]) return;
        
        const createdViews = items.map((item, index) =>
        {
            const context = this.createViewContext(item, tickLevel, index);
            const view    = ticks.view!.createEmbeddedView(ticks.template, context);
            
            return { item, index, context, view } as CreatedView;
        });

        this.state.ticksInView[tickLevel] = createdViews;
    }

    public unrenderTicks(tickLevel: number): void
    {
        if (!this.state.ticksInView[tickLevel]) return;

        this.state.ticksInView[tickLevel].forEach(viewRef => viewRef.view.destroy());

        delete this.state.ticksInView[tickLevel];
    }

    private createViewContext(value: any, tickLevel: number, index: number): any
    {
        const context = {
            state: this.state,
            tickLevel,
            value,
            index
        };

        return {
            $implicit: context,
            ...context
        };
    }
}

export const TimelineRendererProvider: ClassProvider = {
    provide : TimelineRenderer,
    useClass: TimelineRendererService
};