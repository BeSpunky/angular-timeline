import { TickItem } from './directives/timeline-tick.directive';
import { ViewBounds } from './services/timeline-renderer.service';

const parent        = null;
const tickWidth     = 12000;
const viewCenter    = -3500;
const bufferedTicks = 1;
const items: number | any[] = 0;

const id            = 'years';
const zoom          = 1;
const viewBounds    = new ViewBounds(1000, 500, zoom, viewCenter);

// [parent, items, tickWidth, label, viewBounds, bufferedTicks]) =>
function renderedItemsFeed(): TickItem[]
{
    const closestLeftTickIndex = Math.floor(viewBounds.left / tickWidth);/*?*/
    const closestRightTickIndex = Math.ceil(viewBounds.right / tickWidth);/*?*/
    
    const startTickIndex = closestLeftTickIndex - bufferedTicks;/*?*/
    const endTickIndex = closestRightTickIndex + bufferedTicks;/*?*/
                
    let indexes: number[];
    let values: any[];
    let calcValueIndex: (values: any[], tickIndex: number, renderIndex: number) => number;

    if (parent)
    {
        if (items)
        {
            values = items instanceof Array ? items : range(0, items);/*?*/
            indexes = range(startTickIndex, endTickIndex + 1);/*?*/

            calcValueIndex = (values: any[], tickIndex: number, renderIndex: number) =>
            {
                const valueRelativeIndex = tickIndex % values.length;/*?*/
                            
                return tickIndex >= 0 ? valueRelativeIndex : values.length + valueRelativeIndex - 1;/*?*/
            };
        }
        else
            throw new Error(`No items specified for the ${id} tick`);
    }
    else // No parent, this is the top level tick
    {
        if (items)
        {
            values = items instanceof Array ? items : range(0, items);/*?*/
            indexes = range(0, values.length);/*?*/

            calcValueIndex = (values: any[], tickIndex: number, renderIndex: number) =>
            {
                const valueRelativeIndex = tickIndex % values.length;/*?*/
                            
                return tickIndex >= 0 ? valueRelativeIndex : values.length + valueRelativeIndex - 1;/*?*/
            };
        }
        else
        {
            indexes = range(startTickIndex, endTickIndex + 1);/*?*/
            values = [...indexes];/*?*/

            calcValueIndex = (values: any[], tickIndex: number, renderIndex: number) => renderIndex/*?*/;
        }
    }
                
    return indexes.map((tickIndex, renderIndex) =>
    {
        const valueIndex = calcValueIndex(values, tickIndex, renderIndex);/*?*/
        const value = values[valueIndex];/*?*/
        const itemLabel = value;/*?*/
                
        return new TickItem(tickIndex, tickWidth, itemLabel, value);
    });
}

function range(from: number, to: number): number[]
{
    return Array.from({ length: to - from }, (_, index) => from + index);
}

const x = renderedItemsFeed();

x.map(item => item.index);   /*?*/
x.map(item => item.value);   /*?*/
x.map(item => item.position);/*?*/
x.map(item => item.label);   /*?*/