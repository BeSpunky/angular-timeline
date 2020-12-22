import { AfterViewInit, Directive, EmbeddedViewRef, Input, OnChanges, OnInit, Optional, SkipSelf, TemplateRef, ViewChildren, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[timelineTicksDef]'
})
export class TimelineTicksDefinitionDirective
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

    @Input() public set timelineTicksDef       (value: any   ) { this.id = value; }

    @Input() public set timelineTicksDefFrom   (value: number) { this.from  = value; }
    @Input() public set timelineTicksDefTo     (value: number) { this.to    = value; }
    @Input() public set timelineTicksDefJumps  (value: number) { this.jumps = value; }

    @Input() public set timelineTicksDefMinZoom(value: number) { this.minZoom = value; }
    @Input() public set timelineTicksDefMaxZoom(value: number) { this.maxZoom = value; }
}
