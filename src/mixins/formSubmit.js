import {
 addBaseObject,
 updateBaseObject,
 saveAndStartWf,//保存并发起流程
 submitAndCalc,//保存并计算
 updateAppData,//更新数据
 saveAndCommitTask
} from "service/commonService";
import util from '@/common/util';
export default {
   methods:{
        addAppData(){
            var me = this,
                values = me.getValues(),
                formData = me.formatValues(values),
                proCode,
                wfPara = {},
                param = {
                    listId: me.listId,
                    biComment: formData.biComment,
                    formKey: me.formKey,
                    formData: JSON.stringify(formData)
                },
                isBindFlow = me.workflows.length > 0 ? true : false,
                submitHandler = isBindFlow ? saveAndStartWf : submitAndCalc,
                values,
                {relationKey} = me.$route.query;
                
            if(me.biReferenceId) {
                param.biReferenceId = me.biReferenceId;    
            }
            if (relationKey) {
                param.relationKey = relationKey;
            }
            if (isBindFlow) {
                proCode = me.workflows[0].procCode;
                wfPara[proCode] = me.getApprovalData(values);
                param.wfPara = JSON.stringify(wfPara);
            } 
            //3.提交表单数据
            submitHandler(param).then((res)=>{
                me.handlerResopnse(res);
            }).catch(e => {
                this.$HandleLoad.hide();
            });
        },
        addBaseObject(){
            var me = this,
                values = me.getBaseObjectValues(),
                submitParam = {
                    listId: me.listId,
                    formData: values
                },
                isBindFlow = me.workflows.length > 0 ? true : false,
                approvalData,
                proCode,
                wfPara = {},
                baseObjectKey = me.viewInfo.config.baseObjectKey,
                apiKey = '/save',
                {relationKey} = me.$route.query;

            if (relationKey) {
                submitParam.relationKey = relationKey;
            }

            if (isBindFlow) {
                proCode = me.workflows[0].procCode;
                approvalData = me.getApprovalData(values);
                wfPara[proCode] = approvalData;
                submitParam.wfPara = JSON.stringify(wfPara);
                apiKey = '/saveAndStartWf';
            }
            
            if(me.biReferenceId) {
                submitParam.biReferenceId = me.biReferenceId;    
            }

            //console.log('----', submitParam);
            addBaseObject(baseObjectKey, apiKey,submitParam).then(function(res) {
                me.handlerResopnse(res);
            }).catch(e => {
                me.$HandleLoad.hide();
            });
        },
        formatValues(values){
            var apiCfg = this.apiCfg,
                disableFieldset = [],
                multipleFieldset = [],
                fieldsets = this.$refs.fieldsetCt.$children,
                fieldCfgHash = apiCfg && apiCfg.groupCfg,
                fieldCfg,
                isList,
                root = {},
                fieldCode,
                value;
        
            //防止单一项映射进不提交的重复项容器。
            fieldsets.map(function(fieldset){
                if(!fieldset.submitValue)disableFieldset.push(fieldset.cfg.name);
                if(fieldset.cfg.isMultiple == true)multipleFieldset.push(fieldset.cfg.name);
            })

            if(fieldCfgHash){
                for(fieldCode in values){
                    value = values[fieldCode];
                    if(value && value.dataSet){ //grid or bom，设置列表数据
                        root[fieldCode] = root[fieldCode]||{};
                        root[fieldCode].dataSet = value.dataSet;
                    } else {
                        insetValueIntoRoot(fieldCode,value);
                    }
                    
                }
            }
            return root;
            function insetValueIntoRoot(fieldCode,value){
                var fieldCfg = fieldCfgHash[fieldCode],
                    isList = fieldCfg && fieldCfg.isList,
                    groupBoxStr = fieldCfg && fieldCfg.fieldContainer;
                
                if (groupBoxStr){//设置容器的字段
                    insertValueIntoGroupBox(fieldCode,value,groupBoxStr,isList);
                } else {
                    if (isList) {//列表数据必须放容器里
                        console.log('列表项 fieldCode:' + code + ' 需要配置数据容器！');
                    } else {//设置普通字段到根节点
                        setNode(root, fieldCode, value);
                    }
                        
                }
                        
            }
            function insertValueIntoGroupBox(fieldCode,value,groupBoxStr,isList){
                var groupBoxs = groupBoxStr && (~groupBoxStr.indexOf(',') ? groupBoxStr.split(',') : [groupBoxStr]),
                    groupBox,
                    groupBoxNode,
                    node,
                    i = 0,
                    l;
                
                for (i, l = groupBoxs.length; i < l; i++) {
                    groupBox = groupBoxs[i];
                    if (disableFieldset.indexOf(groupBox) != -1) continue;//避免单一项映射进被禁用的重复项容器。
                    if (isList && multipleFieldset.indexOf(groupBox) != -1)continue;//避免单一项被映射进重复项 
                    if (!root[groupBox]) {
                        root[groupBox] = {};
                    }
                    node = groupBoxNode = root[groupBox];
                    if (isList) { //后端需要某些单一项表现的像重复项，所以包装成重复项。
                        if (!groupBoxNode.dataSet) {
                            groupBoxNode.dataSet = [{}];
                        }
                        node = groupBoxNode.dataSet[0];
                    } 
                    setNode(node, fieldCode, value);
                }
                
            }
            function setNode(node, key, value) {
                if (!node) {
                    node = {};
                }
                node[key] = value === undefined ? null : value;//undefined会在json格式化时丢失
            }
        },
        handlerResopnse(rs){
            let me = this,
                {success = false, message = '提交失败',transCode} = rs;

            this.$HandleLoad.hide()
            if(transCode) me.transCode = transCode;
            if (success) {
                message = '提交成功';
                this.$emit('change', true);
            }

            this.$vux.alert.show({
                content: message,
                onHide: () => {
                    if (success) {
                        judgePage();
                    }
                }
            });
            function judgePage(){
                let {name,folder,fileName} = me.$route.query;

                if(me.$route.name == 'DETAIL') {
                    router.go(0);
                }
                me.$router.replace({
                    path: `/detail/${me.listId}/0`,
                    query: {
                        folder,
                        name,
                        fileName,
                        transCode:me.transCode
                    }
                });
            }
        },
        submit(){
            var me = this,
                oprationType = me.model == 'new' ? 'add' : 'update',
                isBaseObject = me.viewInfo.config.isBaseObject,
                oprationObj = isBaseObject?'BaseObject':'AppData',
                opration = oprationType+oprationObj;
            
            //表单校验
            if (!me.isValid())return;
            if(!me.initNumberVerSel())return;
            
            this.$vux.confirm.show({
                content: '确认提交?',
                // 确定回调
                onConfirm: () => {
                    this.$HandleLoad.show();
                    me[opration]();
                }
            });
        },
        initComputed:function(){
            var computed = parseComputed(this.viewInfo.config.formComputed);

            if(computed)util.setFormulas(this,computed);

            function parseComputed(cfg){
                var cfgArr,
                    computed = {};

                if(!cfg) return null;

                try{
                    cfgArr = JSON.parse(cfg);
                }catch(e){
                    console.log('公式解析bug');
                    return null;
                }
                util.each(cfgArr,(cfg)=>{
                    var key = cfg.key,
                        fn;

                    try{
                        fn = eval('('+ cfg.fn +')');
                        if(window.isDebug)console.log(key,fn);
                        computed[key] = fn;
                    } catch(e) {
                        console.log('公式[' + key +']语法bug');
                    }
                });
                return computed;
            }
        },
        setValue(fieldCode,value){
            this.$set(this.formData,fieldCode,value);
        },
        getValues(){
            var values = {},
                fieldMap = this.fieldMap,
                isGrid,
                value,
                fieldCode,
                containerCode,
                id,field;

           for(id in fieldMap){
               field = fieldMap[id];
               isGrid = !!field.cfg.columns;
               
               if(!isGrid){
                    if(field.submitValue){  
                        fieldCode = field.cfg.fieldCode;   
                        value = field.getSubmitData(); 
                        values[fieldCode] = value == null ? null : value;
                    } 
               } else {
                   containerCode = field.containerCode;
                   if(field.$parent.submitValue&& (!field.$parent.hidden)){
                        values[containerCode] = field.getSubmitData();
                   }
               }
           }
    
           return values;
        },
        getBaseObjectValues:function(){
            var me = this,
                values = {},
                fieldsets =  me.$refs.fieldsetCt.$children,
                i=0,l = fieldsets.length,fieldset;
            
            for(;i<l;i++){
               fieldset = fieldsets[i];
               name = fieldset.name;
               try{
                   if(name){
                        values[name] = fieldset.getValues();
                    }
                } catch(e){
                    console.log(e)
                }
            }

            return values;
        },
        getApprovalData(){
            var me = this,
                approvalData = {},
                paramKey,
                fieldCode,
                values = this.formData,
                cmp,
                wfParamFieldMap = this.wfParamFieldMap;

            for(paramKey in wfParamFieldMap){
                fieldCode = wfParamFieldMap[paramKey];
                approvalData[paramKey] = values[fieldCode];
            }
            return approvalData;
        },
        registField(field){
            var cfg = field.cfg;

            this.fieldMap[cfg.id] = this.fields[cfg.fieldCode] = field;
        },
        updateAppData:function(){
            var me = this,
                values = me.getValues(),
                formData = me.formatValues(values),
                isBindFlow = me.workflows.length > 0 ? true : false,
                //没有流程的修改有两种情况：1.草稿，编辑并进行计算updateAndCalc 2.已生效要修改:updateData
                //有流程的修改有三种情况：1.草稿，编辑并发起流程2.驳回的，不走这个接口。3.有流程已生效的:updateData
                oprationType = me.model == 'revise' ? 'updateData':(isBindFlow ? 'updateAndStartWf' : 'updateAndCalc'),
                wfPara = {},
                proCode,
                param = {
                    listId: me.listId,
                    biComment: formData.biComment,
                    formKey: me.formKey,
                    biReferenceId: me.biReferenceId,
                    formData: JSON.stringify(formData)
                };

            if (isBindFlow) {
                proCode = me.workflows[0].procCode;
                wfPara[proCode] = me.getApprovalData(values);
                param.wfPara = JSON.stringify(wfPara);
            }
            //3.提交表单数据
            updateAppData(oprationType,param).then((res)=>{
                me.handlerResopnse(res);
            }).catch(e => {
                this.$HandleLoad.hide();
            });
        },
        saveAndCommitTask(comment){
            var me = this,
                values = me.getValues(),
                taskId = me.taskInfo.taskId,
                transCode = me.transCode,
                approvalData = me.getApprovalData(),
                formData = me.formatValues(values),
                comment = comment || '',
                param;

            if (!me.isValid()){
                this.$HandleLoad.hide();    
                return;
            }
            if(!me.initNumberVerSel()){
                this.$HandleLoad.hide();    
                return;    
            }
            
            approvalData.transCode = transCode;
            approvalData.result = me.taskType;
            approvalData.taskId = taskId,           
            approvalData.comment = comment;
    
            param = {
                listId: me.listId,
                biComment: formData.biComment,
                biReferenceId: me.biReferenceId,
                formData: JSON.stringify(formData),
                wfPara: JSON.stringify(approvalData)
            }
             //3.提交表单数据
            saveAndCommitTask(param).then((res)=>{
                me.handlerResopnse(res);
            }).catch(e => {
                this.$HandleLoad.hide();
            });
        },
        updateBaseObject:function(){
            var me = this,
                values = me.getBaseObjectValues(),
                proCode,
                submitParam = {
                    listId: me.listId,
                    formData: values,
                    wfPara: null,
                    biReferenceId: me.biReferenceId
                },
                isBindFlow = me.workflows.length > 0 ? true : false,
                wfPara = {},
                approvalData,
                apiKey = '/updateAndEffective',
                baseObjectKey = me.viewInfo.config.baseObjectKey;

            if (isBindFlow) {
                proCode = me.workflows[0].procCode;
                approvalData = me.getApprovalData(values);
                wfPara[proCode] = approvalData;
                submitParam.wfPara = JSON.stringify(wfPara);
                apiKey = '/updateAndStartWf';
            }

            updateBaseObject(baseObjectKey, apiKey,submitParam).then(function(res) {
                me.handlerResopnse(res);
            }).catch(e => {
                me.$HandleLoad.hide();
            });
        }
   }
}