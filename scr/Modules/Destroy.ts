namespace pivotcharts{
    export class PivotDestroy extends apexcharts.Destroy{

      clearDomElements({ isUpdating }) {
        const elSVG = this.w.globals.dom.Paper.node
        // fixes apexcharts.js#1654 & vue-apexcharts#256
        if (elSVG.parentNode && elSVG.parentNode.parentNode && !isUpdating) {
          elSVG.parentNode.parentNode.style.minHeight = 'unset'
        }
    
        // detach root event
        const baseEl = this.w.globals.dom.baseEl
        if (baseEl) {
          // see https://github.com/apexcharts/vue-apexcharts/issues/275
          this.ctx.eventList.forEach((event) => {
            baseEl.removeEventListener(event, this.ctx.events.documentEvent)
          })
        }
    
        const domEls = this.w.globals.dom
    
        if (this.ctx.el !== null) {
          // remove all child elements - resetting the whole chart
          // let fc = this.ctx.el.firstChild;
          for (let ii = 0; ii < this.ctx.el.children.length; ii++) {
            let _class = this.ctx.el.children[ii].className;
             if(_class != 'wrap'){
              this.ctx.el.removeChild(this.ctx.el.children[ii]);
             }
             
          }
        }
    
        this.killSVG(domEls.Paper)
        domEls.Paper.remove()
    
        domEls.elWrap = null
        domEls.elGraphical = null
        domEls.elAnnotations = null
        domEls.elLegendWrap = null
        domEls.baseEl = null
        domEls.elGridRect = null
        domEls.elGridRectMask = null
        domEls.elGridRectMarkerMask = null
        domEls.elDefs = null
      }
    }
}