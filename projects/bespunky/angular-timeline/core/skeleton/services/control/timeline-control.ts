import { Destroyable } from '@bespunky/angular-zen/core';
import { BehaviorSubject } from 'rxjs';

export abstract class TimelineControl extends Destroyable
{
    public readonly zoomOnWheel   : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly moveOnWheel   : BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly zoomOnKeyboard: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
    public readonly moveOnKeyboard: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
}
