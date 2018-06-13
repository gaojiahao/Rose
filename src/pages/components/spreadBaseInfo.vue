<template>
    <div>
        <!-- 表单基本信息 -->
        <group :title="formBase.title">

            <div v-for="(val,idx) in formBase.items" :key="idx" class="formBase" v-if="!val.hiddenInRun">
                <!-- 交易类型，经办主体 -->
                <x-input v-if="val.xtype=='r2Textfield'"
                :title='val.fieldLabel'
                :value="val.defaultValue.data[0]"
                ></x-input>
                <!-- 经办人，所属区域，经办部门，经办角色 -->
                <popup-picker v-else-if="val.xtype=='r2Selector'||val.xtype=='r2Datefield'||val.xtype=='r2Combo'"
                :title="val.fieldLabel"
                v-model="val.defaultValue.data"
                :data="val.defaultValue.PopupPicker"
                @on-hide="selectInfo(idx,val,val.defaultValue.data,$event)"
                ></popup-picker>
                
            </div>

        </group>
    </div>
</template>
<script>
import { Cell, Group, XInput, PopupPicker, XTextarea, numberComma } from 'vux'
import createService from '../../service/createService.js'
export default {
    props:['info','user','operatorlist'],
    name:'spreadBaseInfo',
    components:{
        Cell,
        Group,
        XInput,
        PopupPicker,
        XTextarea,
    },
    filters:{
        numberComma
    },
    data(){
        return{
            formBase:'',
            xinput:[],
            popups:[],
            operator:[],
            area:[],
            department:[],
            role:[],
            userBase:'',
            areaBase:'',
            departmentBase:''
        }
    },
    watch: {
        //info初始化数据
        info: {
            handler(val){
                let that=this;
                that.userBase=that.user;
                for(let i = 0 ; i<that.info.length; i++){
                    that.formBase=that.info[i];
                }
            },
            deep: true
        }
    },
    methods:{
        //default信息
        defaultInfo(i,name){
            let that=this;
            that.formBase.items[i].defaultValue.PopupPicker=[[]];
            if(!name){
                name=''
            }
            if(name.indexOf(",") != -1){
                that.formBase.items[i].defaultValue.data=[name.split(',')[0]];
                for(let s = 0 ; s<name.split(',').length; s++){
                    that.formBase.items[i].defaultValue.PopupPicker[0].push({
                        name:name.split(',')[s],
                        value:name.split(',')[s]
                    })
                }
            }else{
                that.formBase.items[i].defaultValue.data=[name];
                that.formBase.items[i].defaultValue.PopupPicker[0].push({
                    name:name ||'',
                    value:name ||''   
                });
            };
        },
        //选择信息
        selectInfo(idx,info,val,event){
            let that=this;
            if(event){
                if(info.dataSource!=''){
                    //默认选择
                    if(info.fieldLabel=="经办人"){
                        let dataSource=JSON.parse(info.dataSource);
                        if(dataSource.type=='remoteData'){
                            createService.getCurrentUser(val[0]).then(res=>{
                                that.$parent.userinfo=res.tableContent;
                                for(let i = 0 ; i < that.formBase.items.length ; i++){
                                    if( that.formBase.items[i].fieldLabel=="经办人"){
                                        //经办人
                                        that.formBase.items[i].defaultValue.data=[res.tableContent[0].nickname];
                                    }else if( that.formBase.items[i].fieldLabel=="所属区域"){
                                        //所属区域
                                        that.defaultInfo(i,res.tableContent[0].area);
                                    }else if( that.formBase.items[i].fieldLabel=="经办部门"){
                                        //经办部门
                                        that.defaultInfo(i,res.tableContent[0].dept);
                                    }else if( that.formBase.items[i].fieldLabel=="经办角色"){
                                        //经办角色
                                        that.defaultInfo(i,res.tableContent[0].role);
                                    }
                                };
                            })
                        }else if(dataSource.type=='formData'){

                        }else if(dataSource.type=='staticData'){

                        }
                    }else if(info.fieldLabel=="所属区域"){
                        //选择所属区域
                        let areaData={
                            userId: that.userBase[0].userId,
                            page: 1,
                            start: 0,
                            limit: 10000,
                        };
                        createService.getRemoteData(JSON.parse(info.dataSource).data.url,areaData).then(e=>{
                            info.defaultValue.PopupPicker.length=0;
                            let areaArr=[];
                            if(e.tableContent.length!=0){
                                for(let i = 0 ; i <e.tableContent.length ; i++){
                                    areaArr.push({
                                        name:e.tableContent[i].userGroupName,
                                        value:e.tableContent[i].userGroupName    
                                    });
                                }
                            }else{
                                 areaArr.push({
                                        name:'',
                                        value:''   
                                    });
                            }
                            that.areaBase=e.tableContent;
                            info.defaultValue.PopupPicker.push(areaArr);
                        })
                    }else if(info.fieldLabel=="经办部门"&&that.areaBase!=''){
                        // 选择经办部门
                        // let areaData={
                        //     userId: that.userBase[0].userId,
                        //     parentId: that.areaBase[0].userGroupId,
                        //     page: 1,
                        //     start: 0,
                        //     limit: 10000,
                        // };
                        // createService.getRemoteData(JSON.parse(info.dataSource).data.url,areaData).then(e=>{
                        //     info.defaultValue.PopupPicker.length=0;
                        //     let areaArr=[];
                        //     if(e.tableContent.length!=0){
                        //         for(let i = 0 ; i <e.tableContent.length ; i++){
                        //             areaArr.push({
                        //                 name:e.tableContent[i].userGroupName,
                        //                 value:e.tableContent[i].userGroupName    
                        //             });
                        //         }
                        //     }else{
                        //          areaArr.push({
                        //                 name:'',
                        //                 value:''   
                        //             });
                        //     }
                        //     that.departmentBase=e.tableContent;
                        //     info.defaultValue.PopupPicker.push(areaArr);
                        // })
                    }else{
                        return;
                    }
                    
                }else{
                    return;
                }
            }
        }
    },
    mounted(){

    }
}
</script>
<style>
    .formBase{
        border-bottom: 1px solid #D9D9D9;
    }
</style>

