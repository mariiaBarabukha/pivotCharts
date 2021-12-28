namespace pivotcharts {
  export class PivotData extends apexcharts.Data {
    constructor(ctx) {
      super(ctx);
    }
    parseDataAxisCharts(ser, ctx?) {
      super.parseDataAxisCharts(ser, ctx);
      var gl = this.w.globals;
      gl.full_name = [];
      gl.series_levels = [];
      let rf = ser[0].r_fulls;
      gl.rows_levels = rf.map(x=>x.split('_').length-1);

      for (let i = 0; i < ser.length; i++) {
        if (ser[i].full_name !== undefined) {
          gl.full_name.push(ser[i].full_name);
        } else {
          gl.full_name.push("full_name-" + (i + 1));
        }

        if (ser[i].level !== undefined) {
          gl.series_levels.push(ser[i].level);
        } else {
          gl.series_levels.push(0);
        }
      }
    }

    parseDataNonAxisCharts(ser) {
      super.parseDataNonAxisCharts(ser.data);
      var gl = this.w.globals;
      gl.full_name = Object.assign({}, gl.seriesNames);
      gl.series_levels = ser.levels;
      // if (ser.level !== undefined) {
      //   gl.series_levels.push(ser.level)
      // } else {
      //   gl.series_levels.push(0)
      // }
      return this.w;
    }

    parseData(ser) {
      let w = this.w
      let cnf = w.config
      let gl = w.globals
      this.excludeCollapsedSeriesInYAxis()
  
      // If we detected string in X prop of series, we fallback to category x-axis
      this.fallbackToCategory = false
  
      this.ctx.core.resetGlobals()
      this.ctx.core.isMultipleY()
  
      if (gl.axisCharts) {
        // axisCharts includes line / area / column / scatter
        this.parseDataAxisCharts(ser)
      } else {
        // non-axis charts are pie / donut
        var i = this.ctx.rowsSelector.getCurrentRowIndex();
        this.parseDataNonAxisCharts(ser[i])
      }
  
      this.coreUtils.getLargestSeries()
  
      // set Null values to 0 in all series when user hides/shows some series
      if (cnf.chart.type === 'bar' && cnf.chart.stacked) {
        const series = new apexcharts.Series(this.ctx)
        gl.series = series.setNullSeriesToZeroValues(gl.series)
      }
  
      this.coreUtils.getSeriesTotals()
      if (gl.axisCharts) {
        this.coreUtils.getStackedSeriesTotals()
      }
  
      this.coreUtils.getPercentSeries()
  
      if (
        !gl.dataFormatXNumeric &&
        (!gl.isXNumeric ||
          (cnf.xaxis.type === 'numeric' &&
            cnf.labels.length === 0 &&
            cnf.xaxis.categories.length === 0))
      ) {
        // x-axis labels couldn't be detected; hence try searching every option in config
        this.handleExternalLabelsData(ser)
      }
  
      // check for multiline xaxis
      const catLabels = this.coreUtils.getCategoryLabels(gl.labels)
      for (let l = 0; l < catLabels.length; l++) {
        if (Array.isArray(catLabels[l])) {
          gl.isMultiLineX = true
          break
        }
      }
    }
  }
}
