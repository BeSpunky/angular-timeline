import { AfterViewInit, Directive, EmbeddedViewRef, Input, OnChanges, OnInit, Optional, SkipSelf, TemplateRef, ViewChildren, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[timelineRange]'
})
export class TimelineRangeDirective
{
    public id     : string = '';
    public from   : number = 0;
    public to     : number = 10;
    public jumps  : number = 1;
    public minZoom: number = 0;
    public maxZoom: number = 100;

    constructor(
        public template: TemplateRef<any>
    ) { }

    @Input() public set timelineRange       (value: any   ) { this.id = value; }

    @Input() public set timelineRangeFrom   (value: number) { this.from  = value; }
    @Input() public set timelineRangeTo     (value: number) { this.to    = value; }
    @Input() public set timelineRangeJumps  (value: number) { this.jumps = value; }

    @Input() public set timelineRangeMinZoom(value: number) { this.minZoom = value; }
    @Input() public set timelineRangeMaxZoom(value: number) { this.maxZoom = value; }
}
