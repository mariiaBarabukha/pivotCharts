namespace pivotcharts {
  export class PivotChart extends ApexCharts {
    constructor(el: any, config: any) {
      Data.ChartName = el.id;
      super(el, config);
      var initCtx = new PivotInitCtxVariables(this);
     
      initCtx.initModules();
      Data.Chart = this;
      Data.BasicSeriesNames = config.series.map(x => x.full_name);

      Data.ChartHeight =this.w.config.chart.height;
    }

    create(ser, opts) {
      if(Data.Model.dataStorage.stateOfUpdate == 0){
        this.w.config.yaxis.max = Math.max(...ser.map(x=>x.data).flat(2));
      }
      var initCtx = new PivotInitCtxVariables(this);
      initCtx.initModules();
      var res = super.create(ser, opts);
      let gl = this.w.globals
      if(!gl.axisCharts && ser.length > 1 && !this.ctx.rowsSelector.isDrawn){
        this.ctx.rowsSelector.draw(ser.map(x => x.name));
      }
      let w = this.w
      if (
        w.config.chart.zoom.enabled ||
        (w.config.chart.selection && w.config.chart.selection.enabled) ||
        (w.config.chart.pan && w.config.chart.pan.enabled)
      ){
        if(Data.Model.scroll == undefined){
          Data.Model.scroll =  new pivotcharts.Scroll(this.ctx);
        }      
        Data.Model.scroll.create();
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
  }
}
