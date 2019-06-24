import util from '@/common/util';
import Record from '@/common/record';
export default {
      methods:{
        setValue(fieldCode,value){
            this.$set(this.values,fieldCode,value);
            this.executeExpression(fieldCode);
        },
        setValues(values){
            this.values = util.clone(values);
            this.record = new Record(this.values);
        },
        executeExpression(fieldCode){
            var expressionCfg = this.grid.expressionCfg,
                record = this.record;
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