import { TickVisualizationChanges } from './timeline-renderer.service';

   let currentViews  =     [0, 1, 2, 3, 4];
const renderedItems    = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7]; // Grow on both sides
// const renderedItems    = [-2, -1, 0, 1, 2, 3, 4]; // Grow left
// const renderedItems    = [0, 1, 2, 3, 4, 5, 6, 7]; // Grow right
// const renderedItems    = [1, 2]; // Shrink on both sides
// const renderedItems    = [2, 3, 4]; // Shrink left
// const renderedItems    = [0, 1, 2]; // Shrink right
// const renderedItems    = [-2, -1, 0, 1, 2]; // Grow left, shrink right
// const renderedItems    = [2, 3, 4, 5, 6]; // Grow right, shrink left

const oldFirstIndex = currentViews[0];/*?*/
const newFirstIndex = renderedItems[0];/*?*/
const prefixChanges = oldFirstIndex - newFirstIndex;/*?*/

const oldLastIndex  = currentViews[currentViews.length - 1];/*?*/
const newLastIndex  = renderedItems[renderedItems.length - 1];/*?*/
const suffixChanges = newLastIndex - oldLastIndex;/*?*/



if (newFirstIndex > oldLastIndex || newLastIndex < oldFirstIndex)
{
    currentViews = renderedItems;/*?*/
}

let changes: TickVisualizationChanges = { replaceAll: false, updateFrom: 0, updateTo: 0, updateSourceFrom: 0 };

if (prefixChanges < 0)
{
    changes.removePrefixCount = -prefixChanges;
    changes.updateFrom        = -prefixChanges;
    changes.updateSourceFrom  = 0;
}
else
{
    changes.addPrefixCount   = prefixChanges;
    changes.updateFrom       = 0;
    changes.updateSourceFrom = prefixChanges;
}

if (suffixChanges < 0)
{
    changes.removeSuffixCount = -suffixChanges;
    changes.updateTo          = currentViews.length - 1 + suffixChanges ;
}
else
{
    changes.addSuffixCount   = suffixChanges;
    changes.updateTo         = currentViews.length - 1;
}

changes.addPrefixCount/*?*/;
changes.addSuffixCount/*?*/;
changes.removePrefixCount/*?*/;
changes.removeSuffixCount/*?*/;
changes.updateFrom/*?*/; changes.updateTo/*?*/; changes.updateSourceFrom/*?*/;

function removePrefix(views: number[], itemCount: number)
{
    const removed = views.splice(0, itemCount); removed;

    // removed.foreach(unrender)
}

function removeSuffix(views: number[], itemCount: number)
{
    const removed = views.splice(views.length - itemCount); removed;

    // removed.foreach(unrender)
}

function prefix(views: number[], newViews: number[], itemCount: number)
{
    const newItems = newViews.slice(0, itemCount);

    views.unshift(...newItems);
}

function suffix(views: number[], newViews: number[], itemCount: number)
{
    const newItems = newViews.slice(renderedItems.length - itemCount);

    views.push(...newItems);
}

if (suffixChanges < 0)
    removeSuffix(currentViews, -suffixChanges);
else
    suffix(currentViews, renderedItems, suffixChanges);

currentViews;

if (prefixChanges < 0)
    removePrefix(currentViews, -prefixChanges);
else
    prefix(currentViews, renderedItems, prefixChanges);

currentViews;
