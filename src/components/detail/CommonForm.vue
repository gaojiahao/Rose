<template>
<!--通用form组件-->
<div class="detail_wrapper">
    <div class="basicPart">
      <div v-for="(fieldSet,index) in fieldSets" :key="index">
          <r-fieldset :cfg = "fieldSet" v-if="fieldSet.hiddenInRun == false && 'r2FieldSet' == fieldSet.xtype && fieldSet.isMultiple == false" :values="formData"/>
          <r-fieldset :cfg="{items:[fieldSet]}" :values="formData" v-if="fieldSet.xtype.indexOf('Grid') != -1 || fieldSet.isMultiple == true"/>
      </div>
    </div>
</div>
</template>
<script>
// 请求 引入
import { 
  isMyflow, 
  getListId, 
  getListById, 
  getSOList,
  getWorkFlow, 
  currentUser, 
  getFromStatus, 
  getAppExampleDetails 
} from 'service/detailService'
import { getFormViews, getFormConfig, saveAndCommitTask } from 'service/common/commonService'
export default {
    data() {
        return {
            transCode:'',
            listId:'',
            formViewUniqueId:'',
            fieldSets:[],
            formData:{}
        }
    },
    methods:{
        // 获取listid
        getListId(transCode) {
            return new Promise((resolve, reject)=>{
                getListId(transCode).then(data => {
                    if(data.length){
                        this.formViewUniqueId = data[0].uniqueId;
                        this.listId = data[0].listId;
                        resolve();
                    } else {
                        this.$vux.alert.show({
                            content: '抱歉，交易号有误，没有数据可以查看'
                        });
                    }
                });
            })
        },
        handlerFormData(formData){
            var key,
                key1,
                item,
                list;

            for(key  in formData){
                item = formData[key];
                if(item && 'object' === typeof item && 'dataSet' in item){
                    list = item.dataSet;
                    delete item.dataSet;
                    for(key1  in item){
                        formData[key1] = item[key1];
                        delete item[key1];
                    }
                    formData[key] = list;
                }
            }
            this.formData = formData;
        },
        async loadPage(){
            let { transCode } = this.$route.query;
            if (!transCode) {
                this.$vux.alert.show({
                content: '抱歉，交易号有误，请尝试刷新之后再次进入'
                });
                return;
            }
            this.transCode = transCode;
            await this.getListId(transCode);
            await this.loadFormCfg();
            await this.loadFormData(transCode);
            
        },
        loadFormData(transCode){
            return getSOList({formViewUniqueId: this.formViewUniqueId,transCode}).then(({formData = {},attachment = []}) => {
                this.handlerFormData(formData);
            });
        },
        loadFormCfg(){
           return getFormConfig(this.formViewUniqueId).then(data => {
                 let {config = [], dataSource = '[]', reconfig = {}} = data;
                 config.forEach(item => {
                    if (item.formViewPartId) {
                        let reconfigData = reconfig[`_${item.formViewPartId}`] || {};
                        item.items = item.items && item.items.map(cItem => {
                        let matched = reconfigData[cItem.fieldCode] || {};
                        return {...cItem, ...matched,}
                        });
                    }
                 });
                 this.fieldSets = config;
           })
        }
    },
    created(){
        this.loadPage();
    }
}
</script>