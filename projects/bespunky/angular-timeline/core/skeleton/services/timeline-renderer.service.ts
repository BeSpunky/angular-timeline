import { ClassProvider, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TimelineTick } from '../directives/timeline-tick.directive';
import { CreatedView, TimelineState } from './timeline-state.service';

export interface TickContext
{
    state    : TimelineState;
    tickLevel: number;
    value    : any;
    index    : number;
    width    : Observable<number>;
    position : Observable<number>;
}

export abstract class TimelineRenderer
{
    abstract renderTicks(ticks: TimelineTick, tickLevel: number, items: any[]): void;
    abstract unrenderTicks(tickLevel: number): void;
}

@Injectable()
export class TimelineRendererService extends TimelineRenderer
{
    constructor(private state: TimelineState) { super(); }
    
    // TODO: Aggregate changes instead of clearing and recreating views
    public renderTicks(tick: TimelineTick, tickLevel: number, items: any[]): void
    {
        if (this.state.ticksInView[tickLevel]) return;
        
        const createdViews = items.map((item, index) =>
        {
            const context = this.createViewContext(tick, item, tickLevel, index);
            const view    = tick.view!.createEmbeddedView(tick.template, context);
            
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

    private createViewContext(tick: TimelineTick, value: any, tickLevel: number, index: number): any
    {
        const context = {
            state: this.state,
            tickLevel,
            value,
            index,
            width: tick.width,
            position: tick.positionFeed(index)
        } as TickContext;

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