import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject, combineLatest, merge } from 'rxjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimelineStateService } from '../services/timeline-state.service';
import { TimelineToolsService } from '../services/timeline-tools.service';

export interface TimelineTicksDefinition
{
    id     : BehaviorSubject<string>;
    from   : BehaviorSubject<number>;
    to     : BehaviorSubject<number>;
    jumps  : BehaviorSubject<number>;
    minZoom: BehaviorSubject<number>;
    maxZoom: BehaviorSubject<number>;

    template: TemplateRef<any>;
}

@Directive({
    selector: '[timelineTicksDef]',
    exportAs: 'timelineTicksDef'
})
export class TimelineTicksDefinitionDirective extends Destroyable implements TimelineTicksDefinition
{
    public id     : BehaviorSubject<string> = new BehaviorSubject('');
    public from   : BehaviorSubject<number> = new BehaviorSubject(0);
    public to     : BehaviorSubject<number> = new BehaviorSubject(10);
    public jumps  : BehaviorSubject<number> = new BehaviorSubject(1);
    public minZoom: BehaviorSubject<number> = new BehaviorSubject(0);
    public maxZoom: BehaviorSubject<number> = new BehaviorSubject(100);

    public items!       : Observable<any[]>;
    public shouldRender!: Observable<boolean>;

    constructor(
        public  template: TemplateRef<any>,
        private view    : ViewContainerRef,
        private state   : TimelineStateService,
        private tools   : TimelineToolsService
    )
    {
        super();

        this.items        = this.itemsFeed();
        this.shouldRender = this.shouldRenderFeed();

        this.subscribe(this.renderFeed(), this.renderTicks.bind(this));
    }

    @Input() public set timelineTicksDef       (value: string) { this.id.next(value); }

    @Input() public set timelineTicksDefFrom   (value: number) { this.from .next(value); }
    @Input() public set timelineTicksDefTo     (value: number) { this.to   .next(value); }
    @Input() public set timelineTicksDefJumps  (value: number) { this.jumps.next(value); }

    @Input() public set timelineTicksDefMinZoom(value: number) { this.minZoom.next(value); }
    @Input() public set timelineTicksDefMaxZoom(value: number) { this.maxZoom.next(value); }

    private itemsFeed(): Observable<any[]>
    {
        return merge(this.from, this.to, this.jumps).pipe(
            map(_ => this.tools.range(this.from.value, this.to.value))
        );
    }

    private shouldRenderFeed(): Observable<boolean>
    {
        return merge(this.state.debouncedZoom(), this.minZoom, this.maxZoom).pipe(
            map(zoom => this.tickMatchsZoom(zoom))
        );
    }
    
    private renderFeed(): Observable<[any[], boolean]>
    {
        return combineLatest([this.items, this.shouldRender]);
    }

    public tickMatchsZoom(zoom: number): boolean
    {
        return this.minZoom.value <= zoom && zoom <= this.maxZoom.value;
    }

    private renderTicks([items, shouldRender]: [any[], boolean]): void
    {
        // TODO: Aggregate changes instead of clearing and recreating views
        this.view.clear();

        if (!shouldRender) return;
        
        for (let item of items)
        {
            const context = this.createViewContext(item);

            this.view.createEmbeddedView(this.template, context);
        }
    }

    private createViewContext(value: any): any
    {
        return {
            state: this.state,
            value
        };
    }
}
