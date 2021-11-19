namespace pivotcharts {
  export class Scroll {
    ctx = undefined;
    min: number = 0;
    max: number = 100;

    top: number = Data.BasicSeries.xaxis.categories.length;
    bottom: number = 0;
    curr_series;
    segment_value: number = 0;

    constructor(ctx) {
      this.ctx = ctx;
      this.curr_series = JSON.stringify(Data.BasicSeries);
    }

    private removeData(val: number, koeff: number = 1): void {
      
      let serLen = Data.BasicSeries.xaxis.categories.length;
      
      var len = Data.BasicSeries.xaxis.categories.length;
      var len_new = (len * val) / 100;
      len_new = Math.round(len_new);
      
      if (koeff == 1) {
        if(len_new == this.bottom){
          return;
        }
       // console.log(val)
        
        this.bottom = len_new;
        let valnew = Math.floor((len_new * 100) / serLen);
        (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
          "--a",
          valnew
        );
        (document.getElementById("a") as any).value = valnew;
        //console.log(valnew);
        this.min = valnew;
      } else {
        if(len_new == this.top){
          return;
        }
        let valnew = Math.floor((len_new * 100) / serLen);
        (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
          "--b",
          valnew
        );
        (document.getElementById("b") as any).value = valnew;
        this.top = len_new;
        this.max = valnew;
      }
      var cSeries = JSON.parse(JSON.stringify(Data.BasicSeries.series));

      cSeries = cSeries.map((x) => {
        x.data = x.data.slice(this.bottom, this.top);
        return x;
      });
      var cLabels = [...Data.BasicSeries.xaxis.categories];
      cLabels = cLabels.slice(this.bottom, this.top);
      Data.Model.dataStorage.stateOfUpdate = 1;
      Data.Chart.updateOptions(
        { series: cSeries, labels: cLabels },
        false,
        false
      );
      Data.Model.dataStorage.stateOfUpdate = 0;
      //console.log(this.min)
      
    }

    private createScroll(): string {
      return (
        "<div " +
        " class='wrap'" +
        " role='group'" +
        " aria-labelledby='multi-lbl'" +
        " style='--a: 0; --b: 100; --min: 0; --max: 100; --w:500; --left-margin:0'" +
        ">" +
        "<label class='sr-only' for='a'>Value A:</label>" +
        "<input class='input-range' id='a' type='range' min='0' value='0' max='100' />" +
        "<output" +
        " for='a'" +
        " style='--c: var(--a)'" +
        "></output>" +
        "<label class='sr-only' for='b'>Value B:</label>" +
        "<input class='input-range' id='b' type='range' min='0' value='100' max='100'  />" +
        "<output" +
        " for='b'" +
        " style='--c: var(--b)'" +
        "></output>" +
        "<div id='scroller'><div>" +
        "</div>"
      );
    }

    private _addListeners() {
      document.getElementById("a").addEventListener("change", (e) => {
        let val = Number((e.target as any).value);
        //console.log((e.target as any).value);
        if (val >= this.max) {
          (e.target as any).value = this.min;
          (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
            "--a",
            this.min
          );
          return;
        } else {
          this.min = val;
        }
        this.removeData(this.min);
      });

      document.getElementById("b").addEventListener("change", (e) => {
        let val = Number((e.target as any).value);
        if (val <= this.min) {
          (e.target as any).value = this.max;
          (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
            "--b",
            this.max
          );
          return;
        } else {
          this.max = val;
        }

        this.removeData(this.max, -1);
      });
      let isDown = false;
      var x;
      var scroller = document.getElementById("scroller");
      let scrollPressed = false;

      let temp_min;
      let temp_max;

      scroller.addEventListener("mousedown", (e) => {
        x = e.pageX;
        isDown = true;
        scrollPressed = true;

        document.onmousemove = (e) => {
          if (!scrollPressed) {
            return;
          }
          let a = e.pageX - x;
          let wrap = document.getElementsByClassName("wrap")[0] as any;
          let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));
          let diff = this.max - this.min;
          

          if (this.min + move > 100 - diff) {
            temp_max = 100;
            temp_min = 100 - diff;
          } else {
            if (this.min + move < 0) {
              temp_min = 0;
              temp_max = diff;
            } else {
              temp_min = this.min + move;
              temp_max = temp_min + diff;
            }
          }
          if(move % this.segment_value == 0){
            
            this.removeData(temp_min);
            this.removeData(temp_max, -1);
            //this.max = temp_max;
            //this.min = temp_min;
           // setTimeout(() => {console.log("a") }, 2000);
          }else{
            console.log("no"+move)
          }
          

          // this.removeData(temp_min);
          // this.removeData(temp_max, -1);
          // this.min = temp_min;
          // this.max = temp_max;
          // if (temp_min % this.segment_value == (this.segment_value/2)) {

          //   this.removeData(temp_min);
          //   this.removeData(temp_max, -1);
          //   this.min = temp_min;
          //   this.max = temp_max;

          // }
         // this.removeData(temp_min);
         // this.removeData(temp_min + diff, -1);
          // (document.getElementById("a") as any).value = temp_min;
          // (document.getElementById("b") as any).value = temp_max;
          // wrap.style.setProperty("--a", temp_min);
          // wrap.style.setProperty("--b", temp_max);
          // let len = Data.BasicSeries.xaxis.categories.length;
          // let len_new = (len * temp_min) / 100;
          // //let serLen = Data.BasicSeries.xaxis.categories.length;
          // let valnew = Math.round(len_new * 100)/len;
          // if (temp_min == valnew) {
           
          //   this.removeData(temp_min);
          //   this.removeData(temp_max, -1);
          //   this.min = temp_min;
          //   this.max = temp_max;
          // }else{
          //   var i  = 0;
          // }
          (document.getElementById("a") as any).value = temp_min;
          (document.getElementById("b") as any).value = temp_max;
          wrap.style.setProperty("--a", temp_min);
          wrap.style.setProperty("--b", temp_max);
        };

        document.onmouseup = (e) => {
          this.max = temp_max;
          this.min = temp_min;

          this.removeData(temp_min);
          this.removeData(temp_max, -1);
          isDown = false;
          scrollPressed = false;
          document.onmousemove = null;
          document.onmouseup = null;
        };
      });

      scroller.ondragstart = function () {
        return false;
      };
    }

    public create() {
      if (document.getElementsByClassName("wrap").length != 0) {
        if (this.curr_series != JSON.stringify(Data.BasicSeries)) {
          this.curr_series = JSON.stringify(Data.BasicSeries);
          (document.getElementById("a") as any).value = 0;
          (document.getElementById("b") as any).value = 100;
          (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
            "--a",
            0
          );
          (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
            "--b",
            100
          );
          this.top = Data.BasicSeries.xaxis.categories.length;
          
        }
        this.curr_series = JSON.stringify(Data.BasicSeries);
        this.segment_value = Math.round(100 / this.top);
        return;
      }

      document.head.innerHTML +=
        "<link rel='stylesheet' href='../scr/Modules/Scroll/style.css' />";
      var chart = document.getElementById(this.ctx.el.id);

      chart.insertAdjacentHTML("beforebegin", this.createScroll());

      this._addListeners();

      (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
        "--w",
        this.ctx.w.globals.gridWidth
      );
      (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
        "--left-margin",
        this.ctx.w.globals.translateX
      );

      let inps = document.getElementsByClassName("input-range");
      for (let i = 0; i < inps.length; i++) {
        inps[i].addEventListener(
          "input",
          (e) => {
            let _t = e.target as any;
            _t.parentNode.style.setProperty(`--${_t.id}`, +_t.value);
          },
          false
        );
      }
    }

    getCoords(elem) {
      // кроме IE8-
      var box = elem.getBoundingClientRect();
      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset,
      };
    }
  }
}
