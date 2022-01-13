namespace pivotcharts {
  export class PivotXAxis extends apexcharts.XAxis {


    xAxisLabelCorrections() {
      let w = this.w;

      let graphics = new apexcharts.Graphics(this.ctx);

      let xAxis = w.globals.dom.baseEl.querySelector(
        ".apexcharts-xaxis-texts-g"
      );

      let xAxisTexts = w.globals.dom.baseEl.querySelectorAll(
        ".apexcharts-xaxis-texts-g text"
      );
      let yAxisTextsInversed = w.globals.dom.baseEl.querySelectorAll(
        ".apexcharts-yaxis-inversed text"
      );
      let xAxisTextsInversed = w.globals.dom.baseEl.querySelectorAll(
        ".apexcharts-xaxis-inversed-texts-g text tspan"
      );

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
      } else {
        let width = w.globals.gridWidth / (w.globals.labels.length + 1);

        for (let xat = 0; xat < xAxisTexts.length; xat++) {
          let tSpan = xAxisTexts[xat].childNodes;

          if (
            w.config.xaxis.labels.trim &&
            w.config.xaxis.type !== "datetime"
          ) {
            Array.prototype.forEach.call(tSpan, (ts) => {
              graphics.placeTextWithEllipsis(ts, ts.textContent, width);
            });
          }
        }
      }

      if (yAxisTextsInversed.length > 0) {
        // truncate rotated y axis in bar chart (x axis)
        let firstLabelPosX =
          yAxisTextsInversed[yAxisTextsInversed.length - 1].getBBox();
        let lastLabelPosX = yAxisTextsInversed[0].getBBox();

        if (firstLabelPosX.x < -20) {
          yAxisTextsInversed[
            yAxisTextsInversed.length - 1
          ].parentNode.removeChild(
            yAxisTextsInversed[yAxisTextsInversed.length - 1]
          );
        }

        if (
          lastLabelPosX.x + lastLabelPosX.width > w.globals.gridWidth &&
          !w.globals.isBarHorizontal
        ) {
          yAxisTextsInversed[0].parentNode.removeChild(yAxisTextsInversed[0]);
        }

        // truncate rotated x axis in bar chart (y axis)
        for (let xat = 0; xat < xAxisTextsInversed.length; xat++) {
          graphics.placeTextWithEllipsis(
            xAxisTextsInversed[xat],
            xAxisTextsInversed[xat].textContent,
            w.config.yaxis[0].labels.maxWidth -
              parseFloat(w.config.yaxis[0].title.style.fontSize) * 2 -
              20
          );
        }
      }
    }

    
    


    drawXaxis() {
      let aa = document.getElementsByClassName("apexcharts-xaxis");

      // var graphics = new PivotGraphics(this.ctx);
      var _this = this;

      var w = this.w;
      var graphics = new PivotGraphics(this.ctx);
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
      } else {
        colWidth = w.globals.gridWidth / labels.length;
        xPos = xPos + colWidth + w.config.xaxis.labels.offsetX;
      }

      var _loop = function _loop(_i) {
        var x = xPos - colWidth / 2 + w.config.xaxis.labels.offsetX;

        if (
          _i === 0 &&
          labelsLen === 1 &&
          colWidth / 2 === xPos &&
          w.globals.dataPoints === 1
        ) {
          // single datapoint
          x = w.globals.gridWidth / 2;
        }

        var label = _this.axesUtils.getLabel(
          labels,
          w.globals.timescaleLabels,
          x,
          _i,
          _this.drawnLabels,
          _this.xaxisFontSize
        );

        var offsetYCorrection = 28;

        if (w.globals.rotateXLabels) {
          offsetYCorrection = 22;
        }

        var isCategoryTickAmounts =
          typeof w.config.xaxis.tickAmount !== "undefined" &&
          w.config.xaxis.tickAmount !== "dataPoints" &&
          w.config.xaxis.type !== "datetime";

        if (isCategoryTickAmounts) {
          label = _this.axesUtils.checkLabelBasedOnTickamount(
            _i,
            label,
            labelsLen
          );
        } else {
          label = _this.axesUtils.checkForOverflowingLabels(
            _i,
            label,
            labelsLen,
            _this.drawnLabels,
            _this.drawnLabelsRects
          );
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
            y:
              _this.offY +
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
            cssClass:
              "apexcharts-xaxis-label " + w.config.xaxis.labels.style.cssClass,
          });
          let trimT = function trimText(elText, colWidth){
            let l = elText.node.getBBox();
            if(l.width > colWidth){
              let v = elText.node.childNodes[0].innerHTML;
              let nv = v.slice(0,v.length-4);
              elText.node.childNodes[0].innerHTML = nv+'...';
              let nw = elText.node.getBBox();
              // if(nw.width > colWidth){
              //   trimText(elText, colWidth);
              // }
              // v = "...";
            }
          }

          trimT(elText, colWidth);
          
          // elText.node.setAttribute("width", colWidth)

          elXaxisTexts.add(elText);
          var elTooltipTitle = document.createElementNS(
            w.globals.SVGNS,
            "title"
          );
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
          y:
            this.offY +
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
          cssClass:
            "apexcharts-xaxis-title-text " +
            w.config.xaxis.title.style.cssClass,
        });
        elXaxisTitle.add(elXAxisTitleText);
        elXaxis.add(elXaxisTitle);
      }

      if (w.config.xaxis.axisBorder.show) {
        var offX = w.globals.barPadForNumericAxis;
        var elHorzLine = graphics.drawLine(
          w.globals.padHorizontal + w.config.xaxis.axisBorder.offsetX - offX,
          this.offY,
          this.xaxisBorderWidth + offX,
          this.offY,
          w.config.xaxis.axisBorder.color,
          0,
          this.xaxisBorderHeight
        );
        elXaxis.add(elHorzLine);
      }

      // document.head.innerHTML +=
      // "<link rel='stylesheet' href='../scr/Modules/Axis/style.css' />";

      var _labels = document.querySelectorAll(".apexcharts-xaxis-label");
      for (var i = 0; i < _labels.length; i++) {
        _labels[i].addEventListener("click", (e) => {
          var parent = (e.target as Element).parentNode as Element;
          var text = parent.getAttribute("value");
          var names = Object.assign(text.split("_"));
          // LabelsGroup.hiddens.push({ val: text, level: names.length - 1 });
          Data.DataStorage.manipulateChartData(
            names,
            Data.Flexmonster.drillDownCell,
            Data.Flexmonster.expandCell,
            "rows"
          );
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

    private selectCurrent(text) {
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


    private close(val: string) {
      // var index = id.split("_")[0];
      if(val.split("_").length == 1){
        Data.xaxisFilter = "";
      }
      Data.DataStorage.manipulateChartData(
        val.split("_"),
        Data.Flexmonster.drillUpCell,
        Data.Flexmonster.collapseCell,
        "rows"
      );
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
      }else{
        Data.xaxisFilter = "";
      }
    }
  }

  export class PivotAxis extends apexcharts.Axes {
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
        } else {
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
}
