import { fromEvent, Observable  } from 'rxjs';
import { map, startWith, tap    } from 'rxjs/operators';
import { ElementRef, Injectable } from '@angular/core';

import { TimelineConfig, TimelineRenderer } from '@bespunky/angular-timeline/abstraction';

@Injectable()
export class TimelineRendererService extends TimelineRenderer
{
    constructor(private config: TimelineConfig, private element: ElementRef)
    {
        super();

        this.subscribe(this.viewPortSizeFeed());
    }

    private viewPortSizeFeed(): Observable<{ width: number, height: number }>
    {
        const element: HTMLElement = this.element.nativeElement;

        return fromEvent<UIEvent>(element, 'resize').pipe(
            startWith(null),
            map(() => ({ width: element.clientWidth, height: element.clientHeight })),
            tap(viewPort =>
            {
                this.config.viewPortWidth .next(viewPort.width);
                this.config.viewPortHeight.next(viewPort.height);
            })
        );
    }
}