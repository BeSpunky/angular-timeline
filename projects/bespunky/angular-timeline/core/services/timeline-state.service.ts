import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Injectable()
export class TimelineStateService
{
    public zoom: BehaviorSubject<number> = new BehaviorSubject(0);
}
