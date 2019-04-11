import Vue from 'vue'

let rtext = Vue.component('RText',{
    props:['cfg','values'],
    render:function(c){
        var self = this,
            cfg = this.cfg,
            values =  this.values;
        
       return cfg.xtype == 'r2Textfield' ? c(
           'div',
           {
               attrs:{
                 class:'each_property'  
               }
           },
           [
               c(
                   'label',
                   {
                       class:{
                            required:!cfg.allowBlank
                       }
                   },
                   cfg.fieldLabel
               ),
               c(
                   'input',
                   {
                       attrs:{
                           type:'text',
                           placeholder:'请输入',
                           value:values[cfg.fieldCode],
                           class:'property_val'
                       },
                       on:{
                           focus:function(){
                               event.currentTarget.select();
                           },
                           input:function(event){
                               self.$emit('input', event.target.value)
                           }
                       }
                   }
               )
           ]
       ):undefined;
    }
})
export default rtext;