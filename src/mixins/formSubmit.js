import {
 saveAndStartWf,//保存并发起流程
 submitAndCalc//保存并计算
} from "service/commonService";
module.exports = {
   methods:{
        addFormData: function () {
            var me = this,
                isBaseObject = me.viewInfo.config.isBaseObject,
                handler = this[isBaseObject?'addBaseObject':'addAppData'];
            
            this.$vux.confirm.show({
                content: '确认提交?',
                // 确定回调
                onConfirm: () => {
                    this.$HandleLoad.show();
                    handler();
                }
            });
        },
        addAppData(){
            var me = this,
                formData,
                proCode,
                approvalData,
                wfPara = {},
                isBindFlow = me.workflow.length > 0 ? true : false,
                submitHandler = isBindFlow ? saveAndStartWf : submitAndCalc,
                values,
              //  uploadComp = me.formView.down('r2Fileupload'),
              //  files = uploadComp ? uploadComp.getR2Value() : null,
                {relationKey} = me.$route.query;

        

            //表单校验
            if (!me.isValid()){
                me.$HandleLoad.hide();
                return;
            } 

            values = me.getValues();
            me.formData = me.formatValues(formData);
            param = {
                listId: me.listId,
                biComment: formData.biComment,
                formKey: me.formKey,
                formData: JSON.stringify(me.formData)
            }
            if (relationKey) {
                param.relationKey = relationKey;
            }
            // if (files && files.length) {
            //     param.biReferenceId = uploadComp.biReferenceId;
            // }
            if (isBindFlow) {
                proCode = me.workflow[0].procCode;
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
                values = me.formView.getValues(),
                submitParam = {
                    listId: me.listId,
                    formData: values
                },
                isBindFlow = me.workflow.length > 0 ? true : false,
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
                approvalData = me.formView.getApprovalData(values);
                wfPara[proCode] = approvalData;
                submitParam.wfPara = JSON.stringify(wfPara);
                apiKey = '/saveAndStartWf';
            }

            //表单校验

            if (!me.isValid()) {
                me.$HandleLoad.hide();
                return;
            }
            // if (files && files.length) {
            //     submitParam.biReferenceId = uploadComp.biReferenceId;
            // }

            console.log('----', submitParam);


            me.dao.request(['/', baseObjectKey, apiKey].join(''), null, function (res) {
                Ext.getBody().unmask();
                var resopnse = me.handlerResopnse(res);
                if (resopnse) {
                    var submitFormView = r2.global.DAO.getFormViews(me.listId).filter(function (f) {
                        return f.viewType === 'submit';
                    });
                    var url = '/Form/index.html?model=new&view=' + submitFormView[0].uniqueId + '&list=' + me.listId;
                }

            }, 'post', submitParam);
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
                    if(value && value.dataSheet){ //grid or bom
                        root[fieldCode] = value;
                    } else {
                        insetValueIntoRoot(fieldCode,value);
                    }
                    
                }
            }
            return root;
            function insetValueIntoRoot(fieldCode,value){
                var fieldCfg = fieldCfgHash[fieldCode];
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
                {success = false, message = '提交失败'} = rs;

            this.$HandleLoad.hide()

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
        }
   }
}