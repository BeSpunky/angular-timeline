import { ViewRef } from '@angular/core';
import { TickItem } from '../../../abstraction/tick-item';
import { TickContext } from './tick-context';

export interface RenderedTick
{
    item   : TickItem;
    context: TickContext;
    view   : ViewRef;
}