<template>
    <div class='pages stow-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="wrapper">
                <checklist  :options="commonList" label-position="left" v-model="isPutawat" :max="1" @on-change="handlerChangeWay"></checklist>
                <div class="scanCodeInfo">
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">托盘码</label>
                            <input 
                                type='text' 
                                v-model="scanCodeInfo.trayCode" 
                                placeholder="请扫码" 
                                ref='trayCode'
                                class='property_val' 
                                @change="handlerScanTrayCode"
                                @focus="handleOnFocus($event)" />
                            <i class="iconfont" @click="handlerClickScanIcon('trayCode')">&#xe661;</i>
                        </div>
                    </div>
                    <div class="vux-1px-t" v-if="isPutawat.length>0">
                        <div class='each_property' >
                            <label class="required">库位码</label>
                            <input 
                                type='text' 
                                v-model="scanCodeInfo.spCode" 
                                placeholder="请扫码" 
                                ref='spCode'
                                class='property_val' 
                                @change="handlerScanSpCode"
                                @focus="handleOnFocus($event)" />
                            <i class="iconfont" @click="handlerClickScanIcon('spCode')">&#xe661;</i>
                        </div>
                    </div>
                </div>
                <div  class="wms-matter-part" ref="wmsMatterPart">
                    <div class="header" >
                        <div>托盘明细</div>
                        <div>
                            <span v-if="!matterModifyClass" @click="handlerChangeState">编辑</span>
                            <span v-if="matterModifyClass" @click="handlerChangeState">完成</span>
                        </div>
                    </div>
                    <div  class="trays-warp">
                        <ul class="trays">
                            <li v-for="(tray,index) in trays" :key="index" 
                                :class="{mater_delete : matterModifyClass}"
                                class="tray vux-1px-t">
                                
                                <div class="tray_info">
                                    <div>托盘码:{{tray.cardCode}}</div>
                                    <div>库位编码:{{tray.storehouseOutCode}}</div>
                                    <div>库区:{{tray.warehouseName_storehouseOutCode}}</div>
                                </div>
                                <div class='delete_icon' 
                                    @click="handlerSelectItem(index)" 
                                    v-if='matterModifyClass'>
                                    <x-icon 
                                        type="ios-checkmark" 
                                        size="30" 
                                        class="checked" 
                                    v-show="showSelIcon(index)"></x-icon>
                                    <x-icon 
                                        type="ios-circle-outline" 
                                        size="30" 
                                        v-show="!showSelIcon(index)"></x-icon>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
         <!-- 底部按钮 -->
        <op-button 
            :is-modify="matterModifyClass" :hide="btnIsHide" 
            :all-check="isCheckAll()" 
            @on-submit="handlerSubmit" 
            @on-check-all="handlerCheckAll"
            @on-delete="handlerDeleteCheckd">
        </op-button>
        <!-- 提示信息 -->
        <toast  v-model="showTost" type="text" :time="3000" is-show-mask :text="tostText" position="top" width="20em" ></toast>

        <!-- 固定title -->
	    <section class="topFixed" v-show="isScroll" :class="isScroll == true ? 'isFixed' : ''" @click="toReferrals" >
	        <div>托盘明细</div>
	        <div >
	            <div class="fixed-button">继续扫码</div>
	        </div>
	    </section>
    </div>
</template>

<script>
import { Toast  } from 'vux'

import OpButton from 'components/apply/commonPart/OpButton'
import { 
    saveAndStartWf, 
    saveAndCommitTask, 
    submitAndCalc, 
    getPriceFromSalesContractAndPrice, 
    updateData} from 'service/commonService'
import WebContext from 'service/commonService'
import {getLocationByPallet,getLocationInfo} from 'service/wmsService'
 
import { getSOList } from 'service/detailService'
import scanVoice from '@/plugins/scanVoice'

import { scanQRCode} from 'plugins/wx/api'
// mixins 引入
import wmsCommon from 'mixins/wmsCommon'
import { Checklist } from 'vux'

import { debug, debuglog } from 'util';
export default {
    data(){
        return {
            scanCodeInfo:{
                boxCode:'',
                trayCode:''
            },
            commonList: [ '是否上架'],
            isPutawat:[],
            trays:[],
            selItems: [],                               // 选中的要删除的物料
            matterModifyClass : false,                  // 删除状态,
            btnIsHide:false,
            showTost:false,
            tostText:'',
            formViewUniqueId: '2e5631e6-7232-49b1-a773-75c25ce9aa78', // 修改时的UniqueId
            matterInfoConfig:{
                specification:"规格",
                batchNo:"生产批号",
                productionDate:"生产日期",
                assMeasureUnit:"采购单位", //采购单位
                assMeasureDescription:"包装规格",//包装规格
            },
        }
    },
    mixins: [wmsCommon],
    computed: {
        // 将选中删除的物料 转换成 数组
        checkList() {
            let newArr = [].concat.apply([], Object.values(this.selItems));
            return newArr
        },
        
    },
    components: {
        OpButton,
        Toast,
        Checklist
    },
    methods:{
        handlerChangeWay(){
            this.trays = [];
            this.$refs.trayCode.focus();
        },
        // 输入框获取焦点，内容选中
        handleOnFocus(e) {
            event.currentTarget.select();
            return false;
        },
        handlerClickScanIcon(refKey){
            this.$refs[refKey].focus();
        },
        //扫托盘码
        handlerScanTrayCode(){
            if(!this.scanCodeInfo.trayCode) return;
            let pallet = this.scanCodeInfo.trayCode;

             if(this.trays.filter(t=>{ return t.cardCode === pallet}).length){
                this.tostText = '此托盘码已经扫码过啦!';
                this.showTost = true;
                this.scanCodeInfo.trayCode = '';
                scanVoice.error();
                return;
            }

            getLocationByPallet(pallet).then(res=>{

                //如果是上架
                if(this.isPutawat.length){
                    if(!res.dataCount){
                        this.$refs.spCode.focus();
                    }else{
                        let palletInfo = res.tableContent[0];
                        this.$vux.alert.show({
                            content:`此托盘码已上架在【${palletInfo.warehouseName}】，无需再次上架!`
                        });
                        this.scanCodeInfo.trayCode = '';
                        this.$refs.trayCode.focus();
                        scanVoice.error();
                    }
                }else{
                     if(!res.dataCount){
                        this.showTost = true;
                        this.tostText = '此托盘码并无关联库位，无需下架!'
                        this.scanCodeInfo.trayCode = '';
                        scanVoice.error();
                    }else{
                        let palletInfo = res.tableContent[0];
                        this.trays.push({
                            cardCode:palletInfo.pallet,
                            warehouseName_storehouseOutCode:palletInfo.warehouseName,
                            storehouseOutCode:palletInfo.location
                        });
                        this.scanCodeInfo.trayCode = '';
                        scanVoice.success();
                    }
                }
               
            });
           
        },
        handlerScanSpCode(){
            if(!this.scanCodeInfo.trayCode){
                this.tostText = '请先扫托盘码!';
                this.showTost = true;
                this.scanCodeInfo.spCode = '';
                scanVoice.error();
                return;
            }

            if(this.trays.filter(t=>{ return t.storehouseOutCode === this.scanCodeInfo.spCode}).length){
                this.tostText = '此库位码已经扫码过啦!';
                this.showTost = true;
                this.scanCodeInfo.spCode = '';
                scanVoice.error();
                return;
            }

            getLocationInfo(this.scanCodeInfo.spCode).then(res=>{
                if(res.dataCount){
                    let wh  = res.tableContent[0];
                    this.trays.push({
                        cardCode:this.scanCodeInfo.trayCode,
                        storehouseOutCode:this.scanCodeInfo.spCode,
                        warehouseName_storehouseOutCode:wh.locationName
                    });
                    this.scanCodeInfo.trayCode = '';
                    this.scanCodeInfo.spCode ='';
                    this.$refs.trayCode.focus();
                    scanVoice.success();
                }else{
                    this.tostText = '此库位码无效,在基础数据中,未查询到该库位信息!';
                    this.showTost = true;
                    scanVoice.error();
                    return;
                }
            });
           
        },
        isCheckAll(){
            return this.selItems.length === this.trays.length;
        },
        // 展开可删除状态
        handlerChangeState(){
            this.matterModifyClass = ! this.matterModifyClass;
            this.selItems = [];
        },
        handlerCheckAll(){
            // 如果已全部选中 则清除所有选中状态
            if(this.isCheckAll()){
                this.selItems = [];
                return;
            }
            this.selItems = [];
            this.trays.map((tray,idx)=>{
                this.selItems.push(idx)
            });
        },
        handlerDeleteCheckd(){
            this.$vux.confirm.show({
                content: '确认删除?',
                // 确定回调
                onConfirm: () => {
                    // 被选中删除的物料
                    this.selItems.map(sel=>{
                        this.trays.map((tray,idx)=>{
                            if(sel === idx){
                                tray.isDelete = true;
                            }
                        });
                    });

                    this.trays = this.trays.filter(tray=>{
                        return !tray.isDelete;
                    })

                    this.selItems = [];
                    this.matterModifyClass = false;
                }
            })
        },
        // 选中明细
        handlerSelectItem(sItem) {
            let arr = this.selItems;
            let delIndex = arr.findIndex(item => item === sItem);
            //若存在重复的 则清除
            if (delIndex !== -1) {
                arr.splice(delIndex, 1);
                return;
            }
            arr.push(sItem);
        },
        showSelIcon(index){
            return this.checkList.includes(index);;
        },
        transfromDataSource(item){
            return {
                transMatchedCode: this.scanCodeInfo.postCode,//被核销交易号
                transObjCode: item.inventoryCode,//物料编码
                tdProcessing:item.processing,//加工属性
                assMeasureUnit: item.assMeasureUnit,//采购单位
                assMeasureDescription: item.assMeasureDescription,//产品规格
                assMeasureScale: item.assMeasureScale,//主计倍数
                specification:item.specification,//规格
                tdQty: item.tdQty,
            }
        },
        transfromViewData(box){
            return {
                transMatchedCode: box.transMatchedCode,
                transObjCode: box.transObjCode,
                inventoryCode:box.transObjCode,
                inventoryName:box.inventoryName_transObjCode,
                storehouseInCode:box.storehouseInCode,
                tdProcessing: box.tdProcessing,
                assMeasureUnit: box.measureUnit,
                assMeasureDescription: box.assMeasureDescription,
                assMeasureScale: box.assMeasureScale,
                specification:box.specification_transObjCode,
                tdQty: box.tdQty,//本次码垛
                assistQty:  box.assistQty,
                batchNo: box.batchNo,
                productionDate: box.productionDate,
                boxCode:box.boxCode,
                boxRule:box.boxRule
            }
        },
        handlerSubmit(){
            let validate = true;
            let errMsg=``;

           
            if(this.trays.length===0){
                this.$vux.alert.show({
                    content:"托盘明细不能为空!"
                });
                return;
            }

            if(!validate){
                this.$vux.alert.show({
                    content:errMsg
                });
                return;
            }
             // 准备提交
            this.$vux.confirm.show({
                content: '确认提交?',
                // 确定回调
                onConfirm: () => {
                    this.$HandleLoad.show();
                    const currentUser = WebContext.WebContext.currentUser;
                    let data={};
                    let formData={
                        handlerName: currentUser.name,
                        handlerUnitName: currentUser.sysDeptList && currentUser.sysDeptList[0] ? currentUser.sysDeptList[0].groupName : '',
                        handlerRoleName: currentUser.sysRoleList[0].name,
                        handler: currentUser.userId,
                        handlerUnit:  currentUser.sysDeptList && currentUser.sysDeptList[0] ? currentUser.sysDeptList[0].groupId : '',
                        handlerRole: currentUser.sysRoleList[0].id,
                        creator: currentUser.userId,
                        modifer: currentUser.userId,
                        biId:'',
                        handlerEntity: currentUser.entityId,
                        biProcessStatus:null,
                        containerInWarehouseManager:'',
                        biComment:'',
                        outPut:{
                            whether:this.isPutawat.length?1:0,
                            dataSet:this.trays
                        }
                    };

                    let submitData={
                        listId: this.$route.params.listId,
                        biComment: '',
                        biReferenceId:this.biReferenceId,
                        formData:JSON.stringify(formData),
                    };

                    let opeartion = submitAndCalc;

                    if(this.isModify){
                        opeartion = updateData;
                    }else{
                        delete submitData.biReferenceId;
                    }

                    this.saveData(opeartion,submitData);
                   
                }
            })
        },
        saveData(request, submitData) {
            this.$HandleLoad.show();
            request(submitData).then(data => {
                this.$HandleLoad.hide();
                let {success = false, message = '提交失败'} = data;
                if (success) {
                    message = '提交成功';
                    this.$emit('change', true);
                }
                this.$vux.alert.show({
                    content: message,
                    onHide: () => {
                        if (success) {
                            this.judgePage();
                        }
                    }
                });
            }).catch(e => {
                this.$HandleLoad.hide();
            })
        },
        getFormData(){
            return getSOList({
                formViewUniqueId: this.formViewUniqueId,
                transCode:this.transCode
            }).then(({success = true, formData = {}, attachment = []}) => {
                // http200时提示报错信息
                if (success === false) {
                    this.$vux.alert.show({
                        content: '抱歉，数据有误，暂无法查看',
                        onHide: () => {
                            this.$router.back();
                        }
                    });
                    return;
                }
                let {outPut = {}} = formData;
                this.biReferenceId = formData.biReferenceId;
                this.scanCodeInfo.trayCode = outPut.cardCode;
                if(outPut.whether){
                    this.isPutawat = this.commonList;
                }
                setTimeout(()=>{
                    this.trays = outPut.dataSet;
                },100);
            })
        },
        // 判断是返回上一页还是跳转详情页
        judgePage() {
            // 在企业微信的提醒中打开重新提交页面history为1，此时终止成功则跳转详情页
            if (window.history.length !== 1) {
                this.$router.go(-1);
            }
            else {
                let {name,folder, fileName} = this.$route.query;
                let {listId} = this.$route.params;
                this.$router.replace({
                path: `/detail/${listId}/0`,
                query: {
                    name,
                    folder,
                    fileName,
                    transCode: this.transCode
                }
                });
            }
        }
    },
    created(){
    },
    mounted(){

        //扫箱码后确定的申请单号信息
        this.trayCode = '';
        //已扫箱码信息集合

        this.$refs.trayCode.focus();
        if(this.$route.query.transCode){
            this.transCode = this.$route.query.transCode;
            this.getFormData();
            this.biReferenceId = '';
            this.isModify = true;
        }
    }
}
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';
  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    input{  
      border: none;
      outline: none;
      font-size: .14rem;
      flex:none;
    }
    label{
      color: #696969;
    }
   .iconfont{
        font-size: .20rem
    }
    .required {
      color: #3296FA;
      font-weight: bold;
    }
    .property_val {
      text-align: right;
    }
    .readonly {
      color: #999;
    }
    .picker {
      display: flex;
      align-items: center;
      .icon-right{
        width: .08rem;
        height: .14rem;
        margin-left: .1rem;
      }
    }
  }
.scanCodeInfo {
    background: #fff;
    padding: 0 .15rem;
    font-size: 0.14rem;
    color: #333;
    .weui-cell {
      padding: .1rem 0;
      /deep/ .weui-textarea {
        text-align: right;
      }
    }
}
.wms-matter-part{
    overflow: hidden;
    margin-top: .1rem;
    background: #FFF;
    // height: calc(100% - 1.60rem);
    .header{
        font-size: 18px;
        height: .4rem;
        line-height: .4rem;
        color: #696969;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding: 0 .15rem;
        border-bottom: 1px solid #e8e8e8;
    }
    .trays-warp{
        overflow: hidden;
        position: relative;
        background: #FFF;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        padding: 0 .15rem;
        .trays{
            font-size: 14px;
            color: #696969;
            .mater_delete{
                position: relative;
                padding-left: 0.3rem;
            }
            .tray{
                width: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                padding-top: .05rem;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                justify-content: space-between;
                .tray_info{
                    -webkit-box-flex: 1;
                    -ms-flex: 1;
                    flex: 1;
                    position: relative;
                    margin-left: .12rem;
                    padding-bottom: .05rem;
                }
            }
        }
        .delete_icon{
            left: 0;
            top: 30%;
            height: 20px;
            fill: #999;
            position: absolute;
            transform: translateY(-50%);
            .checked{
                fill: #FA7138;
            }
        }
    }
  }


.topFixed {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2;
    background: #fff;
    width: 100%;
    padding: 0 .10rem;
    box-shadow: 2.9px 5.2px 8px 0px rgba(109, 109, 109, 0.1);
    height: .44rem;
    line-height: .44rem;
     display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    padding: 0 .15rem;
    .fixed-button{
        background-color: #3296fa;
        border-radius: .5rem;
        display: initial;
        padding: .03rem .09rem;
        color: white;
        font-size: 16px;
        box-shadow: 2.9px 5.2px 8px 0px rgba(109, 109, 109, 0.1);
    }
}
</style>

