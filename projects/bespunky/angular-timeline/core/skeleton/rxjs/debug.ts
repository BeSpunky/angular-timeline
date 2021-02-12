import { Observable, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

export function debug<T>(message: string | ((value: T) => string)): (source: Observable<T>) => Observable<T>
{
    return (source: Observable<T>) => source.pipe(message instanceof Function
        ? tap((value: T) => console.log(message(value)))
        : tap(_ => console.log(message))
    );
}