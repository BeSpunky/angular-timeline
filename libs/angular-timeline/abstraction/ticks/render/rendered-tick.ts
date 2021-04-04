import { ViewRef } from '@angular/core';

import { TickItem    } from './tick-item';
import { TickContext } from './tick-context';

export interface RenderedTick
{
    item   : TickItem;
    context: TickContext;
    view   : ViewRef;
}