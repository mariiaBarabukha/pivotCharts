namespace pivotcharts {
  export class Scroll {
    ctx = undefined;
    min: number = 0;
    max: number = 100;

    top:number =Data.BasicSeries.xaxis.categories.length;
    bottom: number = 0;
    curr_series;

    constructor(ctx) {
      this.ctx = ctx;
      this.curr_series = JSON.stringify(Data.BasicSeries);
    }

    private removeData(val:number, koeff:number = 1):void {
      let serLen =  Data.BasicSeries.xaxis.categories.length;
      if(this.top == 0){
        this.top = serLen;
      }
      Data.Model.dataStorage.stateOfUpdate = 1;
      var len  = Data.BasicSeries.xaxis.categories.length;
      var len_new = len * val / 100;
      len_new = Math.round(len_new);
      
      if(koeff == 1){        
        this.bottom = len_new;
        let valnew = Math.floor(len_new * 100/serLen);
        (document.getElementsByClassName("wrap")[0] as any).style
              .setProperty('--a', valnew);
        (document.getElementById("a") as any).value = valnew;
      }else{
        let valnew = Math.ceil(len_new * 100/serLen);
        (document.getElementsByClassName("wrap")[0] as any).style
              .setProperty('--b', valnew);
        (document.getElementById("b") as any).value = valnew;
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

    private createScroll(): string{
      return "<div "+
      " class='wrap'"+
      " role='group'"+
      " aria-labelledby='multi-lbl'"+
      " style='--a: 0; --b: 100; --min: 0; --max: 100; --w:500; --left-margin:0'"+
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
    }

    private _addListeners(){
      document.getElementById("a").addEventListener("change", (e) => {
        let val = Number((e.target as any).value)
        console.log((e.target as any).value);
        if (val >= this.max) {
            (e.target as any).value = this.min;   
            (document.getElementsByClassName("wrap")[0] as any).style
              .setProperty('--a', this.min);
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
            (document.getElementsByClassName("wrap")[0] as any).style
              .setProperty('--b', this.max);
            return;
        }else{
            this.max = val;
        }
        
        this.removeData(this.max, -1);

      });
    }
    
    public create() {
      this.top =Data.BasicSeries.xaxis.categories.length;    

      if (document.getElementsByClassName("wrap").length != 0) {
        if(this.curr_series != JSON.stringify(Data.BasicSeries)){
          this.curr_series = JSON.stringify(Data.BasicSeries);
          (document.getElementById("a") as any).value = 0;
          (document.getElementById("b") as any).value = 100;
          (document.getElementsByClassName("wrap")[0] as any).style
                .setProperty('--a', 0);
          (document.getElementsByClassName("wrap")[0] as any).style
                .setProperty('--b', 100);
        }        
        return;
      }    
      
      
      
      document.head.innerHTML += "<link rel='stylesheet' href='../scr/Modules/Scroll/style.css' />";
      var chart = document.getElementById(this.ctx.el.id);            

      chart.insertAdjacentHTML("beforebegin", this.createScroll());
      
      this._addListeners();
      
      
      (document.getElementsByClassName("wrap")[0] as any).style
        .setProperty('--w', this.ctx.w.globals.gridWidth);
        (document.getElementsByClassName("wrap")[0] as any).style
        .setProperty('--left-margin', this.ctx.w.globals.translateX);
      
      let inps = document.getElementsByClassName("input-range");
        for(let i = 0; i < inps.length; i++){
          inps[i].addEventListener('input', e => {
            let _t = e.target as any;
            _t.parentNode.style.setProperty(`--${_t.id}`, +_t.value)
          }, false);
        }    
      
    }
  }
}
