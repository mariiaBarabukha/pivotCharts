namespace Data {
  export class OneDimentionalDataSetsMaker extends Data.DataSetsMaker {
    makeDataSets() {
      
      this.determinateRowsNames();
      this.determinateColumnsNames();
      var sorted = this.sortData("r_full");
      var categories: string[] = sorted[0].map((x) => {
        var r = x.c_full.split("_");
        return this.capitalizeFirstLetter(r[r.length - 1]);
      });
      var series = this.makeSeries(sorted, "r_full");
      this.hideSeries(series);

      return { series: series, labels: categories };
    }
  }
}
