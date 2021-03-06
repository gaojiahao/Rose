import util from '@/common/util';
import Record from '@/common/record';
import { accMul, accDiv } from "plugins/calc/decimalsAdd";
import {
    convertDataType
} from "service/commonService";
export default {
      methods:{
        setValue(fieldCode,value,editor){
            var record = this.record;

            record.set(fieldCode,value);
            if(editor){
                this.grid.executeExpression(record,editor.cfg.fieldCode);
                record.commit();
            }
        },
        setValues(values){
            this.values = util.clone(values);
            this.record = new Record(this.values,this);
        },
        initFieldMap(){
            var grid = this.grid,
                fieldMap = grid.form.fieldMap,
                fieldId;

            this.fieldMap = {};
            this.fields = {};
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
                    var record = me.record;

                    me.grid.handlerValueBind(record,editor.selection,fieldCode,cfgArr,me);
                });
            }
        },
        initKeyboardEvent:function(){
            var vm = this,
                form = vm.grid.form,
                fn = function(showKeyboard){
                    vm.showKeyboard = showKeyboard;
                };

            form.$on('keyboardToggle',fn);
            vm.$on('hook:destroyed',function(){
                form.$off('keyboardToggle',fn);
            })
        },
        formatByType(value,type){
            if(value == null) return '-';
                if(type == 'r2Numberfield'){
                    return util.permilFormat(value);
                } else if(type == 'r2Percentfield'){
                    return util.permilFormat(accMul(value,100));
                } else {
                return value
            }
        },
        getRowParam:function(paramField){
            var paramData = this.values;
            return util.isArray(paramField) ? util.getValueByNs(paramData, paramField) : eval('paramData' + paramField);
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
        },
        registField(field){
            var cfg = field.cfg;

            this.fieldMap[cfg.id] = this.fields[cfg.fieldCode] = field;
        }
      }
   }