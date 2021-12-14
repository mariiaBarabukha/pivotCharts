namespace pivotcharts {
  export class Scroll {
    ctx = undefined;
    min: number = 0;
    max: number = 100;

    top: number = Data.BasicSeries.xaxis.categories.length;
    bottom: number = 0;
    curr_series;
    public segment_value: number = 0;
    isScrolling: boolean = false;
    globMove = 0;

    constructor(ctx) {
      this.ctx = ctx;
      this.curr_series = JSON.stringify(Data.BasicSeries);
    }

    public removeData(val: number, koeff: number = 1): void {
      var len = Data.BasicSeries.xaxis.categories.length;
      var len_new = (len * val) / 100;
      
      len_new = Math.round(len_new);
      
      if (koeff == 1) {
        if(len_new == this.bottom){
          return;
        }
        this.bottom = len_new;
        let valnew = Math.floor((len_new * 100) / len);
        (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
          "--a",
          valnew
        );
        (document.getElementById("a") as any).value = valnew;
        this.min = valnew;
      } else {
        if(len_new == this.top){
          return;
        }
        let valnew = Math.floor((len_new * 100) / len);
        (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
          "--b",
          valnew
        );
        (document.getElementById("b") as any).value = valnew;
        this.top = len_new;
        this.max = valnew;
      }
      var cSeries = JSON.parse(JSON.stringify(Data.BasicSeries.series));
      let ymax = Math.max(...cSeries.map(x => x.data).flat(2))
      cSeries = cSeries.map((x) => {
        x.data = x.data.slice(this.bottom, this.top);
        return x;
      });
      var cLabels = [...Data.BasicSeries.xaxis.categories];
      cLabels = cLabels.slice(this.bottom, this.top);
      Data.Model.dataStorage.stateOfUpdate = 1;
      
      Data.Chart.updateOptions(
        { series: cSeries, labels: cLabels, 
          yaxis: {max: ymax, forceNiceScale:true}
        },
        false,
        false
      );
      Data.Model.dataStorage.stateOfUpdate = 0;
    }

    inerval: number = 0;

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

      document.getElementById("a").addEventListener("mousedown", (e) => {
        x = e.pageX;
        let m = this.min;
        document.onmousemove = (e) => {
          
          let a = e.pageX - x;
          let wrap = document.getElementsByClassName("wrap")[0] as any;
          let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));
          
          if (m + move > this.max) {
            this.min = this.max;
          } else {
            if (m + move < 0) {
              this.min = 0;
            } else {
              this.min = m + move;
            }
          }

          if(Math.abs(move) % this.segment_value == 0){
            this.removeData(this.min);
          }else{
            (document.getElementById("a") as any).value = this.min;
            wrap.style.setProperty("--a", this.min);
          }
        };

        document.onmouseup = (e) => {         
          document.onmousemove = null;
          document.onmouseup = null;
        };
      });

      document.getElementById("b").addEventListener("mousedown", (e) => {
        x = e.pageX;
        let m = this.max;
        document.onmousemove = (e) => {
          
          let a = e.pageX - x;
          let wrap = document.getElementsByClassName("wrap")[0] as any;
          let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));          
          
          if (m + move < this.min) {
            this.max = this.min;
          } else {
            if (m + move > 100) {
              this.max = 100;
            } else {
              this.max = m + move;
            }
          }

          if(Math.abs(move) % this.segment_value == 0){
            this.removeData(this.max, -1);
          }else{
            (document.getElementById("b") as any).value = this.max;
            wrap.style.setProperty("--b", this.max);
          }
        };

        document.onmouseup = (e) => {         
          document.onmousemove = null;
          document.onmouseup = null;
        };
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
        let m = this.min;
        document.onmousemove = (e) => {
          if (!scrollPressed) {
            return;
          }
          let a = e.pageX - x;
          let wrap = document.getElementsByClassName("wrap")[0] as any;
          let move = Math.floor(a / (this.ctx.w.globals.gridWidth / 100));
          let diff = this.max - this.min;
          
          
          if (m + move > 100 - diff) {
            temp_max = 100;
            temp_min = 100 - diff;
          } else {
            if (m + move < 0) {
              temp_min = 0;
              temp_max = diff;
            } else {
              temp_min = m + move;
              temp_max = temp_min + diff;
            }
          }

          if(Math.abs(move) % this.segment_value == 0){
            this.removeData(temp_min);
            this.removeData(temp_max, -1);
          }else{
            this.inerval = move;
            (document.getElementById("a") as any).value = temp_min;
            (document.getElementById("b") as any).value = temp_max;
            wrap.style.setProperty("--a", temp_min);
            wrap.style.setProperty("--b", temp_max);
          }
         
          this.globMove = move;
        };

        document.onmouseup = (e) => {
          this.max = temp_max;
          this.min = temp_min;
          let diff = this.max - this.min;

          this.isScrolling = true;
          this.removeData(temp_min);
          this.removeData(this.min + diff, -1);
          this.isScrolling = false;
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

    public dropScroll(){
      (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
        "--a",
        0
      );
      (document.getElementsByClassName("wrap")[0] as any).style.setProperty(
        "--b",
        100
      );
      (document.getElementById("a") as any).value = 0;
      (document.getElementById("b") as any).value = 100;
    }

    public create() {
      if (document.getElementsByClassName("wrap").length != 0) {
        if (this.curr_series != JSON.stringify(Data.BasicSeries)) {
          this.curr_series = JSON.stringify(Data.BasicSeries);          
          this.dropScroll();
          this.top = Data.BasicSeries.xaxis.categories.length;
          this.segment_value = Math.round(100 / this.top);
        }
        return;
      }
      this.segment_value = Math.round(100 / this.top);
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

      Data.Scroll = this;
    }

    getCoords(elem) {
      var box = elem.getBoundingClientRect();
      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset,
      };
    }
  }
}
