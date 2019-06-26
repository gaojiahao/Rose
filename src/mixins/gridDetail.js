import util from '@/common/util';
import Record from '@/common/record';
import {
    convertDataType
} from "service/commonService";
export default {
      methods:{
        setValue(fieldCode,value,editor){
            var record = this.record;

            record.set(fieldCode,value);
            if(editor){
                this.executeExpression(editor.cfg.fieldCode);
                record.commit();
            }
        },
        setValues(values){
            this.values = util.clone(values);
            this.record = new Record(this.values);
        },
        executeExpression(editorFieldCode){
            var me = this,
                expressionCfg = this.grid.expressionCfg,
                record = this.record,
                i, l,
                num,
                cfg,
                dataIndex,
                getNumber = function (fieldCode) {
                    var form = me.grid.form;
                    return Number(form.getValues()[fieldCode]);
                },
                loanDay = function (qty, date) {
                    return util.dateAdd((new Date(date)), util.DAY, 0 - Number(qty));
                };
    
            
            if (expressionCfg) for (i = 0, l = expressionCfg.length; i < l; i++) {
                cfg = expressionCfg[i];
                dataIndex = cfg.col.dataIndex;
                if (editorFieldCode == dataIndex) continue; //当前编辑字段，不重新计算。
                if (cfg.type == 'calc') {
                    cfg = CalcToCmd(cfg);
                }
                if (cfg.type == 'cmd') {
                    try {
                        num = util.round(util.correctFloat(eval(cfg.cmd)), cfg.col.decimalPrecision);
                        num = (Number.isNaN(num) || (num === Infinity)) ? 0 : num;
                        record.set(cfg.col.dataIndex, convertDataType(cfg.col.editorType, num));
                    } catch (ex) {
                        console.warn(ex);
                    }
                } else if (cfg.type == 'fn') {
                    num = cfg.fn.call(me, record, changeDataIndex);
                    if (num != null && !isNaN(num) && cfg.col.decimalPrecision != null) num = util.round(num, cfg.col.decimalPrecision);
                    if (num != null) record.set(dataIndex, convertDataType(cfg.col.editorType, num));
                }
            }

            function CalcToCmd(cfg) {
                var changeItems = record.getChanges(),
                    v1,
                    v2;
    
                if (cfg.v1 in changeItems || cfg.v2 in changeItems) {
                    v1 = record.get(cfg.v1);
                    v2 = record.get(cfg.v2);
                    v1 = v1 == +v1 ? v1 : 0;
                    v2 = v2 == +v2 ? v2 : 0;
                    //设置计算结果
                    if (v2 != 0 || cfg.symbol != '/') {
                        return {
                            type: 'cmd',
                            cmd: v1 + cfg.symbol + v2,
                            col: cfg.col
                        };
                    }
                }
                return cfg;
            }
        },
        initFieldMap(){
            var grid = this.grid,
                fieldMap = grid.form.fieldMap,
                fieldId;

            this.fieldMap = [];
            for(fieldId in fieldMap){
                this.fieldMap[fieldId] = fieldMap[fieldId];
            }
        },
        initValueBind(valueBind){
            var me = this,
                fieldCode,
                cfgArr;

            if(util.isEmpty(valueBind))return;
            for(fieldCode in valueBind){
                cfgArr = valueBind[fieldCode];
                addListener(fieldCode,cfgArr);
            }

            function addListener(fieldCode,cfgArr){
                me.$on('before-value-change-column-' + fieldCode,function(editor){
                    var extra = {},
                        data = editor.selection;
                    extra[fieldCode + '.extraData'] = util.clone(data);
                    cfgArr.forEach(function (cfg) {
                        var valueField = cfg.valueField,
                            targetFieldCode = cfg.fieldCode,
                            value;

                        try {
                            value = util.isArray(valueField) ? util.getValueByNs(extra, valueField) : eval('extra' + valueField);
                            me.setValue(targetFieldCode,convertDataType(cfg.editorType, value));
                        } catch (ex) {
                            console.warn(ex);
                        }
                    });
                });
            }
        },
        getValues(){
            var values = {},
                fieldMap = this.fieldMap,
                fieldCode,
                id,field;
            
            for(id in fieldMap){
                field = fieldMap[id];
                if(field.submitValue){
                fieldCode = field.cfg.fieldCode;
                    values[fieldCode] = field.getValue();
                }
            }
            return values;
        }
      }
   }