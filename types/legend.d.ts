declare class Legend {
    constructor(ctx:any, opts:any);
    init():void;
    drawLegends():any;
    setLegendWrapXY(offsetX:number, offsetY:number):void;
    legendAlignHorizontal():void;
    legendAlignVertical():void;
    onLegendHovered(e:Event):void;
    onLegendClick(e:Event):void;
    
}

declare module Legend{
   
    export interface LegendOptions{
        ctx:any,
        w:any,
        onLegendClick:any,
        onLegendHovered:any,
        isBarsDistributed:any,
        legendHelpers:any
    }

}