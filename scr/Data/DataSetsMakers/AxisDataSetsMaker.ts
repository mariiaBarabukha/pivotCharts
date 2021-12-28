namespace Data {
  export class AxisDataSetsMaker extends Data.DataSetsMaker {
    formStringsToHide(series) {
      return series.map((x) => x.full_name.toLowerCase());
    }
    makeDataSets() {
      this.riseAllCollapsedSeries();
      // Data.RowsLevels = [];
      this.determinateRowsNames();
      this.determinateColumnsNames();
      var sortByColumns = this.sortData();
      var categories: string[] = sortByColumns[0].map((x) => {
        var r = x.r_full.split("_");
        return this.capitalizeFirstLetter(r[r.length - 1]);
      });
      var series = this.makeSeries(sortByColumns);
      this.hideSeries(series);
      // console.log(series);
      return { series: series, xaxis: { categories: categories } };
    }

    makeSeries(sortByColumns: any[]): any[] {
      var key = "c_full";
      var series = [];
      sortByColumns.forEach((group) => {
        if (group[0].r0 === undefined && group.length > 1) {
          group.splice(0, 1);
        }
        var n = group[0][key].split("_");
        series.push({
          name: n[n.length - 1] || "",
          data: group.map((a) => a.v0),
          full_name: group[0][key],
          level: n.length - 1,
          r_fulls: group.map(x=>x.r_full)
        });
      });
      Data.RowsLevels = (sortByColumns[0].map(x=>x.r_full.split('_').length-1));
      // pivotcharts.LabelsGroup.allLabels = (sortByColumns[0].map(x=>x.r_full));
      return series;
    }
  }
}
