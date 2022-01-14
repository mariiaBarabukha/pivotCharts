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
      // if(Data.xaxisFilter != ""){
      //   let res = this.selectCurrent(Data.xaxisFilter, series);
      //   return { series: res.series, xaxis: res.xaxis };
      // }else{
      //   return { series: series, xaxis: { categories: categories } };
      // }
      this.filterRowsByDepth(series, categories);
      
      return { series: series, xaxis: { categories: categories } };
    }

    private filterRowsByDepth(series, categories){
      let rlevels = series[0].r_fulls.map(x=>x.split("_").length-1);
      let max = Math.max(...rlevels);
      if(max == 0) return;
      let indexes = rlevels.map((elem, i)=> elem == max ? i : []).flat()
      
      for(let i = 0; i < series.length; i++){
        for(let j = rlevels.length; j >=0; j--){
          if(!indexes.includes(j)){
            series[i].data.splice(j,1);
            series[i].r_fulls.splice(j,1);
            if(i == 0){
              categories.splice(j,1);
            }
          }
        }
      }
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

    private selectCurrent(text, series) {
      let cSeries = JSON.parse(JSON.stringify(series));

      cSeries.forEach((x) => {
        let inds = [];
        for (let i = 0; i < x.r_fulls.length; i++) {
          if (!x.r_fulls[i].includes(text) || x.r_fulls[i] == text) {
            inds.push(i);
          }
        }

        inds.reverse();
        inds.forEach((y) => {
          x.data.splice(y, 1);
        });

        x.r_fulls = x.r_fulls.filter((a) => a.includes(text) && a != text);
      });

      var cLabels = cSeries[0].r_fulls.map((x) => {
        let t = x.split("_");
        let l = t.length;
        return t[l - 1];
      });
      return {
        series: cSeries,
        xaxis: {
          categories: cLabels,
        },
      };
    }
  }
}
