import { ViewContainerRef, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TickItem } from '../view-models/tick-item';
import { DatesBetweenGenerator, DayFactor, TickLabeler } from '../view-models/types';

export abstract class TimelineTick
{
    public readonly id          : BehaviorSubject<string>                = new BehaviorSubject('');
    public readonly minZoom     : BehaviorSubject<number>                = new BehaviorSubject(0);
    public readonly maxZoom     : BehaviorSubject<number>                = new BehaviorSubject(100);
    public readonly label       : BehaviorSubject<TickLabeler>           = new BehaviorSubject(value => value);
    public readonly datesBetween: BehaviorSubject<DatesBetweenGenerator> = new BehaviorSubject((() => []) as DatesBetweenGenerator);
    public readonly dayFactor   : BehaviorSubject<DayFactor>             = new BehaviorSubject(1 as DayFactor);
    
    public readonly parent: BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);
    public readonly child : BehaviorSubject<TimelineTick | null> = new BehaviorSubject(null as TimelineTick | null);

    abstract readonly view    : ViewContainerRef;
    abstract readonly template: TemplateRef<any>;

    abstract readonly renderedItems: Observable<TickItem[]>;
    abstract readonly shouldRender : Observable<boolean>;
}
