namespace pivotcharts{
    export class ToMainChartButton{
        ctx:any;
        constructor(ctx){
            this.ctx = ctx;
        }


        public createButton(text, close) {
            let bp = document.getElementById("buttons_panel");
            if (bp.innerHTML != "") {
                bp.innerHTML = "";
            }
            let b = document.createElement("button");
            b.style.background = "#FFFFFF";
            b.style.border = "1px solid #DF3800";
            b.style.boxSizing = "border-box";
            b.style.borderRadius = "4px";
            b.style.color = "DF3800";
            b.style.padding = "6px 16px";
            b.style.fontSize = "14px";
            b.style.fontFamily = "Open Sans";
            b.onclick = () => close(text);
            b.onmouseover = () => b.style.cursor = "pointer";
            b.onmouseleave= () => b.style.cursor = "none";
            bp.appendChild(b);
            b.value = text;
            b.innerHTML = "<&nbsp;&nbsp;Back to the main chart";
          }
    }
}