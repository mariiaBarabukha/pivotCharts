namespace pivotcharts{
    export class PivotCore extends apexcharts.Core{
        resizeNonAxisCharts(){
            var w = this.w;
            var gl = w.globals;
            var legendHeight = 0;
            var offY = w.config.chart.sparkline.enabled ? 1 : 15;
            offY = offY + w.config.grid.padding.bottom;
    
            if ((w.config.legend.position === 'top' || w.config.legend.position === 'bottom') && w.config.legend.show && !w.config.legend.floating) {
              legendHeight = new PivotLegend(this.ctx, {}).legendHelpers.getLegendBBox().clwh + 10;
            }
    
            var el = w.globals.dom.baseEl.querySelector('.apexcharts-radialbar, .apexcharts-pie');
            var chartInnerDimensions = w.globals.radialSize * 2.05;
    
            if (el && !w.config.chart.sparkline.enabled) {
              var elRadialRect = apexcharts.Utils.getBoundingClientRect(el);
              chartInnerDimensions = elRadialRect.bottom;
              var maxHeight = elRadialRect.bottom - elRadialRect.top;
              chartInnerDimensions = Math.max(w.globals.radialSize * 2.05, maxHeight);
            }
    
            var newHeight = chartInnerDimensions + gl.translateY + legendHeight + offY;
    
            if (gl.dom.elLegendForeign) {
              gl.dom.elLegendForeign.setAttribute('height', newHeight);
            }
    
            gl.dom.elWrap.style.height = newHeight + 'px';
            apexcharts.Graphics.setAttrs(gl.dom.Paper.node, {
              height: newHeight
            });
            gl.dom.Paper.node.parentNode.parentNode.style.minHeight = newHeight + 'px';
          
        }

        plotChartType(ser, xyRatios) {
          const w = this.w
          const cnf = w.config
          const gl = w.globals
      
          let lineSeries = {
            series: [],
            i: []
          }
          let areaSeries = {
            series: [],
            i: []
          }
          let scatterSeries = {
            series: [],
            i: []
          }
      
          let bubbleSeries = {
            series: [],
            i: []
          }
      
          let columnSeries = {
            series: [],
            i: []
          }
      
          let candlestickSeries = {
            series: [],
            i: []
          }
      
          let boxplotSeries = {
            series: [],
            i: []
          }
      
          gl.series.map((series, st) => {
            let comboCount = 0
            // if user has specified a particular type for particular series
            if (typeof ser[st].type !== 'undefined') {
              if (ser[st].type === 'column' || ser[st].type === 'bar') {
                if (gl.series.length > 1 && cnf.plotOptions.bar.horizontal) {
                  // horizontal bars not supported in mixed charts, hence show a warning
                  console.warn(
                    'Horizontal bars are not supported in a mixed/combo chart. Please turn off `plotOptions.bar.horizontal`'
                  )
                }
                columnSeries.series.push(series)
                columnSeries.i.push(st)
                comboCount++
                w.globals.columnSeries = columnSeries.series
              } else if (ser[st].type === 'area') {
                areaSeries.series.push(series)
                areaSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'line') {
                lineSeries.series.push(series)
                lineSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'scatter') {
                scatterSeries.series.push(series)
                scatterSeries.i.push(st)
              } else if (ser[st].type === 'bubble') {
                bubbleSeries.series.push(series)
                bubbleSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'candlestick') {
                candlestickSeries.series.push(series)
                candlestickSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'boxPlot') {
                boxplotSeries.series.push(series)
                boxplotSeries.i.push(st)
                comboCount++
              } else {
                // user has specified type, but it is not valid (other than line/area/column)
                console.warn(
                  'You have specified an unrecognized chart type. Available types for this property are line/area/column/bar/scatter/bubble'
                )
              }
              if (comboCount > 1) {
                gl.comboCharts = true
              }
            } else {
              lineSeries.series.push(series)
              lineSeries.i.push(st)
            }
          })
      
          let line = new charts.PivotLine(this.ctx, xyRatios, false)
          let boxCandlestick = new apexcharts.BoxCandleStick(this.ctx, xyRatios)
          this.ctx.pie = new charts.PivotPie(this.ctx)
          let radialBar = new apexcharts.Radial(this.ctx)
          this.ctx.rangeBar = new apexcharts.RangeBar(this.ctx, xyRatios)
          let radar = new charts.PivotRadar(this.ctx)
          let elGraph = []
      
          if (gl.comboCharts) {
            if (areaSeries.series.length > 0) {
              elGraph.push(line.draw(areaSeries.series, 'area', areaSeries.i))
            }
            if (columnSeries.series.length > 0) {
              if (w.config.chart.stacked) {
                let barStacked = new apexcharts.BarStacked(this.ctx, xyRatios)
                elGraph.push(barStacked.draw(columnSeries.series, columnSeries.i))
              } else {
                this.ctx.bar = new charts.PivotBar(this.ctx, xyRatios)
                elGraph.push(this.ctx.bar.draw(columnSeries.series, columnSeries.i))
              }
            }
            if (lineSeries.series.length > 0) {
              elGraph.push(line.draw(lineSeries.series, 'line', lineSeries.i))
            }
            if (candlestickSeries.series.length > 0) {
              elGraph.push(
                boxCandlestick.draw(candlestickSeries.series, candlestickSeries.i)
              )
            }
            if (boxplotSeries.series.length > 0) {
              elGraph.push(boxCandlestick.draw(boxplotSeries.series, boxplotSeries.i))
            }
            if (scatterSeries.series.length > 0) {
              const scatterLine = new apexcharts.Line(this.ctx, xyRatios, true)
              elGraph.push(
                scatterLine.draw(scatterSeries.series, 'scatter', scatterSeries.i)
              )
            }
            if (bubbleSeries.series.length > 0) {
              const bubbleLine = new apexcharts.Line(this.ctx, xyRatios, true)
              elGraph.push(
                bubbleLine.draw(bubbleSeries.series, 'bubble', bubbleSeries.i)
              )
            }
          } else {
            switch (cnf.chart.type) {
              case 'line':
                elGraph = line.draw(gl.series, 'line', null)
                break
              case 'area':
                elGraph = line.draw(gl.series, 'area', null)
                break
              case 'bar':
                if (cnf.chart.stacked) {
                  let barStacked = new apexcharts.BarStacked(this.ctx, xyRatios)
                  elGraph = barStacked.draw(gl.series, null)
                } else {
                  this.ctx.bar = new charts.PivotBar(this.ctx, xyRatios)
                  elGraph = this.ctx.bar.draw(gl.series)
                }
                break
              case 'candlestick':
                let candleStick = new apexcharts.BoxCandleStick(this.ctx, xyRatios)
                elGraph = candleStick.draw(gl.series, null)
                break
              case 'boxPlot':
                let boxPlot = new apexcharts.BoxCandleStick(this.ctx, xyRatios)
                elGraph = boxPlot.draw(gl.series, null)
                break
              case 'rangeBar':
                elGraph = this.ctx.rangeBar.draw(gl.series)
                break
              case 'heatmap':
                let heatmap = new apexcharts.HeatMap(this.ctx, xyRatios)
                elGraph = heatmap.draw(gl.series)
                break
              case 'treemap':
                let treemap = new apexcharts.Treemap(this.ctx, xyRatios)
                elGraph = treemap.draw(gl.series)
                break
              case 'pie':
              case 'donut':
              case 'polarArea':
                elGraph = this.ctx.pie.draw(gl.series)
                break
              case 'radialBar':
                elGraph = radialBar.draw(gl.series)
                break
              case 'radar':
                elGraph = radar.draw(gl.series)
                break
              default:
                elGraph = line.draw(gl.series, null, null)
            }
          }
      
          return elGraph
        }
    }
}