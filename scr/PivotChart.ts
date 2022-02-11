namespace pivotcharts {
  export class PivotChart extends ApexCharts {
    navPanel;
    constructor(el: any, config: any) {
      // if (config.title == null) {
      //   config.title = { text: "Chart", align: "left" };
      //   // config.title =
      // }

      super(el, config);
      var initCtx = new PivotInitCtxVariables(this);

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
    }

    updateOptions(
      options,
      redraw = false,
      animate = true,
      updateSyncedCharts = true,
      overwriteInitialConfig = true
    ) {
      const w = this.w;
      let path = document.querySelector("#path");
      if (path != null && Data.xaxisFilter == '') {
        path.innerHTML = "";
      }

      let bp = document.querySelector("#buttons_panel");
      if (bp != null && Data.xaxisFilter == '') {
        bp.innerHTML = "";
      }

      if (Data.NavPanel != null && Data.xaxisFilter == "") {
        Data.NavPanel.toRoot();
      }
      if (Data.chartType != 'pie' && options.series != null && Data.Model.dataStorage.stateOfUpdate != 1) {
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
        } else {
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
      return this.updateHelpers._updateOptions(
        options,
        redraw,
        animate,
        updateSyncedCharts,
        overwriteInitialConfig
      );
    }

    create(ser, opts) {
      if (Data.Model.dataStorage.stateOfUpdate == 0) {
        this.w.config.yaxis.max = Math.max(...ser.map((x) => x.data).flat(2));
      }
      var initCtx = new PivotInitCtxVariables(this);
      initCtx.initModules();
      var res = super.create(ser, opts);
      let gl = this.w.globals;
      if (!gl.axisCharts && ser.length > 1 && !this.ctx.rowsSelector.isDrawn) {
        this.ctx.rowsSelector.draw(ser.map((x) => x.name));
      }
      let w = this.w;
      if (
        w.config.chart.zoom.enabled ||
        (w.config.chart.selection && w.config.chart.selection.enabled) ||
        (w.config.chart.pan && w.config.chart.pan.enabled)
      ) {
        if (Data.Model.scroll == undefined && Data.chartType != 'pie' ) {
          Data.Model.scroll = new pivotcharts.Scroll(this.ctx);
        }
        if(Data.chartType != 'pie'){
          Data.Model.scroll.create();
        }
        
      }

      if (Data.NavPanel == null) {
        let navPanel = new pivotcharts.NavigationPanel(this.ctx);
        navPanel.create();
        Data.NavPanel = navPanel;
        let el = document.getElementById("nav_panel");

        if (document.getElementById("buttons_panel") == null) {
          el.innerHTML += "<div id='buttons_panel'></div>";
          // document.createElement('div');
          // bp.id = 'buttons_panel';
        }
      }

      return res;
    }

    mount(graphData = null) {
      var me = this;

      var graphData =
        arguments.length > 0 && arguments[0] !== undefined
          ? arguments[0]
          : null;
      var me = this;
      var w = me.w;
      return new Promise(function (resolve, reject) {
        // no data to display
        if (me.el === null) {
          return reject(
            new Error("Not enough data to display or target element not found")
          );
        } else if (graphData === null || w.globals.allSeriesCollapsed) {
          me.series.handleNoData();
        }

        if (w.config.chart.type !== "treemap") {
          me.axes.drawAxis(w.config.chart.type, graphData.xyRatios);
        }

        me.grid = new PivotGrid(me);
        var elgrid = me.grid.drawGrid();
        me.annotations = new apexcharts.Annotations(me);
        me.annotations.drawImageAnnos();
        me.annotations.drawTextAnnos();

        if (w.config.grid.position === "back" && elgrid) {
          w.globals.dom.elGraphical.add(elgrid.el);
        }

        var xAxis = new PivotXAxis(me.ctx);
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
        } else {
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

          if (
            w.globals.axisCharts &&
            (w.globals.isXNumeric ||
              w.config.xaxis.convertedCatToNumeric ||
              w.globals.isTimelineBar)
          ) {
            if (
              w.config.chart.zoom.enabled ||
              (w.config.chart.selection && w.config.chart.selection.enabled) ||
              (w.config.chart.pan && w.config.chart.pan.enabled)
            ) {
              me.zoomPanSelection.init({
                xyRatios: graphData.xyRatios,
              });
            }
          } else {
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

    update(options: any) {
      return new Promise((resolve, reject) => {
        new PivotDestroy(this.ctx).clear({ isUpdating: true });

        const graphData = this.create(this.w.config.series, options);
        if (!graphData) return resolve(this);
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
}
