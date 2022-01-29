namespace pivotcharts{
    export class ZoomPanSelection extends apexcharts.ZoomPanSelection{
        selectionDrawn({ context, zoomtype }){
            super.selectionDrawn({ context, zoomtype });
            document.getElementById("apexcharts-xaxis").style.zIndex = "100";
            // let y = context.startY;
            // let rect = document.getElementsByClassName("apexcharts-inner")[0].getBoundingClientRect();
            // let top = rect.top;
            // let bottom = rect.bottom;
            // let startY = context.startY;
            // if(startY > bottom || startY < top){
            //     return;
            // }
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
