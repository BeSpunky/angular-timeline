import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Destroyable } from '@bespunky/angular-zen/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TimelineStateService } from '../../../../services/timeline-state.service';
import { TimelineTick } from '../../../../timeline.component';

@Component({
    selector   : 'bs-timeline-ticks',
    templateUrl: './timeline-ticks.component.html',
    styleUrls  : ['./timeline-ticks.component.css']
})
export class TimelineTicksComponent extends Destroyable implements AfterViewInit
{
    @Input() public tick?: TimelineTick;

    public items       : any[]   = [];
    public shouldRender: boolean = false;

    constructor(public state: TimelineStateService)
    {
        super();

        this.subscribe(this.state.zoom.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ), this.onZoomChanged.bind(this));
    }

    ngAfterViewInit(): void
    {
        setTimeout(() =>
        {
            if (!this.tick) return;
            const definition = this.tick.definition;

            this.items = Array(definition.to - definition.from).fill(0).map((item, index) => definition.from + index);
        }, 1);
    }

    private onZoomChanged(zoom: number): void
    {
        this.updateRenderState(zoom);
    }

    public updateRenderState(zoom: number): void
    {
        this.shouldRender = this.tickMatchsZoom(zoom, this.tick);
    }
    
    public tickMatchsZoom(zoom: number, tick?: TimelineTick): boolean
    {
        return !!tick && tick.definition.minZoom <= zoom && zoom <= tick.definition.maxZoom;
    }
}
