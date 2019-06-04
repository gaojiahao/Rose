import Vue from 'vue'
import fieldBase from 'mixins/fieldBase'

let rtext = Vue.component('r2Textfield',{
    props:['cfg','values'],
    mixins:[fieldBase],
    watch:{
        values:{
            handler(values){

            }
        }
    },
    render:function(c){
        var self = this,
            cfg = this.cfg,
            values =  this.values||{};
        
       return cfg.xtype == 'r2Textfield' ? c(
           'div',
           {
               attrs:{
                 class:'cell each_property vux-1px-b',
                 style:this.hidden?"display:none":""  
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
               cfg.readOnly == false ?
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
                ):c(
                    'span',
                    {},
                    values[cfg.fieldCode]||'无'
                )]
               
       ):undefined;
    }
})
export default rtext;