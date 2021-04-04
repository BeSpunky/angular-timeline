export class ViewBounds
{
    public readonly left!  : number;
    public readonly top!   : number;
    public readonly right! : number;
    public readonly bottom!: number;

    public readonly width! : number;
    public readonly height!: number;
    
    public readonly screenCenterX: number;
    public readonly screenCenterY: number;

    constructor(
        public readonly viewPortWidth : number,
        public readonly viewPortHeight: number,
        public readonly zoom          : number,
        public readonly viewCenter    : number
    )
    {
        this.top    = 0;
        this.left   = viewCenter - viewPortWidth / 2;
        this.width  = viewPortWidth;
        this.height = viewPortHeight;
        this.right  = this.left + this.width;
        this.bottom = this.top + this.height;

        this.screenCenterX = this.viewPortWidth  / 2;
        this.screenCenterY = this.viewPortHeight / 2;
    }
}