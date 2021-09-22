namespace pivotcharts {
  export class PivotTheme extends apexcharts.Theme {
    pushExtraColors(colorSeries, length, distributed = null) {
      let w = this.w;
      let utils = new apexcharts.Utils();

      let len =
        length == undefined || length == -2 ? w.globals.series.length : length;

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
            if ((w.globals.series_levels[i] || w.globals.series_levels) == 0) {
              new_colors.push(cl.shift());
            } else {
              new_colors.push(utils.shadeColor(0.15, new_colors[i - 1]));
            }
          }
          console.log(new_colors);
        //   colorSeries = [...new_colors];
        //   colorSeries = JSON.parse(JSON.stringify(new_colors));
        colorSeries.splice(0, colorSeries.length);

        new_colors.forEach(c => {
            colorSeries.push(c);
        });
        } else {
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

      w.globals.dom.elWrap.classList.add(
        `apexcharts-theme-${w.config.theme.mode}`
      );

      if (w.config.colors === undefined) {
        w.globals.colors = this.predefined();
      } else {
        w.globals.colors = w.config.colors;

        // if user provided a function in colors, we need to eval here
        if (
          Array.isArray(w.config.colors) &&
          w.config.colors.length > 0 &&
          typeof w.config.colors[0] === "function"
        ) {
          w.globals.colors = w.config.series.map((s, i) => {
            let c = w.config.colors[i];
            if (!c) c = w.config.colors[0];
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
          } else {
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
        } else {
          w.globals[c].colors = w.config[c].colors.slice();
        }
        this.pushExtraColors(w.globals[c].colors, undefined);
      });

      if (w.config.dataLabels.style.colors === undefined) {
        w.globals.dataLabels.style.colors = defaultColors;
      } else {
        w.globals.dataLabels.style.colors =
          w.config.dataLabels.style.colors.slice();
      }
      this.pushExtraColors(w.globals.dataLabels.style.colors, 50);

      if (w.config.plotOptions.radar.polygons.fill.colors === undefined) {
        w.globals.radarPolygons.fill.colors = [
          w.config.theme.mode === "dark" ? "#424242" : "none",
        ];
      } else {
        w.globals.radarPolygons.fill.colors =
          w.config.plotOptions.radar.polygons.fill.colors.slice();
      }
      this.pushExtraColors(w.globals.radarPolygons.fill.colors, 20);

      // The point colors
      if (w.config.markers.colors === undefined) {
        w.globals.markers.colors = defaultColors;
      } else {
        w.globals.markers.colors = w.config.markers.colors.slice();
      }
      this.pushExtraColors(w.globals.markers.colors, -2);
      // w.globals.markers.colors = w.globals.colors;
    }
    // predefined() {
    //   return super
    //     .predefined()
    //     .slice(
    //       0,
    //       this.colors.length >= Data.BasicSeriesNames.length
    //         ? Data.BasicSeriesNames.length
    //         : this.colors.length
    //     );
    // }
  }
}
