import {
 addBaseObject,
 updateBaseObject,
 saveAndStartWf,//保存并发起流程
 submitAndCalc,//保存并计算
 updateAppData//更新数据
} from "service/commonService";
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
              //  uploadComp = me.formView.down('r2Fileupload'),
              //  files = uploadComp ? uploadComp.getR2Value() : null,
                {relationKey} = me.$route.query;

            if (relationKey) {
                param.relationKey = relationKey;
            }
            // if (files && files.length) {
            //     param.biReferenceId = uploadComp.biReferenceId;
            // }
            if (isBindFlow) {
                proCode = me.workflows[0].procCode;
                wfPara[proCode] = me.approvalData(values);
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
                // uploadComp = me.formView.down('r2Fileupload'),
                // files = uploadComp ? uploadComp.getR2Value() : null,
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
            // if (files && files.length) {
            //     submitParam.biReferenceId = uploadComp.biReferenceId;
            // }

            //console.log('----', submitParam);
            addBaseObject(baseObjectKey, apiKey,submitParam).then(function(res) {
                me.handlerResopnse(res);
            }).catch(e => {
                me.$HandleLoad.hide();
            });
        },
        formatValues(values){
            var apiCfg = this.apiCfg,
                disableFieldset = this.disableFieldset||[],
                fieldCfgHash = apiCfg && apiCfg.groupCfg,
                fieldCfg,
                isList,
                root = {},
                fieldCode,
                value;
        
            if(fieldCfgHash){
                for(fieldCode in values){
                    value = values[fieldCode];
                    if(value && value.dataSet){ //grid or bom
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
                
                if (groupBoxStr){
                    insertValueIntoGroupBox(fieldCode,value,groupBoxStr,isList);
                } else {
                    if (isList) {
                        console.log('列表项 fieldCode:' + code + ' 需要配置数据容器！');
                    } else {
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
                    if (!root[groupBox]) {
                        root[groupBox] = {};
                    }
                    node = groupBoxNode = root[groupBox];
                    if (isList) {
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
                let {name} = me.$route.query;
                let {folder} = me.$route.params;
                me.$router.replace({
                    path: `/detail/${folder}/null`,
                    query: {
                        listId:me.listId,
                        transCode: me.transCode
                    }
                });
            }
        },
        submit(){
            var me = this,
                oprationType = me.model == 'new' ? 'add' : 'update',
                isBaseObject = me.viewInfo.config.isBaseObject,
                oprationObj = isBaseObject?'BaseObject':'AppData',
                handler = this[oprationType+oprationObj];
            
            //表单校验
            if (!me.isValid())return;

            this.$vux.confirm.show({
                content: '确认提交?',
                // 确定回调
                onConfirm: () => {
                    this.$HandleLoad.show();
                    handler();
                }
            });
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
           
           this.disableFieldset = [];
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
                   if(field.submitValue){
                        values[containerCode] = field.getSubmitData();
                   } else {
                        this.disableFieldset.push(containerCode);
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
               values[name] = fieldset.getValues();
            }

            return values;
        },
        getApprovalData(values){
            var approvalData = {},
                paramKey,
                fieldCode,
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
                wfPara[proCode] = me.approvalData(values);
                param.wfPara = JSON.stringify(wfPara);
            }
            //3.提交表单数据
            updateAppData(oprationType,param).then((res)=>{
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