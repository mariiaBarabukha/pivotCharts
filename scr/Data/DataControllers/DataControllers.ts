namespace Data {
  // export class DataSelectotController {
  //   data: any[];
  //   selectedItem: string;
  //   outerWrapperName: string = "";
  //   key: string;
  //   ctx;

  //   constructor(ctx:object, data:any[], key:string, type:string) {
  //     this.ctx = ctx;
  //     this.data = data;
  //     this.key = key;
  //     this.outerWrapperName = type;
  //   }

  // }

  export class DataSelector {
    data: any[];
    selectedItem: string;
    outerWrapperName: string = "";
    key: string;
    ctx;
    index: number;

    constructor(ctx:object, data:any[], key:string, type:string, index:number) {
      this.ctx = ctx;
      this.data = data;
      this.key = key;
      this.outerWrapperName = type;
      this.index = index;
    }

    draw() {
      var options = this.data.map((x) => x[this.key]);
      var dropDown =
        "<div class='" + this.outerWrapperName + "'>" + this.selectedItem ||
        options[0] + "<div class='menu'>";
      options.forEach((option) => {
        dropDown += " <div class='item'>" + option + "</div>";
      });
      dropDown += "</div></div>";
      var chart = document.getElementById(this.ctx.el.id);
      chart.insertAdjacentHTML("beforebegin", dropDown);
    }
  }
}
