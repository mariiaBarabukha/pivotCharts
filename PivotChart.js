var Data;
(function (Data) {
    class DataSetsMaker {
        constructor(data) {
            this._data = undefined;
            this._meta = undefined;
            this._data = data === null || data === void 0 ? void 0 : data.data;
            this._meta = data === null || data === void 0 ? void 0 : data.meta;
        }
        riseAllCollapsedSeries() {
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
        determinateRowsNames() {
            DataSetsMaker.rows_names = [];
            var rows_amount = this._meta.rAmount;
            for (var i = 0; i < rows_amount; i++) {
                DataSetsMaker.rows_names.push(this._meta["r" + i + "Name"]);
            }
        }
        determinateColumnsNames() {
            DataSetsMaker.cols_names = [];
            var cols_amount = this._meta.cAmount;
            for (var i = 0; i < cols_amount; i++) {
                DataSetsMaker.cols_names.push(this._meta["c" + i + "Name"]);
            }
        }
        combineFullNames(key, element, v) {
            if (key[0].includes("full")) {
                var a = element[key[0]] === undefined
                    ? ""
                    : element[key[0]]
                        .match(/(?<=\[)[^\][]*(?=])/g)
                        .map((x) => this.capitalizeFirstLetter(x))
                        .join("_");
                if (this.includesDespiteCase(a, element[v])) {
                    element[v] = a;
                }
                else {
                    if (!this.includesDespiteCase(element[v], a)) {
                        element[v] += "_" + a;
                    }
                }
            }
            else {
                var b = element[key[0]] === undefined ? "" : "_" + element[key[0]];
                if (this.includesDespiteCase(b, element[v])) {
                    element[v] = b;
                }
                else {
                    if (!this.includesDespiteCase(element[v], b)) {
                        element[v] += "_" + b;
                    }
                }
            }
        }
        sortData(sortKey = "c_full") {
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
                element.c_full = this.removeFirstUnderLine(element.c_full.replace("__", "_"));
                element.r_full = this.removeFirstUnderLine(element.r_full.replace("__", "_"));
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
        findExtraGroup(sortByKey) {
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
        includesDespiteCase(a, b) {
            var _a = a.toLowerCase();
            var _b = b.toLowerCase();
            _a = _a[0] == "_" ? _a.slice(1) : _a;
            _b = _b[0] == "_" ? _b.slice(1) : _b;
            return _a.includes(_b);
        }
        removeFirstUnderLine(str) {
            var _str = str;
            if (str[0] == "_") {
                _str = _str.slice(1);
            }
            return _str;
        }
        getOldLegends() {
            var data = Data.Model.dataStorage.getAllData();
            if (data == undefined) {
                return;
            }
            return data.series.map((x) => x.full_name);
        }
        hideSeries(series) {
            Data.Hiddens = [];
            let legends = this.formStringsToHide(series);
            for (var i = 0; i < legends.length; i++) {
                for (var j = 1; j < legends.length; j++) {
                    if (legends[i].toLowerCase() != legends[j].toLowerCase() &&
                        this.isPrevLegend(legends[i], legends[j])) {
                        Data.Hiddens.push(j - 1);
                        var sEl = null;
                        var obj = Data.LegendHelper._realIndex(j - 1);
                        if (obj == null)
                            return;
                        sEl = obj.seriesEl;
                        Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: j - 1 });
                        break;
                    }
                }
            }
        }
        isPrevLegend(old_legend, expand_legend) {
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
        _regroup(arr, objKey) {
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
        capitalizeFirstLetter(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    }
    Data.DataSetsMaker = DataSetsMaker;
})(Data || (Data = {}));
var Data;
(function (Data) {
    class AxisDataSetsMaker extends Data.DataSetsMaker {
        formStringsToHide(series) {
            return series.map((x) => x.full_name.toLowerCase());
        }
        makeDataSets() {
            this.riseAllCollapsedSeries();
            // Data.RowsLevels = [];
            this.determinateRowsNames();
            this.determinateColumnsNames();
            var sortByColumns = this.sortData();
            var categories = sortByColumns[0].map((x) => {
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
        filterRowsByDepth(series, categories) {
            let rlevels = series[0].r_fulls.map(x => x.split("_").length - 1);
            let max = Math.max(...rlevels);
            if (max == 0)
                return;
            let indexes = rlevels.map((elem, i) => elem == max ? i : []).flat();
            for (let i = 0; i < series.length; i++) {
                for (let j = rlevels.length; j >= 0; j--) {
                    if (!indexes.includes(j)) {
                        series[i].data.splice(j, 1);
                        series[i].r_fulls.splice(j, 1);
                        if (i == 0) {
                            categories.splice(j, 1);
                        }
                    }
                }
            }
        }
        makeSeries(sortByColumns) {
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
                    r_fulls: group.map(x => x.r_full)
                });
            });
            Data.RowsLevels = (sortByColumns[0].map(x => x.r_full.split('_').length - 1));
            // pivotcharts.LabelsGroup.allLabels = (sortByColumns[0].map(x=>x.r_full));
            return series;
        }
        selectCurrent(text, series) {
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
    Data.AxisDataSetsMaker = AxisDataSetsMaker;
})(Data || (Data = {}));
var Data;
(function (Data) {
    class OneDimentionalDataSetsMaker extends Data.DataSetsMaker {
        formStringsToHide(series) {
            var c = series[series.length - 1];
            series.splice(series.length - 1, 1);
            return c;
        }
        makeDataSets() {
            var _a;
            this.riseAllCollapsedSeries();
            this.determinateRowsNames();
            this.determinateColumnsNames();
            var sorted = this.sortData("r_full");
            var categories = sorted[0].map((x) => {
                var r = x.c_full.split("_");
                return this.capitalizeFirstLetter(r[r.length - 1]);
            });
            var cat_full = (_a = sorted[0]) === null || _a === void 0 ? void 0 : _a.map(x => x.c_full);
            Data.OneDCFull = cat_full;
            var series = this.makeSeries(sorted);
            // if(Data.Chart != null) {
            //   Data.Chart.updateSeries(series);
            // }
            series.push(cat_full);
            this.hideSeries(series);
            return { series: series, labels: categories };
        }
        makeSeries(sortByColumns) {
            var key = "r_full";
            var series = [];
            sortByColumns.forEach((group) => {
                if (group[0].r0 === undefined && group.length > 1) {
                    group.splice(0, 1);
                }
                var n = group[0][key].split("_");
                var ls = group.map(x => x.c_full.split("_").length - 1);
                series.push({
                    name: n[n.length - 1] || "",
                    data: group.map((a) => a.v0),
                    full_name: group[0][key],
                    levels: ls,
                });
            });
            return series;
        }
        hideSeries(series) {
            Data.Hiddens = [];
            let legends = this.formStringsToHide(series);
            for (var i = 0; i < legends.length; i++) {
                for (var j = 1; j < legends.length; j++) {
                    if (legends[i].toLowerCase() != legends[j].toLowerCase() &&
                        this.isPrevLegend(legends[i], legends[j])) {
                        var sEl = null;
                        var obj = Data.LegendHelper._realIndex(j - 1);
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
    Data.OneDimentionalDataSetsMaker = OneDimentionalDataSetsMaker;
})(Data || (Data = {}));
var Data;
(function (Data) {
    // export class DataSelectotController {
    //   data: any[];
    //   selectedItem: string;
    //   outerWrapperName: string = "";
    //   key: string;
    //   ctx;
    //   constructor(ctx:object, data:any[], key:string, type:string) {
    //     this.ctx = ctx;
    //     this.data = data;
    //     this.key = key;
    //     this.outerWrapperName = type;
    //   }
    // }
    class DataSelector {
        constructor(ctx, data, key, type, index) {
            this.outerWrapperName = "";
            this.ctx = ctx;
            this.data = data;
            this.key = key;
            this.outerWrapperName = type;
            this.index = index;
        }
        draw() {
            var options = this.data.map((x) => x[this.key]);
            var dropDown = "<div class='" + this.outerWrapperName + "'>" + this.selectedItem ||
                options[0] + "<div class='menu'>";
            options.forEach((option) => {
                dropDown += " <div class='item'>" + option + "</div>";
            });
            dropDown += "</div></div>";
            var chart = document.getElementById(this.ctx.el.id);
            chart.insertAdjacentHTML("beforebegin", dropDown);
        }
    }
    Data.DataSelector = DataSelector;
})(Data || (Data = {}));
var Data;
(function (Data) {
    class RowsSelectorController {
        constructor() {
            this.currentRowIndex = 0;
        }
        getCurrentRowIndex() {
            return this.currentRowIndex;
        }
        setCurrentRowIndex(i) {
            this.currentRowIndex = i;
        }
    }
    Data.RowsSelectorController = RowsSelectorController;
    class RowsSelector {
        constructor(ctx) {
            this.controller = new RowsSelectorController();
            this.ctx = ctx;
            this.isDrawn = false;
        }
        draw(names) {
            var dropDown = "<select id='rows'>";
            var options = names.map(x => "<option value='" + names.indexOf(x) + "'>" + x + "</option>").join();
            dropDown += options;
            dropDown += "</select>";
            var chart = document.getElementById(this.ctx.el.id);
            chart.insertAdjacentHTML("beforebegin", dropDown);
            var select = document.getElementById("rows");
            select.onchange = () => {
                var s = document.getElementById("rows");
                var option = s.options[s.selectedIndex].value;
                this.controller.setCurrentRowIndex(Number(option));
                Data.Chart.updateOptions(this.ctx.w.globals.series);
                ;
            };
            this.isDrawn = true;
        }
        getCurrentRowIndex() {
            return this.controller.getCurrentRowIndex();
        }
    }
    Data.RowsSelector = RowsSelector;
})(Data || (Data = {}));
var Data;
(function (Data) {
    class DataStorage {
        constructor(data, type) {
            //#queries = undefined;
            this.res = undefined;
            this.q = undefined;
            this.stateOfUpdate = 0;
            this.setConfigs(data, type);
        }
        setConfigs(data, type) {
            switch (type) {
                case "bar":
                case "line":
                case "radar":
                    this.q = new Data.AxisDataSetsMaker(data);
                    break;
                case "pie":
                case "donute":
                case "radialBar":
                    this.q = new Data.OneDimentionalDataSetsMaker(data);
            }
        }
        getAllData() {
            return this.res;
        }
        getVisibleDataSets() {
            // if(i > -1){
            //   return { series: this.res.series[i].data, labels: this.res.labels };
            // }
            this.res = this.q.makeDataSets();
            return this.res;
        }
        static manipulateChartData(names, drill, action, dim) {
            var nms = dim === "columns"
                ? Data.DataSetsMaker.cols_names
                : Data.DataSetsMaker.rows_names;
            // if(nms.length < 2){
            //   var members = Data.Flexmonster.getMembers(nms[i]).map(x => x.uniqueName);
            // }
            for (var i = 0; i < nms.length; i++) {
                var members = Data.Flexmonster.getMembers(nms[i]).map((x) => {
                    return { uniqueName: x.uniqueName, children: x.children };
                });
                // var b = members.map(x => x.uniqueName).includes(names[names.length - 1]);
                var m = DataStorage.search(members, names);
                if (m != null) {
                    if (m.children.length > 0) {
                        var prev = [...names].slice(0, i);
                        var aaa = [...names].slice(i);
                        var toDrill = aaa.map((x) => "[" + x + "]").join(".");
                        drill(dim, prev, null, toDrill);
                        break;
                    }
                    else {
                        action(dim, names);
                    }
                }
            }
        }
        static search(members, names) {
            if (members.length < 1 || members == null) {
                return null;
            }
            var b = false;
            var index = -1;
            for (var i = 0; i < members.length; i++) {
                var incl = names.map((x) => members[i].uniqueName.includes(x.toLowerCase()));
                var res = true;
                incl.forEach((element) => {
                    res && (res = element);
                });
                if (res) {
                    return members[i];
                }
            }
            var childen = members.map((x) => x.children);
            // var children_res = [].concat().apply();
            return this.search(Array.prototype.concat.apply([], childen), names);
        }
    }
    Data.DataStorage = DataStorage;
})(Data || (Data = {}));
var Data;
(function (Data) {
    class Model {
    }
    Model.dataStorage = undefined;
    Model.colorManager = undefined;
    Model.labelManager = undefined;
    Data.Model = Model;
})(Data || (Data = {}));
var Data;
(function (Data) {
    Data.Hiddens = [];
    Data.visibleDataSets = [];
    Data.Categories = [];
    Data.chartType = 'bar';
    Data.OneDCFull = [];
    Data.DropScroll = false;
    Data.LegendHeightZero = 0;
    Data.updateLegend = false;
    Data.xaxisHiddenLabels = [];
    Data.RowsLevels = [];
    Data.xaxisFilter = "";
    function processData(rawData, type) {
        if (type != undefined) {
            Data.chartType = type;
        }
        if (Data.Model.dataStorage == undefined) {
            Data.Model.dataStorage = new Data.DataStorage(rawData, type || Data.chartType);
        }
        else {
            Data.Model.dataStorage.setConfigs(rawData, Data.chartType);
        }
        var data = Data.Model.dataStorage.getVisibleDataSets(Data.chartType);
        if (Data.Model.dataStorage.stateOfUpdate == 0) {
            Data.BasicSeries = JSON.parse(JSON.stringify(data));
            Data.DropScroll = true;
        }
        else {
            Data.DropScroll = false;
        }
        // Chart.axes.expand();
        return data;
    }
    Data.processData = processData;
})(Data || (Data = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotHelper extends apexcharts.LegendHelpers {
        //visibleDataSets = [];
        // getLegendStyles() {
        //   let a = super.getLegendStyles();
        //   a.innerHTML += ".apexcharts-legend {" + "overflow: visible !important";
        //   return a;
        // }
        toggleDataSeries(seriesCnt, isHidden) {
            const w = this.w;
            var seriesEl;
            var names;
            if (w.globals.axisCharts || w.config.chart.type === "radialBar") {
                w.globals.resized = true; // we don't want initial animations again
                // let seriesEl = null
                let realIndex = null;
                // yes, make it null. 1 series will rise at a time
                w.globals.risingSeries = [];
                var _obj = this._realIndex(seriesCnt);
                seriesEl = _obj.seriesEl;
                realIndex = this._realIndex;
                if (Data.visibleDataSets.length === 0) {
                    w.config.series.forEach((data) => {
                        Data.visibleDataSets.push(0);
                    });
                }
                var name = seriesEl.getAttribute("full_name");
                names = name.split("_");
                // var globalIndex = names.indexOf(name);
            }
            else {
                // for non-axis charts i.e pie / donuts
                seriesEl = w.globals.dom.Paper.select(` .apexcharts-series[rel='${seriesCnt + 1}'] path`);
                const type = w.config.chart.type;
                // if (type === "pie" || type === "polarArea" || type === "donut") {
                //   let dataLabels = w.config.plotOptions.pie.donut.labels;
                //   const graphics = new PivotGraphics(this.lgCtx.ctx);
                //   graphics.pathMouseDown(seriesEl.members[0], null);
                //   this.lgCtx.ctx.pie.printDataLabelsInner(
                //     seriesEl.members[0].node,
                //     dataLabels
                //   );
                // }
                // seriesEl.fire("click");
                seriesEl = seriesEl.members[0].node;
                names = Data.OneDCFull[seriesCnt].split("_");
            }
            Data.seriesLenght = w.config.series.length;
            if (isHidden) {
                Data.DataStorage.manipulateChartData(names, Data.Flexmonster.drillUpCell, Data.Flexmonster.collapseCell, "columns");
                // Data.Flexmonster.collapseCell("columns", names);
            }
            else {
                Data.DataStorage.manipulateChartData(names, Data.Flexmonster.drillDownCell, Data.Flexmonster.expandCell, "columns");
                // realIndex = this._realIndex(seriesCnt).realIndex;
            }
        }
        _realIndex(seriesCnt) {
            var seriesEl = null;
            const w = this.w;
            var realIndex = null;
            if (w.globals.axisCharts) {
                seriesEl = w.globals.dom.baseEl.querySelector(`.apexcharts-series[data\\:realIndex='${seriesCnt}']`);
                try {
                    realIndex = parseInt(seriesEl.getAttribute("data:realIndex"), 10);
                }
                catch (e) {
                    return null;
                }
            }
            else {
                seriesEl = w.globals.dom.baseEl.querySelector(`.apexcharts-series[rel='${seriesCnt + 1}']`);
                try {
                    realIndex = parseInt(seriesEl.getAttribute("rel"), 10) - 1;
                }
                catch (e) {
                    return null;
                }
            }
            return { seriesEl, realIndex };
        }
        riseCollapsedSeries(collapsedSeries, seriesIndices, realIndex) {
            const w = this.w;
            let series = apexcharts.Utils.clone(w.config.series);
            var curr_len = series.length;
            if (collapsedSeries.length > 0) {
                for (let c = 0; c < collapsedSeries.length; c++) {
                    if (collapsedSeries[c].index === realIndex) {
                        if (w.globals.axisCharts) {
                            series[realIndex].data = collapsedSeries[c].data.slice();
                            collapsedSeries.splice(c, 1);
                            seriesIndices.splice(c, 1);
                            w.globals.risingSeries.push(realIndex);
                        }
                        else {
                            series[realIndex] = collapsedSeries[c].data;
                            collapsedSeries.splice(c, 1);
                            seriesIndices.splice(c, 1);
                            w.globals.risingSeries.push(realIndex);
                        }
                    }
                }
                collapsedSeries.forEach((element) => {
                    if (element.index > realIndex) {
                        element.index -= Data.seriesLenght - curr_len;
                    }
                });
                series = this._getSeriesBasedOnCollapsedState(series);
                this.lgCtx.ctx.updateHelpers._updateSeries(series, w.config.chart.animations.dynamicAnimation.enabled);
            }
        }
        hideSeries({ seriesEl, realIndex }) {
            const w = this.w;
            var curr_len;
            let series = apexcharts.Utils.clone(w.config.series);
            curr_len = series.length;
            if (w.globals.axisCharts) {
                let shouldNotHideYAxis = false;
                if (w.config.yaxis[realIndex] &&
                    w.config.yaxis[realIndex].show &&
                    w.config.yaxis[realIndex].showAlways) {
                    shouldNotHideYAxis = true;
                    if (w.globals.ancillaryCollapsedSeriesIndices.indexOf(realIndex) < 0) {
                        w.globals.ancillaryCollapsedSeries.push({
                            index: realIndex,
                            data: series[realIndex].data.slice(),
                            type: seriesEl.parentNode.className.baseVal.split("-")[1],
                        });
                        w.globals.ancillaryCollapsedSeriesIndices.push(realIndex);
                    }
                }
                if (!shouldNotHideYAxis) {
                    w.globals.collapsedSeries.push({
                        index: realIndex,
                        data: series[realIndex].data.slice(),
                        type: seriesEl.parentNode.className.baseVal.split("-")[1],
                    });
                    w.globals.collapsedSeriesIndices.push(realIndex);
                    let removeIndexOfRising = w.globals.risingSeries.indexOf(realIndex);
                    w.globals.risingSeries.splice(removeIndexOfRising, 1);
                }
            }
            else {
                w.globals.collapsedSeries.push({
                    index: realIndex,
                    data: series[realIndex],
                });
                w.globals.collapsedSeriesIndices.push(realIndex);
            }
            let seriesChildren = seriesEl.childNodes;
            for (let sc = 0; sc < seriesChildren.length; sc++) {
                if (seriesChildren[sc].classList.contains("apexcharts-series-markers-wrap")) {
                    if (seriesChildren[sc].classList.contains("apexcharts-hide")) {
                        seriesChildren[sc].classList.remove("apexcharts-hide");
                    }
                    else {
                        seriesChildren[sc].classList.add("apexcharts-hide");
                    }
                }
            }
            w.globals.allSeriesCollapsed =
                w.globals.collapsedSeries.length === w.config.series.length;
            w.globals.collapsedSeries.forEach((element) => {
                if (element.index > realIndex) {
                    element.index -= Data.seriesLenght - curr_len;
                }
            });
            series = this._getSeriesBasedOnCollapsedState(series);
            this.lgCtx.ctx.updateHelpers._updateSeries(series, w.config.chart.animations.dynamicAnimation.enabled);
        }
        _getSeriesBasedOnCollapsedState(series) {
            const w = this.w;
            if (w.globals.axisCharts) {
                series.forEach((s, sI) => {
                    if (w.globals.collapsedSeriesIndices.indexOf(sI) > -1) {
                        series[sI].data = [];
                    }
                });
            }
            else {
                series.forEach((s, sI) => {
                    w.globals.collapsedSeriesIndices.forEach((i) => {
                        s.data[i] = 0;
                    });
                    // if (w.globals.collapsedSeriesIndices.indexOf(sI) > -1) {
                    //   s.data[sI] = 0
                    // }
                });
            }
            return series;
        }
    }
    pivotcharts.PivotHelper = PivotHelper;
    class PivotLegend extends apexcharts.Legend {
        constructor(ctx, opts) {
            super(ctx, opts);
            this.needToResize = false;
            this.onLegendClick = this.onLegendClick.bind(this);
            this.legendHelpers = new PivotHelper(this);
            Data.LegendHelper = this.legendHelpers;
        }
        init() {
            super.init();
        }
        _theBiggestHeight(arr) {
            let m = arr[1];
            for (let i = 1; i < arr.length; i++) {
                m = arr[i].clientHeight > m.clientHeight ? arr[i] : m;
            }
            return m;
        }
        setCorrectHeight() {
            let legends = document.getElementsByClassName("legend-set");
            //const reducer = (prevV, newxtV) => prevV.clientHeight > newxtV.clientHeight ? prevV : newxtV;
            let legend = this._theBiggestHeight(legends);
            let legendHeight = legend.clientHeight;
            let canvas = document.getElementsByClassName("apexcharts-svg")[0];
            var x = canvas.getBoundingClientRect();
            if (x.top + x.height > window.innerHeight && !Data.updateLegend) {
                Data.updateLegend = true;
                Data.Chart.updateOptions({
                    chart: {
                        height: window.innerHeight - x.top,
                    },
                });
                return;
            }
            // if (legend.scrollHeight > legendHeight && !Data.updateLegend) {
            //   Data.updateLegend = true;
            //   let h = document
            //     .getElementsByClassName("apexcharts-inner")[0]
            //     .getClientRects()[0] as any;
            //   Data.Chart.updateOptions({
            //     chart: {
            //       height:
            //         Data.originalChartHeight +
            //         -Data.LegendHeightZero +
            //         legendHeight +
            //         (Data.originalChartHeight - Data.LegendHeightZero - h.height),
            //       //  + (h.height-legendHeight)
            //     },
            //   });
            //   return;
            // }
            if (Math.max(...this.w.globals.series_levels) == 0 &&
                (Data.originalChartHeight == null ||
                    Data.originalChartHeight == canvas.clientHeight)) {
                Data.LegendHeightZero = legendHeight;
                Data.originalChartHeight = canvas.clientHeight;
            }
            let predictableChartHeight = Data.originalChartHeight + (legendHeight - Data.LegendHeightZero);
            if ((Math.abs(Data.LegendHeightZero - legendHeight) > 1 ||
                Math.abs(predictableChartHeight - canvas.clientHeight) > 1) &&
                !Data.updateLegend) {
                Data.updateLegend = true;
                //Data.Chart.destroy();
                Data.Chart.updateOptions({
                    chart: {
                        height: Data.originalChartHeight + (legendHeight - Data.LegendHeightZero),
                    },
                });
            }
            else {
                Data.updateLegend = false;
            }
        }
        drawLegends() {
            let self = this;
            let w = this.w;
            //w.config.chart.height = Data.ChartHeight || w.config.chart.height;
            let fontFamily = w.config.legend.fontFamily;
            let legendNames = w.globals.seriesNames;
            let full_names = w.globals.full_name;
            let fillcolor = w.globals.colors.slice();
            let markerHeight = 0;
            if (w.config.chart.type === "heatmap") {
                const ranges = w.config.plotOptions.heatmap.colorScale.ranges;
                legendNames = ranges.map((colorScale) => {
                    return colorScale.name
                        ? colorScale.name
                        : colorScale.from + " - " + colorScale.to;
                });
                fillcolor = ranges.map((color) => color.color);
            }
            else if (this.isBarsDistributed) {
                legendNames = w.globals.labels.slice();
            }
            if (w.config.legend.customLegendItems.length) {
                legendNames = w.config.legend.customLegendItems;
            }
            let legendFormatter = w.globals.legendFormatter;
            let isLegendInversed = w.config.legend.inverseOrder;
            let new_height = w.config.chart.height;
            for (let i = isLegendInversed ? legendNames.length - 1 : 0; isLegendInversed ? i >= 0 : i <= legendNames.length - 1; isLegendInversed ? i-- : i++) {
                let text = legendFormatter(legendNames[i], { seriesIndex: i, w });
                let collapsedSeries = false;
                let ancillaryCollapsedSeries = false;
                if (w.globals.collapsedSeries.length > 0) {
                    for (let c = 0; c < w.globals.collapsedSeries.length; c++) {
                        if (w.globals.collapsedSeries[c].index === i) {
                            collapsedSeries = true;
                        }
                    }
                }
                if (w.globals.ancillaryCollapsedSeriesIndices.length > 0) {
                    for (let c = 0; c < w.globals.ancillaryCollapsedSeriesIndices.length; c++) {
                        if (w.globals.ancillaryCollapsedSeriesIndices[c] === i) {
                            ancillaryCollapsedSeries = true;
                        }
                    }
                }
                let elMarker = document.createElement("span");
                elMarker.classList.add("apexcharts-legend-marker");
                let mOffsetX = w.config.legend.markers.offsetX;
                let mOffsetY = w.config.legend.markers.offsetY;
                let mHeight = w.config.legend.markers.height;
                let mWidth = w.config.legend.markers.width;
                let mBorderWidth = w.config.legend.markers.strokeWidth;
                let mBorderColor = w.config.legend.markers.strokeColor;
                let mBorderRadius = w.config.legend.markers.radius;
                let mStyle = elMarker.style;
                mStyle.background = fillcolor[i];
                mStyle.color = fillcolor[i];
                mStyle.setProperty("background", fillcolor[i], "important");
                // override fill color with custom legend.markers.fillColors
                if (w.config.legend.markers.fillColors &&
                    w.config.legend.markers.fillColors[i]) {
                    mStyle.background = w.config.legend.markers.fillColors[i];
                }
                // override with data color
                if (w.globals.seriesColors[i] !== undefined) {
                    mStyle.background = w.globals.seriesColors[i];
                    mStyle.color = w.globals.seriesColors[i];
                }
                mStyle.height = Array.isArray(mHeight)
                    ? parseFloat(mHeight[i]) + "px"
                    : parseFloat(mHeight) + "px";
                mStyle.width = Array.isArray(mWidth)
                    ? parseFloat(mWidth[i]) + "px"
                    : parseFloat(mWidth) + "px";
                mStyle.left =
                    (Array.isArray(mOffsetX)
                        ? parseFloat(mOffsetX[i])
                        : parseFloat(mOffsetX)) + "px";
                mStyle.top =
                    (Array.isArray(mOffsetY)
                        ? parseFloat(mOffsetY[i])
                        : parseFloat(mOffsetY)) + "px";
                mStyle.borderWidth = Array.isArray(mBorderWidth)
                    ? mBorderWidth[i]
                    : mBorderWidth;
                mStyle.borderColor = Array.isArray(mBorderColor)
                    ? mBorderColor[i]
                    : mBorderColor;
                mStyle.borderRadius = Array.isArray(mBorderRadius)
                    ? parseFloat(mBorderRadius[i]) + "px"
                    : parseFloat(mBorderRadius) + "px";
                if (w.config.legend.markers.customHTML) {
                    if (Array.isArray(w.config.legend.markers.customHTML)) {
                        if (w.config.legend.markers.customHTML[i]) {
                            elMarker.innerHTML = w.config.legend.markers.customHTML[i]();
                        }
                    }
                    else {
                        elMarker.innerHTML = w.config.legend.markers.customHTML();
                    }
                }
                markerHeight = Number(mStyle.height.replace("px", ""));
                apexcharts.Graphics.setAttrs(elMarker, {
                    rel: i + 1,
                    "data:collapsed": collapsedSeries || ancillaryCollapsedSeries,
                });
                if (collapsedSeries || ancillaryCollapsedSeries) {
                    elMarker.classList.add("apexcharts-inactive-legend");
                }
                let elLegend = document.createElement("div");
                let elLegendText = document.createElement("span");
                elLegendText.classList.add("apexcharts-legend-text");
                elLegendText.innerHTML = Array.isArray(text)
                    ? apexcharts.Utils.sanitizeDom(text.join(" "))
                    : apexcharts.Utils.sanitizeDom(text);
                let textColor = w.config.legend.labels.useSeriesColors
                    ? w.globals.colors[i]
                    : w.config.legend.labels.colors;
                if (!textColor) {
                    textColor = w.config.chart.foreColor;
                }
                elLegendText.style.color = textColor;
                elLegendText.style.fontSize =
                    parseFloat(w.config.legend.fontSize) + "px";
                elLegendText.style.fontWeight = w.config.legend.fontWeight;
                elLegendText.style.fontFamily = fontFamily || w.config.chart.fontFamily;
                apexcharts.Graphics.setAttrs(elLegendText, {
                    rel: i + 1,
                    i,
                    "data:default-text": encodeURIComponent(text),
                    "data:collapsed": collapsedSeries || ancillaryCollapsedSeries,
                });
                let wrapLegendSet;
                if (w.globals.series_levels[i] == 0) {
                    wrapLegendSet = document.createElement("div");
                    wrapLegendSet.id = "legend-set-" + i;
                    wrapLegendSet.classList.add("legend-set");
                    wrapLegendSet.appendChild(elLegend);
                    wrapLegendSet.style.display = "flex";
                    wrapLegendSet.style.flexDirection = "column";
                    //let arr:number[] = [...w.globals.series_levels].slice(0,i);
                    // if(arr.includes(1)){
                    //   this.needToResize = false;
                    // }
                }
                else {
                    let c = 1;
                    let curr = w.globals.series_levels[i];
                    let prev = w.globals.series_levels[i - c];
                    if (curr != 0) {
                        while (curr != 0) {
                            curr = w.globals.series_levels[i - c];
                            c++;
                        }
                    }
                    let wId = "legend-set-" + (i - c + 1);
                    for (let j = 0; j < w.globals.dom.elLegendWrap.childNodes.length; j++) {
                        if (w.globals.dom.elLegendWrap.childNodes[j].id == wId) {
                            wrapLegendSet = w.globals.dom.elLegendWrap.childNodes[j];
                            break;
                        }
                    }
                    wrapLegendSet.appendChild(elLegend);
                }
                elLegend.appendChild(elMarker);
                elLegend.appendChild(elLegendText);
                elLegend.style.transform = "translateX(" + 5 * w.globals.series_levels[i] + "px)";
                const coreUtils = new apexcharts.CoreUtils(this.ctx);
                if (!w.config.legend.showForZeroSeries) {
                    const total = coreUtils.getSeriesTotalByIndex(i);
                    if (total === 0 &&
                        coreUtils.seriesHaveSameValues(i) &&
                        !coreUtils.isSeriesNull(i) &&
                        w.globals.collapsedSeriesIndices.indexOf(i) === -1 &&
                        w.globals.ancillaryCollapsedSeriesIndices.indexOf(i) === -1) {
                        elLegend.classList.add("apexcharts-hidden-zero-series");
                    }
                }
                if (!w.config.legend.showForNullSeries) {
                    if (coreUtils.isSeriesNull(i) &&
                        w.globals.collapsedSeriesIndices.indexOf(i) === -1 &&
                        w.globals.ancillaryCollapsedSeriesIndices.indexOf(i) === -1) {
                        elLegend.classList.add("apexcharts-hidden-null-series");
                    }
                }
                w.globals.dom.elLegendWrap.appendChild(wrapLegendSet);
                w.globals.dom.elLegendWrap.classList.add(`apexcharts-align-${w.config.legend.horizontalAlign}`);
                w.globals.dom.elLegendWrap.classList.add("position-" + w.config.legend.position);
                elLegend.classList.add("apexcharts-legend-series");
                elLegend.style.margin = `${w.config.legend.itemMargin.vertical}px ${w.config.legend.itemMargin.horizontal}px`;
                w.globals.dom.elLegendWrap.style.width = w.config.legend.width
                    ? w.config.legend.width + "px"
                    : "";
                w.globals.dom.elLegendWrap.style.height = w.config.legend.height
                    ? w.config.legend.height + "px"
                    : "";
                apexcharts.Graphics.setAttrs(elLegend, {
                    rel: i + 1,
                    seriesName: apexcharts.Utils.escapeString(legendNames[i], "x"),
                    full_name: full_names[i],
                    "data:collapsed": collapsedSeries || ancillaryCollapsedSeries,
                });
                if (collapsedSeries || ancillaryCollapsedSeries) {
                    elLegend.classList.add("apexcharts-inactive-legend");
                }
                if (!w.config.legend.onItemClick.toggleDataSeries) {
                    elLegend.classList.add("apexcharts-no-click");
                }
            }
            w.globals.dom.elWrap.addEventListener("click", self.onLegendClick, true);
            if (w.config.legend.onItemHover.highlightDataSeries &&
                w.config.legend.customLegendItems.length === 0) {
                w.globals.dom.elWrap.addEventListener("mousemove", self.onLegendHovered, true);
                w.globals.dom.elWrap.addEventListener("mouseout", self.onLegendHovered, true);
            }
        }
    }
    pivotcharts.PivotLegend = PivotLegend;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotCore extends apexcharts.Core {
        resizeNonAxisCharts() {
            var w = this.w;
            var gl = w.globals;
            var legendHeight = 0;
            var offY = w.config.chart.sparkline.enabled ? 1 : 15;
            offY = offY + w.config.grid.padding.bottom;
            if ((w.config.legend.position === "top" ||
                w.config.legend.position === "bottom") &&
                w.config.legend.show &&
                !w.config.legend.floating) {
                legendHeight =
                    new pivotcharts.PivotLegend(this.ctx, {}).legendHelpers.getLegendBBox().clwh + 10;
            }
            var el = w.globals.dom.baseEl.querySelector(".apexcharts-radialbar, .apexcharts-pie");
            var chartInnerDimensions = w.globals.radialSize * 2.05;
            if (el && !w.config.chart.sparkline.enabled) {
                var elRadialRect = apexcharts.Utils.getBoundingClientRect(el);
                chartInnerDimensions = elRadialRect.bottom;
                var maxHeight = elRadialRect.bottom - elRadialRect.top;
                chartInnerDimensions = Math.max(w.globals.radialSize * 2.05, maxHeight);
            }
            var newHeight = chartInnerDimensions + gl.translateY + legendHeight + offY;
            if (gl.dom.elLegendForeign) {
                gl.dom.elLegendForeign.setAttribute("height", newHeight);
            }
            gl.dom.elWrap.style.height = newHeight + "px";
            apexcharts.Graphics.setAttrs(gl.dom.Paper.node, {
                height: newHeight,
            });
            gl.dom.Paper.node.parentNode.parentNode.style.minHeight =
                newHeight + "px";
        }
        plotChartType(ser, xyRatios) {
            const w = this.w;
            const cnf = w.config;
            const gl = w.globals;
            let lineSeries = {
                series: [],
                i: [],
            };
            let areaSeries = {
                series: [],
                i: [],
            };
            let scatterSeries = {
                series: [],
                i: [],
            };
            let bubbleSeries = {
                series: [],
                i: [],
            };
            let columnSeries = {
                series: [],
                i: [],
            };
            let candlestickSeries = {
                series: [],
                i: [],
            };
            let boxplotSeries = {
                series: [],
                i: [],
            };
            if (!gl.axisCharts) {
                let i = this.ctx.rowsSelector.getCurrentRowIndex();
                ser = ser[i].data;
            }
            gl.series.map((series, st) => {
                let comboCount = 0;
                // if user has specified a particular type for particular series
                if (typeof ser[st].type !== "undefined") {
                    if (ser[st].type === "column" || ser[st].type === "bar") {
                        if (gl.series.length > 1 && cnf.plotOptions.bar.horizontal) {
                            // horizontal bars not supported in mixed charts, hence show a warning
                            console.warn("Horizontal bars are not supported in a mixed/combo chart. Please turn off `plotOptions.bar.horizontal`");
                        }
                        columnSeries.series.push(series);
                        columnSeries.i.push(st);
                        comboCount++;
                        w.globals.columnSeries = columnSeries.series;
                    }
                    else if (ser[st].type === "area") {
                        areaSeries.series.push(series);
                        areaSeries.i.push(st);
                        comboCount++;
                    }
                    else if (ser[st].type === "line") {
                        lineSeries.series.push(series);
                        lineSeries.i.push(st);
                        comboCount++;
                    }
                    else if (ser[st].type === "scatter") {
                        scatterSeries.series.push(series);
                        scatterSeries.i.push(st);
                    }
                    else if (ser[st].type === "bubble") {
                        bubbleSeries.series.push(series);
                        bubbleSeries.i.push(st);
                        comboCount++;
                    }
                    else if (ser[st].type === "candlestick") {
                        candlestickSeries.series.push(series);
                        candlestickSeries.i.push(st);
                        comboCount++;
                    }
                    else if (ser[st].type === "boxPlot") {
                        boxplotSeries.series.push(series);
                        boxplotSeries.i.push(st);
                        comboCount++;
                    }
                    else {
                        // user has specified type, but it is not valid (other than line/area/column)
                        console.warn("You have specified an unrecognized chart type. Available types for this property are line/area/column/bar/scatter/bubble");
                    }
                    if (comboCount > 1) {
                        gl.comboCharts = true;
                    }
                }
                else {
                    lineSeries.series.push(series);
                    lineSeries.i.push(st);
                }
            });
            let line = new charts.PivotLine(this.ctx, xyRatios, false);
            let boxCandlestick = new apexcharts.BoxCandleStick(this.ctx, xyRatios);
            this.ctx.pie = new charts.PivotPie(this.ctx);
            let radialBar = new apexcharts.Radial(this.ctx);
            this.ctx.rangeBar = new apexcharts.RangeBar(this.ctx, xyRatios);
            let radar = new charts.PivotRadar(this.ctx);
            let elGraph = [];
            // let rowsSelection = new Data.DataSelector(this.ctx, this.w.config.series, "r_full", "rows");
            if (gl.comboCharts) {
                if (areaSeries.series.length > 0) {
                    elGraph.push(line.draw(areaSeries.series, "area", areaSeries.i));
                }
                if (columnSeries.series.length > 0) {
                    if (w.config.chart.stacked) {
                        let barStacked = new apexcharts.BarStacked(this.ctx, xyRatios);
                        elGraph.push(barStacked.draw(columnSeries.series, columnSeries.i));
                    }
                    else {
                        this.ctx.bar = new charts.PivotBar(this.ctx, xyRatios);
                        elGraph.push(this.ctx.bar.draw(columnSeries.series, columnSeries.i));
                    }
                }
                if (lineSeries.series.length > 0) {
                    elGraph.push(line.draw(lineSeries.series, "line", lineSeries.i));
                }
                if (candlestickSeries.series.length > 0) {
                    elGraph.push(boxCandlestick.draw(candlestickSeries.series, candlestickSeries.i));
                }
                if (boxplotSeries.series.length > 0) {
                    elGraph.push(boxCandlestick.draw(boxplotSeries.series, boxplotSeries.i));
                }
                if (scatterSeries.series.length > 0) {
                    const scatterLine = new apexcharts.Line(this.ctx, xyRatios, true);
                    elGraph.push(scatterLine.draw(scatterSeries.series, "scatter", scatterSeries.i));
                }
                if (bubbleSeries.series.length > 0) {
                    const bubbleLine = new apexcharts.Line(this.ctx, xyRatios, true);
                    elGraph.push(bubbleLine.draw(bubbleSeries.series, "bubble", bubbleSeries.i));
                }
            }
            else {
                switch (cnf.chart.type) {
                    case "line":
                        elGraph = line.draw(gl.series, "line", null);
                        break;
                    case "area":
                        elGraph = line.draw(gl.series, "area", null);
                        break;
                    case "bar":
                        if (cnf.chart.stacked) {
                            let barStacked = new apexcharts.BarStacked(this.ctx, xyRatios);
                            elGraph = barStacked.draw(gl.series, null);
                        }
                        else {
                            this.ctx.bar = new charts.PivotBar(this.ctx, xyRatios);
                            elGraph = this.ctx.bar.draw(gl.series);
                        }
                        break;
                    case "candlestick":
                        let candleStick = new apexcharts.BoxCandleStick(this.ctx, xyRatios);
                        elGraph = candleStick.draw(gl.series, null);
                        break;
                    case "boxPlot":
                        let boxPlot = new apexcharts.BoxCandleStick(this.ctx, xyRatios);
                        elGraph = boxPlot.draw(gl.series, null);
                        break;
                    case "rangeBar":
                        elGraph = this.ctx.rangeBar.draw(gl.series);
                        break;
                    case "heatmap":
                        let heatmap = new apexcharts.HeatMap(this.ctx, xyRatios);
                        elGraph = heatmap.draw(gl.series);
                        break;
                    case "treemap":
                        let treemap = new apexcharts.Treemap(this.ctx, xyRatios);
                        elGraph = treemap.draw(gl.series);
                        break;
                    case "pie":
                    case "donut":
                    case "polarArea":
                        elGraph = this.ctx.pie.draw(gl.series);
                        break;
                    case "radialBar":
                        elGraph = radialBar.draw(gl.series);
                        break;
                    case "radar":
                        elGraph = radar.draw(gl.series);
                        break;
                    default:
                        elGraph = line.draw(gl.series, null, null);
                }
            }
            return elGraph;
        }
    }
    pivotcharts.PivotCore = PivotCore;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotInitCtxVariables extends apexcharts.InitCtxVariables {
        initModules() {
            super.initModules();
            this.ctx.core = new pivotcharts.PivotCore(this.ctx.el, this.ctx);
            this.ctx.legend = new pivotcharts.PivotLegend(this.ctx, {});
            this.ctx.axes = new pivotcharts.PivotAxis(this.ctx);
            this.ctx.grid = new pivotcharts.PivotGrid(this.ctx);
            ;
            this.ctx.data = new pivotcharts.PivotData(this.ctx);
            this.ctx.updateHelpers = new pivotcharts.PivotUpdateHelpers(this.ctx);
            this.ctx.theme = new pivotcharts.PivotTheme(this.ctx);
            this.ctx.rowsSelector = this.ctx.rowsSelector || new Data.RowsSelector(this.ctx);
            this.ctx.zoomPanSelection = new pivotcharts.ZoomPanSelection(this.ctx);
            // this.ctx.labelsGroup = new pivotcharts.LabelsGroup(this.ctx);
        }
    }
    pivotcharts.PivotInitCtxVariables = PivotInitCtxVariables;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotXAxis extends apexcharts.XAxis {
        xAxisLabelCorrections() {
            let w = this.w;
            let graphics = new apexcharts.Graphics(this.ctx);
            let xAxis = w.globals.dom.baseEl.querySelector(".apexcharts-xaxis-texts-g");
            let xAxisTexts = w.globals.dom.baseEl.querySelectorAll(".apexcharts-xaxis-texts-g text");
            let yAxisTextsInversed = w.globals.dom.baseEl.querySelectorAll(".apexcharts-yaxis-inversed text");
            let xAxisTextsInversed = w.globals.dom.baseEl.querySelectorAll(".apexcharts-xaxis-inversed-texts-g text tspan");
            if (w.globals.rotateXLabels || w.config.xaxis.labels.rotateAlways) {
                // for (let xat = 0; xat < xAxisTexts.length; xat++) {
                //   let textRotatingCenter = graphics.rotateAroundCenter(xAxisTexts[xat]);
                //   textRotatingCenter.y = textRotatingCenter.y - 1; // + tickWidth/4;
                //   textRotatingCenter.x = textRotatingCenter.x + 1;
                //   // xAxisTexts[xat].setAttribute(
                //   //   'transform',
                //   //   // `rotate(${w.config.xaxis.labels.rotate} ${textRotatingCenter.x} ${textRotatingCenter.y})`
                //   // )
                //   xAxisTexts[xat].setAttribute("text-anchor", `end`);
                //   let offsetHeight = 10;
                //   xAxis.setAttribute("transform", `translate(0, ${-offsetHeight})`);
                //   let tSpan = xAxisTexts[xat].childNodes;
                //   if (w.config.xaxis.labels.trim) {
                //     Array.prototype.forEach.call(tSpan, (ts) => {
                //       graphics.placeTextWithEllipsis(
                //         ts,
                //         ts.textContent,
                //         w.globals.xAxisLabelsHeight -
                //           (w.config.legend.position === "bottom" ? 20 : 10)
                //       );
                //     });
                //   }
                // }
            }
            else {
                let width = w.globals.gridWidth / (w.globals.labels.length + 1);
                for (let xat = 0; xat < xAxisTexts.length; xat++) {
                    let tSpan = xAxisTexts[xat].childNodes;
                    if (w.config.xaxis.labels.trim &&
                        w.config.xaxis.type !== "datetime") {
                        Array.prototype.forEach.call(tSpan, (ts) => {
                            graphics.placeTextWithEllipsis(ts, ts.textContent, width);
                        });
                    }
                }
            }
            if (yAxisTextsInversed.length > 0) {
                // truncate rotated y axis in bar chart (x axis)
                let firstLabelPosX = yAxisTextsInversed[yAxisTextsInversed.length - 1].getBBox();
                let lastLabelPosX = yAxisTextsInversed[0].getBBox();
                if (firstLabelPosX.x < -20) {
                    yAxisTextsInversed[yAxisTextsInversed.length - 1].parentNode.removeChild(yAxisTextsInversed[yAxisTextsInversed.length - 1]);
                }
                if (lastLabelPosX.x + lastLabelPosX.width > w.globals.gridWidth &&
                    !w.globals.isBarHorizontal) {
                    yAxisTextsInversed[0].parentNode.removeChild(yAxisTextsInversed[0]);
                }
                // truncate rotated x axis in bar chart (y axis)
                for (let xat = 0; xat < xAxisTextsInversed.length; xat++) {
                    graphics.placeTextWithEllipsis(xAxisTextsInversed[xat], xAxisTextsInversed[xat].textContent, w.config.yaxis[0].labels.maxWidth -
                        parseFloat(w.config.yaxis[0].title.style.fontSize) * 2 -
                        20);
                }
            }
        }
        drawXaxis() {
            let aa = document.getElementsByClassName("apexcharts-xaxis");
            // var graphics = new PivotGraphics(this.ctx);
            var _this = this;
            var w = this.w;
            var graphics = new pivotcharts.PivotGraphics(this.ctx);
            var elXaxis = graphics.group({
                class: "apexcharts-xaxis",
                transform: "translate("
                    .concat(w.config.xaxis.offsetX, ", ")
                    .concat(w.config.xaxis.offsetY, ")"),
            });
            var elXaxisTexts = graphics.group({
                class: "apexcharts-xaxis-texts-g",
                transform: "translate("
                    .concat(w.globals.translateXAxisX, ", ")
                    .concat(w.globals.translateXAxisY, ")"),
            });
            elXaxis.add(elXaxisTexts);
            var colWidth; // initial x Position (keep adding column width in the loop)
            var xPos = w.globals.padHorizontal;
            var labels = [];
            for (var i = 0; i < this.xaxisLabels.length; i++) {
                labels.push(this.xaxisLabels[i]);
            }
            var labelsLen = labels.length;
            if (w.globals.isXNumeric) {
                var len = labelsLen > 1 ? labelsLen - 1 : labelsLen;
                colWidth = w.globals.gridWidth / len;
                xPos = xPos + colWidth / 2 + w.config.xaxis.labels.offsetX;
            }
            else {
                colWidth = w.globals.gridWidth / labels.length;
                xPos = xPos + colWidth + w.config.xaxis.labels.offsetX;
            }
            var _loop = function _loop(_i) {
                var x = xPos - colWidth / 2 + w.config.xaxis.labels.offsetX;
                if (_i === 0 &&
                    labelsLen === 1 &&
                    colWidth / 2 === xPos &&
                    w.globals.dataPoints === 1) {
                    // single datapoint
                    x = w.globals.gridWidth / 2;
                }
                var label = _this.axesUtils.getLabel(labels, w.globals.timescaleLabels, x, _i, _this.drawnLabels, _this.xaxisFontSize);
                var offsetYCorrection = 28;
                if (w.globals.rotateXLabels) {
                    offsetYCorrection = 22;
                }
                var isCategoryTickAmounts = typeof w.config.xaxis.tickAmount !== "undefined" &&
                    w.config.xaxis.tickAmount !== "dataPoints" &&
                    w.config.xaxis.type !== "datetime";
                if (isCategoryTickAmounts) {
                    label = _this.axesUtils.checkLabelBasedOnTickamount(_i, label, labelsLen);
                }
                else {
                    label = _this.axesUtils.checkForOverflowingLabels(_i, label, labelsLen, _this.drawnLabels, _this.drawnLabelsRects);
                }
                var getCatForeColor = function getCatForeColor() {
                    return w.config.xaxis.convertedCatToNumeric
                        ? _this.xaxisForeColors[w.globals.minX + _i - 1]
                        : _this.xaxisForeColors[_i];
                };
                if (label.text) {
                    w.globals.xaxisLabelsCount++;
                }
                if (label.text.le) {
                }
                if (w.config.xaxis.labels.show) {
                    var elText = graphics.drawText({
                        x: label.x,
                        y: _this.offY +
                            w.config.xaxis.labels.offsetY +
                            offsetYCorrection -
                            (w.config.xaxis.position === "top"
                                ? w.globals.xAxisHeight + w.config.xaxis.axisTicks.height - 2
                                : 0),
                        text: label.text,
                        textAnchor: "middle",
                        fontWeight: label.isBold
                            ? 600
                            : w.config.xaxis.labels.style.fontWeight,
                        fontSize: _this.xaxisFontSize,
                        fontFamily: _this.xaxisFontFamily,
                        foreColor: Array.isArray(_this.xaxisForeColors)
                            ? getCatForeColor()
                            : _this.xaxisForeColors,
                        isPlainText: false,
                        opacity: undefined,
                        cssClass: "apexcharts-xaxis-label " + w.config.xaxis.labels.style.cssClass,
                    });
                    let trimT = function trimText(elText, colWidth) {
                        let l = elText.node.getBBox();
                        if (l.width > colWidth) {
                            let v = elText.node.childNodes[0].innerHTML;
                            let nv = v.slice(0, v.length - 4);
                            elText.node.childNodes[0].innerHTML = nv + '...';
                            let nw = elText.node.getBBox();
                            // if(nw.width > colWidth){
                            //   trimText(elText, colWidth);
                            // }
                            // v = "...";
                        }
                    };
                    trimT(elText, colWidth);
                    // elText.node.setAttribute("width", colWidth)
                    elXaxisTexts.add(elText);
                    var elTooltipTitle = document.createElementNS(w.globals.SVGNS, "title");
                    elTooltipTitle.textContent = Array.isArray(label.text)
                        ? label.text.join(" ")
                        : label.text;
                    elText.node.appendChild(elTooltipTitle);
                    if (label.text !== "") {
                        _this.drawnLabels.push(label.text);
                        _this.drawnLabelsRects.push(label);
                    }
                }
                xPos = xPos + colWidth;
            };
            for (var _i = 0; _i <= labelsLen - 1; _i++) {
                _loop(_i);
            }
            if (w.config.xaxis.title.text !== undefined) {
                var elXaxisTitle = graphics.group({
                    class: "apexcharts-xaxis-title",
                });
                var elXAxisTitleText = graphics.drawText({
                    x: w.globals.gridWidth / 2 + w.config.xaxis.title.offsetX,
                    y: this.offY +
                        parseFloat(this.xaxisFontSize) +
                        w.globals.xAxisLabelsHeight +
                        w.config.xaxis.title.offsetY,
                    text: w.config.xaxis.title.text,
                    textAnchor: "middle",
                    fontSize: w.config.xaxis.title.style.fontSize,
                    fontFamily: w.config.xaxis.title.style.fontFamily,
                    fontWeight: w.config.xaxis.title.style.fontWeight,
                    foreColor: w.config.xaxis.title.style.color,
                    opacity: undefined,
                    cssClass: "apexcharts-xaxis-title-text " +
                        w.config.xaxis.title.style.cssClass,
                });
                elXaxisTitle.add(elXAxisTitleText);
                elXaxis.add(elXaxisTitle);
            }
            if (w.config.xaxis.axisBorder.show) {
                var offX = w.globals.barPadForNumericAxis;
                var elHorzLine = graphics.drawLine(w.globals.padHorizontal + w.config.xaxis.axisBorder.offsetX - offX, this.offY, this.xaxisBorderWidth + offX, this.offY, w.config.xaxis.axisBorder.color, 0, this.xaxisBorderHeight);
                elXaxis.add(elHorzLine);
            }
            // document.head.innerHTML +=
            // "<link rel='stylesheet' href='../scr/Modules/Axis/style.css' />";
            var _labels = document.querySelectorAll(".apexcharts-xaxis-label");
            for (var i = 0; i < _labels.length; i++) {
                _labels[i].addEventListener("click", (e) => {
                    var parent = e.target.parentNode;
                    var text = parent.getAttribute("value");
                    var names = Object.assign(text.split("_"));
                    // LabelsGroup.hiddens.push({ val: text, level: names.length - 1 });
                    Data.DataStorage.manipulateChartData(names, Data.Flexmonster.drillDownCell, Data.Flexmonster.expandCell, "rows");
                    this.selectCurrent(text);
                    Data.xaxisFilter = text;
                    let bp = document.getElementById("buttons_panel");
                    if (bp.innerHTML != "") {
                        bp.innerHTML = "";
                    }
                    let b = document.createElement("button");
                    b.onclick = () => this.close(text);
                    bp.appendChild(b);
                    b.value = text;
                    b.innerHTML = "Back";
                });
            }
            return elXaxis;
        }
        selectCurrent(text) {
            let cSeries = Data.BasicSeries.series;
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
            Data.BasicSeries.xaxis.categories = cLabels;
            Data.Chart.updateOptions({
                series: cSeries,
                labels: cLabels,
                xaxis: {
                    categories: cLabels,
                },
            });
        }
        close(val) {
            // var index = id.split("_")[0];
            if (val.split("_").length == 1) {
                Data.xaxisFilter = "";
            }
            Data.DataStorage.manipulateChartData(val.split("_"), Data.Flexmonster.drillUpCell, Data.Flexmonster.collapseCell, "rows");
            let bp = document.getElementById("buttons_panel");
            bp.innerHTML = "";
            let tt = val.split("_");
            let text = tt.slice(0, tt.length - 1).join("_");
            if (val.split("_").length > 1) {
                // let b = document.createElement("button");
                let b = document.createElement("button");
                b.onclick = () => this.close(text);
                bp.appendChild(b);
                b.value = text;
                b.innerHTML = "Back";
            }
            if (text.length > 0) {
                Data.xaxisFilter = text;
                this.selectCurrent(text);
            }
            else {
                Data.xaxisFilter = "";
            }
        }
    }
    pivotcharts.PivotXAxis = PivotXAxis;
    class PivotAxis extends apexcharts.Axes {
        drawAxis(type, xyRatios = 0) {
            var gl = this.w.globals;
            var cnf = this.w.config;
            let xAxis = new PivotXAxis(this.ctx);
            var yAxis = new apexcharts.YAxis(this.ctx);
            if (gl.axisCharts && type !== "radar") {
                let elXaxis, elYaxis;
                if (gl.isBarHorizontal) {
                    elYaxis = yAxis.drawYaxisInversed(0);
                    elXaxis = xAxis.drawXaxisInversed(0);
                    gl.dom.elGraphical.add(elXaxis);
                    gl.dom.elGraphical.add(elYaxis);
                }
                else {
                    elXaxis = xAxis.drawXaxis();
                    gl.dom.elGraphical.add(elXaxis);
                    cnf.yaxis.map((yaxe, index) => {
                        if (gl.ignoreYAxisIndexes.indexOf(index) === -1) {
                            elYaxis = yAxis.drawYaxis(index);
                            gl.dom.Paper.add(elYaxis);
                        }
                    });
                }
            }
        }
    }
    pivotcharts.PivotAxis = PivotAxis;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotGrid extends apexcharts.Grid {
        _drawInvertedXYLines({ xCount }) {
            const w = this.w;
            if (w.config.grid.xaxis.lines.show || w.config.xaxis.axisTicks.show) {
                let x1 = w.globals.padHorizontal;
                let y1 = 0;
                let x2;
                let y2 = w.globals.gridHeight;
                for (let i = 0; i < xCount + 1; i++) {
                    if (w.config.grid.xaxis.lines.show) {
                        this._drawGridLine({ x1, y1, x2, y2, parent: this.elgridLinesV });
                    }
                    let xAxis = new pivotcharts.PivotXAxis(this.ctx);
                    xAxis.drawXaxisTicks(x1, this.elg);
                    x1 = x1 + w.globals.gridWidth / xCount + 0.3;
                    x2 = x1;
                }
            }
            // draw horizontal lines
            if (w.config.grid.yaxis.lines.show) {
                let x1 = 0;
                let y1 = 0;
                let y2 = 0;
                let x2 = w.globals.gridWidth;
                for (let i = 0; i < w.globals.dataPoints + 1; i++) {
                    this._drawGridLine({ x1, y1, x2, y2, parent: this.elgridLinesH });
                    y1 = y1 + w.globals.gridHeight / w.globals.dataPoints;
                    y2 = y1;
                }
            }
        }
        _drawGridLines({ i, x1, y1, x2, y2, xCount, parent }) {
            const w = this.w;
            const shouldDraw = () => {
                if (i === 0 && w.globals.skipFirstTimelinelabel) {
                    return false;
                }
                if (i === xCount - 1 &&
                    w.globals.skipLastTimelinelabel &&
                    !w.config.xaxis.labels.formatter) {
                    return false;
                }
                if (w.config.chart.type === 'radar') {
                    return false;
                }
                return true;
            };
            if (shouldDraw()) {
                if (w.config.grid.xaxis.lines.show) {
                    this._drawGridLine({ x1, y1, x2, y2, parent });
                }
                let xAxis = new pivotcharts.PivotXAxis(this.ctx);
                xAxis.drawXaxisTicks(x1, this.elg);
            }
        }
    }
    pivotcharts.PivotGrid = PivotGrid;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotData extends apexcharts.Data {
        constructor(ctx) {
            super(ctx);
        }
        parseDataAxisCharts(ser, ctx) {
            super.parseDataAxisCharts(ser, ctx);
            var gl = this.w.globals;
            gl.full_name = [];
            gl.series_levels = [];
            let rf = ser[0].r_fulls;
            gl.rows_levels = rf.map(x => x.split('_').length - 1);
            for (let i = 0; i < ser.length; i++) {
                if (ser[i].full_name !== undefined) {
                    gl.full_name.push(ser[i].full_name);
                }
                else {
                    gl.full_name.push("full_name-" + (i + 1));
                }
                if (ser[i].level !== undefined) {
                    gl.series_levels.push(ser[i].level);
                }
                else {
                    gl.series_levels.push(0);
                }
            }
        }
        parseDataNonAxisCharts(ser) {
            super.parseDataNonAxisCharts(ser.data);
            var gl = this.w.globals;
            gl.full_name = Object.assign({}, gl.seriesNames);
            gl.series_levels = ser.levels;
            // if (ser.level !== undefined) {
            //   gl.series_levels.push(ser.level)
            // } else {
            //   gl.series_levels.push(0)
            // }
            return this.w;
        }
        parseData(ser) {
            let w = this.w;
            let cnf = w.config;
            let gl = w.globals;
            this.excludeCollapsedSeriesInYAxis();
            // If we detected string in X prop of series, we fallback to category x-axis
            this.fallbackToCategory = false;
            this.ctx.core.resetGlobals();
            this.ctx.core.isMultipleY();
            if (gl.axisCharts) {
                // axisCharts includes line / area / column / scatter
                this.parseDataAxisCharts(ser);
            }
            else {
                // non-axis charts are pie / donut
                var i = this.ctx.rowsSelector.getCurrentRowIndex();
                this.parseDataNonAxisCharts(ser[i]);
            }
            this.coreUtils.getLargestSeries();
            // set Null values to 0 in all series when user hides/shows some series
            if (cnf.chart.type === 'bar' && cnf.chart.stacked) {
                const series = new apexcharts.Series(this.ctx);
                gl.series = series.setNullSeriesToZeroValues(gl.series);
            }
            this.coreUtils.getSeriesTotals();
            if (gl.axisCharts) {
                this.coreUtils.getStackedSeriesTotals();
            }
            this.coreUtils.getPercentSeries();
            if (!gl.dataFormatXNumeric &&
                (!gl.isXNumeric ||
                    (cnf.xaxis.type === 'numeric' &&
                        cnf.labels.length === 0 &&
                        cnf.xaxis.categories.length === 0))) {
                // x-axis labels couldn't be detected; hence try searching every option in config
                this.handleExternalLabelsData(ser);
            }
            // check for multiline xaxis
            const catLabels = this.coreUtils.getCategoryLabels(gl.labels);
            for (let l = 0; l < catLabels.length; l++) {
                if (Array.isArray(catLabels[l])) {
                    gl.isMultiLineX = true;
                    break;
                }
            }
        }
    }
    pivotcharts.PivotData = PivotData;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotUpdateHelpers extends apexcharts.UpdateHelpers {
        _extendSeries(s, i) {
            const w = this.w;
            const ser = w.config.series[i];
            return Object.assign(Object.assign({}, w.config.series[i]), { name: s.name ? s.name : ser && ser.name, color: s.color ? s.color : ser && ser.color, type: s.type ? s.type : ser && ser.type, data: s.data != undefined ? s.data : ser && ser.data, full_name: s.full_name ? s.full_name : ser && ser.full_name, level: s.level != undefined ? s.level : ser && ser.level, levels: s.levels != undefined ? s.levels : ser && ser.levels });
        }
        _updateSeries(newSeries, animate, overwriteInitialSeries = false) {
            const w = this.w;
            w.globals.shouldAnimate = animate;
            w.globals.dataChanged = true;
            if (animate) {
                this.ctx.series.getPreviousPaths();
            }
            let existingSeries;
            // axis charts
            if (w.globals.axisCharts) {
                existingSeries = newSeries.map((s, i) => {
                    return this._extendSeries(s, i);
                });
                if (existingSeries.length === 0) {
                    existingSeries = [{ data: [] }];
                }
                w.config.series = existingSeries;
            }
            else {
                //   // non-axis chart (pie/radialbar)
                // if(w.config.series[0] != undefined && typeof w.config.series[0] == 'object') { 
                // }
                // w.config.series = newSeries.slice()
            }
            if (overwriteInitialSeries) {
                w.globals.initialSeries = apexcharts.Utils.clone(w.config.series);
            }
            return this.ctx.update();
        }
    }
    pivotcharts.PivotUpdateHelpers = PivotUpdateHelpers;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotGraphics extends apexcharts.Graphics {
        drawText({ x, y, text, textAnchor, fontSize, fontFamily, fontWeight, foreColor, opacity, cssClass = '', isPlainText = true }) {
            var result = super.drawText({
                x,
                y,
                text,
                textAnchor,
                fontSize,
                fontFamily,
                fontWeight,
                foreColor,
                opacity,
                cssClass,
                isPlainText
            });
            for (var i = Data.Categories.length - 1; i >= 0; i--) {
                if (Data.Categories[i].includes(text)) {
                    result.attr({ 'value': Data.Categories[i] });
                    break;
                }
            }
            return result;
        }
    }
    pivotcharts.PivotGraphics = PivotGraphics;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotTheme extends apexcharts.Theme {
        pushExtraColors(colorSeries, length, distributed = null) {
            let w = this.w;
            let utils = new apexcharts.Utils();
            let len = length == undefined || length == -2 || length == -3 ? w.globals.series.length : length;
            if (distributed === null) {
                distributed =
                    this.isBarDistributed ||
                        this.isHeatmapDistributed ||
                        (w.config.chart.type === "heatmap" &&
                            w.config.plotOptions.heatmap.colorScale.inverse);
            }
            if (distributed && w.globals.series.length) {
                len =
                    w.globals.series[w.globals.maxValsInArrayIndex].length *
                        w.globals.series.length;
            }
            var cl = JSON.parse(JSON.stringify(colorSeries));
            //!Cause error
            if (cl.length < len || length == -2 || length == -3) {
                var new_colors = [];
                let nn = w.globals.series_levels.filter((x) => x == 0).length || 0;
                if ((length == undefined || length == -2 || length == -3) &&
                    (nn <= cl.length || nn != w.globals.series_levels.length)) {
                    var lev = 0;
                    let ser_lev = w.globals.series_levels;
                    for (var i = 0; i < len; i++) {
                        if (ser_lev[i] == 0) {
                            new_colors.push(cl.shift());
                        }
                        else {
                            if (ser_lev[i] >= lev) {
                                new_colors.push(utils.shadeColor(0.15, new_colors[i - 1]));
                                lev = ser_lev[i];
                            }
                            else {
                                for (var j = i - 1; j >= 0; j--) {
                                    if (ser_lev[i] != ser_lev[j]) {
                                        break;
                                    }
                                }
                                if (j < 0) {
                                    new_colors.push(utils.shadeColor(0.15, new_colors[i - 1]));
                                }
                                else {
                                    new_colors.push(utils.shadeColor(0.1, new_colors[j]));
                                }
                                lev = ser_lev[i];
                            }
                        }
                    }
                    // console.log(new_colors);
                    //   colorSeries = [...new_colors];
                    //   colorSeries = JSON.parse(JSON.stringify(new_colors));
                    colorSeries.splice(0, colorSeries.length);
                    new_colors.forEach((c) => {
                        colorSeries.push(c);
                    });
                }
                else {
                    let diff = len - colorSeries.length;
                    for (let i = 0; i < diff; i++) {
                        colorSeries.push(colorSeries[i]);
                    }
                }
            }
        }
        setDefaultColors() {
            let w = this.w;
            let utils = new apexcharts.Utils();
            w.globals.dom.elWrap.classList.add(`apexcharts-theme-${w.config.theme.mode}`);
            if (w.config.colors === undefined) {
                w.globals.colors = this.predefined();
            }
            else {
                w.globals.colors = w.config.colors;
                // if user provided a function in colors, we need to eval here
                if (Array.isArray(w.config.colors) &&
                    w.config.colors.length > 0 &&
                    typeof w.config.colors[0] === "function") {
                    w.globals.colors = w.config.series.map((s, i) => {
                        let c = w.config.colors[i];
                        if (!c)
                            c = w.config.colors[0];
                        if (typeof c === "function") {
                            this.isColorFn = true;
                            return c({
                                value: w.globals.axisCharts
                                    ? w.globals.series[i][0]
                                        ? w.globals.series[i][0]
                                        : 0
                                    : w.globals.series[i],
                                seriesIndex: i,
                                dataPointIndex: i,
                                w,
                            });
                        }
                        return c;
                    });
                }
            }
            // user defined colors in series array
            w.globals.seriesColors.map((c, i) => {
                if (c) {
                    w.globals.colors[i] = c;
                }
            });
            if (w.config.theme.monochrome.enabled) {
                let monoArr = [];
                let glsCnt = w.globals.series.length;
                if (this.isBarDistributed || this.isHeatmapDistributed) {
                    glsCnt = w.globals.series[0].length * w.globals.series.length;
                }
                let mainColor = w.config.theme.monochrome.color;
                let part = 1 / (glsCnt / w.config.theme.monochrome.shadeIntensity);
                let shade = w.config.theme.monochrome.shadeTo;
                let percent = 0;
                for (let gsl = 0; gsl < glsCnt; gsl++) {
                    let newColor;
                    if (shade === "dark") {
                        newColor = utils.shadeColor(percent * -1, mainColor);
                        percent = percent + part;
                    }
                    else {
                        newColor = utils.shadeColor(percent, mainColor);
                        percent = percent + part;
                    }
                    monoArr.push(newColor);
                }
                w.globals.colors = monoArr.slice();
            }
            const defaultColors = w.globals.colors.slice();
            // if user specified fewer colors than no. of series, push the same colors again
            this.pushExtraColors(w.globals.colors, -3);
            const colorTypes = ["fill", "stroke"];
            colorTypes.forEach((c) => {
                if (w.config[c].colors === undefined) {
                    w.globals[c].colors = this.isColorFn
                        ? w.config.colors
                        : defaultColors;
                }
                else {
                    w.globals[c].colors = [...w.config[c].colors.slice()];
                }
                let ii = c == "stroke" ? undefined : -2;
                this.pushExtraColors(w.globals[c].colors, ii);
            });
            if (w.config.dataLabels.style.colors === undefined) {
                w.globals.dataLabels.style.colors = [...defaultColors];
            }
            else {
                w.globals.dataLabels.style.colors =
                    [...w.config.dataLabels.style.colors.slice()];
            }
            this.pushExtraColors(w.globals.dataLabels.style.colors, 50);
            if (w.config.plotOptions.radar.polygons.fill.colors === undefined) {
                w.globals.radarPolygons.fill.colors = [
                    w.config.theme.mode === "dark" ? "#424242" : "none",
                ];
            }
            else {
                w.globals.radarPolygons.fill.colors =
                    [...w.config.plotOptions.radar.polygons.fill.colors.slice()];
            }
            this.pushExtraColors(w.globals.radarPolygons.fill.colors, 20);
            // The point colors
            if (w.config.markers.colors === undefined) {
                w.globals.markers.colors = [...defaultColors];
            }
            else {
                [...w.globals.markers.colors = w.config.markers.colors.slice()];
            }
            this.pushExtraColors(w.globals.markers.colors, -2);
            // w.globals.markers.colors = w.globals.colors;
        }
        updateThemeOptions(options) {
            options.chart = options.chart || {};
            options.tooltip = options.tooltip || {};
            const mode = options.theme.mode || "light";
            const palette = options.theme.palette
                ? options.theme.palette
                : mode === "dark"
                    ? "palette4"
                    : "palette0";
            const foreColor = options.chart.foreColor
                ? options.chart.foreColor
                : mode === "dark"
                    ? "#f6f7f8"
                    : "#373d3f";
            options.tooltip.theme = mode;
            options.chart.foreColor = foreColor;
            options.theme.palette = palette;
            return options;
        }
        predefined() {
            let palette = this.w.config.theme.palette;
            // D6E3F8, FCEFEF, DCE0D9, A5978B, EDDDD4, D6E3F8, FEF5EF
            switch (palette) {
                case "palette0":
                    this.colors = [
                        "#6FEFD0",
                        "#FFDA7A",
                        "#D6A87D",
                        "#95EEA8",
                        "#7CC7FE",
                        "#FF8E8E",
                        "#FFA1D9",
                        "#A1A1FF",
                    ];
                    break;
                case "palette1":
                    this.colors = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];
                    break;
                case "palette2":
                    this.colors = ["#3f51b5", "#03a9f4", "#4caf50", "#f9ce1d", "#FF9800"];
                    break;
                case "palette3":
                    this.colors = ["#33b2df", "#546E7A", "#d4526e", "#13d8aa", "#A5978B"];
                    break;
                case "palette4":
                    this.colors = ["#4ecdc4", "#c7f464", "#81D4FA", "#fd6a6a", "#546E7A"];
                    break;
                case "palette5":
                    this.colors = ["#2b908f", "#f9a3a4", "#90ee7e", "#fa4443", "#69d2e7"];
                    break;
                case "palette6":
                    this.colors = ["#449DD1", "#F86624", "#EA3546", "#662E9B", "#C5D86D"];
                    break;
                case "palette7":
                    this.colors = ["#D7263D", "#1B998B", "#2E294E", "#F46036", "#E2C044"];
                    break;
                case "palette8":
                    this.colors = ["#662E9B", "#F86624", "#F9C80E", "#EA3546", "#43BCCD"];
                    break;
                case "palette9":
                    this.colors = ["#5C4742", "#A5978B", "#8D5B4C", "#5A2A27", "#C4BBAF"];
                    break;
                case "palette10":
                    this.colors = ["#A300D6", "#7D02EB", "#5653FE", "#2983FF", "#00B1F2"];
                    break;
                default:
                    this.colors = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];
                    break;
            }
            return this.colors;
        }
    }
    pivotcharts.PivotTheme = PivotTheme;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotDestroy extends apexcharts.Destroy {
        clearDomElements({ isUpdating }) {
            const elSVG = this.w.globals.dom.Paper.node;
            // fixes apexcharts.js#1654 & vue-apexcharts#256
            if (elSVG.parentNode && elSVG.parentNode.parentNode && !isUpdating) {
                elSVG.parentNode.parentNode.style.minHeight = 'unset';
            }
            // detach root event
            const baseEl = this.w.globals.dom.baseEl;
            if (baseEl) {
                // see https://github.com/apexcharts/vue-apexcharts/issues/275
                this.ctx.eventList.forEach((event) => {
                    baseEl.removeEventListener(event, this.ctx.events.documentEvent);
                });
            }
            const domEls = this.w.globals.dom;
            if (this.ctx.el !== null) {
                // remove all child elements - resetting the whole chart
                // let fc = this.ctx.el.firstChild;
                for (let ii = 0; ii < this.ctx.el.children.length; ii++) {
                    let _class = this.ctx.el.children[ii].className;
                    if (_class != 'wrap') {
                        this.ctx.el.removeChild(this.ctx.el.children[ii]);
                    }
                }
            }
            this.killSVG(domEls.Paper);
            domEls.Paper.remove();
            domEls.elWrap = null;
            domEls.elGraphical = null;
            domEls.elAnnotations = null;
            domEls.elLegendWrap = null;
            domEls.baseEl = null;
            domEls.elGridRect = null;
            domEls.elGridRectMask = null;
            domEls.elGridRectMarkerMask = null;
            domEls.elDefs = null;
        }
    }
    pivotcharts.PivotDestroy = PivotDestroy;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class ZoomPanSelection extends apexcharts.ZoomPanSelection {
        selectionDrawn({ context, zoomtype }) {
            super.selectionDrawn({ context, zoomtype });
            let startX = context.startX;
            let endX = context.endX;
            let minVal = startX / (this.ctx.w.globals.gridWidth / 100);
            let maxVal = endX / (this.ctx.w.globals.gridWidth / 100);
            Data.Scroll.removeData(minVal);
            Data.Scroll.removeData(maxVal, -1);
            //Data.Scroll.dropScroll();
        }
    }
    pivotcharts.ZoomPanSelection = ZoomPanSelection;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class Scroll {
        constructor(ctx) {
            this.ctx = undefined;
            this.min = 0;
            this.max = 100;
            this.top = Data.BasicSeries.xaxis.categories.length;
            this.bottom = 0;
            this.segment_value = 0;
            this.isScrolling = false;
            this.globMove = 0;
            this.inerval = 0;
            this.ctx = ctx;
            this.curr_series = JSON.stringify(Data.BasicSeries);
        }
        removeData(val, koeff = 1) {
            var len = Data.BasicSeries.xaxis.categories.length;
            var len_new = (len * val) / 100;
            len_new = Math.round(len_new);
            if (koeff == 1) {
                if (len_new == this.bottom) {
                    return;
                }
                this.bottom = len_new;
                let valnew = Math.floor((len_new * 100) / len);
                document.getElementsByClassName("wrap")[0].style.setProperty("--a", valnew);
                document.getElementById("a").value = valnew;
                this.min = valnew;
            }
            else {
                if (len_new == this.top) {
                    return;
                }
                let valnew = Math.floor((len_new * 100) / len);
                document.getElementsByClassName("wrap")[0].style.setProperty("--b", valnew);
                document.getElementById("b").value = valnew;
                this.top = len_new;
                this.max = valnew;
            }
            var cSeries = JSON.parse(JSON.stringify(Data.BasicSeries.series));
            let a = this.ctx.w.globals.collapsedSeriesIndices;
            let uniqueArray = a.filter(function (item, pos) {
                return a.indexOf(item) == pos;
            });
            let newArr = [...cSeries];
            uniqueArray.forEach((element) => {
                newArr[element].data = [0];
            });
            let max = Math.max(...newArr.map((x) => x.data).flat(2));
            let min = Math.min(...newArr.map((x) => x.data).flat(2));
            //let ymax = Math.max(...cSeries.map((x) => x.data).flat(2));
            cSeries = cSeries.map((x) => {
                x.data = x.data.slice(this.bottom, this.top);
                return x;
            });
            var cLabels = [...Data.BasicSeries.xaxis.categories];
            cLabels = cLabels.slice(this.bottom, this.top);
            Data.Model.dataStorage.stateOfUpdate = 1;
            Data.Chart.updateOptions({
                series: cSeries,
                labels: cLabels,
                xaxis: {
                    categories: cLabels
                },
                yaxis: { max: max, min: min, forceNiceScale: true },
            }, false, false);
            Data.Model.dataStorage.stateOfUpdate = 0;
        }
        createScroll() {
            return ("<div " +
                " class='wrap'" +
                " role='group'" +
                " aria-labelledby='multi-lbl'" +
                " style='--a: 0; --b: 100; --min: 0; --max: 100; --w:500; --left-margin:0'" +
                ">" +
                "<label class='sr-only' for='a'>Value A:</label>" +
                "<input class='input-range' id='a' type='range' min='0' value='0' max='100' />" +
                "<output" +
                " for='a'" +
                " style='--c: var(--a)'" +
                "></output>" +
                "<label class='sr-only' for='b'>Value B:</label>" +
                "<input class='input-range' id='b' type='range' min='0' value='100' max='100'  />" +
                "<output" +
                " for='b'" +
                " style='--c: var(--b)'" +
                "></output>" +
                "<div id='backSideScroll'></div>" +
                "<div id='scroller'></div>" +
                // "<img src='../scr/Modules/Scroll/scrollThumb.svg' id='thumb_min'>"+
                "</div>");
        }
        _addListeners() {
            document.getElementById("a").addEventListener("change", (e) => {
                let val = Number(e.target.value);
                if (val >= this.max) {
                    e.target.value = this.min;
                    document.getElementsByClassName("wrap")[0].style.setProperty("--a", this.min);
                    return;
                }
                else {
                    this.min = val;
                }
                this.removeData(this.min);
            });
            document.getElementById("a").addEventListener("mousedown", (e) => {
                x = e.pageX;
                let m = this.min;
                document.onmousemove = (e) => {
                    let a = e.pageX - x;
                    let wrap = document.getElementsByClassName("wrap")[0];
                    let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));
                    if (m + move > this.max) {
                        this.min = this.max;
                    }
                    else {
                        if (m + move < 0) {
                            this.min = 0;
                        }
                        else {
                            this.min = m + move;
                        }
                    }
                    if (Math.abs(move) % this.segment_value == 0) {
                        this.removeData(this.min);
                    }
                    else {
                        document.getElementById("a").value = this.min;
                        wrap.style.setProperty("--a", this.min);
                    }
                };
                document.onmouseup = (e) => {
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            });
            document.getElementById("b").addEventListener("mousedown", (e) => {
                x = e.pageX;
                let m = this.max;
                document.onmousemove = (e) => {
                    let a = e.pageX - x;
                    let wrap = document.getElementsByClassName("wrap")[0];
                    let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));
                    if (m + move < this.min) {
                        this.max = this.min;
                    }
                    else {
                        if (m + move > 100) {
                            this.max = 100;
                        }
                        else {
                            this.max = m + move;
                        }
                    }
                    if (Math.abs(move) % this.segment_value == 0) {
                        this.removeData(this.max, -1);
                    }
                    else {
                        document.getElementById("b").value = this.max;
                        wrap.style.setProperty("--b", this.max);
                    }
                };
                document.onmouseup = (e) => {
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            });
            document.getElementById("b").addEventListener("change", (e) => {
                let val = Number(e.target.value);
                if (val <= this.min) {
                    e.target.value = this.max;
                    document.getElementsByClassName("wrap")[0].style.setProperty("--b", this.max);
                    return;
                }
                else {
                    this.max = val;
                }
                this.removeData(this.max, -1);
            });
            let isDown = false;
            var x;
            var scroller = document.getElementById("scroller");
            let scrollPressed = false;
            let temp_min;
            let temp_max;
            scroller.addEventListener("mousedown", (e) => {
                x = e.pageX;
                isDown = true;
                scrollPressed = true;
                let m = this.min;
                document.onmousemove = (e) => {
                    if (!scrollPressed) {
                        return;
                    }
                    let a = e.pageX - x;
                    let wrap = document.getElementsByClassName("wrap")[0];
                    let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));
                    let diff = this.max - this.min;
                    if (m + move > 100 - diff) {
                        temp_max = 100;
                        temp_min = 100 - diff;
                    }
                    else {
                        if (m + move < 0) {
                            temp_min = 0;
                            temp_max = diff;
                        }
                        else {
                            temp_min = m + move;
                            temp_max = temp_min + diff;
                        }
                    }
                    if (Math.abs(move) % this.segment_value == 0) {
                        this.removeData(temp_min);
                        this.removeData(temp_max, -1);
                    }
                    else {
                        this.inerval = move;
                        document.getElementById("a").value = temp_min;
                        document.getElementById("b").value = temp_max;
                        wrap.style.setProperty("--a", temp_min);
                        wrap.style.setProperty("--b", temp_max);
                    }
                    this.globMove = move;
                };
                document.onmouseup = (e) => {
                    this.max = temp_max;
                    this.min = temp_min;
                    let diff = this.max - this.min;
                    this.isScrolling = true;
                    this.removeData(temp_min);
                    this.removeData(this.min + diff, -1);
                    this.isScrolling = false;
                    isDown = false;
                    scrollPressed = false;
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            });
            scroller.ondragstart = function () {
                return false;
            };
        }
        dropScroll() {
            document.getElementsByClassName("wrap")[0].style.setProperty("--a", 0);
            document.getElementsByClassName("wrap")[0].style.setProperty("--b", 100);
            document.getElementById("a").value = 0;
            document.getElementById("b").value = 100;
        }
        create() {
            if (document.getElementsByClassName("wrap").length != 0) {
                if (this.curr_series != JSON.stringify(Data.BasicSeries)) {
                    this.curr_series = JSON.stringify(Data.BasicSeries);
                    this.dropScroll();
                    this.top = Data.BasicSeries.xaxis.categories.length;
                    this.segment_value = Math.round(100 / this.top);
                }
                return;
            }
            this.segment_value = Math.round(100 / this.top);
            var chart = document.getElementById(this.ctx.el.id);
            chart.insertAdjacentHTML("afterbegin", this.createScroll());
            this._addListeners();
            document.getElementsByClassName("wrap")[0].style.setProperty("--w", this.ctx.w.globals.gridWidth);
            document.getElementsByClassName("wrap")[0].style.setProperty("--left-margin", this.ctx.w.globals.translateX);
            let inps = document.getElementsByClassName("input-range");
            for (let i = 0; i < inps.length; i++) {
                inps[i].addEventListener("input", (e) => {
                    let _t = e.target;
                    _t.parentNode.style.setProperty(`--${_t.id}`, +_t.value);
                }, false);
            }
            Data.Scroll = this;
        }
        getCoords(elem) {
            var box = elem.getBoundingClientRect();
            return {
                top: box.top + pageYOffset,
                left: box.left + pageXOffset,
            };
        }
    }
    pivotcharts.Scroll = Scroll;
})(pivotcharts || (pivotcharts = {}));
var charts;
(function (charts) {
    class PivotBar extends apexcharts.Bar {
        constructor(ctx, xyRatios) {
            super(ctx, xyRatios);
        }
        draw(series, seriesIndex) {
            let w = this.w;
            let graphics = new apexcharts.Graphics(this.ctx);
            let full_names = w.globals.full_name;
            const coreUtils = new apexcharts.CoreUtils(this.ctx);
            series = coreUtils.getLogSeries(series);
            this.series = series;
            this.yRatio = coreUtils.getLogYRatios(this.yRatio);
            this.barHelpers.initVariables(series);
            let ret = graphics.group({
                class: "apexcharts-bar-series apexcharts-plot-series",
            });
            if (w.config.dataLabels.enabled) {
                if (this.totalItems > this.barOptions.dataLabels.maxItems) {
                    console.warn("WARNING: DataLabels are enabled but there are too many to display. This may cause performance issue when rendering.");
                }
            }
            for (let i = 0, bc = 0; i < series.length; i++, bc++) {
                let x, y, xDivision, // xDivision is the GRIDWIDTH divided by number of datapoints (columns)
                yDivision, // yDivision is the GRIDHEIGHT divided by number of datapoints (bars)
                zeroH, // zeroH is the baseline where 0 meets y axis
                zeroW; // zeroW is the baseline where 0 meets x axis
                let yArrj = []; // hold y values of current iterating series
                let xArrj = []; // hold x values of current iterating series
                let realIndex = w.globals.comboCharts ? seriesIndex[i] : i;
                // el to which series will be drawn
                let elSeries = graphics.group({
                    class: `apexcharts-series`,
                    rel: i + 1,
                    seriesName: apexcharts.Utils.escapeString(w.globals.seriesNames[realIndex], "x"),
                    full_name: full_names[i],
                    "data:realIndex": realIndex,
                });
                this.ctx.series.addCollapsedClassToSeries(elSeries, realIndex);
                if (series[i].length > 0) {
                    this.visibleI = this.visibleI + 1;
                }
                let barHeight = 0;
                let barWidth = 0;
                if (this.yRatio.length > 1) {
                    this.yaxisIndex = realIndex;
                }
                this.isReversed =
                    w.config.yaxis[this.yaxisIndex] &&
                        w.config.yaxis[this.yaxisIndex].reversed;
                let initPositions = this.barHelpers.initialPositions();
                y = initPositions.y;
                barHeight = initPositions.barHeight;
                yDivision = initPositions.yDivision;
                zeroW = initPositions.zeroW;
                x = initPositions.x;
                barWidth = initPositions.barWidth;
                xDivision = initPositions.xDivision;
                zeroH = initPositions.zeroH;
                if (!this.horizontal) {
                    xArrj.push(x + barWidth / 2);
                }
                // eldatalabels
                let elDataLabelsWrap = graphics.group({
                    class: "apexcharts-datalabels",
                    "data:realIndex": realIndex,
                });
                let elGoalsMarkers = graphics.group({
                    class: "apexcharts-bar-goals-markers",
                    style: `pointer-events: none`,
                });
                for (let j = 0; j < w.globals.dataPoints; j++) {
                    const strokeWidth = this.barHelpers.getStrokeWidth(i, j, realIndex);
                    let paths = null;
                    const pathsParams = {
                        indexes: {
                            i,
                            j,
                            realIndex,
                            bc,
                        },
                        x,
                        y,
                        strokeWidth,
                        elSeries,
                    };
                    if (this.isHorizontal) {
                        paths = this.drawBarPaths(Object.assign(Object.assign({}, pathsParams), { barHeight,
                            zeroW,
                            yDivision }));
                        barWidth = this.series[i][j] / this.invertedYRatio;
                    }
                    else {
                        paths = this.drawColumnPaths(Object.assign(Object.assign({}, pathsParams), { xDivision,
                            barWidth,
                            zeroH }));
                        barHeight = this.series[i][j] / this.yRatio[this.yaxisIndex];
                    }
                    const barGoalLine = this.barHelpers.drawGoalLine({
                        barXPosition: paths.barXPosition,
                        barYPosition: paths.barYPosition,
                        goalX: paths.goalX,
                        goalY: paths.goalY,
                        barHeight,
                        barWidth,
                    });
                    if (barGoalLine) {
                        elGoalsMarkers.add(barGoalLine);
                    }
                    y = paths.y;
                    x = paths.x;
                    // push current X
                    if (j > 0) {
                        xArrj.push(x + barWidth / 2);
                    }
                    yArrj.push(y);
                    let pathFill = this.barHelpers.getPathFillColor(series, i, j, realIndex);
                    this.renderSeries({
                        realIndex,
                        pathFill,
                        j,
                        i,
                        pathFrom: paths.pathFrom,
                        pathTo: paths.pathTo,
                        strokeWidth,
                        elSeries,
                        x,
                        y,
                        series,
                        barHeight,
                        barWidth,
                        elDataLabelsWrap,
                        elGoalsMarkers,
                        visibleSeries: this.visibleI,
                        type: "bar",
                    });
                }
                // push all x val arrays into main xArr
                w.globals.seriesXvalues[realIndex] = xArrj;
                w.globals.seriesYvalues[realIndex] = yArrj;
                ret.add(elSeries);
            }
            return ret;
        }
    }
    charts.PivotBar = PivotBar;
})(charts || (charts = {}));
var charts;
(function (charts) {
    class PivotPie extends apexcharts.Pie {
        constructor(ctx) {
            super(ctx);
            // var controller = new PieController();
        }
        drawArcs(sectorAngleArr, series) {
            let w = this.w;
            const filters = new apexcharts.Filters(this.ctx);
            let graphics = new apexcharts.Graphics(this.ctx);
            let fill = new apexcharts.Fill(this.ctx);
            let g = graphics.group({
                class: 'apexcharts-slices'
            });
            let startAngle = this.initialAngle;
            let prevStartAngle = this.initialAngle;
            let endAngle = this.initialAngle;
            let prevEndAngle = this.initialAngle;
            this.strokeWidth = w.config.stroke.show ? w.config.stroke.width : 0;
            let full_names = w.globals.full_name;
            for (let i = 0; i < sectorAngleArr.length; i++) {
                let elPieArc = graphics.group({
                    class: `apexcharts-series apexcharts-pie-series`,
                    seriesName: apexcharts.Utils.escapeString(w.globals.seriesNames[i]),
                    rel: i + 1,
                    'data:realIndex': i
                });
                g.add(elPieArc);
                startAngle = endAngle;
                prevStartAngle = prevEndAngle;
                endAngle = startAngle + sectorAngleArr[i];
                prevEndAngle = prevStartAngle + this.prevSectorAngleArr[i];
                const angle = endAngle < startAngle
                    ? this.fullAngle + endAngle - startAngle
                    : endAngle - startAngle;
                let pathFill = fill.fillPath({
                    seriesNumber: i,
                    size: this.sliceSizes[i],
                    value: series[i]
                }); // additionally, pass size for gradient drawing in the fillPath function
                let path = this.getChangedPath(prevStartAngle, prevEndAngle);
                let elPath = graphics.drawPath({
                    d: path,
                    stroke: Array.isArray(this.lineColorArr)
                        ? this.lineColorArr[i]
                        : this.lineColorArr,
                    strokeWidth: 0,
                    fill: pathFill,
                    fillOpacity: w.config.fill.opacity,
                    strokeOpacity: 0,
                    classes: `apexcharts-pie-area apexcharts-${this.chartType.toLowerCase()}-slice-${i}`,
                    strokeLinecap: null,
                    strokeDashArray: null
                });
                elPath.attr({
                    index: 0,
                    j: i
                });
                filters.setSelectionFilter(elPath, 0, i);
                if (w.config.chart.dropShadow.enabled) {
                    const shadow = w.config.chart.dropShadow;
                    filters.dropShadow(elPath, shadow, i);
                }
                this.addListeners(elPath, this.donutDataLabels);
                apexcharts.Graphics.setAttrs(elPath.node, {
                    'data:angle': angle,
                    'data:startAngle': startAngle,
                    'data:strokeWidth': this.strokeWidth,
                    'data:value': series[i],
                    'full_name': full_names[i]
                });
                let labelPosition = {
                    x: 0,
                    y: 0
                };
                if (this.chartType === 'pie' || this.chartType === 'polarArea') {
                    labelPosition = apexcharts.Utils.polarToCartesian(this.centerX, this.centerY, w.globals.radialSize / 1.25 +
                        w.config.plotOptions.pie.dataLabels.offset, (startAngle + angle / 2) % this.fullAngle);
                }
                else if (this.chartType === 'donut') {
                    labelPosition = apexcharts.Utils.polarToCartesian(this.centerX, this.centerY, (w.globals.radialSize + this.donutSize) / 2 +
                        w.config.plotOptions.pie.dataLabels.offset, (startAngle + angle / 2) % this.fullAngle);
                }
                elPieArc.add(elPath);
                // Animation code starts
                let dur = 0;
                if (this.initialAnim && !w.globals.resized && !w.globals.dataChanged) {
                    dur = (angle / this.fullAngle) * w.config.chart.animations.speed;
                    if (dur === 0)
                        dur = 1;
                    this.animDur = dur + this.animDur;
                    this.animBeginArr.push(this.animDur);
                }
                else {
                    this.animBeginArr.push(0);
                }
                if (this.dynamicAnim && w.globals.dataChanged) {
                    this.animatePaths(elPath, {
                        size: this.sliceSizes[i],
                        endAngle,
                        startAngle,
                        prevStartAngle,
                        prevEndAngle,
                        animateStartingPos: true,
                        i,
                        animBeginArr: this.animBeginArr,
                        shouldSetPrevPaths: true,
                        dur: w.config.chart.animations.dynamicAnimation.speed
                    });
                }
                else {
                    this.animatePaths(elPath, {
                        size: this.sliceSizes[i],
                        endAngle,
                        startAngle,
                        i,
                        totalItems: sectorAngleArr.length - 1,
                        animBeginArr: this.animBeginArr,
                        dur
                    });
                }
                // animation code ends
                if (w.config.plotOptions.pie.expandOnClick &&
                    this.chartType !== 'polarArea') {
                    elPath.click(this.pieClicked.bind(this, i));
                }
                if (typeof w.globals.selectedDataPoints[0] !== 'undefined' &&
                    w.globals.selectedDataPoints[0].indexOf(i) > -1) {
                    this.pieClicked(i);
                }
                if (w.config.dataLabels.enabled) {
                    let xPos = labelPosition.x;
                    let yPos = labelPosition.y;
                    let text = (100 * angle) / this.fullAngle + '%';
                    if (angle !== 0 &&
                        w.config.plotOptions.pie.dataLabels.minAngleToShowLabel <
                            sectorAngleArr[i]) {
                        let formatter = w.config.dataLabels.formatter;
                        if (formatter !== undefined) {
                            text = formatter(w.globals.seriesPercent[i][0], {
                                seriesIndex: i,
                                w
                            });
                        }
                        let foreColor = w.globals.dataLabels.style.colors[i];
                        const elPieLabelWrap = graphics.group({
                            class: `apexcharts-datalabels`
                        });
                        let elPieLabel = graphics.drawText({
                            x: xPos,
                            y: yPos,
                            text: text,
                            textAnchor: 'middle',
                            fontSize: w.config.dataLabels.style.fontSize,
                            fontFamily: w.config.dataLabels.style.fontFamily,
                            fontWeight: w.config.dataLabels.style.fontWeight,
                            foreColor,
                            opacity: 1,
                            cssClass: "",
                            isPlainText: true
                        });
                        elPieLabelWrap.add(elPieLabel);
                        if (w.config.dataLabels.dropShadow.enabled) {
                            const textShadow = w.config.dataLabels.dropShadow;
                            filters.dropShadow(elPieLabel, textShadow);
                        }
                        elPieLabel.node.classList.add('apexcharts-pie-label');
                        if (w.config.chart.animations.animate &&
                            w.globals.resized === false) {
                            elPieLabel.node.classList.add('apexcharts-pie-label-delay');
                            elPieLabel.node.style.animationDelay =
                                w.config.chart.animations.speed / 940 + 's';
                        }
                        this.sliceLabels.push(elPieLabelWrap);
                    }
                }
            }
            return g;
        }
    }
    charts.PivotPie = PivotPie;
})(charts || (charts = {}));
var charts;
(function (charts) {
    class PivotRadar extends apexcharts.Radar {
        constructor(ctx) {
            super(ctx);
        }
        draw(series) {
            let w = this.w;
            const fill = new apexcharts.Fill(this.ctx);
            let full_names = w.globals.full_name;
            const allSeries = [];
            const dataLabels = new apexcharts.DataLabels(this.ctx);
            if (series.length) {
                this.dataPointsLen = series[w.globals.maxValsInArrayIndex].length;
            }
            this.disAngle = (Math.PI * 2) / this.dataPointsLen;
            let halfW = w.globals.gridWidth / 2;
            let halfH = w.globals.gridHeight / 2;
            let translateX = halfW + w.config.plotOptions.radar.offsetX;
            let translateY = halfH + w.config.plotOptions.radar.offsetY;
            let ret = this.graphics.group({
                class: "apexcharts-radar-series apexcharts-plot-series",
                transform: `translate(${translateX || 0}, ${translateY || 0})`,
            });
            let dataPointsPos = [];
            let elPointsMain = null;
            let elDataPointsMain = null;
            this.yaxisLabels = this.graphics.group({
                class: "apexcharts-yaxis",
            });
            series.forEach((s, i) => {
                let longestSeries = s.length === w.globals.dataPoints;
                // el to which series will be drawn
                let elSeries = this.graphics.group().attr({
                    class: `apexcharts-series`,
                    "data:longestSeries": longestSeries,
                    seriesName: apexcharts.Utils.escapeString(w.globals.seriesNames[i], "x"),
                    rel: i + 1,
                    "data:realIndex": i,
                    full_name: full_names[i],
                });
                this.dataRadiusOfPercent[i] = [];
                this.dataRadius[i] = [];
                this.angleArr[i] = [];
                s.forEach((dv, j) => {
                    const range = Math.abs(this.maxValue - this.minValue);
                    dv = dv + Math.abs(this.minValue);
                    if (this.isLog) {
                        dv = this.coreUtils.getLogVal(dv, 0);
                    }
                    this.dataRadiusOfPercent[i][j] = dv / range;
                    this.dataRadius[i][j] = this.dataRadiusOfPercent[i][j] * this.size;
                    this.angleArr[i][j] = j * this.disAngle;
                });
                dataPointsPos = this.getDataPointsPos(this.dataRadius[i], this.angleArr[i], this.dataPointsLen);
                const paths = this.createPaths(dataPointsPos, {
                    x: 0,
                    y: 0,
                });
                // points
                elPointsMain = this.graphics.group({
                    class: "apexcharts-series-markers-wrap apexcharts-element-hidden",
                });
                // datapoints
                elDataPointsMain = this.graphics.group({
                    class: `apexcharts-datalabels`,
                    "data:realIndex": i,
                });
                w.globals.delayedElements.push({
                    el: elPointsMain.node,
                    index: i,
                });
                const defaultRenderedPathOptions = {
                    i,
                    realIndex: i,
                    animationDelay: i,
                    initialSpeed: w.config.chart.animations.speed,
                    dataChangeSpeed: w.config.chart.animations.dynamicAnimation.speed,
                    className: `apexcharts-radar`,
                    shouldClipToGrid: false,
                    bindEventsOnPaths: false,
                    stroke: w.globals.stroke.colors[i],
                    strokeLineCap: w.config.stroke.lineCap,
                };
                let pathFrom = null;
                if (w.globals.previousPaths.length > 0) {
                    pathFrom = this.getPreviousPath(i);
                }
                for (let p = 0; p < paths.linePathsTo.length; p++) {
                    let renderedLinePath = this.graphics.renderPaths(Object.assign(Object.assign({}, defaultRenderedPathOptions), { pathFrom: pathFrom === null ? paths.linePathsFrom[p] : pathFrom, pathTo: paths.linePathsTo[p], strokeWidth: Array.isArray(this.strokeWidth)
                            ? this.strokeWidth[i]
                            : this.strokeWidth, fill: "none", drawShadow: false }));
                    elSeries.add(renderedLinePath);
                    let pathFill = fill.fillPath({
                        seriesNumber: i,
                    });
                    let renderedAreaPath = this.graphics.renderPaths(Object.assign(Object.assign({}, defaultRenderedPathOptions), { pathFrom: pathFrom === null ? paths.areaPathsFrom[p] : pathFrom, pathTo: paths.areaPathsTo[p], strokeWidth: 0, fill: pathFill, drawShadow: false }));
                    if (w.config.chart.dropShadow.enabled) {
                        const filters = new apexcharts.Filters(this.ctx);
                        const shadow = w.config.chart.dropShadow;
                        filters.dropShadow(renderedAreaPath, Object.assign({}, shadow, { noUserSpaceOnUse: true }), i);
                    }
                    elSeries.add(renderedAreaPath);
                }
                s.forEach((sj, j) => {
                    let markers = new apexcharts.Markers(this.ctx);
                    let opts = markers.getMarkerConfig("apexcharts-marker", i, j);
                    let point = this.graphics.drawMarker(dataPointsPos[j].x, dataPointsPos[j].y, opts);
                    point.attr("rel", j);
                    point.attr("j", j);
                    point.attr("index", i);
                    point.node.setAttribute("default-marker-size", opts.pSize);
                    let elPointsWrap = this.graphics.group({
                        class: "apexcharts-series-markers",
                    });
                    if (elPointsWrap) {
                        elPointsWrap.add(point);
                    }
                    elPointsMain.add(elPointsWrap);
                    elSeries.add(elPointsMain);
                    const dataLabelsConfig = w.config.dataLabels;
                    if (dataLabelsConfig.enabled) {
                        let text = dataLabelsConfig.formatter(w.globals.series[i][j], {
                            seriesIndex: i,
                            dataPointIndex: j,
                            w,
                        });
                        dataLabels.plotDataLabelsText({
                            x: dataPointsPos[j].x,
                            y: dataPointsPos[j].y,
                            text,
                            textAnchor: "middle",
                            i,
                            j: i,
                            parent: elDataPointsMain,
                            offsetCorrection: false,
                            dataLabelsConfig: Object.assign({}, dataLabelsConfig),
                        });
                    }
                    elSeries.add(elDataPointsMain);
                });
                allSeries.push(elSeries);
            });
            this.drawPolygons({
                parent: ret,
            });
            if (w.config.xaxis.labels.show) {
                const xaxisTexts = this.drawXAxisTexts();
                ret.add(xaxisTexts);
            }
            allSeries.forEach((elS) => {
                ret.add(elS);
            });
            ret.add(this.yaxisLabels);
            return ret;
        }
    }
    charts.PivotRadar = PivotRadar;
})(charts || (charts = {}));
var charts;
(function (charts) {
    class PivotLine extends apexcharts.Line {
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
    charts.PivotLine = PivotLine;
})(charts || (charts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotChart extends ApexCharts {
        constructor(el, config) {
            if (config.title == null) {
                config.title = { text: "Chart", align: "left" };
                // config.title =
            }
            super(el, config);
            var initCtx = new pivotcharts.PivotInitCtxVariables(this);
            initCtx.initModules();
            Data.Chart = this;
            document.head.innerHTML +=
                "<link rel='stylesheet' href='../scr/Modules/Axis/style.css' />";
            document.head.innerHTML +=
                "<link rel='stylesheet' href='../scr/Modules/Scroll/style.css' />";
            // document.head.innerHTML +=
            //   "<link rel='stylesheet' href='../scr/style.css' />";
            // let org_html = document.getElementById("chart").innerHTML;
            // let new_html = "<div id='chart-box'>" + org_html + "</div>";
            // document.getElementById("chart").innerHTML = new_html;
            if (document.getElementById("buttons_panel") == null) {
                el.insertAdjacentHTML("beforebegin", "<div id='buttons_panel'></div>");
                // document.createElement('div');
                // bp.id = 'buttons_panel';
            }
        }
        updateOptions(options, redraw = false, animate = true, updateSyncedCharts = true, overwriteInitialConfig = true) {
            const w = this.w;
            if (options.series != null && Data.Model.dataStorage.stateOfUpdate != 1) {
                //Data.Hiddens;
                let a = w.globals.collapsedSeriesIndices;
                let uniqueArray = a.filter(function (item, pos) {
                    return a.indexOf(item) == pos;
                });
                let newArr = [...options.series];
                uniqueArray.forEach((element) => {
                    newArr[element].data = [0];
                });
                let m = Math.max(...newArr.map((x) => x.data).flat(2));
                if (options.yaxis == null) {
                    options.yaxis = { max: m };
                }
                else {
                    options.yaxis.max = m;
                }
                options.yaxis.forceNiceScale = true;
            }
            // when called externally, clear some global variables
            // fixes apexcharts.js#1488
            w.globals.selection = undefined;
            if (options.series) {
                this.series.resetSeries(false, true, false);
                if (options.series.length && options.series[0].data) {
                    options.series = options.series.map((s, i) => {
                        return this.updateHelpers._extendSeries(s, i);
                    });
                }
                // user updated the series via updateOptions() function.
                // Hence, we need to reset axis min/max to avoid zooming issues
                this.updateHelpers.revertDefaultAxisMinMax();
            }
            // user has set x-axis min/max externally - hence we need to forcefully set the xaxis min/max
            if (options.xaxis) {
                options = this.updateHelpers.forceXAxisUpdate(options);
            }
            if (options.yaxis) {
                options = this.updateHelpers.forceYAxisUpdate(options);
            }
            if (w.globals.collapsedSeriesIndices.length > 0) {
                this.series.clearPreviousPaths();
            }
            /* update theme mode#459 */
            if (options.theme) {
                options = this.theme.updateThemeOptions(options);
            }
            return this.updateHelpers._updateOptions(options, redraw, animate, updateSyncedCharts, overwriteInitialConfig);
        }
        create(ser, opts) {
            if (Data.Model.dataStorage.stateOfUpdate == 0) {
                this.w.config.yaxis.max = Math.max(...ser.map((x) => x.data).flat(2));
            }
            var initCtx = new pivotcharts.PivotInitCtxVariables(this);
            initCtx.initModules();
            var res = super.create(ser, opts);
            let gl = this.w.globals;
            if (!gl.axisCharts && ser.length > 1 && !this.ctx.rowsSelector.isDrawn) {
                this.ctx.rowsSelector.draw(ser.map((x) => x.name));
            }
            let w = this.w;
            if (w.config.chart.zoom.enabled ||
                (w.config.chart.selection && w.config.chart.selection.enabled) ||
                (w.config.chart.pan && w.config.chart.pan.enabled)) {
                if (Data.Model.scroll == undefined) {
                    Data.Model.scroll = new pivotcharts.Scroll(this.ctx);
                }
                Data.Model.scroll.create();
            }
            return res;
        }
        mount(graphData = null) {
            var me = this;
            var graphData = arguments.length > 0 && arguments[0] !== undefined
                ? arguments[0]
                : null;
            var me = this;
            var w = me.w;
            return new Promise(function (resolve, reject) {
                // no data to display
                if (me.el === null) {
                    return reject(new Error("Not enough data to display or target element not found"));
                }
                else if (graphData === null || w.globals.allSeriesCollapsed) {
                    me.series.handleNoData();
                }
                if (w.config.chart.type !== "treemap") {
                    me.axes.drawAxis(w.config.chart.type, graphData.xyRatios);
                }
                me.grid = new pivotcharts.PivotGrid(me);
                var elgrid = me.grid.drawGrid();
                me.annotations = new apexcharts.Annotations(me);
                me.annotations.drawImageAnnos();
                me.annotations.drawTextAnnos();
                if (w.config.grid.position === "back" && elgrid) {
                    w.globals.dom.elGraphical.add(elgrid.el);
                }
                var xAxis = new pivotcharts.PivotXAxis(me.ctx);
                var yaxis = new apexcharts.YAxis(me.ctx);
                if (elgrid !== null) {
                    xAxis.xAxisLabelCorrections();
                    yaxis.setYAxisTextAlignments();
                    w.config.yaxis.map(function (yaxe, index) {
                        if (w.globals.ignoreYAxisIndexes.indexOf(index) === -1) {
                            yaxis.yAxisTitleRotate(index, yaxe.opposite);
                        }
                    });
                }
                if (w.config.annotations.position === "back") {
                    w.globals.dom.Paper.add(w.globals.dom.elAnnotations);
                    me.annotations.drawAxesAnnotations();
                }
                if (Array.isArray(graphData.elGraph)) {
                    for (var g = 0; g < graphData.elGraph.length; g++) {
                        w.globals.dom.elGraphical.add(graphData.elGraph[g]);
                    }
                }
                else {
                    w.globals.dom.elGraphical.add(graphData.elGraph);
                }
                if (w.config.grid.position === "front" && elgrid) {
                    w.globals.dom.elGraphical.add(elgrid.el);
                }
                if (w.config.xaxis.crosshairs.position === "front") {
                    me.crosshairs.drawXCrosshairs();
                }
                if (w.config.yaxis[0].crosshairs.position === "front") {
                    me.crosshairs.drawYCrosshairs();
                }
                if (w.config.annotations.position === "front") {
                    w.globals.dom.Paper.add(w.globals.dom.elAnnotations);
                    me.annotations.drawAxesAnnotations();
                }
                if (!w.globals.noData) {
                    // draw tooltips at the end
                    if (w.config.tooltip.enabled && !w.globals.noData) {
                        me.w.globals.tooltip.drawTooltip(graphData.xyRatios);
                    }
                    if (w.globals.axisCharts &&
                        (w.globals.isXNumeric ||
                            w.config.xaxis.convertedCatToNumeric ||
                            w.globals.isTimelineBar)) {
                        if (w.config.chart.zoom.enabled ||
                            (w.config.chart.selection && w.config.chart.selection.enabled) ||
                            (w.config.chart.pan && w.config.chart.pan.enabled)) {
                            me.zoomPanSelection.init({
                                xyRatios: graphData.xyRatios,
                            });
                        }
                    }
                    else {
                        var tools = w.config.chart.toolbar.tools;
                        var toolsArr = [
                            "zoom",
                            "zoomin",
                            "zoomout",
                            "selection",
                            "pan",
                            "reset",
                        ];
                        toolsArr.forEach(function (t) {
                            tools[t] = false;
                        });
                    }
                    if (w.config.chart.toolbar.show && !w.globals.allSeriesCollapsed) {
                        me.toolbar.createToolbar();
                    }
                }
                if (w.globals.memory.methodsToExec.length > 0) {
                    w.globals.memory.methodsToExec.forEach(function (fn) {
                        fn.method(fn.params, false, fn.context);
                    });
                }
                if (!w.globals.axisCharts && !w.globals.noData) {
                    me.core.resizeNonAxisCharts();
                }
                resolve(me);
            });
        }
        update(options) {
            return new Promise((resolve, reject) => {
                new pivotcharts.PivotDestroy(this.ctx).clear({ isUpdating: true });
                const graphData = this.create(this.w.config.series, options);
                if (!graphData)
                    return resolve(this);
                this.mount(graphData)
                    .then(() => {
                    if (typeof this.w.config.chart.events.updated === "function") {
                        this.w.config.chart.events.updated(this, this.w);
                    }
                    this.events.fireEvent("updated", [this, this.w]);
                    this.w.globals.isDirty = true;
                    resolve(this);
                })
                    .catch((e) => {
                    reject(e);
                });
                Data.Hiddens.forEach((e) => {
                    var sEl = null;
                    var obj = Data.LegendHelper._realIndex(e);
                    sEl = obj.seriesEl;
                    let ee = e;
                    Data.Hiddens.shift();
                    Data.LegendHelper.hideSeries({ seriesEl: sEl, realIndex: ee });
                });
                this.ctx.legend.setCorrectHeight();
            });
        }
    }
    pivotcharts.PivotChart = PivotChart;
})(pivotcharts || (pivotcharts = {}));
//# sourceMappingURL=PivotChart.js.map