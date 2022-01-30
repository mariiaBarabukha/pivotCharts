namespace pivotcharts {
  export class NavigationPanel {
    ctx;
    names = [];
    title;
    constructor(ctx, name = "Chart") {
      this.ctx = ctx;
      this.title = name;
      this.names.push(name);
    }

    public toRoot() {
      this.names = [""];
      document.getElementById("path").innerHTML = "";
    }

    public create() {
      var chart = document.getElementById(this.ctx.el.id);
      let panel =
        "<div id='nav_panel' class='nav' style='margin:10px 0px 10px "+
        this.ctx.w.globals.translateX +
        "px;width:" +
        this.ctx.w.globals.gridWidth +
        "px;"+
        "display:flex;justify-content:space-between; align-items:center; font-size:14; font-family:'Open Sans''>" +
            "<div id='path'>"+
                // this.title +
            "</div>"+
        "</div>";
      chart.insertAdjacentHTML("beforebegin", panel);
    }

    public expand(names){
        this.names = ["<span style='color:#DF3800'>"+this.title+"</span>"];
        names.forEach(element => {
            this.names.push(element);
        });
        
        let _names = this.names.join(' > ');
        document.getElementById('path').innerHTML = _names;

    }
  }
}
