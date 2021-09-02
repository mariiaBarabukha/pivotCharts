namespace pivotcharts{
    
    export class PivotGrid extends apexcharts.Grid{
        _drawInvertedXYLines({ xCount }){
          const w = this.w;
          if (w.config.grid.xaxis.lines.show || w.config.xaxis.axisTicks.show) {
            let x1 = w.globals.padHorizontal
            let y1 = 0
            let x2
            let y2 = w.globals.gridHeight
            for (let i = 0; i < xCount + 1; i++) {
              if (w.config.grid.xaxis.lines.show) {
                this._drawGridLine({ x1, y1, x2, y2, parent: this.elgridLinesV })
              }
      
              let xAxis = new PivotXAxis(this.ctx)
              xAxis.drawXaxisTicks(x1, this.elg)
              x1 = x1 + w.globals.gridWidth / xCount + 0.3
              x2 = x1
            }
          }
      
          // draw horizontal lines
          if (w.config.grid.yaxis.lines.show) {
            let x1 = 0
            let y1 = 0
            let y2 = 0
            let x2 = w.globals.gridWidth
      
            for (let i = 0; i < w.globals.dataPoints + 1; i++) {
              this._drawGridLine({ x1, y1, x2, y2, parent: this.elgridLinesH })
      
              y1 = y1 + w.globals.gridHeight / w.globals.dataPoints
              y2 = y1
            }
          }
        }
  
        _drawGridLines({ i, x1, y1, x2, y2, xCount, parent }){
          
          const w = this.w
  
          const shouldDraw = () => {
            if (i === 0 && w.globals.skipFirstTimelinelabel) {
              return false
            }
  
            if (
              i === xCount - 1 &&
              w.globals.skipLastTimelinelabel &&
              !w.config.xaxis.labels.formatter
            ) {
              return false
            }
            if (w.config.chart.type === 'radar') {
              return false
            }
            return true
          }
  
          if (shouldDraw()) {
            if (w.config.grid.xaxis.lines.show) {
              this._drawGridLine({ x1, y1, x2, y2, parent })
            }
            let xAxis = new PivotXAxis(this.ctx);
            xAxis.drawXaxisTicks(x1, this.elg)
          }
        }
      }
}