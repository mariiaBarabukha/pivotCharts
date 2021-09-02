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
          }
        }
      }
}