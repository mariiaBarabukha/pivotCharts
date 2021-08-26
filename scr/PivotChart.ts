namespace pivotcharts{
    export class PivotChart extends ApexCharts{

        constructor(el:any, config:any){
           
            super(el, config);
            var initCtx = new PivotInitCtxVariables(this);
            initCtx.initModules();
            console.log("CHART");
            Data.Chart = this;
           
            
        }

        create(ser, opts){
            var initCtx = new PivotInitCtxVariables(this);
            initCtx.initModules();
            
            return super.create(ser, opts);
        }

        mount(graphData = null){
          
          var me = this;

          var graphData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
          var me = this;
          var w = me.w;
          return new Promise(function (resolve, reject) {
            // no data to display
            if (me.el === null) {
              return reject(new Error('Not enough data to display or target element not found'));
            } else if (graphData === null || w.globals.allSeriesCollapsed) {
              me.series.handleNoData();
            }

            if (w.config.chart.type !== 'treemap') {
              me.axes.drawAxis(w.config.chart.type, graphData.xyRatios);
            }

            me.grid = new PivotGrid(me);
            var elgrid = me.grid.drawGrid();
            me.annotations = new apexcharts.Annotations(me);
            me.annotations.drawImageAnnos();
            me.annotations.drawTextAnnos();

            if (w.config.grid.position === 'back' && elgrid) {
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

            if (w.config.annotations.position === 'back') {
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

            if (w.config.grid.position === 'front' && elgrid) {
              w.globals.dom.elGraphical.add(elgrid.el);
            }

            if (w.config.xaxis.crosshairs.position === 'front') {
              me.crosshairs.drawXCrosshairs();
            }

            if (w.config.yaxis[0].crosshairs.position === 'front') {
              me.crosshairs.drawYCrosshairs();
            }

            if (w.config.annotations.position === 'front') {
              w.globals.dom.Paper.add(w.globals.dom.elAnnotations);
              me.annotations.drawAxesAnnotations();
            }

            if (!w.globals.noData) {
              // draw tooltips at the end
              if (w.config.tooltip.enabled && !w.globals.noData) {
                me.w.globals.tooltip.drawTooltip(graphData.xyRatios);
              }

              if (w.globals.axisCharts && (w.globals.isXNumeric || w.config.xaxis.convertedCatToNumeric || w.globals.isTimelineBar)) {
                if (w.config.chart.zoom.enabled || w.config.chart.selection && w.config.chart.selection.enabled || w.config.chart.pan && w.config.chart.pan.enabled) {
                  me.zoomPanSelection.init({
                    xyRatios: graphData.xyRatios
                  });
                }
              } else {
                var tools = w.config.chart.toolbar.tools;
                var toolsArr = ['zoom', 'zoomin', 'zoomout', 'selection', 'pan', 'reset'];
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

    export class PivotHelper extends apexcharts.LegendHelpers{
        //visibleDataSets = [];
        toggleDataSeries(seriesCnt, isHidden) {
            const w = this.w
            if (w.globals.axisCharts || w.config.chart.type === 'radialBar') {
              w.globals.resized = true // we don't want initial animations again
        
              let seriesEl = null
        
              let realIndex = null
        
              // yes, make it null. 1 series will rise at a time
              w.globals.risingSeries = []
              var _obj = this._realIndex(seriesCnt);
              seriesEl = _obj.seriesEl;
              realIndex = this._realIndex;
              
        
              if(Data.visibleDataSets.length === 0){
                w.config.series.forEach(data => {
                  Data.visibleDataSets.push(0);
                });
              }

              var name = seriesEl.getAttribute("full_name");
              var names = name.split('_');
              // var globalIndex = names.indexOf(name);
              Data.seriesLenght = w.config.series.length;
              if (isHidden) {
                Data.DataStorage.manipulateChartData(names,  Data.Flexmonster.drillUpCell, Data.Flexmonster.collapseCell, "columns");
                // Data.Flexmonster.collapseCell("columns", names);  
              } else {              
                Data.DataStorage.manipulateChartData(names,  Data.Flexmonster.drillDownCell, Data.Flexmonster.expandCell, "columns");
               
                // realIndex = this._realIndex(seriesCnt).realIndex;
              }
            } else {
              // for non-axis charts i.e pie / donuts
              let seriesEl = w.globals.dom.Paper.select(
                ` .apexcharts-series[rel='${seriesCnt + 1}'] path`
              )
        
              const type = w.config.chart.type
              if (type === 'pie' || type === 'polarArea' || type === 'donut') {
                let dataLabels = w.config.plotOptions.pie.donut.labels
        
                const graphics = new PivotGraphics(this.lgCtx.ctx)
                graphics.pathMouseDown(seriesEl.members[0], null)
                this.lgCtx.ctx.pie.printDataLabelsInner(
                  seriesEl.members[0].node,
                  dataLabels
                )
              }
        
              
              seriesEl.fire('click')
            }
          
        }

        

        _realIndex(seriesCnt){
          var seriesEl = null;
          const w = this.w
          var realIndex = null;
          if (w.globals.axisCharts) {
            seriesEl = w.globals.dom.baseEl.querySelector(
              `.apexcharts-series[data\\:realIndex='${seriesCnt}']`
            )
            realIndex = parseInt(seriesEl.getAttribute('data:realIndex'), 10)
          } else {
            seriesEl = w.globals.dom.baseEl.querySelector(
              `.apexcharts-series[rel='${seriesCnt + 1}']`
            )
            realIndex = parseInt(seriesEl.getAttribute('rel'), 10) - 1
          }
          return {seriesEl, realIndex};
        }

        riseCollapsedSeries(collapsedSeries, seriesIndices, realIndex) {
            const w = this.w
            let series = apexcharts.Utils.clone(w.config.series)
            var curr_len = series.length;
            if (collapsedSeries.length > 0) {
              for (let c = 0; c < collapsedSeries.length; c++) {
                if (collapsedSeries[c].index === realIndex) {
                  if (w.globals.axisCharts) {
                    series[realIndex].data = collapsedSeries[c].data.slice()
                    collapsedSeries.splice(c, 1)
                    seriesIndices.splice(c, 1)
                    w.globals.risingSeries.push(realIndex)
                  } else {
                    series[realIndex] = collapsedSeries[c].data
                    collapsedSeries.splice(c, 1)
                    seriesIndices.splice(c, 1)
                    w.globals.risingSeries.push(realIndex)
                  }
                }
              }
        
              collapsedSeries.forEach(element => {
                  if(element.index > realIndex){
                    element.index -= (Data.seriesLenght - curr_len);
                  }
              });
              series = this._getSeriesBasedOnCollapsedState(series)
        
              this.lgCtx.ctx.updateHelpers._updateSeries(
                series,
                w.config.chart.animations.dynamicAnimation.enabled
              )
            }
        }


        hideSeries({ seriesEl, realIndex }) {
            const w = this.w
        
            let series = apexcharts.Utils.clone(w.config.series)
        
            var curr_len = series.length;
            if (w.globals.axisCharts) {
              let shouldNotHideYAxis = false
        
              if (
                w.config.yaxis[realIndex] &&
                w.config.yaxis[realIndex].show &&
                w.config.yaxis[realIndex].showAlways
              ) {
                shouldNotHideYAxis = true
                if (w.globals.ancillaryCollapsedSeriesIndices.indexOf(realIndex) < 0) {
                  w.globals.ancillaryCollapsedSeries.push({
                    index: realIndex,
                    data: series[realIndex].data.slice(),
                    type: seriesEl.parentNode.className.baseVal.split('-')[1]
                  })
                  w.globals.ancillaryCollapsedSeriesIndices.push(realIndex)
                }
              }
        
              if (!shouldNotHideYAxis) {
                w.globals.collapsedSeries.push({
                  index: realIndex,
                  data: series[realIndex].data.slice(),
                  type: seriesEl.parentNode.className.baseVal.split('-')[1]
                })
                w.globals.collapsedSeriesIndices.push(realIndex)
        
                let removeIndexOfRising = w.globals.risingSeries.indexOf(realIndex)
        
                w.globals.risingSeries.splice(removeIndexOfRising, 1)
              }
            } else {
              w.globals.collapsedSeries.push({
                index: realIndex,
                data: series[realIndex]
              })
              w.globals.collapsedSeriesIndices.push(realIndex)
            }
        
            let seriesChildren = seriesEl.childNodes
            for (let sc = 0; sc < seriesChildren.length; sc++) {
              if (
                seriesChildren[sc].classList.contains('apexcharts-series-markers-wrap')
              ) {
                if (seriesChildren[sc].classList.contains('apexcharts-hide')) {
                  seriesChildren[sc].classList.remove('apexcharts-hide')
                } else {
                  seriesChildren[sc].classList.add('apexcharts-hide')
                }
              }
            }
        
            w.globals.allSeriesCollapsed =
              w.globals.collapsedSeries.length === w.config.series.length
        
              w.globals.collapsedSeries.forEach(element => {
                if(element.index > realIndex){
                  element.index -= (Data.seriesLenght - curr_len);
                }
            });
            series = this._getSeriesBasedOnCollapsedState(series)
            this.lgCtx.ctx.updateHelpers._updateSeries(
              series,
              w.config.chart.animations.dynamicAnimation.enabled
            )
          }
    }
   
    export class PivotLegend extends apexcharts.Legend{
        constructor(ctx:any, opts:any){
            super(ctx,opts);
            this.onLegendClick = this.onLegendClick.bind(this);
            this.legendHelpers = new PivotHelper(this);
            Data.LegendHelper = this.legendHelpers;
        }
        onLegendClick(e:Event){
            super.onLegendClick(e);
            console.log("LEGEND");
            
            //this._onClick(super., isHidden);
        }

        drawLegends() {
          let self = this
          let w = this.w
      
          let fontFamily = w.config.legend.fontFamily
      
          let legendNames = w.globals.seriesNames
          let full_names = w.globals.full_name;
          let fillcolor = w.globals.colors.slice()
      
          if (w.config.chart.type === 'heatmap') {
            const ranges = w.config.plotOptions.heatmap.colorScale.ranges
            legendNames = ranges.map((colorScale) => {
              return colorScale.name
                ? colorScale.name
                : colorScale.from + ' - ' + colorScale.to
            })
            fillcolor = ranges.map((color) => color.color)
          } else if (this.isBarsDistributed) {
            legendNames = w.globals.labels.slice()
          }
      
          if (w.config.legend.customLegendItems.length) {
            legendNames = w.config.legend.customLegendItems
          }
          let legendFormatter = w.globals.legendFormatter
      
          let isLegendInversed = w.config.legend.inverseOrder
      
          for (
            let i = isLegendInversed ? legendNames.length - 1 : 0;
            isLegendInversed ? i >= 0 : i <= legendNames.length - 1;
            isLegendInversed ? i-- : i++
          ) {
            let text = legendFormatter(legendNames[i], { seriesIndex: i, w })
      
            let collapsedSeries = false
            let ancillaryCollapsedSeries = false
            if (w.globals.collapsedSeries.length > 0) {
              for (let c = 0; c < w.globals.collapsedSeries.length; c++) {
                if (w.globals.collapsedSeries[c].index === i) {
                  collapsedSeries = true
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
                  ancillaryCollapsedSeries = true
                }
              }
            }
      
            let elMarker = document.createElement('span')
            elMarker.classList.add('apexcharts-legend-marker')
      
            let mOffsetX = w.config.legend.markers.offsetX
            let mOffsetY = w.config.legend.markers.offsetY
            let mHeight = w.config.legend.markers.height
            let mWidth = w.config.legend.markers.width
            let mBorderWidth = w.config.legend.markers.strokeWidth
            let mBorderColor = w.config.legend.markers.strokeColor
            let mBorderRadius = w.config.legend.markers.radius
      
            let mStyle = elMarker.style
      
            mStyle.background = fillcolor[i]
            mStyle.color = fillcolor[i]
            mStyle.setProperty('background', fillcolor[i], 'important')
      
            // override fill color with custom legend.markers.fillColors
            if (
              w.config.legend.markers.fillColors &&
              w.config.legend.markers.fillColors[i]
            ) {
              mStyle.background = w.config.legend.markers.fillColors[i]
            }
      
            // override with data color
            if (w.globals.seriesColors[i] !== undefined) {
              mStyle.background = w.globals.seriesColors[i]
              mStyle.color = w.globals.seriesColors[i]
            }
      
            mStyle.height = Array.isArray(mHeight)
              ? parseFloat(mHeight[i]) + 'px'
              : parseFloat(mHeight) + 'px'
            mStyle.width = Array.isArray(mWidth)
              ? parseFloat(mWidth[i]) + 'px'
              : parseFloat(mWidth) + 'px'
            mStyle.left =
              (Array.isArray(mOffsetX)
                ? parseFloat(mOffsetX[i])
                : parseFloat(mOffsetX)) + 'px'
            mStyle.top =
              (Array.isArray(mOffsetY)
                ? parseFloat(mOffsetY[i])
                : parseFloat(mOffsetY)) + 'px'
            mStyle.borderWidth = Array.isArray(mBorderWidth)
              ? mBorderWidth[i]
              : mBorderWidth
            mStyle.borderColor = Array.isArray(mBorderColor)
              ? mBorderColor[i]
              : mBorderColor
            mStyle.borderRadius = Array.isArray(mBorderRadius)
              ? parseFloat(mBorderRadius[i]) + 'px'
              : parseFloat(mBorderRadius) + 'px'
      
            if (w.config.legend.markers.customHTML) {
              if (Array.isArray(w.config.legend.markers.customHTML)) {
                if (w.config.legend.markers.customHTML[i]) {
                  elMarker.innerHTML = w.config.legend.markers.customHTML[i]()
                }
              } else {
                elMarker.innerHTML = w.config.legend.markers.customHTML()
              }
            }
      
            apexcharts.Graphics.setAttrs(elMarker, {
              rel: i + 1,
              'data:collapsed': collapsedSeries || ancillaryCollapsedSeries
            })
      
            if (collapsedSeries || ancillaryCollapsedSeries) {
              elMarker.classList.add('apexcharts-inactive-legend')
            }
      
            let elLegend = document.createElement('div')
      
            let elLegendText = document.createElement('span')
            elLegendText.classList.add('apexcharts-legend-text')
            elLegendText.innerHTML = Array.isArray(text)
              ? apexcharts.Utils.sanitizeDom(text.join(' '))
              : apexcharts.Utils.sanitizeDom(text)
      
            let textColor = w.config.legend.labels.useSeriesColors
              ? w.globals.colors[i]
              : w.config.legend.labels.colors
      
            if (!textColor) {
              textColor = w.config.chart.foreColor
            }
      
            elLegendText.style.color = textColor
      
            elLegendText.style.fontSize = parseFloat(w.config.legend.fontSize) + 'px'
            elLegendText.style.fontWeight = w.config.legend.fontWeight
            elLegendText.style.fontFamily = fontFamily || w.config.chart.fontFamily
      
            apexcharts.Graphics.setAttrs(elLegendText, {
              rel: i + 1,
              i,
              'data:default-text': encodeURIComponent(text),
              'data:collapsed': collapsedSeries || ancillaryCollapsedSeries
            })
      
            elLegend.appendChild(elMarker)
            elLegend.appendChild(elLegendText)
      
            const coreUtils = new apexcharts.CoreUtils(this.ctx)
            if (!w.config.legend.showForZeroSeries) {
              const total = coreUtils.getSeriesTotalByIndex(i)
      
              if (
                total === 0 &&
                coreUtils.seriesHaveSameValues(i) &&
                !coreUtils.isSeriesNull(i) &&
                w.globals.collapsedSeriesIndices.indexOf(i) === -1 &&
                w.globals.ancillaryCollapsedSeriesIndices.indexOf(i) === -1
              ) {
                elLegend.classList.add('apexcharts-hidden-zero-series')
              }
            }
      
            if (!w.config.legend.showForNullSeries) {
              if (
                coreUtils.isSeriesNull(i) &&
                w.globals.collapsedSeriesIndices.indexOf(i) === -1 &&
                w.globals.ancillaryCollapsedSeriesIndices.indexOf(i) === -1
              ) {
                elLegend.classList.add('apexcharts-hidden-null-series')
              }
            }
      
            w.globals.dom.elLegendWrap.appendChild(elLegend)
            w.globals.dom.elLegendWrap.classList.add(
              `apexcharts-align-${w.config.legend.horizontalAlign}`
            )
            w.globals.dom.elLegendWrap.classList.add(
              'position-' + w.config.legend.position
            )
      
            elLegend.classList.add('apexcharts-legend-series')
            elLegend.style.margin = `${w.config.legend.itemMargin.vertical}px ${w.config.legend.itemMargin.horizontal}px`
            w.globals.dom.elLegendWrap.style.width = w.config.legend.width
              ? w.config.legend.width + 'px'
              : ''
            w.globals.dom.elLegendWrap.style.height = w.config.legend.height
              ? w.config.legend.height + 'px'
              : ''
      
            apexcharts.Graphics.setAttrs(elLegend, {
              rel: i + 1,
              seriesName: apexcharts.Utils.escapeString(legendNames[i], 'x'),
              full_name: full_names[i],
              'data:collapsed': collapsedSeries || ancillaryCollapsedSeries
            })
      
            if (collapsedSeries || ancillaryCollapsedSeries) {
              elLegend.classList.add('apexcharts-inactive-legend')
            }
      
            if (!w.config.legend.onItemClick.toggleDataSeries) {
              elLegend.classList.add('apexcharts-no-click')
            }
          }
      
          w.globals.dom.elWrap.addEventListener('click', self.onLegendClick, true)
      
          if (
            w.config.legend.onItemHover.highlightDataSeries &&
            w.config.legend.customLegendItems.length === 0
          ) {
            w.globals.dom.elWrap.addEventListener(
              'mousemove',
              self.onLegendHovered,
              true
            )
            w.globals.dom.elWrap.addEventListener(
              'mouseout',
              self.onLegendHovered,
              true
            )
          }
        }
    }
    

    export class PivotInitCtxVariables extends apexcharts.InitCtxVariables{
        
        initModules(){
            super.initModules();
            this.ctx.core = new PivotCore(this.ctx.el, this.ctx);
            this.ctx.legend = new PivotLegend(this.ctx, {});
            this.ctx.axes = new PivotAxis(this.ctx);
            this.ctx.grid = new PivotGrid(this.ctx);;
            this.ctx.data = new PivotData(this.ctx);
            this.ctx.updateHelpers = new PivotUpdateHelpers(this.ctx);
        }
    }

    export class PivotCore extends apexcharts.Core{
        resizeNonAxisCharts(){
            var w = this.w;
            var gl = w.globals;
            var legendHeight = 0;
            var offY = w.config.chart.sparkline.enabled ? 1 : 15;
            offY = offY + w.config.grid.padding.bottom;
    
            if ((w.config.legend.position === 'top' || w.config.legend.position === 'bottom') && w.config.legend.show && !w.config.legend.floating) {
              legendHeight = new PivotLegend(this.ctx, {}).legendHelpers.getLegendBBox().clwh + 10;
            }
    
            var el = w.globals.dom.baseEl.querySelector('.apexcharts-radialbar, .apexcharts-pie');
            var chartInnerDimensions = w.globals.radialSize * 2.05;
    
            if (el && !w.config.chart.sparkline.enabled) {
              var elRadialRect = apexcharts.Utils.getBoundingClientRect(el);
              chartInnerDimensions = elRadialRect.bottom;
              var maxHeight = elRadialRect.bottom - elRadialRect.top;
              chartInnerDimensions = Math.max(w.globals.radialSize * 2.05, maxHeight);
            }
    
            var newHeight = chartInnerDimensions + gl.translateY + legendHeight + offY;
    
            if (gl.dom.elLegendForeign) {
              gl.dom.elLegendForeign.setAttribute('height', newHeight);
            }
    
            gl.dom.elWrap.style.height = newHeight + 'px';
            apexcharts.Graphics.setAttrs(gl.dom.Paper.node, {
              height: newHeight
            });
            gl.dom.Paper.node.parentNode.parentNode.style.minHeight = newHeight + 'px';
          
        }

        plotChartType(ser, xyRatios) {
          const w = this.w
          const cnf = w.config
          const gl = w.globals
      
          let lineSeries = {
            series: [],
            i: []
          }
          let areaSeries = {
            series: [],
            i: []
          }
          let scatterSeries = {
            series: [],
            i: []
          }
      
          let bubbleSeries = {
            series: [],
            i: []
          }
      
          let columnSeries = {
            series: [],
            i: []
          }
      
          let candlestickSeries = {
            series: [],
            i: []
          }
      
          let boxplotSeries = {
            series: [],
            i: []
          }
      
          gl.series.map((series, st) => {
            let comboCount = 0
            // if user has specified a particular type for particular series
            if (typeof ser[st].type !== 'undefined') {
              if (ser[st].type === 'column' || ser[st].type === 'bar') {
                if (gl.series.length > 1 && cnf.plotOptions.bar.horizontal) {
                  // horizontal bars not supported in mixed charts, hence show a warning
                  console.warn(
                    'Horizontal bars are not supported in a mixed/combo chart. Please turn off `plotOptions.bar.horizontal`'
                  )
                }
                columnSeries.series.push(series)
                columnSeries.i.push(st)
                comboCount++
                w.globals.columnSeries = columnSeries.series
              } else if (ser[st].type === 'area') {
                areaSeries.series.push(series)
                areaSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'line') {
                lineSeries.series.push(series)
                lineSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'scatter') {
                scatterSeries.series.push(series)
                scatterSeries.i.push(st)
              } else if (ser[st].type === 'bubble') {
                bubbleSeries.series.push(series)
                bubbleSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'candlestick') {
                candlestickSeries.series.push(series)
                candlestickSeries.i.push(st)
                comboCount++
              } else if (ser[st].type === 'boxPlot') {
                boxplotSeries.series.push(series)
                boxplotSeries.i.push(st)
                comboCount++
              } else {
                // user has specified type, but it is not valid (other than line/area/column)
                console.warn(
                  'You have specified an unrecognized chart type. Available types for this property are line/area/column/bar/scatter/bubble'
                )
              }
              if (comboCount > 1) {
                gl.comboCharts = true
              }
            } else {
              lineSeries.series.push(series)
              lineSeries.i.push(st)
            }
          })
      
          let line = new apexcharts.Line(this.ctx, xyRatios, false)
          let boxCandlestick = new apexcharts.BoxCandleStick(this.ctx, xyRatios)
          this.ctx.pie = new apexcharts.Pie(this.ctx)
          let radialBar = new apexcharts.Radial(this.ctx)
          this.ctx.rangeBar = new apexcharts.RangeBar(this.ctx, xyRatios)
          let radar = new apexcharts.Radar(this.ctx)
          let elGraph = []
      
          if (gl.comboCharts) {
            if (areaSeries.series.length > 0) {
              elGraph.push(line.draw(areaSeries.series, 'area', areaSeries.i))
            }
            if (columnSeries.series.length > 0) {
              if (w.config.chart.stacked) {
                let barStacked = new apexcharts.BarStacked(this.ctx, xyRatios)
                elGraph.push(barStacked.draw(columnSeries.series, columnSeries.i))
              } else {
                this.ctx.bar = new charts.PivotBar(this.ctx, xyRatios)
                elGraph.push(this.ctx.bar.draw(columnSeries.series, columnSeries.i))
              }
            }
            if (lineSeries.series.length > 0) {
              elGraph.push(line.draw(lineSeries.series, 'line', lineSeries.i))
            }
            if (candlestickSeries.series.length > 0) {
              elGraph.push(
                boxCandlestick.draw(candlestickSeries.series, candlestickSeries.i)
              )
            }
            if (boxplotSeries.series.length > 0) {
              elGraph.push(boxCandlestick.draw(boxplotSeries.series, boxplotSeries.i))
            }
            if (scatterSeries.series.length > 0) {
              const scatterLine = new apexcharts.Line(this.ctx, xyRatios, true)
              elGraph.push(
                scatterLine.draw(scatterSeries.series, 'scatter', scatterSeries.i)
              )
            }
            if (bubbleSeries.series.length > 0) {
              const bubbleLine = new apexcharts.Line(this.ctx, xyRatios, true)
              elGraph.push(
                bubbleLine.draw(bubbleSeries.series, 'bubble', bubbleSeries.i)
              )
            }
          } else {
            switch (cnf.chart.type) {
              case 'line':
                elGraph = line.draw(gl.series, 'line', null)
                break
              case 'area':
                elGraph = line.draw(gl.series, 'area', null)
                break
              case 'bar':
                if (cnf.chart.stacked) {
                  let barStacked = new apexcharts.BarStacked(this.ctx, xyRatios)
                  elGraph = barStacked.draw(gl.series, null)
                } else {
                  this.ctx.bar = new charts.PivotBar(this.ctx, xyRatios)
                  elGraph = this.ctx.bar.draw(gl.series)
                }
                break
              case 'candlestick':
                let candleStick = new apexcharts.BoxCandleStick(this.ctx, xyRatios)
                elGraph = candleStick.draw(gl.series, null)
                break
              case 'boxPlot':
                let boxPlot = new apexcharts.BoxCandleStick(this.ctx, xyRatios)
                elGraph = boxPlot.draw(gl.series, null)
                break
              case 'rangeBar':
                elGraph = this.ctx.rangeBar.draw(gl.series)
                break
              case 'heatmap':
                let heatmap = new apexcharts.HeatMap(this.ctx, xyRatios)
                elGraph = heatmap.draw(gl.series)
                break
              case 'treemap':
                let treemap = new apexcharts.Treemap(this.ctx, xyRatios)
                elGraph = treemap.draw(gl.series)
                break
              case 'pie':
              case 'donut':
              case 'polarArea':
                elGraph = this.ctx.pie.draw(gl.series)
                break
              case 'radialBar':
                elGraph = radialBar.draw(gl.series)
                break
              case 'radar':
                elGraph = radar.draw(gl.series)
                break
              default:
                elGraph = line.draw(gl.series, null, null)
            }
          }
      
          return elGraph
        }
    }

    export class PivotXAxis extends apexcharts.XAxis{
      drawXaxis(){
        // var graphics = new PivotGraphics(this.ctx);
        var _this = this;

        var w = this.w;
        var graphics = new PivotGraphics(this.ctx);
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
        } else {
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
          } else {
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
          var elHorzLine = graphics.drawLine(w.globals.padHorizontal + w.config.xaxis.axisBorder.offsetX - offX, this.offY, 
            this.xaxisBorderWidth + offX, this.offY, w.config.xaxis.axisBorder.color, 0, this.xaxisBorderHeight);
          elXaxis.add(elHorzLine);
        }       
        var _labels = document.querySelectorAll('.apexcharts-xaxis-label'); 
        for(var i = 0; i < _labels.length; i++){            
          	_labels[i].addEventListener('click', (e)=>{   
              var parent = (e.target as Element).parentNode as Element;
              var text = parent.getAttribute('value');         
              var names = Object.assign(text.split('_'));
              Data.DataStorage.manipulateChartData(names, Data.Flexmonster.drillDownCell, Data.Flexmonster.expandCell, "rows");
              // Data.Flexmonster.expandCell('rows', names);
              var index = Data.Chart.w.config.xaxis.categories.indexOf(text);
              var curr_button = document.getElementById(index +'_button') as HTMLButtonElement;
              // curr_button.disabled = false;
            });
        }
        return elXaxis;
      }

      static close(id: string){
        var index = id.split('_')[0];
        Data.DataStorage.manipulateChartData(Data.Chart.w.config.xaxis.categories[index].split('_'),
        Data.Flexmonster.drillUpCell, Data.Flexmonster.collapseCell, "rows");
        (document.getElementById(id) as HTMLButtonElement).disabled = true;
      }
    }

    export class PivotAxis extends apexcharts.Axes{
      drawAxis(type, xyRatios = 0){
        var gl = this.w.globals;
        var cnf = this.w.config;
        let xAxis = new PivotXAxis(this.ctx);
        var yAxis = new apexcharts.YAxis(this.ctx);

        if (gl.axisCharts && type !== 'radar') {
          let elXaxis, elYaxis
    
          if (gl.isBarHorizontal) {
            elYaxis = yAxis.drawYaxisInversed(0)
            elXaxis = xAxis.drawXaxisInversed(0)
    
            gl.dom.elGraphical.add(elXaxis)
            gl.dom.elGraphical.add(elYaxis)
          } else {
            elXaxis = xAxis.drawXaxis()
            gl.dom.elGraphical.add(elXaxis)
    
            cnf.yaxis.map((yaxe, index) => {
              if (gl.ignoreYAxisIndexes.indexOf(index) === -1) {
                elYaxis = yAxis.drawYaxis(index)
                gl.dom.Paper.add(elYaxis)
              }
            })
          }
        }
      }
    }

    export class PivotGrid extends apexcharts.Grid{
      _drawInvertedXYLines({ xCount }){
        const w = this.w;
        if (w.config.grid.xaxis.lines.show || w.config.xaxis.axisTicks.show) {
          let x1 = w.globals.padHorizontal
          let y1 = 0
          let x2
          let y2 = w.globals.gridHeight
          for (let i = 0; i < xCount + 1; i++) {
            if (w.config.grid.xaxis.lines.show) {
              this._drawGridLine({ x1, y1, x2, y2, parent: this.elgridLinesV })
            }
    
            let xAxis = new PivotXAxis(this.ctx)
            xAxis.drawXaxisTicks(x1, this.elg)
            x1 = x1 + w.globals.gridWidth / xCount + 0.3
            x2 = x1
          }
        }
    
        // draw horizontal lines
        if (w.config.grid.yaxis.lines.show) {
          let x1 = 0
          let y1 = 0
          let y2 = 0
          let x2 = w.globals.gridWidth
    
          for (let i = 0; i < w.globals.dataPoints + 1; i++) {
            this._drawGridLine({ x1, y1, x2, y2, parent: this.elgridLinesH })
    
            y1 = y1 + w.globals.gridHeight / w.globals.dataPoints
            y2 = y1
          }
        }
      }

      _drawGridLines({ i, x1, y1, x2, y2, xCount, parent }){
        
        const w = this.w

        const shouldDraw = () => {
          if (i === 0 && w.globals.skipFirstTimelinelabel) {
            return false
          }

          if (
            i === xCount - 1 &&
            w.globals.skipLastTimelinelabel &&
            !w.config.xaxis.labels.formatter
          ) {
            return false
          }
          if (w.config.chart.type === 'radar') {
            return false
          }
          return true
        }

        if (shouldDraw()) {
          if (w.config.grid.xaxis.lines.show) {
            this._drawGridLine({ x1, y1, x2, y2, parent })
          }
          let xAxis = new PivotXAxis(this.ctx);
          xAxis.drawXaxisTicks(x1, this.elg)
        }
      }
    }

    export class PivotData extends apexcharts.Data{

      constructor(ctx){
        super(ctx);
      }
      parseDataAxisCharts(ser, ctx){
        super.parseDataAxisCharts(ser, ctx);
        var gl = this.w.globals;
        gl.full_name = [];
        for (let i = 0; i < ser.length; i++) {
          if (ser[i].full_name !== undefined) {
            gl.full_name.push(ser[i].full_name)
          } else {
            gl.full_name.push('full_name-' + (i + 1))
          }
        }
      }
    }

    export class PivotUpdateHelpers extends apexcharts.UpdateHelpers{
      _extendSeries(s, i){
        const w = this.w
        const ser = w.config.series[i]

        return {
          ...w.config.series[i],
          name: s.name ? s.name : ser && ser.name,
          color: s.color ? s.color : ser && ser.color,
          type: s.type ? s.type : ser && ser.type,
          data: s.data ? s.data : ser && ser.data,
          full_name: s.full_name ? s.full_name : ser && ser.full_name,
        }
      }
    }

    export class PivotGraphics extends apexcharts.Graphics{
      drawText({
        x,
        y,
        text,
        textAnchor,
        fontSize,
        fontFamily,
        fontWeight,
        foreColor,
        opacity,
        cssClass = '',
        isPlainText = true
      }){
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
        for(var i = Data.Categories.length - 1; i >= 0; i--){
          if(Data.Categories[i].includes(text)){
            result.attr({'value':Data.Categories[i]});
            break;
          }
        }
        return result;
      }
    }

    // export class PivotDimensions extends apexcharts.Dimensions{
    //   constructor(ctx){
    //     super(ctx);
    //   }
    // }
}
