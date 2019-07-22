import Vue from 'vue';
import {
    getValuesByExp
} from "service/commonService";
import util from '@/common/util';
export default {
    data(){
        return {
            hidden:false,
            disabled:false,
            allowBlank:false
        }
    },
    created(){
        this.init();
    },
    methods:{
        init:function(){
            var cfg = this.cfg,
                id = cfg.id,
                fieldCode = cfg.fieldCode,
                fieldSet = this.$parent,
                form = fieldSet.form;

            this.form = form;
            this.form.registField(this);
            this.valueChangeKey = 'value-change-' + id;
            this.blankText = cfg.fieldLabel + '不能为空！'
            this.initOption(cfg);
            if(cfg.wfParam){
                form.wfParamFieldMap[cfg.wfParam] = fieldCode;
            }
            this.initVisible();
            this.initWatch(cfg.watch);
            if(form.model == 'new')this.initDefaultValue(cfg.defaultValue);
            this.initDataSource(cfg.dataSource);
        },
        initOption(cfg){
            var options = ['allowBlank','submitValue'],
                l = options.length,
                option;

            while(l--){
                option = options[l];
                this[option] = cfg[option];
            }
        },
        initVisible:function(){
            var cfg = this.cfg,
                fieldSet = this.$parent,
                form = this.form,
                hasValueBind = cfg.dataSource && cfg.dataSource.type == "formData",
                values = this.values;
            
            if(form.model == 'new' && values[cfg.fieldCode] == null && cfg.readOnly == true && hasValueBind && cfg.allowBlank == true){
                this.hidden = true;
            } else if(fieldSet.styleType == 0 && cfg.readOnly == true){
                this.hidden = true;
                fieldSet.$on('change-styleType',this.onStyleTypeChange)
            }else {
                this.hidden = cfg.hiddenInRun;
            }
            
        },
        initDataSource:function(ds){
            if(!ds) return;
            if(!this.isCombo()){
                this.initDefaultValue(ds);
            }
        },
        initWatch(watch){
            var me = this,
                cfgArr;

            if(!watch) return;
            try{
                cfgArr = JSON.parse(watch);
            }catch(e){
                console.log('watch解析bug');
                return null;
            }
            util.each(cfgArr,(cfg)=>{
                var key = cfg.computed,
                    bind = util.trim(cfg.bind),
                    fn;
                
                if(bind){
                    fn = createBindFn(bind);
                }else{
                    try{
                        fn = eval('('+ cfg.fn +')');
                    } catch(e) {
                        console.log('watch[' + key +']语法bug');
                    }
                }
                this.form.$watch(key,fn,{immediate:true});
            });
 
            function createBindFn(bind){
                return function(value){
                   me['set'+ bind[0].toUpperCase()+bind.substr(1)](value);
                }
            }
        },
        isCombo:function(){
            return this.$options.name == 'R2Combofield';
        },
        isGridEditor:function(){
            return this.cfg.inGrid == true;
        },
        isValid : function() {
            var me = this;
            return me.disabled || me.getErrors().length == 0;
        },
        initDefaultValue:function(cfg){
            var value;
            if(!cfg) return;
            if(cfg.type == 'formData'){
                this.initValueBind([cfg.data]);
            }else if(cfg.type == 'contextData'){
                value = getValuesByExp(cfg.data);
            }else if(cfg.type == 'staticData') {
                value = cfg.data[0];
            }
            if(value != null){
               this.setValue(value);
            }
        },
        initValueBind(valueBind){
            var me = this,
                cmp,
                cmpId,
                form = this.form,
                i = 0,l = valueBind.length,
                item,
                valueField;
            
            for(;i<l;i++){
                item = valueBind[i];
                cmpId = item.contrl;
                valueField = item.valueField;
                cmp = form.fieldMap[cmpId];
                form.$on('value-change-' + cmpId,(function(valueField){
                    return function(){
                       var arg = Array.prototype.slice.call(arguments);
                       arg.unshift(valueField);
                       me.valueBindChangeHandler.apply(me,arg);
                    }
                })(valueField));
            } 
        },
        onStyleTypeChange:function(type){
            if(this.cfg.hiddenInRun) return;
            this.hidden = !type;
        },
        setValue:function(value){
            var cfg = this.cfg;
            this.form.$emit('before-'+this.valueChangeKey,this);
            this.form.setValue(cfg.fieldCode,value,this);
            this.form.$emit(this.valueChangeKey,this);
        },
        getErrors:function(){
            var me = this,
                value = me.getValue(),
                errors = [];
           
            if(!me.allowBlank && value == null){
                errors.push(me.blankText);
                this.$vux.alert.show({
                    content: me.blankText
                });
            }
            return errors;
        },
        getValue:function(){
            var cfg = this.cfg;
            return this.values[cfg.fieldCode];
        },
        getSubmitData:function(){
            return this.getValue();
        },
        getExtraFieldValue:function(valueField){//combo 会覆盖这个方法
            return this.getValue();
        },
        //输入框获取焦点时内容选中
        getFocus(e) {
            event.currentTarget.select();
        },
        valueBindChangeHandler(valueField,cmp){
            var value = cmp.getExtraFieldValue(valueField);

            this.setValue(value);
            if(this.form.model == 'new' && this.cfg.readOnly == true)this.hidden = value == null;
        } 
    }
}