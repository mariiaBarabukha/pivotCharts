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
    export function processData(rawData, type='bar'){
        Data.Model.dataStorage = new Data.DataStorage(rawData, type);
        return Data.Model.dataStorage.getVisibleDataSets();
    }
    // export var RawData;
}
