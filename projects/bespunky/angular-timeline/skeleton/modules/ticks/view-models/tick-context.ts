import { BehaviorSubject } from 'rxjs';
import { TickItem } from './tick-item';

export class TickContext
{
    public readonly width   : BehaviorSubject<number>;
    public readonly position: BehaviorSubject<number>;
    public readonly label   : BehaviorSubject<string | number>;
    public readonly value   : BehaviorSubject<Date>;
    
    constructor(item: TickItem)
    {
        this.position = new BehaviorSubject(item.position);
        this.value    = new BehaviorSubject(item.value   );
        this.width    = new BehaviorSubject(item.width   );
        this.label    = new BehaviorSubject(item.label   );
    }

    public update(item: TickItem)
    {
        this.position.next(item.position);
        this.value   .next(item.value   );
        this.width   .next(item.width   );
        this.label   .next(item.label   );
    }
}

export type TickViewContext = { $implicit: TickContext } & Partial<TickContext>;
