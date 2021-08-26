namespace charts{
    export class PivotBar extends apexcharts.Bar{

        constructor(ctx, xyRatios){
            super(ctx, xyRatios);
        }
        
        draw(series, seriesIndex) {
            let w = this.w
            let graphics = new apexcharts.Graphics(this.ctx)
        
            let full_names = w.globals.full_name;
            const coreUtils = new apexcharts.CoreUtils(this.ctx)
            series = coreUtils.getLogSeries(series)
            this.series = series
            this.yRatio = coreUtils.getLogYRatios(this.yRatio)
        
            this.barHelpers.initVariables(series)
        
            let ret = graphics.group({
              class: 'apexcharts-bar-series apexcharts-plot-series'
            })
        
            if (w.config.dataLabels.enabled) {
              if (this.totalItems > this.barOptions.dataLabels.maxItems) {
                console.warn(
                  'WARNING: DataLabels are enabled but there are too many to display. This may cause performance issue when rendering.'
                )
              }
            }
        
            for (let i = 0, bc = 0; i < series.length; i++, bc++) {
              let x,
                y,
                xDivision, // xDivision is the GRIDWIDTH divided by number of datapoints (columns)
                yDivision, // yDivision is the GRIDHEIGHT divided by number of datapoints (bars)
                zeroH, // zeroH is the baseline where 0 meets y axis
                zeroW // zeroW is the baseline where 0 meets x axis
        
              let yArrj = [] // hold y values of current iterating series
              let xArrj = [] // hold x values of current iterating series
        
              let realIndex = w.globals.comboCharts ? seriesIndex[i] : i
        
              // el to which series will be drawn
              let elSeries = graphics.group({
                class: `apexcharts-series`,
                rel: i + 1,
                seriesName: apexcharts.Utils.escapeString(w.globals.seriesNames[realIndex], 'x'),
                full_name: full_names[i],
                'data:realIndex': realIndex
              })
        
              this.ctx.series.addCollapsedClassToSeries(elSeries, realIndex)
        
              if (series[i].length > 0) {
                this.visibleI = this.visibleI + 1
              }
        
              let barHeight = 0
              let barWidth = 0
        
              if (this.yRatio.length > 1) {
                this.yaxisIndex = realIndex
              }
        
              this.isReversed =
                w.config.yaxis[this.yaxisIndex] &&
                w.config.yaxis[this.yaxisIndex].reversed
        
              let initPositions = this.barHelpers.initialPositions()
        
              y = initPositions.y
              barHeight = initPositions.barHeight
              yDivision = initPositions.yDivision
              zeroW = initPositions.zeroW
        
              x = initPositions.x
              barWidth = initPositions.barWidth
              xDivision = initPositions.xDivision
              zeroH = initPositions.zeroH
        
              if (!this.horizontal) {
                xArrj.push(x + barWidth / 2)
              }
        
              // eldatalabels
              let elDataLabelsWrap = graphics.group({
                class: 'apexcharts-datalabels',
                'data:realIndex': realIndex
              })
        
              let elGoalsMarkers = graphics.group({
                class: 'apexcharts-bar-goals-markers',
                style: `pointer-events: none`
              })
        
              for (let j = 0; j < w.globals.dataPoints; j++) {
                const strokeWidth = this.barHelpers.getStrokeWidth(i, j, realIndex)
        
                let paths = null
                const pathsParams = {
                  indexes: {
                    i,
                    j,
                    realIndex,
                    bc
                  },
                  x,
                  y,
                  strokeWidth,
                  elSeries
                }
                if (this.isHorizontal) {
                  paths = this.drawBarPaths({
                    ...pathsParams,
                    barHeight,
                    zeroW,
                    yDivision
                  })
                  barWidth = this.series[i][j] / this.invertedYRatio
                } else {
                  paths = this.drawColumnPaths({
                    ...pathsParams,
                    xDivision,
                    barWidth,
                    zeroH
                  })
                  barHeight = this.series[i][j] / this.yRatio[this.yaxisIndex]
                }
        
                const barGoalLine = this.barHelpers.drawGoalLine({
                  barXPosition: paths.barXPosition,
                  barYPosition: paths.barYPosition,
                  goalX: paths.goalX,
                  goalY: paths.goalY,
                  barHeight,
                  barWidth
                })
        
                if (barGoalLine) {
                  elGoalsMarkers.add(barGoalLine)
                }
        
                y = paths.y
                x = paths.x
        
                // push current X
                if (j > 0) {
                  xArrj.push(x + barWidth / 2)
                }
        
                yArrj.push(y)
        
                let pathFill = this.barHelpers.getPathFillColor(series, i, j, realIndex)
        
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
                  type: 'bar'
                })
              }
        
              // push all x val arrays into main xArr
              w.globals.seriesXvalues[realIndex] = xArrj
              w.globals.seriesYvalues[realIndex] = yArrj
        
              ret.add(elSeries)
            }
        
            return ret
          }
        
    }
}