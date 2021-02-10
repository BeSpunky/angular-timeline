import { Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs';
import { filter, mergeMap, windowToggle } from 'rxjs/operators';

export function useActivationSwitch<T>(observable: Observable<boolean>): UnaryFunction<Observable<T>, Observable<T>>
{
    const on  = observable.pipe(filter(activate => activate));
    const off = observable.pipe(filter(activate => !activate));
    
    return pipe(
        windowToggle<T, boolean>(on, () => off),
        mergeMap(value => value)
    );
}