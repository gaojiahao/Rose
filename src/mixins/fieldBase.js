export default {
    data(){
        return {
            hidden:false
        }
    },
    created(){
        this.init();
    },
    methods:{
        init:function(){
            var cfg = this.cfg,
                id = cfg.id,
                fieldSet = this.$parent,
                form = fieldSet.form;

            form.fieldMap[id] = this;
            this.form = form;
            this.valueChangeKey = 'value-change-' + id;
            this.initVisible();
            this.initDataSource(cfg.dataSource);
        },
        initVisible:function(){
            var cfg = this.cfg,
                fieldSet = this.$parent,
                form = this.form,
                values = this.values;
            
            if(form.model == 'new' && values[cfg.fieldCode] == null){
                this.hidden = true;
            } else if(fieldSet.styleType == 0 && cfg.readOnly == true){
                this.hidden = true;
                fieldSet.$on('change-styleType',this.onStyleTypeChange)
            }else {
                this.hidden = cfg.hiddenInRun;
            }
            
        },
        initDataSource:function(ds){
            var value;
            if(!ds) return;
            if(ds.type == 'formData'){
                this.initValueBind([ds.data]);
            }else if(ds.type == 'contextData'){

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
            this.form.formData[cfg.fieldCode] = value;
            this.form.$emit(this.valueChangeKey,this);
        },
        getExtraFieldValue:function(valueField){
            return values[cfg.fieldCode];
        },
        valueBindChangeHandler(valueField,cmp){
            var value = cmp.getExtraFieldValue(valueField);

            this.setValue(value);
            if(this.form.model == 'new' && this.cfg.readOnly == true)this.hidden = value == null;
        }
    }
}