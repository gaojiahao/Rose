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
            var id = this.cfg.id,
                fieldSet = this.$parent,
                form = fieldSet.form;

            form.fieldMap[id] = this;
            this.form = form;
            this.valueChangeKey = 'value-change-' + id;
            this.initVisible();
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
    }
}