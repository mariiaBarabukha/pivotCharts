namespace pivotcharts{
    export class PivotUpdateHelpers extends apexcharts.UpdateHelpers{
        _extendSeries(s, i){
          const w = this.w
          const ser = w.config.series[i]
  
          return {
            ...w.config.series[i],
            name: s.name ? s.name : ser && ser.name,
            color: s.color ? s.color : ser && ser.color,
            type: s.type ? s.type : ser && ser.type,
            data: s.data ? s.data : ser && ser.data,
            full_name: s.full_name ? s.full_name : ser && ser.full_name,
            level : s.level != undefined ? s.level : ser && ser.level,
            levels : s.levels != undefined ? s.levels : ser && ser.levels
          }
        }

        _updateSeries(newSeries, animate, overwriteInitialSeries = false) {
          const w = this.w
      
          w.globals.shouldAnimate = animate
      
          w.globals.dataChanged = true
      
          if (animate) {
            this.ctx.series.getPreviousPaths()
          }
      
          let existingSeries
      
          // axis charts
          if (w.globals.axisCharts) {
            existingSeries = newSeries.map((s, i) => {
              return this._extendSeries(s, i)
            })
      
            if (existingSeries.length === 0) {
              existingSeries = [{ data: [] }]
            }
            w.config.series = existingSeries
          } else {
          //   // non-axis chart (pie/radialbar)
            // if(w.config.series[0] != undefined && typeof w.config.series[0] == 'object') { 
              
            // }
            // w.config.series = newSeries.slice()
          }
      
          if (overwriteInitialSeries) {
            w.globals.initialSeries = apexcharts.Utils.clone(w.config.series)
          }
          return this.ctx.update()
        }
      }
}