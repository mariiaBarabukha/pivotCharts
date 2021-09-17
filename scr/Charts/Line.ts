namespace charts {
  export class PivotLine extends apexcharts.Line {
    _initSerieVariables(series, i, realIndex) {
      let full_names = this.w.globals.full_name;
      super._initSerieVariables(series, i, realIndex);
      const graphics = new pivotcharts.PivotGraphics(this.ctx);
      let longestSeries = series[i].length === this.w.globals.dataPoints;
      this.elSeries.attr({
        "data:longestSeries": longestSeries,
        rel: i + 1,
        "data:realIndex": realIndex,
        full_name: full_names[i],
      });
    }
  }
}
