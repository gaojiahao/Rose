import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler';

let RFieldsetCt = Vue.component('RFieldsetCt', {
    props: ['cfg', 'values'],
    render: function (_c) {
        var items = [],
            fieldsets = this.cfg,
            matterNames = ['inPut', 'order', 'outPut'],
            xtype,
            i = 0,
            itemCfg,
            l;

        for (l = fieldsets.length; i < l; i++) {
            itemCfg = fieldsets[i];
            xtype = 'RFieldset';//'ContentView';

            if (!itemCfg.CName) this.setFieldCName(itemCfg);

            if (itemCfg.isMultiple == true) {
                if (matterNames.indexOf(itemCfg.name) != -1) {
                    //  xtype = 'MatterListView'
                }
                if (itemCfg.xtype == 'r2Fileupload')
                    //xtype = 'Fileupload'
                    continue;
            }
            items.push(
                _c(xtype, {
                    attrs: {
                        form: this.$parent,
                        cfg: itemCfg,
                        values: this.values
                    }
                })
            )
        }
        return _c('div', { attrs: { class: 'fieldSets' } }, items);
    },
    methods: {
        setFieldCName: function (cfg) {
            var isMultiple = cfg.isMultiple,
                columns,
                titleArr = ['出库', '入库', '项目'],
                firstField,
                title,
                i, l,
                text;

            if (cfg.xtype == 'r2Fileupload') {
                cfg.cName = '附件';
                return;
            }
            if (!isMultiple) {
                firstField = cfg.items[0],
                    text = firstField && firstField.fieldLabel;
            } else {
                columns = cfg.columns || cfg.items[0].columns;
                text = columns ? columns[0].text : '';
            }

            if (text) for (i = 0, l = titleArr.length; i < l; i++) {
                title = titleArr[i];
                if (text.indexOf(title) != -1) {
                    text = text + '信息';
                    break;
                }
            }

            cfg.cName = text;
        }
    }
});
export default RFieldsetCt