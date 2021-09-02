namespace pivotcharts{
    export class PivotData extends apexcharts.Data{

        constructor(ctx){
          super(ctx);
        }
        parseDataAxisCharts(ser, ctx){
          super.parseDataAxisCharts(ser, ctx);
          var gl = this.w.globals;
          gl.full_name = [];
          for (let i = 0; i < ser.length; i++) {
            if (ser[i].full_name !== undefined) {
              gl.full_name.push(ser[i].full_name)
            } else {
              gl.full_name.push('full_name-' + (i + 1))
            }
          }
        }

        parseDataNonAxisCharts(ser) {
            super.parseDataNonAxisCharts(ser);
            var gl = this.w.globals;
            gl.full_name = Object.assign(gl.seriesNames);
            return this.w
          }
      }
  
}