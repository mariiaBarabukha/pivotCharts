namespace pivotcharts {
  export class PivotHelper extends apexcharts.LegendHelpers {
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
      } else {
        // for non-axis charts i.e pie / donuts
        seriesEl = w.globals.dom.Paper.select(
          ` .apexcharts-series[rel='${seriesCnt + 1}'] path`
        );

        const type = w.config.chart.type;
        if (type === "pie" || type === "polarArea" || type === "donut") {
          let dataLabels = w.config.plotOptions.pie.donut.labels;

          const graphics = new PivotGraphics(this.lgCtx.ctx);
          graphics.pathMouseDown(seriesEl.members[0], null);
          this.lgCtx.ctx.pie.printDataLabelsInner(
            seriesEl.members[0].node,
            dataLabels
          );
        }

        seriesEl.fire("click");
        seriesEl = seriesEl.members[0].node;
      }
      var name = seriesEl.getAttribute("full_name");
      var names = name.split("_");
      Data.seriesLenght = w.config.series.length;
      if (isHidden) {
        Data.DataStorage.manipulateChartData(
          names,
          Data.Flexmonster.drillUpCell,
          Data.Flexmonster.collapseCell,
          "columns"
        );
        // Data.Flexmonster.collapseCell("columns", names);
      } else {
        Data.DataStorage.manipulateChartData(
          names,
          Data.Flexmonster.drillDownCell,
          Data.Flexmonster.expandCell,
          "columns"
        );

        // realIndex = this._realIndex(seriesCnt).realIndex;
      }
    }

    _realIndex(seriesCnt) {
      var seriesEl = null;
      const w = this.w;
      var realIndex = null;
      if (w.globals.axisCharts) {
        seriesEl = w.globals.dom.baseEl.querySelector(
          `.apexcharts-series[data\\:realIndex='${seriesCnt}']`
        );
        realIndex = parseInt(seriesEl.getAttribute("data:realIndex"), 10);
      } else {
        seriesEl = w.globals.dom.baseEl.querySelector(
          `.apexcharts-series[rel='${seriesCnt + 1}']`
        );
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
            } else {
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

        this.lgCtx.ctx.updateHelpers._updateSeries(
          series,
          w.config.chart.animations.dynamicAnimation.enabled
        );
      }
    }

    hideSeries({ seriesEl, realIndex }) {
      const w = this.w;

      let series = apexcharts.Utils.clone(w.config.series);

      var curr_len = series.length;
      if (w.globals.axisCharts) {
        let shouldNotHideYAxis = false;

        if (
          w.config.yaxis[realIndex] &&
          w.config.yaxis[realIndex].show &&
          w.config.yaxis[realIndex].showAlways
        ) {
          shouldNotHideYAxis = true;
          if (
            w.globals.ancillaryCollapsedSeriesIndices.indexOf(realIndex) < 0
          ) {
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
      } else {
        w.globals.collapsedSeries.push({
          index: realIndex,
          data: series[realIndex],
        });
        w.globals.collapsedSeriesIndices.push(realIndex);
      }

      let seriesChildren = seriesEl.childNodes;
      for (let sc = 0; sc < seriesChildren.length; sc++) {
        if (
          seriesChildren[sc].classList.contains(
            "apexcharts-series-markers-wrap"
          )
        ) {
          if (seriesChildren[sc].classList.contains("apexcharts-hide")) {
            seriesChildren[sc].classList.remove("apexcharts-hide");
          } else {
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
      this.lgCtx.ctx.updateHelpers._updateSeries(
        series,
        w.config.chart.animations.dynamicAnimation.enabled
      );
    }
  }

  export class PivotLegend extends apexcharts.Legend {
    constructor(ctx: any, opts: any) {
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
      } else if (this.isBarsDistributed) {
        legendNames = w.globals.labels.slice();
      }

      if (w.config.legend.customLegendItems.length) {
        legendNames = w.config.legend.customLegendItems;
      }
      let legendFormatter = w.globals.legendFormatter;

      let isLegendInversed = w.config.legend.inverseOrder;

      for (
        let i = isLegendInversed ? legendNames.length - 1 : 0;
        isLegendInversed ? i >= 0 : i <= legendNames.length - 1;
        isLegendInversed ? i-- : i++
      ) {
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
          for (
            let c = 0;
            c < w.globals.ancillaryCollapsedSeriesIndices.length;
            c++
          ) {
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
        if (
          w.config.legend.markers.fillColors &&
          w.config.legend.markers.fillColors[i]
        ) {
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
          } else {
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

          if (
            total === 0 &&
            coreUtils.seriesHaveSameValues(i) &&
            !coreUtils.isSeriesNull(i) &&
            w.globals.collapsedSeriesIndices.indexOf(i) === -1 &&
            w.globals.ancillaryCollapsedSeriesIndices.indexOf(i) === -1
          ) {
            elLegend.classList.add("apexcharts-hidden-zero-series");
          }
        }

        if (!w.config.legend.showForNullSeries) {
          if (
            coreUtils.isSeriesNull(i) &&
            w.globals.collapsedSeriesIndices.indexOf(i) === -1 &&
            w.globals.ancillaryCollapsedSeriesIndices.indexOf(i) === -1
          ) {
            elLegend.classList.add("apexcharts-hidden-null-series");
          }
        }

        w.globals.dom.elLegendWrap.appendChild(elLegend);
        w.globals.dom.elLegendWrap.classList.add(
          `apexcharts-align-${w.config.legend.horizontalAlign}`
        );
        w.globals.dom.elLegendWrap.classList.add(
          "position-" + w.config.legend.position
        );

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

      if (
        w.config.legend.onItemHover.highlightDataSeries &&
        w.config.legend.customLegendItems.length === 0
      ) {
        w.globals.dom.elWrap.addEventListener(
          "mousemove",
          self.onLegendHovered,
          true
        );
        w.globals.dom.elWrap.addEventListener(
          "mouseout",
          self.onLegendHovered,
          true
        );
      }
    }
  }
}
