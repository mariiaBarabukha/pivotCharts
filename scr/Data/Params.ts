namespace Data{
    export var labelsCoordinates = [];
    export var FullChartArea = [];
    export var Hiddens = [];
    export var GridLines = [];
    export var visibleDataSets = [];
    export var seriesLenght: number;
    export var Chart: pivotcharts.PivotChart;
    export var Flexmonster: any;
    export var LegendHelper: pivotcharts.PivotHelper;
    export var Categories = [];
    export var chartType = 'bar';
    export var OneDCFull = [];
    export function processData(rawData, type?){
        if(type != undefined){
            chartType = type;
        }
        if(Data.Model.dataStorage == undefined){
            Data.Model.dataStorage = new Data.DataStorage(rawData, type || chartType);
        }else{
            Data.Model.dataStorage.setConfigs(rawData, chartType);
        }

        return Data.Model.dataStorage.getVisibleDataSets(chartType);
    }

    export var BasicSeriesNames = [];
    // export var RawData;
}
