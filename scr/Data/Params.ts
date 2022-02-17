namespace Data{
    export var Hiddens = [];
    export var visibleDataSets = [];
    export var seriesLenght: number;
    export var Chart: pivotcharts.PivotChart;
    export var Flexmonster: any;
    export var LegendHelper: pivotcharts.PivotHelper;
    export var Categories = [];
    export var chartType = 'bar';
    export var OneDCFull = [];
    export var BasicSeries:any;
    export var DropScroll = false;
    export var Scroll: pivotcharts.Scroll;
    export var LegendHeightZero = 0;
    export var updateLegend = false;
    export var originalChartHeight: number;
    export var gridObjHeight;
    export var OldSeries;
    export var xaxisHiddenLabels=[];
    export var RowsLevels = [];
    export var xaxisFilter = "";
    export var NavPanel: pivotcharts.NavigationPanel;
    export var legendFilter = "";
    export var MarkerHandler: pivotcharts.MarkerHandler;
    
    export function processData(rawData, type?){
        if(type != undefined){
            chartType = type;
        }
        if(Data.Model.dataStorage == undefined){
            Data.Model.dataStorage = new Data.DataStorage(rawData, type || chartType);
        }else{
            Data.Model.dataStorage.setConfigs(rawData, chartType);
        }

        var data = Data.Model.dataStorage.getVisibleDataSets(chartType);
        if(Data.Model.dataStorage.stateOfUpdate == 0){
            BasicSeries = JSON.parse(JSON.stringify(data));
            DropScroll = true;
        }else{
            DropScroll = false;

        }
        // Chart.axes.expand();
        return data;
    }

    
}
