export class TickItem
{
    constructor(
        public readonly position: number,
        public readonly value   : Date,
        public readonly width   : number,
        public readonly label   : string | number
    ) { }
}
