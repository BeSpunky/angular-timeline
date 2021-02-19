export abstract class TimelineCamera
{
    abstract move  (amount: number)                               : void;
    abstract moveTo(date: Date)                                   : void;
    abstract moveTo(position: number)                             : void;
    abstract moveTo(positionOrDate: number | Date)                : void;
    abstract zoom  (amount: number)                               : void;
    abstract zoomOn(date: Date, amount: number)                   : void;
    abstract zoomOn(position: number, amount: number)             : void;
    abstract zoomOn(positionOrDate: number | Date, amount: number): void;
}
