import { Observable, pipe, UnaryFunction                      } from 'rxjs';
import { distinctUntilChanged, filter, mergeMap, windowToggle } from 'rxjs/operators';

export function useActivationSwitch<T>(observable: Observable<boolean>): UnaryFunction<Observable<T>, Observable<T>>
{
    const activate = observable.pipe(distinctUntilChanged());
    const on       = activate.pipe(filter(activate => activate));
    const off      = activate.pipe(filter(activate => !activate));
    
    return pipe(
        windowToggle<T, boolean>(on, () => off),
        mergeMap(value => value)
    );
}