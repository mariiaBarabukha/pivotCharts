namespace pivotcharts{
    
    export class PivotXAxis extends apexcharts.XAxis{
        drawXaxis(){
           let aa = document.getElementsByClassName("apexcharts-xaxis");
          
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

          // if(document.getElementsByClassName("apexcharts-xaxis").length == 0){
            
          //   //return;
          // }
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
}