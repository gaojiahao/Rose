import Vue from 'vue'

let RFieldsetCt = Vue.component('RFieldsetCt',{
    props:['cfg','values'],
    render:function(_c){
       var items = [],
           fieldsets = this.cfg,
           matterNames = ['inPut'],
           xtype,
           i = 0,
           itemCfg,
           l;

        for(l = fieldsets.length; i<l;i++){
           itemCfg = fieldsets[i];
           xtype = 'RFieldset';//'ContentView';
           if(itemCfg.isMultiple == true){
               if(matterNames.indexOf(itemCfg.name)!= -1){
                    xtype = 'MatterListView'
               }
               if(itemCfg.xtype == 'r2Fileupload')continue;
           }
           items.push(
               _c(xtype,{
                attrs:{
                    form:this.$parent,
                    cfg:itemCfg,
                    values:this.values
                }
               })
           )
        }
        return _c('div',{attrs:{class:'fieldSets'}},items);
    }
});
export default RFieldsetCt