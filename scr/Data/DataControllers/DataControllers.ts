namespace Data {
  export abstract class DataSelectotController {
    data: any[];
    selectedItem: string;
    outerWrapperName: string = "";
    key: string;
    ctx;

    constructor(ctx, data, key, type) {
      this.ctx = ctx;
      this.data = data;
      this.key = key;
      this.outerWrapperName = type;
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
      var chart = document.getElementById(this.ctx.el);
      chart.insertAdjacentHTML("beforebegin", dropDown);
    }
  }
}
