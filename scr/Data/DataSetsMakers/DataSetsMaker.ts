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

    protected riseAllCollapsedSeries() {
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

    protected determinateRowsNames() {
      var rows_amount = this._meta.rAmount;
      for (var i = 0; i < rows_amount; i++) {
        DataSetsMaker.rows_names.push(this._meta["r" + i + "Name"]);
      }
    }

    protected determinateColumnsNames() {
      var cols_amount = this._meta.cAmount;
      for (var i = 0; i < cols_amount; i++) {
        DataSetsMaker.cols_names.push(this._meta["c" + i + "Name"]);
      }
    }
    protected sortData(): any[] {
      this._data.splice(0, 1);
      this._data.forEach((element) => {
        var keys = Object.entries(element);
        element.c_full = "";
        element.r_full = "";
        keys.forEach((key) => {
          if (key[0][0] == "c") {
            if (key[0].includes("full")) {
              var a =
                element[key[0]] === undefined
                  ? ""
                  : (element[key[0]]
                      .match(/(?<=\[)[^\][]*(?=])/g)
                      .map((x) => this.capitalizeFirstLetter(x))
                      .join("_"));

              if (!this.includesDespiteCase(element.c_full, a)) {
                element.c_full += ("_"+a);
              }
            } else {
              var b =
                element[key[0]] === undefined ? "" : "_" + element[key[0]];
              if (!this.includesDespiteCase(element.c_full, b)) {
                element.c_full += b;
              }
            }
          }
          if (key[0][0] == "r") {
            if (key[0].includes("full")) {
              var a = (element.r_full =
                element[key[0]] === undefined
                  ? ""
                  : element[key[0]]
                      .match(/(?<=\[)[^\][]*(?=])/g)
                      .map((x) => this.capitalizeFirstLetter(x))
                      .join("_"));
              if (!this.includesDespiteCase(element.r_full, a)) {
                element.r_full += a;
              }
            }else{
              var b =
                element[key[0]] === undefined ? "" : "_" + element[key[0]];
              if (!this.includesDespiteCase(element.r_full, b)) {
                element.r_full += b;
              }
            }
          }
          if (key[0][0] == "v" && key[1] != key[1]) {
            element[key[0]] = 0;
          }
        });

        element.c_full = this.removeFirstUnderLine(element.c_full);
        element.r_full = this.removeFirstUnderLine(element.r_full);

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

    private includesDespiteCase(a: string, b: string): boolean {
      var _a = a.toLowerCase();
      var _b = b.toLowerCase();
      return _a.includes(_b);
    }

    private removeFirstUnderLine(str: string) : string{
      var _str = str;
      if (str[0] == "_") {
        _str = _str.slice(1);
      }
      return _str;
    }

    protected makeSeries(sortByColumns: any[]): any[] {
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
          level: n.length - 1,
        });
      });
      return series;
    }

    protected getOldLegends() {
      var data = Data.Model.dataStorage.getAllData();
      if (data == undefined) {
        return;
      }
      return data.series.map((x) => x.full_name);
    }
    protected hideSeries(series: any[]) {
      Data.Hiddens = [];
      var old_legends = this.getOldLegends();
      if (old_legends == undefined) {
        return;
      }
      var legends = series.map((x) => x.full_name.toLowerCase());
      for (var i = 0; i < legends.length; i++) {
        for (var j = 1; j < legends.length; j++) {
          if (
            legends[i].toLowerCase() != legends[j].toLowerCase() &&
            this.isPrevLegend(legends[i], legends[j])
          ) {
            var sEl = null;
            var obj = Data.LegendHelper._realIndex(i);
            sEl = obj.seriesEl;
            Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: j - 1 });
            Data.Hiddens.push(j - 1);
            break;
          }
        }
      }
    }

    private isPrevLegend(old_legend: string, expand_legend: string): boolean {
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
