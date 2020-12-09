import { AfterViewInit, Directive, Input, Optional, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[timelineRange]'
})
export class TimelineRangeDirective implements AfterViewInit
{
    @Input() public from : number = 0;
    @Input() public to   : number = 10;
    @Input() public jumps: number = 1;

    constructor(
        @Optional() public  parent         : TimelineRangeDirective,
                    private view           : ViewContainerRef,
                    private template       : TemplateRef<any>
    ) { }

    ngAfterViewInit()
    {
        for (let tick = this.from; tick <= this.to; tick += this.jumps)
        {
            this.view.createEmbeddedView(this.template);
        }
    }
}
