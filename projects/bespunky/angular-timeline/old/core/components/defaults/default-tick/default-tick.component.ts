// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

// @Component({
//     selector   : 'bs-timeline-default-tick',
//     templateUrl: './default-tick.component.html',
//     styleUrls  : ['./default-tick.component.css']
// })
// export class DefaultTickComponent implements OnChanges
// {
//     @Input() public position : 'start' | 'end' | 'middle';

//     public line: { x1: number, y1: number, x2: number, y2: number };

//     ngOnChanges(changes: SimpleChanges)
//     {
//         if (changes.position?.currentValue)
//             this.updateLine();
//     }

//     public updateLine(): void
//     {
//         if      (this.position === 'start')  this.line = { x1: 0, y1: 0, x2: 0, y2: 100 };
//         else if (this.position === 'end')    this.line = { x1: 100, y1: 0, x2: 100, y2: 100 };
//         else if (this.position === 'middle') this.line = { x1: 50, y1: 0, x2: 50, y2: 100 };
//     }
// }
