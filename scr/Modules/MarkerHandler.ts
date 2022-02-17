namespace pivotcharts{
    export class MarkerHandler{
        ctx;
        max_level:number;
        
        constructor(){
           let cols = Data.Flexmonster.getReport()["slice"]["columns"];
           this.max_level = 0;
           cols.forEach(col => {
            let members = Data.Flexmonster.getMembers(col.uniqueName);
            if(members.length > 0){
                let depth = Data.DataStorage.getMembersDepth(members[0])+1;
                this.max_level += depth;
            }
            
           });
           this.max_level--;
        }

        public setMaxLevel(level:number){
            this.max_level = level-1;
        }

        public getMark(curr_level:number, all_levels:number[]):string{
            if(curr_level == this.max_level){
                return "";
            }
            
            if(this.isArrayValuesEquals(all_levels)){
                return "+";
            }
            if(all_levels[0] == curr_level){
                return "-";
            }
            return "+";
        }

        private isArrayValuesEquals(arr:number[]):boolean{
            for(let i = 0; i < arr.length-1; i++){
                if(arr[i] != arr[i+1]) return false;
            }
            return true;
        }
    }
}