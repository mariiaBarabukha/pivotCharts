namespace Data{
   
    export class RowsSelectorController{

        private currentRowIndex:number = 0;
        getCurrentRowIndex():number{
            return this.currentRowIndex;
        }

        setCurrentRowIndex(i:number){
            this.currentRowIndex = i;
        }
    }
    export class RowsSelector{
        controller = new RowsSelectorController();
        ctx:any;
        isDrawn:boolean;
        constructor(ctx:any){
            this.ctx = ctx;
            this.isDrawn = false;
        }
        draw(names:string[]){
            var dropDown = "<select id='rows'>";
            var options = names.map(x=>"<option value='"+names.indexOf(x)+"'>"+x+"</option>").join();
            dropDown+=options;
            dropDown+="</select>";
            var chart = document.getElementById(this.ctx.el.id);
            chart.insertAdjacentHTML("beforebegin", dropDown);

            var select = document.getElementById("rows");
            select.onchange = () => {
                var s = document.getElementById("rows") as any;
                var option = s.options[s.selectedIndex].value;
                this.controller.setCurrentRowIndex(Number(option));
                Data.Chart.updateOptions(this.ctx.w.globals.series);;
            }
            this.isDrawn = true;
        }

        getCurrentRowIndex(){
            return this.controller.getCurrentRowIndex();
        }
    }
}