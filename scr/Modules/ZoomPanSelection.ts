namespace pivotcharts{
    export class ZoomPanSelection extends apexcharts.ZoomPanSelection{
        selectionDrawn({ context, zoomtype }){
            super.selectionDrawn({ context, zoomtype });
            let startX = context.startX;
            let endX = context.endX;

            let minVal = startX / (this.ctx.w.globals.gridWidth / 100);
            let maxVal = endX / (this.ctx.w.globals.gridWidth / 100);

            Data.Scroll.removeData(minVal);
            Data.Scroll.removeData(maxVal, -1);
            //Data.Scroll.dropScroll();
        }
    }
}
