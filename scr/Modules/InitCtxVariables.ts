namespace pivotcharts{
    export class PivotInitCtxVariables extends apexcharts.InitCtxVariables{
        
        initModules(){
            super.initModules();
            this.ctx.core = new PivotCore(this.ctx.el, this.ctx);
            this.ctx.legend = new PivotLegend(this.ctx, {});
            this.ctx.axes = new PivotAxis(this.ctx);
            this.ctx.grid = new PivotGrid(this.ctx);;
            this.ctx.data = new PivotData(this.ctx);
            this.ctx.updateHelpers = new PivotUpdateHelpers(this.ctx);
            this.ctx.theme = new PivotTheme(this.ctx);
            this.ctx.rowsSelector = this.ctx.rowsSelector || new Data.RowsSelector(this.ctx);
        }
    }  

}