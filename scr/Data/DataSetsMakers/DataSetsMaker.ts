namespace Data {
  export abstract class DataSetsMaker {
    static rows_names: string[]; //names
    static cols_names: string[]; //names
    rows_filters: string; // name of countries and quartals

    _data = undefined;
    _meta = undefined;

    constructor(data) {
      this._data = data.data;
      this._meta = data.meta;
    
    }

    abstract makeDataSets();

    

    protected riseAllCollapsedSeries(){
      DataSetsMaker.rows_names = [];
      DataSetsMaker.cols_names = [];
      if (Data.Chart != undefined) {
        [...Data.Chart.w.globals.collapsedSeries].forEach((i) => {
          var realIndex = Data.LegendHelper._realIndex(i.index).realIndex;
          const seriesToMakeVisible = [
            {
              cs: Data.Chart.w.globals.collapsedSeries,
              csi: Data.Chart.w.globals.collapsedSeriesIndices,
            },
            {
              cs: Data.Chart.w.globals.ancillaryCollapsedSeries,
              csi: Data.Chart.w.globals.ancillaryCollapsedSeriesIndices,
            },
          ];
          seriesToMakeVisible.forEach((r) => {
            Data.LegendHelper.riseCollapsedSeries(r.cs, r.csi, realIndex);
          });
        });
      }
    }

    protected sortData(): any[]{
      var rows_amount = this._meta.rAmount;
      for (var i = 0; i < rows_amount; i++) {
        DataSetsMaker.rows_names.push(this._meta["r" + i + "Name"]);
      }

      var cols_amount = this._meta.cAmount;
      for (var i = 0; i < cols_amount; i++) {
        DataSetsMaker.cols_names.push(this._meta["c" + i + "Name"]);
      }
      
      this._data.splice(0, 1);
      this._data.forEach((element) => {
        
        var keys = Object.entries(element);
        keys.forEach((key) => {
          if(key[0][0] == 'c' && key[0].includes('full')){
            element.c_full =
            element[key[0]] === undefined
              ? ""
              : element[key[0]]
                  .match(/(?<=\[)[^\][]*(?=])/g)
                  .map((x) => this.capitalizeFirstLetter(x))
                  .join("_");
          }
          if(key[0][0] == 'r' && key[0].includes('full')){
          element.r_full =
            element[key[0]] === undefined
              ? ""
              : element[key[0]]
                  .match(/(?<=\[)[^\][]*(?=])/g)
                  .map((x) => this.capitalizeFirstLetter(x))
                  .join("_");
          }
        });

        Data.Categories.push(element.r_full);
      });

      var sortByColumns = this._regroup(this._data, "c_full");
      if (sortByColumns.length > 1) {
        sortByColumns.splice(0, 1);
        sortByColumns.forEach((group) => {
          if (group.length > 1) {
            group.splice(0, 1);
          }
        });
      }
      return sortByColumns;
    }
    
    protected makeSeries(sortByColumns: any[]): any[]{
      var series = [];
      sortByColumns.forEach((group) => {
        if (group[0].r0 === undefined && group.length > 1) {
          group.splice(0, 1);
        }
        var n = group[0].c_full.split("_");
        series.push({
          name: n[n.length - 1] || "",
          data: group.map((a) => a.v0),
          full_name: group[0].c_full,
        });
      });
      return series;
    }

    protected hiseSeries(series: any[]){
      var legends = series.map((x) => x.full_name.toLowerCase());
      for (var i = 0; i < legends.length; i++) {
        for (var j = 1; j < legends.length; j++) {
          if (legends[i] != legends[j] && legends[j].includes(legends[i])) {
            var sEl = null;
            var obj = Data.LegendHelper._realIndex(i);
            sEl = obj.seriesEl;
            Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: i });
            break;
          }
        }        
      }
    }

    protected _regroup(arr, objKey) {
      var groups = {};
      return arr.reduce(function (result, item) {
        // console.log(Object.keys(item))
        var key = item[objKey];
        var group = groups[key];
        if (!group)
          if (arr[objKey] === undefined)
            result.push((group = groups[key] = []));

        group.push(item);

        return result;
      }, []);
    }

    capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
}
