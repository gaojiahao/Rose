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
           xtype = 'ContentView';//'RFieldset';
           if(itemCfg.isMultiple == true){
               xtype = 'MatterListView';
               if(matterNames.indexOf(itemCfg.name)!= -1){
                    xtype = 'MatterListView'
               }
           }
           items.push(
               _c(xtype,{
                attrs:{
                    cfg:itemCfg,
                    values:this.values
                }
               })
           )
        }
        return _c('div',{},items);
    }
});
export default RFieldsetCt