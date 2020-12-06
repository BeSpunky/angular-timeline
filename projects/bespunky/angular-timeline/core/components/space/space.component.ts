// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

// @Component({
//     selector   : 'bs-timeline-space',
//     templateUrl: './space.component.html',
//     styleUrls  : ['./space.component.css']
// })
// export class SpaceComponent implements OnChanges
// {
//     @Input() public ticks    : number;
//     @Input() public zoom     : number;
//     @Input() public markStart: boolean = true;
//     @Input() public markEnd  : boolean = true;

//     public innerSpaces: any[] = [];

//     constructor() { }

//     ngOnChanges(changes: SimpleChanges)
//     {
//         if (changes.ticks?.currentValue)
//             this.refreshChildren();
//     }

//     protected refreshChildren(): void
//     {
//         this.innerSpaces = Array(this.ticks).fill(0);
//     }
// }
