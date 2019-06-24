import Vue from 'vue'

let cmp = Vue.component('GridFieldFactory', {
    props: ['cfg', 'values'],
    render: function (_c) {
        var cfg = this.cfg,
            newCfg = {
                fieldCode:cfg.fieldCode,
                fieldLabel:cfg.text,
                dataSource:cfg.dataSource,
                proertyContext:cfg.proertyContext,
                readOnly:false
            },
            fieldMap = {
                'r2Selector':'R2Combofield',
            },
            xtype = cfg.editorType;
 
        if(xtype in fieldMap) xtype = fieldMap[xtype];
        return _c(xtype, {
            attrs: {
                cfg: newCfg,
                values: this.values
            }
        });
    },
    methods: {
        
    },
    created:function(){
        this.form = this.$parent.$parent.$parent;
    }
});
export default cmp