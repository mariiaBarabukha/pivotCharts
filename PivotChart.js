var Data;
(function (Data) {
    class DataSetsMaker {
        constructor(data) {
            this._data = undefined;
            this._meta = undefined;
            this._data = data.data;
            this._meta = data.meta;
        }
        riseAllCollapsedSeries() {
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
        sortData(sortKey = "c_full") {
            this._data.splice(0, 1);
            this._data.forEach((element) => {
                var keys = Object.entries(element);
                element.c_full = "";
                element.r_full = "";
                keys.forEach((key) => {
                    if (key[0][0] == "c") {
                        if (key[0].includes("full")) {
                            var a = element[key[0]] === undefined
                                ? ""
                                : element[key[0]]
                                    .match(/(?<=\[)[^\][]*(?=])/g)
                                    .map((x) => this.capitalizeFirstLetter(x))
                                    .join("_");
                            if (this.includesDespiteCase(a, element.c_full)) {
                                element.c_full = a;
                            }
                            else {
                                if (!this.includesDespiteCase(element.c_full, a)) {
                                    element.c_full += "_" + a;
                                }
                            }
                        }
                        else {
                            var b = element[key[0]] === undefined ? "" : "_" + element[key[0]];
                            if (this.includesDespiteCase(b, element.c_full)) {
                                element.c_full = b;
                            }
                            else {
                                if (!this.includesDespiteCase(element.c_full, b)) {
                                    element.c_full += "_" + b;
                                }
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
                            if (this.includesDespiteCase(a, element.r_full)) {
                                element.r_full = a;
                            }
                            else {
                                if (!this.includesDespiteCase(element.r_full, a)) {
                                    element.r_full += "_" + a;
                                }
                            }
                        }
                        else {
                            var b = element[key[0]] === undefined ? "" : "_" + element[key[0]];
                            if (this.includesDespiteCase(b, element.r_full)) {
                                element.r_full = b;
                            }
                            else {
                                if (!this.includesDespiteCase(element.r_full, b)) {
                                    element.r_full += "_" + b;
                                }
                            }
                        }
                    }
                    if (key[0][0] == "v" && key[1] != key[1]) {
                        element[key[0]] = 0;
                    }
                });
                element.c_full = this.removeFirstUnderLine(element.c_full);
                element.r_full = this.removeFirstUnderLine(element.r_full);
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
        makeSeries(sortByColumns, key = "c_full") {
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
                });
            });
            return series;
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
            var old_legends = this.getOldLegends();
            if (old_legends == undefined) {
                return;
            }
            var legends = series.map((x) => x.full_name.toLowerCase());
            for (var i = 0; i < legends.length; i++) {
                for (var j = 1; j < legends.length; j++) {
                    if (legends[i].toLowerCase() != legends[j].toLowerCase() &&
                        this.isPrevLegend(legends[i], legends[j])) {
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
        makeDataSets() {
            this.riseAllCollapsedSeries();
            this.determinateRowsNames();
            this.determinateColumnsNames();
            var sortByColumns = this.sortData();
            var categories = sortByColumns[0].map((x) => {
                var r = x.r_full.split("_");
                return this.capitalizeFirstLetter(r[r.length - 1]);
            });
            var series = this.makeSeries(sortByColumns);
            this.hideSeries(series);
            console.log(series);
            return { series: series, xaxis: { categories: categories } };
        }
    }
    Data.AxisDataSetsMaker = AxisDataSetsMaker;
})(Data || (Data = {}));
var Data;
(function (Data) {
    class OneDimentionalDataSetsMaker extends Data.DataSetsMaker {
        makeDataSets() {
            this.determinateRowsNames();
            this.determinateColumnsNames();
            var sorted = this.sortData("r_full");
            var categories = sorted[0].map((x) => {
                var r = x.c_full.split("_");
                return this.capitalizeFirstLetter(r[r.length - 1]);
            });
            var series = this.makeSeries(sorted, "r_full");
            this.hideSeries(series);
            return { series: series, labels: categories };
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
    Data.labelsCoordinates = [];
    Data.FullChartArea = [];
    Data.Hiddens = [];
    Data.GridLines = [];
    Data.visibleDataSets = [];
    Data.Categories = [];
    function processData(rawData, type = 'bar') {
        if (Data.Model.dataStorage == undefined) {
            Data.Model.dataStorage = new Data.DataStorage(rawData, type);
        }
        else {
            Data.Model.dataStorage.setConfigs(rawData, type);
        }
        return Data.Model.dataStorage.getVisibleDataSets(type);
    }
    Data.processData = processData;
    Data.BasicSeriesNames = [];
    // export var RawData;
})(Data || (Data = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotHelper extends apexcharts.LegendHelpers {
        //visibleDataSets = [];
        toggleDataSeries(seriesCnt, isHidden) {
            const w = this.w;
            var seriesEl;
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
                // var globalIndex = names.indexOf(name);
            }
            else {
                // for non-axis charts i.e pie / donuts
                seriesEl = w.globals.dom.Paper.select(` .apexcharts-series[rel='${seriesCnt + 1}'] path`);
                const type = w.config.chart.type;
                if (type === "pie" || type === "polarArea" || type === "donut") {
                    let dataLabels = w.config.plotOptions.pie.donut.labels;
                    const graphics = new pivotcharts.PivotGraphics(this.lgCtx.ctx);
                    graphics.pathMouseDown(seriesEl.members[0], null);
                    this.lgCtx.ctx.pie.printDataLabelsInner(seriesEl.members[0].node, dataLabels);
                }
                seriesEl.fire("click");
                seriesEl = seriesEl.members[0].node;
            }
            var name = seriesEl.getAttribute("full_name");
            var names = name.split("_");
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
                realIndex = parseInt(seriesEl.getAttribute("data:realIndex"), 10);
            }
            else {
                seriesEl = w.globals.dom.baseEl.querySelector(`.apexcharts-series[rel='${seriesCnt + 1}']`);
                realIndex = parseInt(seriesEl.getAttribute("rel"), 10) - 1;
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
            let series = apexcharts.Utils.clone(w.config.series);
            var curr_len = series.length;
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
    }
    pivotcharts.PivotHelper = PivotHelper;
    class PivotLegend extends apexcharts.Legend {
        constructor(ctx, opts) {
            super(ctx, opts);
            this.onLegendClick = this.onLegendClick.bind(this);
            this.legendHelpers = new PivotHelper(this);
            Data.LegendHelper = this.legendHelpers;
        }
        drawLegends() {
            let self = this;
            let w = this.w;
            let fontFamily = w.config.legend.fontFamily;
            let legendNames = w.globals.seriesNames;
            let full_names = w.globals.full_name;
            let fillcolor = w.globals.colors.slice();
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
                elLegend.appendChild(elMarker);
                elLegend.appendChild(elLegendText);
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
                w.globals.dom.elLegendWrap.appendChild(elLegend);
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
        }
    }
    pivotcharts.PivotInitCtxVariables = PivotInitCtxVariables;
})(pivotcharts || (pivotcharts = {}));
var pivotcharts;
(function (pivotcharts) {
    class PivotXAxis extends apexcharts.XAxis {
        drawXaxis() {
            // var graphics = new PivotGraphics(this.ctx);
            var _this = this;
            var w = this.w;
            var graphics = new pivotcharts.PivotGraphics(this.ctx);
            var elXaxis = graphics.group({
                class: 'apexcharts-xaxis',
                transform: "translate(".concat(w.config.xaxis.offsetX, ", ").concat(w.config.xaxis.offsetY, ")")
            });
            var elXaxisTexts = graphics.group({
                class: 'apexcharts-xaxis-texts-g',
                transform: "translate(".concat(w.globals.translateXAxisX, ", ").concat(w.globals.translateXAxisY, ")")
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
                if (_i === 0 && labelsLen === 1 && colWidth / 2 === xPos && w.globals.dataPoints === 1) {
                    // single datapoint
                    x = w.globals.gridWidth / 2;
                }
                var label = _this.axesUtils.getLabel(labels, w.globals.timescaleLabels, x, _i, _this.drawnLabels, _this.xaxisFontSize);
                var offsetYCorrection = 28;
                if (w.globals.rotateXLabels) {
                    offsetYCorrection = 22;
                }
                var isCategoryTickAmounts = typeof w.config.xaxis.tickAmount !== 'undefined' && w.config.xaxis.tickAmount !== 'dataPoints' && w.config.xaxis.type !== 'datetime';
                if (isCategoryTickAmounts) {
                    label = _this.axesUtils.checkLabelBasedOnTickamount(_i, label, labelsLen);
                }
                else {
                    label = _this.axesUtils.checkForOverflowingLabels(_i, label, labelsLen, _this.drawnLabels, _this.drawnLabelsRects);
                }
                var getCatForeColor = function getCatForeColor() {
                    return w.config.xaxis.convertedCatToNumeric ? _this.xaxisForeColors[w.globals.minX + _i - 1] : _this.xaxisForeColors[_i];
                };
                if (label.text) {
                    w.globals.xaxisLabelsCount++;
                }
                if (w.config.xaxis.labels.show) {
                    var elText = graphics.drawText({
                        x: label.x,
                        y: _this.offY + w.config.xaxis.labels.offsetY + offsetYCorrection - (w.config.xaxis.position === 'top' ? w.globals.xAxisHeight + w.config.xaxis.axisTicks.height - 2 : 0),
                        text: label.text,
                        textAnchor: 'middle',
                        fontWeight: label.isBold ? 600 : w.config.xaxis.labels.style.fontWeight,
                        fontSize: _this.xaxisFontSize,
                        fontFamily: _this.xaxisFontFamily,
                        foreColor: Array.isArray(_this.xaxisForeColors) ? getCatForeColor() : _this.xaxisForeColors,
                        isPlainText: false,
                        opacity: undefined,
                        cssClass: 'apexcharts-xaxis-label ' + w.config.xaxis.labels.style.cssClass
                    });
                    elXaxisTexts.add(elText);
                    var elTooltipTitle = document.createElementNS(w.globals.SVGNS, 'title');
                    elTooltipTitle.textContent = Array.isArray(label.text) ? label.text.join(' ') : label.text;
                    elText.node.appendChild(elTooltipTitle);
                    if (label.text !== '') {
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
                    class: 'apexcharts-xaxis-title'
                });
                var elXAxisTitleText = graphics.drawText({
                    x: w.globals.gridWidth / 2 + w.config.xaxis.title.offsetX,
                    y: this.offY + parseFloat(this.xaxisFontSize) + w.globals.xAxisLabelsHeight + w.config.xaxis.title.offsetY,
                    text: w.config.xaxis.title.text,
                    textAnchor: 'middle',
                    fontSize: w.config.xaxis.title.style.fontSize,
                    fontFamily: w.config.xaxis.title.style.fontFamily,
                    fontWeight: w.config.xaxis.title.style.fontWeight,
                    foreColor: w.config.xaxis.title.style.color,
                    opacity: undefined,
                    cssClass: 'apexcharts-xaxis-title-text ' + w.config.xaxis.title.style.cssClass
                });
                elXaxisTitle.add(elXAxisTitleText);
                elXaxis.add(elXaxisTitle);
            }
            if (w.config.xaxis.axisBorder.show) {
                var offX = w.globals.barPadForNumericAxis;
                var elHorzLine = graphics.drawLine(w.globals.padHorizontal + w.config.xaxis.axisBorder.offsetX - offX, this.offY, this.xaxisBorderWidth + offX, this.offY, w.config.xaxis.axisBorder.color, 0, this.xaxisBorderHeight);
                elXaxis.add(elHorzLine);
            }
            var _labels = document.querySelectorAll('.apexcharts-xaxis-label');
            for (var i = 0; i < _labels.length; i++) {
                _labels[i].addEventListener('click', (e) => {
                    var parent = e.target.parentNode;
                    var text = parent.getAttribute('value');
                    var names = Object.assign(text.split('_'));
                    Data.DataStorage.manipulateChartData(names, Data.Flexmonster.drillDownCell, Data.Flexmonster.expandCell, "rows");
                    // Data.Flexmonster.expandCell('rows', names);
                    var index = Data.Chart.w.config.xaxis.categories.indexOf(text);
                    var curr_button = document.getElementById(index + '_button');
                    // curr_button.disabled = false;
                });
            }
            return elXaxis;
        }
        static close(id) {
            var index = id.split('_')[0];
            Data.DataStorage.manipulateChartData(Data.Chart.w.config.xaxis.categories[index].split('_'), Data.Flexmonster.drillUpCell, Data.Flexmonster.collapseCell, "rows");
            document.getElementById(id).disabled = true;
        }
    }
    pivotcharts.PivotXAxis = PivotXAxis;
    class PivotAxis extends apexcharts.Axes {
        drawAxis(type, xyRatios = 0) {
            var gl = this.w.globals;
            var cnf = this.w.config;
            let xAxis = new PivotXAxis(this.ctx);
            var yAxis = new apexcharts.YAxis(this.ctx);
            if (gl.axisCharts && type !== 'radar') {
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
            super.parseDataNonAxisCharts(ser);
            var gl = this.w.globals;
            gl.full_name = Object.assign({}, gl.seriesNames);
            gl.series_levels = 0;
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
                this.parseDataNonAxisCharts(ser[i].data);
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
            return Object.assign(Object.assign({}, w.config.series[i]), { name: s.name ? s.name : ser && ser.name, color: s.color ? s.color : ser && ser.color, type: s.type ? s.type : ser && ser.type, data: s.data ? s.data : ser && ser.data, full_name: s.full_name ? s.full_name : ser && ser.full_name, level: s.level != undefined ? s.level : ser && ser.level });
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
            let len = length == undefined || length == -2 ? w.globals.series.length : length;
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
            //   if (colorSeries.length < len) {
            //     let diff = len - colorSeries.length;
            //     for (let i = 0; i < diff; i++) {
            //       colorSeries.push(colorSeries[i]);
            //     }
            //   }
            var cl = JSON.parse(JSON.stringify(colorSeries));
            //   var cl_sr = colorSeries;
            if (cl.length < len) {
                var new_colors = [];
                if (length == undefined) {
                    for (var i = 0; i < len; i++) {
                        if (w.globals.series_levels[i] == 0) {
                            new_colors.push(cl.shift());
                        }
                        else {
                            new_colors.push(utils.shadeColor(0.15, new_colors[i - 1]));
                        }
                    }
                    // console.log(new_colors);
                    //   colorSeries = [...new_colors];
                    //   colorSeries = JSON.parse(JSON.stringify(new_colors));
                    colorSeries.splice(0, colorSeries.length);
                    new_colors.forEach(c => {
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
            this.pushExtraColors(w.globals.colors, undefined);
            const colorTypes = ["fill", "stroke"];
            colorTypes.forEach((c) => {
                if (w.config[c].colors === undefined) {
                    w.globals[c].colors = this.isColorFn
                        ? w.config.colors
                        : defaultColors;
                }
                else {
                    w.globals[c].colors = w.config[c].colors.slice();
                }
                this.pushExtraColors(w.globals[c].colors, undefined);
            });
            if (w.config.dataLabels.style.colors === undefined) {
                w.globals.dataLabels.style.colors = defaultColors;
            }
            else {
                w.globals.dataLabels.style.colors =
                    w.config.dataLabels.style.colors.slice();
            }
            this.pushExtraColors(w.globals.dataLabels.style.colors, 50);
            if (w.config.plotOptions.radar.polygons.fill.colors === undefined) {
                w.globals.radarPolygons.fill.colors = [
                    w.config.theme.mode === "dark" ? "#424242" : "none",
                ];
            }
            else {
                w.globals.radarPolygons.fill.colors =
                    w.config.plotOptions.radar.polygons.fill.colors.slice();
            }
            this.pushExtraColors(w.globals.radarPolygons.fill.colors, 20);
            // The point colors
            if (w.config.markers.colors === undefined) {
                w.globals.markers.colors = defaultColors;
            }
            else {
                w.globals.markers.colors = w.config.markers.colors.slice();
            }
            this.pushExtraColors(w.globals.markers.colors, -2);
            // w.globals.markers.colors = w.globals.colors;
        }
    }
    pivotcharts.PivotTheme = PivotTheme;
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
            super(el, config);
            var initCtx = new pivotcharts.PivotInitCtxVariables(this);
            initCtx.initModules();
            Data.Chart = this;
            Data.BasicSeriesNames = config.series.map(x => x.full_name);
        }
        create(ser, opts) {
            var initCtx = new pivotcharts.PivotInitCtxVariables(this);
            initCtx.initModules();
            var res = super.create(ser, opts);
            let gl = this.w.globals;
            if (!gl.axisCharts && ser.length > 1 && !this.ctx.rowsSelector.isDrawn) {
                this.ctx.rowsSelector.draw(ser.map(x => x.name));
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
    }
    pivotcharts.PivotChart = PivotChart;
})(pivotcharts || (pivotcharts = {}));
//# sourceMappingURL=PivotChart.js.map