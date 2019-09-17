<template>
    <div class="readonly-warp">
        <div v-if="curObj" class="obj-pic">
            <img :src="getImgPic(values)"  > 
         </div>
         <div class="readonly-warp-info">
            <template v-for="(item, index) in fields">
                <div  :key="index" v-if="item.kField">
                    <span >{{item.fieldLabel}}：</span>
                    <span >{{formatByType(values[item.fieldCode],item.xtype)}}</span>
                </div>
            </template>

            <template v-for="(item, index) in fields">
                <div  :key="index" v-if="!item.kField">
                    <span >{{item.fieldLabel}}：</span>
                    <span :class="{'key-info':item.kField===1}">{{formatByType(values[item.fieldCode],item.xtype)}}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import util from '@/common/util';
import objList from '../../common/const/obj-app';
var component = {
    props: ["fields", "values"],
    computed:{
        curObj:function() {
      
            if(!this.values || this.values.length < 1) return;
            let fieldSettingData = this.$r2FieldSetting,
                obj,
                objKey,
                fKey;
            
            this.fields.map(it=>{
                objKey = it.fieldCode.indexOf('_') > -1 ? it.fieldCode.split('_')[1] : it.fieldCode;
                fKey = it.fieldCode.split('_')[0];

                if(fieldSettingData[objKey]){
                    if(fieldSettingData[objKey]['objCode']){
                        obj = objList.getObjectByName(fieldSettingData[objKey]['objCode'])[0];
                    }
                }
                if(fieldSettingData[fKey]){
                    if(fieldSettingData[fKey]['kField']===1){
                        it.kField = 1;
                    }
                }
            });
            return obj;
        }
    },
    methods:{
        formatByType(value,type){
            if(value == null) return '-';
            if(~['r2Numberfield','r2Permilfield'].indexOf(type)){
                return util.permilFormat(value);
            } else {
                return value
            }
        },
        getImgPic(d) {
            let url;
            if(d){
                let pic = this.curObj ? this.curObj.picKey : '',
                    defaultUrl = this.curObj ? this.curObj.defaultUrl : 'wl_default03.png';
                url =  d[pic] ? d[pic] : '/static/' + defaultUrl;
            }else{
                url = require('assets/wl_default03.png');
            }
            return url;
        },
    }
}
export default Vue.component("RReadOnlyPart", component);
</script>

<style  lang="scss" scoped>
.readonly-warp{
    display: flex;
    padding: 0.05rem 0rem;
    .obj-pic >img{
            width:0.85rem;
    }
    &-info{
        margin-left: 0.05rem;
    }
}

.key-info{
    font-weight: bold !important;
}
</style>
