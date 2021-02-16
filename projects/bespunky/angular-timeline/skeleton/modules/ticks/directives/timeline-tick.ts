import { ViewContainerRef, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimelineState } from '../../../services/state/timeline-state';
import { TickItem } from '../view-models/tick-item';
import { DatesBetweenGenerator, DayFactor, TickLabeler } from '../view-models/types';

/**
 * Represents a tick scale and provides tools to easily render it.
 *
 * @export
 * @abstract
 * @class TimelineTick
 */
export abstract class TimelineTick
{
    /**
     * The id of the tick scale (e.g. 'years', 'months', etc.).
     * 
     * Currently not used anywhere. Kept for future reference.
     *
     * @defaultValue ''
     * @type {BehaviorSubject<string>}
     */
    public readonly id          : BehaviorSubject<string>                = new BehaviorSubject('');
    /**
     * The minimum level of zoom at which the tick scale should render on the timeline. When the zoom level
     * reaches a lower number, the tick scale will disappear from the screen.
     *
     * @defaultValue 0
     * @type {BehaviorSubject<number>}
     */
    public readonly minZoom     : BehaviorSubject<number>                = new BehaviorSubject(0);
    /**
     * The maximum level of zoom at which the tick scale should render on the timeline. When the zoom level
     * reaches a higher number, the tick scale will disappear from the screen.
     *
     * @defaultValue 100
     * @type {BehaviorSubject<number>}
     */
    public readonly maxZoom     : BehaviorSubject<number>                = new BehaviorSubject(100);
    /**
     * A labeling function that will be used to produce and provide the label matching a specific date on
     * the timeline. When not provided, the date will be used as the value.
     *
     * @type {BehaviorSubject<TickLabeler>}
     */
    public readonly label       : BehaviorSubject<TickLabeler>           = new BehaviorSubject(value => value);
    /**
     * A function that generates an array of all dates that exist between two specified dates, truncated to
     * the level of the tick. The returned dates will be used to calculate the position of the ticks to render
     * for this scale.
     * 
     * For example, between 20/12/2020 11:30 and 5/3/2021 12:00 there are:
     * 1 date for a year  (1/1/2021 00:00)
     * 3 dates for months (1/1/2021 00:00, 1/2/2021 00:00, 1/3/2021 00:00)
     * ...
     *
     * @defaultValue () => []
     * @type {BehaviorSubject<DatesBetweenGenerator>}
     */
    public readonly datesBetween: BehaviorSubject<DatesBetweenGenerator> = new BehaviorSubject((() => []) as DatesBetweenGenerator);
    /**
     * The factor defining the relationship between one day and the tick level.
     *
     * Example:
     * For hours, this would be 24. 
     * For minutes, this would be 24 hours x 60 minutes = 1440.
     * For months, this would be a function that calculates the number of days according to the specified month.
     * 
     * @defaultValue 1
     * @type {BehaviorSubject<DayFactor>}
     */
    public readonly dayFactor   : BehaviorSubject<DayFactor>             = new BehaviorSubject(1 as DayFactor);

    /**
     * The view container in which ticks should be rendered.
     *
     * @abstract
     * @type {ViewContainerRef}
     */
    abstract readonly view    : ViewContainerRef;
    /**
     * The reference to the template to duplicate and render for each tick on the screen.
     *
     * @abstract
     * @type {TemplateRef<any>}
     */
    abstract readonly template: TemplateRef<any>;

    /**
     * Generates the tick items to render according to what fits on the screen.
     * The generated array includes the additional items needed as virtualization buffer for both sides as specified in
     * the `state.ticksBuffer` factor.
     *
     * The observable depends on zoom, view center, view bounds, buffer size, and base tick size. Any change
     * would trigger the regeneration of the items.
     * 
     * @abstract
     * @type {Observable<TickItem[]>}
     */
    abstract readonly itemsToRender: Observable<TickItem[]>;
    /**
     * Notifies when ticks should render and unrender. Also used as an activation switch for `itemsToRender`.
     * 
     * The observable depends on the current zoom level and the defined min/maxZoom properties.
     *
     * @abstract
     * @type {Observable<boolean>}
     */
    abstract readonly shouldRender: Observable<boolean>;
    /**
     * The object describing the current state of the timeline which defined the tick.
     *
     * @abstract
     * @type {TimelineState}
     */
    abstract readonly state: TimelineState;
}