namespace pivotcharts{
    export class PivotGraphics extends apexcharts.Graphics{
        drawText({
          x,
          y,
          text,
          textAnchor,
          fontSize,
          fontFamily,
          fontWeight,
          foreColor,
          opacity,
          cssClass = '',
          isPlainText = true
        }){
          var result = super.drawText({
            x,
            y,
            text,
            textAnchor,
            fontSize,
            fontFamily,
            fontWeight,
            foreColor,
            opacity,
            cssClass,
            isPlainText
          });
          for(var i = Data.Categories.length - 1; i >= 0; i--){
            if(Data.Categories[i].includes(text)){
              result.attr({'value':Data.Categories[i]});
              break;
            }
          }
          return result;
        }
      }
}