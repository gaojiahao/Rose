import Vue from 'vue'

let r2ColumnItem = Vue.component('RColumnItem',{
    props:['title','value'],
    render:function(c){
        var self = this;
       return c(
           'div',
           {
              attrs:{
                class:'detail-item'  
              }
           },
           [
              c(
                  'span',
                  {
                    attrs:{
                      class:'item-title'  
                    }
                  },
                  self.title
              ),
              c(
                  'span',
                  {},
                  self.value||'无'
              )
           ]
       )
    }
})
export default r2ColumnItem;