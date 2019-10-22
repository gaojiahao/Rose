<template>
    <div class='pages stow-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="wrapper">
                <div class="scanCodeInfo">
                    <div class='each_property' >
                            <label class="required">申请单号</label>
                            <input 
                                type='text' 
                                v-model="scanCodeInfo.postCode" 
                                placeholder="请扫码" 
                                ref='postCode'
                                class='property_val' 
                                @change="handlerScanPostCode"
                                @focus="handleOnFocus($event)" />
                            <i class="iconfont" @click="handlerClickScanIcon('postCode')">&#xe661;</i>
                        </div>
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
                    <div class="vux-1px-t">
                        <div class='each_property' >
                                
                            <label class="required">货品箱码</label>
                            <input 
                                ref='boxCode'
                                type='text' 
                                v-model="scanCodeInfo.boxCode" 
                                placeholder="请扫码" 
                                @change="handlerScanBoxCode"
                                class='property_val' 
                                @focus="handleOnFocus($event)" />
                            <i class="iconfont" @click="handlerClickScanIcon('boxCode')">&#xe661;</i>
                        </div>
                    </div>
                    
                </div>
                <div  class="wms-matter-part" ref="wmsMatterPart">
                    <wms-matter-part 
                        title='码垛明细'
                        :matterModifyClass="matterModifyClass"
                        :matters="matters"
                        :handlerSelectItem="handlerSelectItem"
                        :showSelIcon="showSelIcon"
                        :handlerChangeState="handlerChangeState"    
                        :getGroupInfo="getGroupInfo"
                        :matterInfoConfig="matterInfoConfig"
                        >
                    </wms-matter-part>
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
	        <div>码垛明细</div>
	        <div >
	            <div class="fixed-button">继续扫码</div>
	        </div>
	    </section>
    </div>
</template>

<script>
import { Flexbox, FlexboxItem, Cell,Toast  } from 'vux'

import RNumber from 'components/public/RNumber'
import OpButton from 'components/apply/commonPart/OpButton'
import WmsMatterPart from 'components/apply/commonPart/wmsMatterPart'

import { 
    saveAndStartWf, 
    saveAndCommitTask, 
    submitAndCalc, 
    getPriceFromSalesContractAndPrice, 
    updateData} from 'service/commonService'
import WebContext from 'service/commonService'
import {getStorageShelf, getInventoryInfoByMatCode ,getPreShelfInvInfoByBoxCode} from 'service/wmsService'
 
import { getSOList } from 'service/detailService'
import scanVoice from '@/plugins/scanVoice'

import { scanQRCode} from 'plugins/wx/api'
// mixins 引入
import wmsCommon from 'mixins/wmsCommon'

import { debug, debuglog } from 'util';
export default {
    data(){
        return {
            scanCodeInfo:{
                boxCode:'',
                trayCode:''
            },
            matters:[],
            selItems: [],                               // 选中的要删除的物料
            matterModifyClass : false,                  // 删除状态,
            btnIsHide:false,
            showTost:false,
            tostText:'',
            formViewUniqueId: '133d7d6a-14b5-4d1f-a259-4a2d0f1c8b83', // 修改时的UniqueId
            matterInfoConfig:{
                specification:"产品规格",
                batchNo:"生产批号",
                productionDate:"生产日期",
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
        Flexbox,
        FlexboxItem,
        RNumber,
        OpButton,
        WmsMatterPart,
        Toast
    },
    methods:{
        // 输入框获取焦点，内容选中
        handleOnFocus(e) {
            event.currentTarget.select();
            return false;
        },
        handlerClickScanIcon(refKey){
            this.$refs[refKey].focus();
        },
        handlerScanPostCode(){
             if(!this.scanCodeInfo.postCode) return;

            if(this.postCode && this.scanCodeInfo.postCode != this.postCode && this.matters.length>0){
               scanVoice.error();
                this.$vux.confirm.show({
                    content: '当前扫的申请单号与前面扫的申请单号不一致，是否更换？以重新获取待上架数据',
                    // 确定回调
                    onConfirm: () => {
                        this.postCode = this.scanCodeInfo.postCode;
                        this.scanCodeInfo.trayCode = '';
                        this.warehouse = undefined;
                        this.matters = [];
                        this.boxCodesMap = {};
                        this.shelfList = [];
                    },
                    onCancel:() =>{
                        this.scanCodeInfo.postCode = this.postCode;
                        this.$refs.trayCode.focus();
                    }
                })
            }else{
                
                this.handlerSetMatters(this.scanCodeInfo.postCode,res=>{
                    if(!res.dataCount){
                        scanVoice.error();
                        this.showTost = true;
                        this.tostText = '当前申请单号并没有待上架的数据,请重新扫码!';
                        this.scanCodeInfo.postCode = '';
                        this.$refs.postCode.focus();
                    }else{
                        scanVoice.success();
                        this.postCode = this.scanCodeInfo.postCode;
                        this.$refs.trayCode.focus();
                    }
                });
            }
        },
        //扫托盘码
        handlerScanTrayCode(){
            if(!this.scanCodeInfo.postCode) {
                scanVoice.error();
                this.showTost = true;
                this.tostText = '请先扫申请单号!';
                this.scanCodeInfo.trayCode = '';
                this.$refs.postCode.focus();
            }

            if(!this.scanCodeInfo.trayCode) return;

            var reg =  /[a-zA-Z]{5}[0-9]{8}/;
            if(!reg.test(this.scanCodeInfo.trayCode)){
                scanVoice.error();
                this.$vux.alert.show({
                    content:"此托盘码不符合(5位英文字母+8位数字)的规则,请重新贴码!",
                    onHide:()=>{
                        this.scanCodeInfo.trayCode = '';
                        this.$refs.trayCode.focus();
                    }
                });
                return;
            }
            if(this.trayCode && this.scanCodeInfo.trayCode != this.trayCode && this.matters.length>0){
               scanVoice.error();
                this.$vux.confirm.show({
                    content: '当前扫的托盘码与前面扫的托盘码不一致，是否更换？如果更换,将清空已扫箱码数据',
                    // 确定回调
                    onConfirm: () => {
                        this.trayCode = this.scanCodeInfo.trayCode;
                        this.matters.map(m=>{
                            m.boxCodes = [];
                        });
                        this.boxCodesMap = {};
                    },
                    onCancel:() =>{
                        this.scanCodeInfo.trayCode = this.trayCode;
                        this.$refs.boxCode.focus();
                    }
                })
            }else{
                scanVoice.success();
                this.trayCode = this.scanCodeInfo.trayCode;
                this.$refs.boxCode.focus();
            }
        },
         /**
        * 扫箱码
        */
        handlerScanBoxCode(){
            //matCode 物料编码
            //batchNo 批次号
            //productionDate 生产日期
            //boxRule 箱规
            //uuid 随机码
            let [matCode,batchNo,productionDate,boxRule,uuid] = this.scanCodeInfo.boxCode.split(',');
            this.curQrCodeInfo = {
                matCode,
                batchNo,
                productionDate,
                boxRule,
                uuid
            };

            if(!this.handlerCheckBoxCode())  {
                scanVoice.error();
                return;
            }

            getPreShelfInvInfoByBoxCode({
                boxCode:uuid
            }).then(res=>{
                if(res.dataCount){
                    let boxInfo = res.tableContent[0];
                    this.$vux.alert.show({
                        content:`物料<strong style="color:red;">${boxInfo.inventoryName}</strong><br>
                                箱码<strong style="color:red;">${uuid}</strong>已上架<br>
                                当前库存为<strong style="color:red;">${boxInfo.qty}</strong>`
                    });
                    scanVoice.error();
                    this.scanCodeInfo.boxCode = '';
                    this.$refs.boxCode.focus();
                    return;
                }else{
                    this.boxCodesMap[uuid] =uuid;
                    this.handlerAddBoxCodeToMatter();
                    this.scanCodeInfo.boxCode = '';
                    this.$refs.boxCode.focus();
                }
            });
        },
        isCheckAll(){
            let iNum = 0;
            this.matters.map(m=>{
                m.boxCodes.map(b=>{
                    iNum++;
                });
            });
            return this.selItems.length === iNum;
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
            this.matters.map((m,mIdx)=>{
                 m.boxCodes.map((b,bIdx)=> {
                    this.selItems.push( mIdx+'_'+ bIdx);
                });
            });
        },
        handlerDeleteCheckd(){
            this.$vux.confirm.show({
                content: '确认删除?',
                // 确定回调
                onConfirm: () => {
                    // 被选中删除的物料
                    this.selItems.map(sel=>{
                        let mIdx,bIdx;
                        mIdx = Number(sel.split('_')[0]);
                        bIdx = Number(sel.split('_')[1]);
                        this.matters.map((mat,matIdx)=>{
                            if(matIdx === mIdx){
                                mat.boxCodes.map((box,boxIdx)=>{
                                    if(boxIdx === bIdx){
                                        box.isDelete = true;
                                        delete this.boxCodesMap[box.boxCode];
                                    }
                                });
                            }
                        });
                    });

                    this.matters = this.matters.filter(mat=>{
                        mat.boxCodes = mat.boxCodes.filter(box=> !box.isDelete);
                        return true;
                    })

                    this.selItems = [];
                    this.matterModifyClass = false;
                }
            })
        },
        // 选中物料
        handlerSelectItem(sItem, index) {
            let arr = this.selItems;
            let delIndex = arr.findIndex(item => item === index);
            //若存在重复的 则清除
            if (delIndex !== -1) {
                arr.splice(delIndex, 1);
                return;
            }
            arr.push(index);
        },
        showSelIcon(index){
            return this.checkList.includes(index);;
        },
        getGroupInfo(mat){
            let done = 0; 
            mat.boxCodes.map(b=>{
                done+= b.tdQty;
            });
            return {
                all:mat.thenQtyBal,
                done:done,
                todo:mat.thenQtyBal - done
            }
        },
        groupSumByFileds(a,f,v,k){
            let s = 0;
            a.map(i=>{
                if(i[f] === v) s+=i[k];
            });
            return s;
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
        handlerSetMatters(postCode,callback){
            let params = {
                transCode: postCode,
                page: 1,
                start: 0,
                limit: 10000
            };

            let materielMap = {};
            this.matters = [];
            getStorageShelf(params).then(res=>{
                //循环待上架明细数据
                //往物料集合(materielMap)注册，唯一键为物料编码，作为页面分组使用数据
                this.shelfList = res.tableContent;
                
                res.tableContent.map(m=>{
                    materielMap[m.inventoryCode] = m;
                });
                for(var k in materielMap){
                    let mat = materielMap[k];
                    this.matters.push({
                        expend:true,
                        inventoryCode:mat.inventoryCode,
                        inventoryName:mat.inventoryName,
                        processing:mat.processing,
                        invSubUnitMulti:mat.invSubUnitMulti,
                        assMeasureUnit:mat.invSubUnitName, //采购单位
                        assMeasureDescription:mat.invSubUnitComment,//包装规格
                        specification:mat.specification,//规格
                        thenTotalQtyBal: this.groupSumByFileds(this.shelfList,'inventoryCode',mat.inventoryCode,'thenTotalQtyBal'),//预入库数量
                        thenLockQty:this.groupSumByFileds(this.shelfList,'inventoryCode',mat.inventoryCode,'thenLockQty'),//已上架数量
                        thenQtyBal: this.groupSumByFileds(this.shelfList,'inventoryCode',mat.inventoryCode,'thenQtyBal'),//待上架数量
                        boxCodes:[]
                    });
                }
                this.postCode = this.scanCodeInfo.postCode;
                callback && callback(res);
            });
        },
       
        //校验箱码
        handlerCheckBoxCode(){
            if(!this.scanCodeInfo.trayCode){
                this.showTost = true;
                this.tostText = '请先扫托盘码!'
                this.scanCodeInfo.boxCode = '';
                this.$refs.trayCode.focus();
                return false;
            }

            if(!this.scanCodeInfo.boxCode) return;

            if(this.scanCodeInfo.boxCode.split(',').length !=5){
                this.showTost = true;
                this.tostText = '箱码不复合规则，请重新扫码!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return false;
            }

            if(this.boxCodesMap[this.curQrCodeInfo.uuid]){
                this.showTost = true;
                this.tostText = '该箱码已经扫过啦，请不要重复扫码哦!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return false;
            }

            let boxCodeFlag = false;
            
            this.matters.map(mat=>{
                if(mat.inventoryCode === this.curQrCodeInfo.matCode) boxCodeFlag  =true;
            });

            if(!boxCodeFlag){
                this.showTost = true;
                this.tostText = '此箱码对应物料与申请单数据不匹配，请重新扫码!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return false;
            }
            return true;
        },
        //往物料分组上添加箱码数据
        handlerAddBoxCodeToMatter(){
            this.matters.map(m=>{
                if(m.inventoryCode === this.curQrCodeInfo.matCode){
                    m.boxCodes.unshift({
                        ...this.transfromDataSource(m),
                        batchNo: this.curQrCodeInfo.batchNo,
                        productionDate: this.curQrCodeInfo.productionDate,
                        boxCode: this.curQrCodeInfo.uuid,
                        boxRule:this.curQrCodeInfo.boxRule,
                        tdQty:Number(this.curQrCodeInfo.boxRule),
                    });
                }
            });
        },
        getDataSet(){
            let dataSet = [];
            this.matters.map(mat=>{
                mat.boxCodes.map(box=>{
                    dataSet.push({
                        ...box,
                        assistQty: Math.ceil(box.tdQty/box.assMeasureScale),
                    });
                });
            });
            return dataSet;
        },
        handlerSubmit(){
            let validate = true;
            let errMsg=``;

           
            if(!this.scanCodeInfo.trayCode){
                this.$vux.alert.show({
                   content:"托盘码不能为空!"
               });
               return;
            }

            if(this.matters.length===0){
                this.$vux.alert.show({
                    content:"码垛明细不能为空!"
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
                        inPut:{
                            cardCode:this.scanCodeInfo.trayCode,
                            dataSet:this.getDataSet()
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
                let {inPut = {}} = formData;
                let materielMap  ={};
                this.biReferenceId = formData.biReferenceId;

                this.scanCodeInfo.trayCode = inPut.cardCode;
                
                inPut.dataSet.map(box=>{
                    if(!materielMap[box.transObjCode]){
                        materielMap[box.transObjCode] = {
                            expend:true,
                            inventoryCode:box.transObjCode,
                            inventoryName:box.inventoryName_transObjCode,
                            tdQty: box.tdQty,//本次码垛
                            boxCodes:[{
                                ...this.transfromViewData(box),
                            }]
                        }
                    }else{
                        materielMap[box.transObjCode].boxCodes.push({
                            ...this.transfromViewData(box),
                        });
                    }

                    this.boxCodesMap[box.boxCode] = box;
                });

                for(var k in materielMap){
                    this.matters.unshift(materielMap[k]);
                }

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
        this.boxCodesMap = {};
        
        //待上架明细
        this.shelfList = undefined;

        this.materielMap = {};

        this.$refs.postCode.focus();
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
    height: .2rem;
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
    height: 1.60rem;
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
    // height: calc(100% - 1.60rem);
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

