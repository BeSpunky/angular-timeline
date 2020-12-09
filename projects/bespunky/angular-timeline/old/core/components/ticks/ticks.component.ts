// import { Component, Input, Optional, OnChanges, SimpleChanges, SkipSelf, ViewEncapsulation } from '@angular/core';

// // import { TimelineComponent } from '../../timeline.component';

// @Component({
//     selector     : 'bs-timeline-ticks',
//     templateUrl  : './ticks.component.html',
//     styleUrls    : ['./ticks.component.css'],
//     exportAs     : 'ticks',
//     encapsulation: ViewEncapsulation.None
// })
// export class TicksComponent implements OnChanges
// {
//     @Input() public count    : number;
//     @Input() public tickClass: string;
//     @Input() public zoom: number;
    
//     public periods: any[];

//     constructor(public timeline: TimelineComponent, @Optional() @SkipSelf() public parent: TicksComponent)
//     {
//     }

//     ngOnChanges(changes: SimpleChanges)
//     {
//         if (changes.count && changes.count.currentValue)
//             this.refreshTicks();
//     }

//     protected refreshTicks(): void
//     {
//         this.periods = Array(this.count).fill(0);
//     }
// }
