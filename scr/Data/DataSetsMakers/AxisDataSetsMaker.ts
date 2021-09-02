namespace Data{
    export class AxisDataSetsMaker extends Data.DataSetsMaker{
        makeDataSets(){
            this.riseAllCollapsedSeries();
            var sortByColumns = this.sortData();
            var categories: string[] = sortByColumns[0].map((x) => {
              var r = x.r_full.split("_");
              return this.capitalizeFirstLetter(r[r.length - 1]);
            });
            var series = this.makeSeries(sortByColumns);     
            this.hiseSeries(series);    
      
            return { series: series, xaxis: { categories: categories }};
        }
         
    }
}