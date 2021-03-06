import Vue from 'vue'

let cmp = Vue.component('GridFieldFactoryWx', {
    props: ['cfg', 'values'],
    data(){
        return {
            seletion:{},
        }},
    render: function (_c) {
        var self = this,
            cfg = self.cfg,
            seletion = {},
            newCfg = {
                ...cfg,
                id:'column-'+cfg.fieldCode,
                xtype:cfg.editorType,
                fieldCode:cfg.fieldCode,
                fieldLabel:cfg.text,
                allowBlank:cfg.allowBlank,
                readOnly:cfg.readOnly
            },
            extraCfg = this.getExtraCfg(cfg),
            fieldMap = {
                'r2SelectorPlus':'R2Combofield',
                'r2Selector':'R2Combofield',
                'r2Combo':'R2Combofield'
            },
            xtype = cfg.editorType,
            columns = this.$parent.$parent.$parent.cfg.columns;

            if(this.cfg.fieldCode==columns[0].fieldCode){
                fieldMap['r2Selector'] = 'R2CombofieldWx'    
            }
 
        Object.assign(newCfg,extraCfg||{});
        if(xtype in fieldMap) xtype = fieldMap[xtype];
        return _c(xtype, {
            attrs: {
                cfg: newCfg,
                values: this.values
            },
            on:{
                getSelect:function(val) {
                    self.seletion = val;
                }
            }
        });
    },
    methods: {
        getExtraCfg: function (cfg) {
            switch (cfg.editorType) {
                case 'r2Textfield':
                    return this.buildTextEditor(cfg);
                case 'r2Datefield':
                    return this.buildDateEditor(cfg);
                case 'r2Numberfield':
                case 'r2Percentfield':
                    return this.buildNumberEditor(cfg);
                case 'r2Permilfield':
                    return this.buildPermilEditor(cfg);
                case 'r2Combo':
                    return this.buildComboboxEditor(cfg);
                case 'r2Selector':
                case 'r2SelectorPlus':
                    return this.buildSelectorEditor(cfg);
                case 'r2MultiSelector':
                    return this.buildMultiSelectorEditor(cfg);
                default:
                    return this.buildCommonEditor(cfg);
            }
        },
        buildTextEditor(cfg){
            return {
                regex: new RegExp(cfg.regex),
                regexText: cfg.regexText,
            }
        },
        buildDateEditor(cfg){
           return {
                format: cfg.format
           }
        },
        buildNumberEditor(cfg){
            return  {
                minValue: cfg.minValue,
                maxValue: cfg.maxValue,
                decimalPrecision: cfg.decimalPrecision
            }
        },
        buildPermilEditor(cfg){
            return {
                decimalPrecision: cfg.decimalPrecision
            }
        },
        buildComboboxEditor(cfg){
            return {
                dataSource: cfg.dataSource,
                valueField: cfg.valueField,
                displayField: cfg.displayField,
                inGrid: true,
                proertyContext: cfg.proertyContext
            }
        },
        buildSelectorEditor(cfg){
            return {
                dataSource: cfg.dataSource,
                valueField: cfg.valueField,
                displayField: cfg.displayField,
                proertyContext: cfg.proertyContext,
                selectionModel: cfg.selectionModel || 'MULTI',
                pickerTitle: cfg.pickerTitle,
                inGrid: true,
                isMixSel: cfg.isMixSel
            }
        },
        buildMultiSelectorEditor(cfg){
            return {
                dataSource: cfg.dataSource,
                valueField: cfg.valueField,
                displayField: cfg.displayField,
                proertyContext: cfg.proertyContext
            }
        },
        buildCommonEditor(cfg){
           return {};
        },
    },
    created:function(){
        this.form = this.$parent.$parent.$parent;
    }
});
export default cmp