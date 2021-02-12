import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ValueInRangeParams = [value: number, min: number, max: number];

export function valueInRange()
{
    return (source: Observable<ValueInRangeParams>) => source.pipe(map(([value, min, max]) => min <= value && value <= max));
}