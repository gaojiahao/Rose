export default {
    data(){
        return {
            hidden:false
        }
    },
    created(){
        this.initVisible();
    },
    methods:{
        initVisible:function(){
            var cfg = this.cfg,
                fieldSet = this.$parent,
                form = fieldSet.form,
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
        }
    }
}