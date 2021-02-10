import { Observable, OperatorFunction } from 'rxjs';
import { filter, windowToggle } from 'rxjs/operators';

export function useActivationSwitch<T>(observable: Observable<boolean>): OperatorFunction<T, Observable<T>>
{
    const on  = observable.pipe(filter(activate => activate));
    const off = observable.pipe(filter(activate => !activate));
    
    return windowToggle<T, boolean>(on, () => off);
}