namespace Data {
  export class DataStorage {
    //#queries = undefined;
    res = undefined;
    q: Data.DataSetsMaker = undefined;
    constructor(data, type) {
      this.q = new Data.DataSetsMaker(data, type); 
      this.res = this.q.makeDataSets();         
    }

    

    getAllDataSets() {
      return this.res.series;
    }

    getVisibleDataSets(i: number = -1) {
      if(i > -1){
        return { series: this.res.series[i].data, labels: this.res.labels };
      }
      return { series: this.res.series, labels: this.res.labels };
    }

    static manipulateChartData(names, drill, action, dim) {
      var nms =
        dim === "columns"
          ? Data.DataSetsMaker.cols_names
          : Data.DataSetsMaker.rows_names;
      // if(nms.length < 2){
      //   var members = Data.Flexmonster.getMembers(nms[i]).map(x => x.uniqueName);
      // }
      for (var i = 0; i < nms.length; i++) {
        var members = Data.Flexmonster.getMembers(nms[i]).map((x) => {
          return { uniqueName: x.uniqueName, children: x.children };
        });
        // var b = members.map(x => x.uniqueName).includes(names[names.length - 1]);
        var m = DataStorage.search(members, names);
        if (m != null) {
          if (m.children.length > 0) {
            var prev = [...names].slice(0, i);
            var aaa = [...names].slice(i);
            var toDrill = aaa.map(x => '['+x+']').join('.');
            drill(dim, prev, null, toDrill);
            break;
          } else {
            action(dim, names);
          }
        }
      }
    }

    private static search(members, names){
      if(members.length < 1 || members == null){
        return null;
      }
      var b = false;
      var index = -1;
      for (var i = 0; i < members.length; i++) {
        var incl = names.map(x=>members[i].uniqueName.includes(x.toLowerCase()));
        var res = true;
        incl.forEach(element => {
          res &&= element;
        });
        if (res) {
          return members[i];
        }
        
      }
      var childen = members.map(x => x.children);
      // var children_res = [].concat().apply();
      return this.search(Array.prototype.concat.apply([], childen), names);
    }
  }
}
