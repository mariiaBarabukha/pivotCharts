namespace pivotcharts {
  export class Scroll {
    ctx = undefined;
    min: number = 0;
    max: number = 100;

    top:number =Data.BasicSeries.xaxis.categories.length;
    bottom: number = 0;

    isRight;
    constructor(ctx, isRight = false) {
      this.ctx = ctx;
      this.isRight = isRight;
    }

    private removeData(val:number, koeff:number = 1):void {
      if(this.top == 0){
        this.top = Data.BasicSeries.xaxis.categories.length;
      }
      Data.Model.dataStorage.stateOfUpdate = 1;
      var len  = Data.BasicSeries.xaxis.categories.length;
      var len_new = len * val / 100;
      if(koeff == 1){
        len_new = Math.floor(len_new);
        this.bottom = len_new;
      }else{
        len_new = Math.ceil(len_new);
        this.top = len_new;
      }
      var cSeries =JSON.parse(JSON.stringify(Data.BasicSeries.series));      
     
      cSeries = cSeries.map(x => {
        x.data = x.data.slice(this.bottom,this.top);
        //x.data = koeff == 1 ? x.data.slice(len_new) :x.data.slice(0,len_new);
        return x;
      });
      var cLabels = [...Data.BasicSeries.xaxis.categories];
      cLabels = cLabels.slice(this.bottom,this.top);
      //cLabels = koeff == 1 ? cLabels.slice(len_new) : cLabels.slice(0, len_new);
     // Data.Flexmonster.getData();
      Data.Chart.updateOptions({series: cSeries, labels: cLabels});
      Data.Model.dataStorage.stateOfUpdate = 0;
    }
    
    public create() {
      this.top =Data.BasicSeries.xaxis.categories.length;
      var el = document.getElementsByClassName("wrap");

      if (document.getElementsByClassName("wrap").length != 0) {
        return;
      }
      
      document.head.innerHTML += "<link rel='stylesheet' href='../scr/Modules/Scroll/style.css' />";
      var chart = document.getElementById(this.ctx.el.id);
      //let slider = graphics.group({class: "slider"});
      let sliderStr =
        "<div "+
        " class='wrap'"+
        " role='group'"+
        " aria-labelledby='multi-lbl'"+
        " style='--a: 0; --b: 100; --min: 0; --max: 100'"+
        ">"+
          "<label class='sr-only' for='a'>Value A:</label>"+
          "<input class='input-range' id='a' type='range' min='0' value='0' max='100' />"+
          "<output"+
          " for='a'"+
          " style='--c: var(--a)'"+
          "></output>"+
          "<label class='sr-only' for='b'>Value B:</label>"+
          "<input class='input-range' id='b' type='range' min='0' value='100' max='100'  />"+
          "<output"+
          " for='b'"+
          " style='--c: var(--b)'"+
          "></output>"+
        "</div>";
        
        
      //     "<span class='rangeValues'></span>"+
      //     "<input value='0' min='0' max='1' step='0.1' type='range'>"+
      //     "<input value='1' min='0' max='1' step='0.1' type='range'>"+
      //     "</section></div>";

      chart.insertAdjacentHTML("beforebegin", sliderStr);
      //(document.getElementsByClassName("wrap")[0] as any).style.width = this.ctx.w.globals.gridWidth;
      let inps = document.getElementsByClassName("input-range");
        for(let i = 0; i < inps.length; i++){
          inps[i].addEventListener('input', e => {
            let _t = e.target as any;
            _t.parentNode.style.setProperty(`--${_t.id}`, +_t.value)
          }, false);
        }

      //var series = Data.Chart.w.globals.series;

      let inner = document.getElementsByClassName("apexcharts-inner");
      console.log(inner as any);
      let box = inner[0].getAttribute("viewBox");
      console.log(box);

      document.getElementById("a").addEventListener("change", (e) => {
        let val = Number((e.target as any).value)
        console.log((e.target as any).value);
        if (val >= this.max) {
            (e.target as any).value = this.min;   
            return; 
        }else{
            this.min = val;
        }
       this.removeData(this.min);
      });

      document.getElementById("b").addEventListener("change", (e) => {
        let val = Number((e.target as any).value);
        console.log(val);
        console.log((e.target as any).value);
        if (val <= this.min) {
            (e.target as any).value = this.max;
            return;
        }else{
            this.max = val;
        }
        
        this.removeData(this.max, -1);

      });
    }
  }
}
