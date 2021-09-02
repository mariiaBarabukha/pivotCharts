namespace charts {
  export class PivotRadar extends apexcharts.Radar {
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
          seriesName: apexcharts.Utils.escapeString(
            w.globals.seriesNames[i],
            "x"
          ),
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

        dataPointsPos = this.getDataPointsPos(
          this.dataRadius[i],
          this.angleArr[i],
          this.dataPointsLen
        );
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
          let renderedLinePath = this.graphics.renderPaths({
            ...defaultRenderedPathOptions,
            pathFrom: pathFrom === null ? paths.linePathsFrom[p] : pathFrom,
            pathTo: paths.linePathsTo[p],
            strokeWidth: Array.isArray(this.strokeWidth)
              ? this.strokeWidth[i]
              : this.strokeWidth,
            fill: "none",
            drawShadow: false,
          });

          elSeries.add(renderedLinePath);

          let pathFill = fill.fillPath({
            seriesNumber: i,
          });

          let renderedAreaPath = this.graphics.renderPaths({
            ...defaultRenderedPathOptions,
            pathFrom: pathFrom === null ? paths.areaPathsFrom[p] : pathFrom,
            pathTo: paths.areaPathsTo[p],
            strokeWidth: 0,
            fill: pathFill,
            drawShadow: false,
          });

          if (w.config.chart.dropShadow.enabled) {
            const filters = new apexcharts.Filters(this.ctx);

            const shadow = w.config.chart.dropShadow;
            filters.dropShadow(
              renderedAreaPath,
              Object.assign({}, shadow, { noUserSpaceOnUse: true }),
              i
            );
          }

          elSeries.add(renderedAreaPath);
        }

        s.forEach((sj, j) => {
          let markers = new apexcharts.Markers(this.ctx);

          let opts = markers.getMarkerConfig("apexcharts-marker", i, j);

          let point = this.graphics.drawMarker(
            dataPointsPos[j].x,
            dataPointsPos[j].y,
            opts
          );

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
              dataLabelsConfig: {
                ...dataLabelsConfig,
              },
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
}
