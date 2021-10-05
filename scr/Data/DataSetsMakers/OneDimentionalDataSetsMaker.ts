namespace Data {
  export class OneDimentionalDataSetsMaker extends Data.DataSetsMaker {
    formStringsToHide(series: any): string[] {
      var c = series[series.length - 1];
      series.splice(series.length - 1, 1);
      return c;
    }
    makeDataSets() {
      this.riseAllCollapsedSeries();
      this.determinateRowsNames();
      this.determinateColumnsNames();
      var sorted = this.sortData("r_full");
      var categories: string[] = sorted[0].map((x) => {
        var r = x.c_full.split("_");
        return this.capitalizeFirstLetter(r[r.length - 1]);
      });

      var cat_full: string[] = sorted[0].map(x => x.c_full);
      Data.OneDCFull = cat_full;
      
      var series = this.makeSeries(sorted);
      
      // if(Data.Chart != null) {
      //   Data.Chart.updateSeries(series);
      // }
      series.push(cat_full);
      this.hideSeries(series);

      
      return { series: series, labels: categories };
    }    

    makeSeries(sortByColumns: any[]): any[] {
      var key = "r_full";
      var series = [];
      sortByColumns.forEach((group) => {
        if (group[0].r0 === undefined && group.length > 1) {
          group.splice(0, 1);
        }
        var n = group[0][key].split("_");
        var ls = group.map(x => x.c_full.split("_").length-1);
        series.push({
          name: n[n.length - 1] || "",
          data: group.map((a) => a.v0),
          full_name: group[0][key],
          levels: ls,
        });
        
      });
      return series;
    }

    protected hideSeries(series: any[]) {
      Data.Hiddens = [];
      
      let legends = this.formStringsToHide(series);
      for (var i = 0; i < legends.length; i++) {
        for (var j = 1; j < legends.length; j++) {
          if (
            legends[i].toLowerCase() != legends[j].toLowerCase() &&
            this.isPrevLegend(legends[i], legends[j])
          ) {
            var sEl = null;
            var obj = Data.LegendHelper._realIndex(j-1);
            sEl = obj.seriesEl;
            Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: j - 1 });
            series.forEach(s => {
              s.data[i] = 0;
            });
            Data.Hiddens.push(j - 1);
            break;
          }
        }
      }
    }
  }
}
