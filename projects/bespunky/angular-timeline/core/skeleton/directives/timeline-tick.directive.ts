import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { finalize, flatMap, map, mergeMap, pluck, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { TimelineState } from '../services/timeline-state.service';
import { TimelineToolsService } from '../services/timeline-tools.service';

export interface TimelineTick
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
    readonly render      : Observable<[any[], boolean, number]>;
    readonly width       : Observable<number>;
    
    readonly parent: BehaviorSubject<TimelineTick | null>;
    readonly child : BehaviorSubject<TimelineTick | null>;
    
    positionFeed(tickIndex: number): Observable<number>;
}

@Directive({
    selector: '[timelineTick]',
    exportAs: 'timelineTick'
})
export class TimelineTickDirective implements TimelineTick
{
    public readonly id     : BehaviorSubject<string> = new BehaviorSubject('');
    public readonly from   : BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly to     : BehaviorSubject<number> = new BehaviorSubject(10);
    public readonly jumps  : BehaviorSubject<number> = new BehaviorSubject(1);
    public readonly minZoom: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly maxZoom: BehaviorSubject<number> = new BehaviorSubject(100);

    public readonly items!       : Observable<any[]>;
    public readonly shouldRender!: Observable<boolean>;
    public readonly render!      : Observable<[any[], boolean, number]>;
    public readonly width!       : Observable<number>;

    public readonly parent: BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);
    public readonly child : BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);

    constructor(
        public  readonly view    : ViewContainerRef,
        public  readonly template: TemplateRef<any>,
        private readonly state   : TimelineState,
        private readonly tools   : TimelineToolsService
    )
    {        
        this.items        = this.itemsFeed();
        this.shouldRender = this.shouldRenderFeed();
        this.render       = this.renderFeed();
        this.width        = this.widthFeed();
    }

    @Input() public set timelineTick       (value: string) { this.id.next(value); }

    @Input() public set timelineTickFrom   (value: number) { this.from .next(value); }
    @Input() public set timelineTickTo     (value: number) { this.to   .next(value); }
    @Input() public set timelineTickJumps  (value: number) { this.jumps.next(value); }

    @Input() public set timelineTickMinZoom(value: number) { this.minZoom.next(value); }
    @Input() public set timelineTickMaxZoom(value: number) { this.maxZoom.next(value); }

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
    
    private renderFeed(): Observable<[any[], boolean, number]>
    {
        const duplicateCount = this.parent.pipe(
            switchMap(p => p ? p.items : of({ length: 1 })),
            pluck('length')
        );

        return combineLatest([this.items, this.shouldRender, duplicateCount]);
    }

    private widthFeed(): Observable<number>
    {
        return merge(this.parent, this.items, this.state.baseTickSize).pipe(
            map           (_      => this.parent.value),
            switchMap(parent => parent ? parent.width : this.state.baseTickSize),
            take(1),
            withLatestFrom(this.items),
            map(([parentWidth, items]) => parentWidth / items.length)
        );
    }

    public positionFeed(tickIndex: number): Observable<number>
    {
        return this.width.pipe(
            map(width => width * tickIndex),
        );
    }

    // TODO: Move to tools
    public tickMatchesZoom(zoom: number): boolean
    {
        return this.minZoom.value <= zoom && zoom <= this.maxZoom.value;
    }

}
