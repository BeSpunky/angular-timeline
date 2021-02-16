import { ElementRef, Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { TimelineTick } from '../../modules/ticks/directives/timeline-tick';
import { RenderedTick } from '../../modules/ticks/view-models/rendered-tick';
import { TickViewContext } from '../../modules/ticks/view-models/tick-context';
import { TickItem } from '../../modules/ticks/view-models/tick-item';
import { TimelineState } from '../state/timeline-state';
import { TimelineRenderer } from './timeline-renderer';

@Injectable()
export class TimelineRendererService extends TimelineRenderer
{
    constructor(private state: TimelineState, private element: ElementRef)
    {
        super();

        this.subscribe(this.viewPortSizeFeed());
    }

    private viewPortSizeFeed(): Observable<{ width: number, height: number }>
    {
        const element: HTMLElement = this.element.nativeElement;

        return fromEvent<UIEvent>(element, 'resize').pipe(
            startWith(null),
            map(_ => ({ width: element.clientWidth, height: element.clientHeight })),
            tap(viewPort =>
            {
                this.state.viewPortWidth .next(viewPort.width);
                this.state.viewPortHeight.next(viewPort.height);
            })
        );
    }
}