namespace Data {
  export class OneDimentionalDataSetsMaker extends Data.DataSetsMaker {
    makeDataSets() {
      var sortByColumns = this.sortData();
      var categories: string[] = sortByColumns[0].map((x) => {
        var r = x.r_full.split("_");
        return this.capitalizeFirstLetter(r[r.length - 1]);
      });
      var series = this.makeSeries(sortByColumns);
      this.hideSeries(series);

      return { series: series, labels: categories };
    }
  }
}
