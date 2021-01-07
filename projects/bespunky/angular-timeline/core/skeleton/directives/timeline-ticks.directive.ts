import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { Observable, BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TimelineState } from '../services/timeline-state.service';
import { TimelineToolsService } from '../services/timeline-tools.service';

export interface TimelineTicks
{
    readonly id     : BehaviorSubject<string>;
    readonly from   : BehaviorSubject<number>;
    readonly to     : BehaviorSubject<number>;
    readonly jumps  : BehaviorSubject<number>;
    readonly minZoom: BehaviorSubject<number>;
    readonly maxZoom: BehaviorSubject<number>;

    readonly view    : ViewContainerRef;
    readonly template: TemplateRef<any>;

    readonly items       : Observable<any[]>;
    readonly shouldRender: Observable<boolean>;
    readonly render      : Observable<[any[], boolean]>
}

@Directive({
    selector: '[timelineTicks]',
    exportAs: 'timelineTicks'
})
export class TimelineTicksDirective extends Destroyable implements TimelineTicks
{
    public readonly id     : BehaviorSubject<string> = new BehaviorSubject('');
    public readonly from   : BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly to     : BehaviorSubject<number> = new BehaviorSubject(10);
    public readonly jumps  : BehaviorSubject<number> = new BehaviorSubject(1);
    public readonly minZoom: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly maxZoom: BehaviorSubject<number> = new BehaviorSubject(100);

    public readonly items!       : Observable<any[]>;
    public readonly shouldRender!: Observable<boolean>;
    public readonly render!      : Observable<[any[], boolean]>;

    constructor(
        public  readonly view    : ViewContainerRef,
        public  readonly template: TemplateRef<any>,
        private readonly state   : TimelineState,
        private readonly tools   : TimelineToolsService
    )
    {
        super();
        
        this.items        = this.itemsFeed();
        this.shouldRender = this.shouldRenderFeed();
        this.render       = this.renderFeed();
    }

    @Input() public set timelineTicks       (value: string) { this.id.next(value); }

    @Input() public set timelineTicksFrom   (value: number) { this.from .next(value); }
    @Input() public set timelineTicksTo     (value: number) { this.to   .next(value); }
    @Input() public set timelineTicksJumps  (value: number) { this.jumps.next(value); }

    @Input() public set timelineTicksMinZoom(value: number) { this.minZoom.next(value); }
    @Input() public set timelineTicksMaxZoom(value: number) { this.maxZoom.next(value); }

    private itemsFeed(): Observable<any[]>
    {
        return merge(this.from, this.to, this.jumps).pipe(
            map(_ => this.tools.range(this.from.value, this.to.value))
        );
    }

    private shouldRenderFeed(): Observable<boolean>
    {
        return merge(this.state.zoom, this.minZoom, this.maxZoom).pipe(
        // return merge(this.state.debouncedZoom(180), this.minZoom, this.maxZoom).pipe(
            map(_ => this.tickMatchesZoom(this.state.zoom.value))
        );
    }
    
    private renderFeed(): Observable<[any[], boolean]>
    {
        return combineLatest([this.items, this.shouldRender]);
    }

    // TODO: Move to tools
    public tickMatchesZoom(zoom: number): boolean
    {
        return this.minZoom.value <= zoom && zoom <= this.maxZoom.value;
    }

}
