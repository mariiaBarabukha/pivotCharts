namespace Data {
  export class AxisDataSetsMaker extends Data.DataSetsMaker {
    makeDataSets() {
      
      this.riseAllCollapsedSeries();

      this.determinateRowsNames();
      this.determinateColumnsNames();
      var sortByColumns = this.sortData();
      var categories: string[] = sortByColumns[0].map((x) => {
        var r = x.r_full.split("_");
        return this.capitalizeFirstLetter(r[r.length - 1]);
      });
      var series = this.makeSeries(sortByColumns);
      this.hideSeries(series);

      return { series: series, xaxis: { categories: categories } };
    }
  }
}
