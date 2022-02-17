namespace Data {
  export abstract class DataSetsMaker {
    static rows_names: string[]; //names
    static cols_names: string[]; //names
    rows_filters: string; // name of countries and quartals

    _data = undefined;
    _meta = undefined;

    constructor(data) {
      this._data = data?.data;
      this._meta = data?.meta;
      Data.MarkerHandler = new pivotcharts.MarkerHandler();
    }

    abstract makeDataSets();

    protected riseAllCollapsedSeries() {
      if (Data.Chart != undefined) {
        [...Data.Chart.w.globals.collapsedSeries].forEach((i) => {
          let realObj = Data.LegendHelper._realIndex(i.index);
          var realIndex;
          if (realObj != null) {
            realIndex = realObj.realIndex;
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
          }
        });
      }
    }

    protected determinateRowsNames() {
      DataSetsMaker.rows_names = [];
      var rows_amount = this._meta.rAmount;
      for (var i = 0; i < rows_amount; i++) {
        DataSetsMaker.rows_names.push(this._meta["r" + i + "Name"]);
      }
    }

    protected determinateColumnsNames() {
      DataSetsMaker.cols_names = [];
      var cols_amount = this._meta.cAmount;
      for (var i = 0; i < cols_amount; i++) {
        DataSetsMaker.cols_names.push(this._meta["c" + i + "Name"]);
      }
    }

    protected combineFullNames(key, element, v) {
      if (key[0].includes("full")) {
        var a =
          element[key[0]] === undefined
            ? ""
            : element[key[0]]
                .match(/(?<=\[)[^\][]*(?=])/g)
                .map((x) => this.capitalizeFirstLetter(x))
                .join("_");

        if (this.includesDespiteCase(a, element[v])) {
          element[v] = a;
        } else {
          if (!this.includesDespiteCase(element[v], a)) {
            element[v] += "_" + a;
          }
        }
      } else {
        var b = element[key[0]] === undefined ? "" : "_" + element[key[0]];
        if (this.includesDespiteCase(b, element[v])) {
          element[v] = b;
        } else {
          if (!this.includesDespiteCase(element[v], b)) {
            element[v] += "_" + b;
          }
        }
      }
    }
    protected sortData(sortKey: string = "c_full"): any[] {
      this._data.splice(0, 1);
      this._data.forEach((element) => {
        var keys = Object.entries(element);
        element.c_full = "";
        element.r_full = "";
        keys.forEach((key) => {
          if (key[0][0] == "c") {
            this.combineFullNames(key, element, "c_full");
          }
          if (key[0][0] == "r") {
            this.combineFullNames(key, element, "r_full");
          }
          if (key[0][0] == "v" && key[1] != key[1]) {
            element[key[0]] = 0;
          }
        });

        element.c_full = this.removeFirstUnderLine(
          element.c_full.replace("__", "_")
        );
        element.r_full = this.removeFirstUnderLine(
          element.r_full.replace("__", "_")
        );

        var categKey = sortKey == "c_full" ? "r_full" : "c_full";
        Data.Categories.push(element[categKey]);
      });

      var sortByKey = this._regroup(this._data, sortKey);

      var min_i = this.findExtraGroup(sortByKey);
      if (sortByKey.length > 1) {
        sortByKey.splice(min_i, 1);
        sortByKey.forEach((group) => {
          if (group.length > 1) {
            group.splice(0, 1);
          }
        });
      }
      return sortByKey;
    }

    private findExtraGroup(sortByKey: any[]): number {
      var ls = sortByKey.map((x) => x.length);
      var min = ls[0];
      var min_i = 0;
      for (var i = 1; i < ls.length; i++) {
        if (ls[i] < min) {
          min = ls[i];
          min_i = i;
        }
      }
      return min_i;
    }

    private includesDespiteCase(a: string, b: string): boolean {
      var _a = a.toLowerCase();
      var _b = b.toLowerCase();
      _a = _a[0] == "_" ? _a.slice(1) : _a;
      _b = _b[0] == "_" ? _b.slice(1) : _b;
      return _a.includes(_b);
    }

    private removeFirstUnderLine(str: string): string {
      var _str = str;
      if (str[0] == "_") {
        _str = _str.slice(1);
      }
      return _str;
    }

    abstract makeSeries(sortByColumns: any[]): any[];

    protected getOldLegends() {
      var data = Data.Model.dataStorage.getAllData();
      if (data == undefined) {
        return;
      }
      return data.series.map((x) => x.full_name);
    }

    protected hideSeries(series: any[]) {
      if(Data.LegendHelper == null) {
        return;
      }
      if(Data.legendFilter.length == 0){
        return;
      }
      Data.Hiddens = [];
      var sEl = null;
      var obj = Data.LegendHelper._realIndex(0);
      if (obj == null) return;
      sEl = obj.seriesEl;
      Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: 0 });
      // let legends = this.formStringsToHide(series);
      // for (var i = 0; i < legends.length; i++) {
      //   for (var j = 1; j < legends.length; j++) {
      //     if (
      //       legends[i].toLowerCase() != legends[j].toLowerCase() &&
      //       this.isPrevLegend(legends[i], legends[j])
      //     ) {
      //       Data.Hiddens.push(j - 1);
      //       var sEl = null;
      //       var obj = Data.LegendHelper._realIndex(j-1);
      //       if (obj == null) return;
      //       sEl = obj.seriesEl;
      //       Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: j - 1 });

      //       break;
      //     }
      //   }
      // }
    }

    abstract formStringsToHide(series): string[];

    protected isPrevLegend(old_legend: string, expand_legend: string): boolean {
      var words_old = old_legend.toLowerCase().split("_");
      var words_new = expand_legend.toLowerCase().split("_");
      var res = true;
      for (var i = 0; i < words_old.length; i++) {
        if (words_old[i] != words_new[i]) {
          res = false;
        }
      }
      return res;
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

    protected capitalizeFirstLetter(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }
}
