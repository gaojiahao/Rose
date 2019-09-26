<template>
    <div class='pages cpxq-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="wrapper">
                <div class="scanCodeInfo">
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">波次单</label>
                            <input 
                                ref='postCode'
                                type='text' 
                                v-model="scanCodeInfo.postCode" 
                                placeholder="请扫码" 
                                class='property_val' 
                                @input="handlerScanPostCode"
                                @focus="getFocus($event)" />
                            <i class="iconfont">&#xe661;</i>
                        </div>
                    </div>
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">箱码/托盘码</label>
                            <input 
                                ref='boxCode'
                                type='text' 
                                v-model="scanCodeInfo.boxCode" 
                                placeholder="请扫码" 
                                @input="handlerScanBoxOrTrayCode"
                                class='property_val' 
                                @focus="getFocus($event)" />
                            <i class="iconfont">&#xe661;</i>
                        </div>
                    </div>
                    
                </div>
                <div  class="wms-matter-part" ref="wmsMatterPart">
                    <wms-matter-part 
                        title='上架明细'
                        :matterModifyClass="matterModifyClass"
                        :matters="matters"
                        :handlerSelectItem="handlerSelectItem"
                        :showSelIcon="showSelIcon"
                        :handlerChangeState="handlerChangeState"    
                        :getGroupInfo="getGroupInfo"
                        :matterInfoConfig="matterInfoConfig">
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

        <toast 
            v-model="showTost" 
            type="text" 
            :time="3000" 
            is-show-mask 
            :text="tostText" 
            position="top" 
            width="20em" >
        </toast>

        <!-- 固定title -->
	    <section class="topFixed" v-show="isScroll" :class="isScroll == true ? 'isFixed' : ''" @click="toReferrals" >
	        <div>拣货明细</div>
	        <div >
	            <div class="fixed-button">继续扫码</div>
	        </div>
	    </section>
    </div>
</template>

<script>
import { Flexbox, FlexboxItem, Cell,Toast  } from 'vux'

import OpButton from 'components/apply/commonPart/OpButton'
import WmsMatterPart from 'components/apply/commonPart/wmsMatterPart'

import { 
    saveAndStartWf, 
    saveAndCommitTask, 
    submitAndCalc, 
    getPriceFromSalesContractAndPrice, 
    updateData} from 'service/commonService'
import { getPickingOutByBoxCode, releaseSortingOrder, getForPickingData ,getBoxInfoByPallet} from 'service/wmsService'
import WebContext from 'service/commonService'
import { getSOList } from 'service/detailService'
// mixins 引入
import wmsCommon from 'mixins/wmsCommon'
import scanVoice from '@/plugins/scanVoice'

// 插件引入
import Bscroll from 'better-scroll'
export default {
    data(){
        return {
            scanCodeInfo:{
                boxCode:'',
                postCode:''
            },
            matters:[],
            selItems: [],                               // 选中的要删除的物料
            matterModifyClass : false,                  // 删除状态,
            btnIsHide:false,
            showTost:false,
            tostText:'',
            formViewUniqueId: '700e7b24-d90b-4801-9a11-5d1ff24a4319', // 修改时的UniqueId
            matterInfoConfig: {
                warehouseName:"仓库名称",
                storehouseOutCode:"库位编码",
                cardCode:"托盘码",
                assMeasureUnit:"采购单位", //采购单位
                assMeasureDescription:"包装规格",//包装规格
            }
        }
    },
    mixins: [wmsCommon],
    computed: {
        // 将选中删除的物料 转换成 数组
        checkList() {
            let newArr = [].concat.apply([], Object.values(this.selItems));
            return newArr
        }
    },
    components: {
        Flexbox,
        FlexboxItem,
        OpButton,
        WmsMatterPart,
        Toast
    },
    methods:{
        // 输入框获取焦点，内容选中
        getFocus(e) {
            event.currentTarget.select();
        },
        isCheckAll(){
            let iNum = 0;
            this.matters.map(m => {
                m.boxCodes.map(b => {
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
            this.matters.map((m,mIdx) => {
                 m.boxCodes.map((b,bIdx) => {
                    this.selItems.push( mIdx+'_'+ bIdx);
                });
            });
        },
        handlerDeleteCheckd(){
            this.$vux.confirm.show({
                content: '确认删除?',
                // 确定回调
                onConfirm: () => {
                    console.log('====',this.selItems);
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
        //扫申请单号
        handlerScanPostCode(){
            if(!this.scanCodeInfo.postCode) return;

            this.matters = [];
            getForPickingData(this.scanCodeInfo.postCode).then(res => {
                if(res.tableContent.length > 0){
                    scanVoice.success();
                    res.tableContent.forEach(mat => {
                        this.matters.unshift({
                            expend:true,
                            inventoryCode:mat.inventoryCode,
                            inventoryName:mat.inventoryName,
                            thenTotalQtyBal: mat.thenTotalQtyBal,//待上架
                            thenLockQty: mat.thenLockQty,//已上架
                            thenQtyBal: mat.thenQtyBal,//
                            boxCodes:[]
                        });
                    })
                }else{
                    scanVoice.error();
                    this.showTost = true;
                    this.tostText = '此单号无数据！请重新扫码！';
                    this.scanCodeInfo.postCode = "";
                    this.$refs.postCode.focus();
                    return;
                }
            })
            this.$refs.boxCode.focus();
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
            return this.checkList.includes(index);
        },
        getGroupInfo(mat){
            let done = 0; 
            mat.boxCodes.map(b => {
                done += b.tdQty;
            });

            return {
                all:mat.thenQtyBal,
                done:done,
                todo:mat.thenQtyBal - done
            }
        },
        handlerSetMatters(){
            let params = {
                boxCode:this.curQrCodeInfo.uuid,
                transCode: this.scanCodeInfo.postCode
            };

            let materielMap = {};
            getPickingOutByBoxCode(params).then(res => {
                if(res.tableContent.length === 0){
                    scanVoice.error();
                    this.showTost = true;
                    this.tostText = '此箱码不存在！';
                    this.scanCodeInfo.boxCode = "";
                    this.$refs.boxCode.focus();
                    return;
                }
                scanVoice.success();
                res.tableContent.map(box => {
                    this.matters.map(mat => {
                        if(box.inventoryCode === mat.inventoryCode){
                            mat.boxCodes.unshift({
                                ...this.transformDataSource(box),
                                cardCode:this.trayCode
                            })
                        }
                        this.warehouse = {
                            warehouseName: box.warehouseName,
                            whOutCode: box.whOutCode
                        };
                    })
                });
            });
        },
        handlerCheckBoxCode(){

            
            if(!this.scanCodeInfo.postCode) {
                this.showTost = true;
                this.tostText = '请先扫申请单号!';
                this.scanCodeInfo.boxCode = "";
                this.$refs.postCode.focus();
                return false;
            };

            if(!this.scanCodeInfo.boxCode) return false;

            if(this.scanCodeInfo.boxCode.split(',').length !=5){
                this.showTost = true;
                this.tostText = '箱码不符合规则，请重新扫码!'
                this.scanCodeInfo.boxCode = "";
                this.$refs.boxCode.focus();
                return false;
            }

            if(this.boxCodesMap[this.curQrCodeInfo.uuid]){
                this.showTost = true;
                this.tostText = '该箱码已经扫过啦，请不要重复扫码哦!';
                this.scanCodeInfo.boxCode = "";
                this.$refs.boxCode.focus();
                return false;
            }
            return true;
        },
        handlerScanBoxOrTrayCode(){

             if(!this.scanCodeInfo.postCode) {
                this.showTost = true;
                this.tostText = '请先扫申请单号!';
                this.scanCodeInfo.boxCode = "";
                this.$refs.postCode.focus();
                return false;
            };


            if(this.scanCodeInfo.boxCode.split(',').length !=5 ){
                 this.trayCode = this.scanCodeInfo.boxCode;
                getBoxInfoByPallet({
                    pallet: this.trayCode
                }).then(res=>{
                    if(res.dataCount){
                        res.tableContent.map(box=>{
                            this.scanCodeInfo.boxCode = `${box.inventoryCode},${box.batchNo},${box.productionDate},${box.qty},${box.boxCode}`;
                            this.handlerScanBoxCode();
                        });
                    }else{
                         this.showTost = true;
                        this.tostText = '此托盘码无效!'
                        this.scanCodeInfo.boxCode = '';
                        return false;
                    }
                });
            }else{
                this.handlerScanBoxCode();
            }
        },
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

            if(!this.handlerCheckBoxCode()){
                scanVoice.error();
                return;
            }
            
            //记录已扫码信息,防止重复扫码
            this.boxCodesMap[uuid] = uuid;
            
            this.handlerSetMatters();
            this.scanCodeInfo.boxCode = '';
            this.$refs.boxCode.focus();
        },
        getDataSet(){
            let dataSet = [];
            let keyMap = {
                "transObjCode": "outPutMatCode",
                "inventoryName": "inventoryName_outPutMatCode",
                "storehouseInCode": "storehouseOutCode"
            };
            this.matters.map(mat => {
                mat.boxCodes.map(box => {
                    for(let k in box){
                        let newKey = keyMap[k];
                        if(newKey){
                            box[newKey] = box[k];
                            delete box[k];
                        }
                    }
                    dataSet.push({
                       ...box
                    });
                });
            });

            return dataSet;
        },
        handlerSubmit(){
            if(!this.scanCodeInfo.postCode){
                this.$vux.alert.show({
                content:"申请单号不能为空!"
            });
                return;
            }
            if(this.matters.length===0){
                this.$vux.alert.show({
                    content:"出库明细不能为空!"
                });
                return;
            }

            let validate = true;
            let errMsg=``;

            this.matters.map(mat=>{
                let sumInfo = this.getGroupInfo(mat);
                if(sumInfo.all< sumInfo.done){
                    validate = false;
                    errMsg = `抱歉,物料<strong style="color:red;">${mat.inventoryName}</strong>的数量不能大于待拣货数量!`;
                }
            });

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
                        containerOutWarehouseManager:'',
                        biComment:'',
                        outPut:{
                            containerCodeOut: this.warehouse.whOutCode,
                            warehouseName_containerCodeOut: this.warehouse.warehouseName,
                            warehouseType_containerCodeOut: this.warehouse.warehouseType,
                            warehouseAddress_containerCodeOut: this.warehouse.warehouseAddress,
                            dataSet:this.getDataSet()
                        }
                    };

                    let submitData = {
                        listId: this.$route.params.listId,
                        biComment: '',
                        biReferenceId:this.biReferenceId,
                        formData:JSON.stringify(formData)
                    }, matCodeCollection  = [];

                    formData.outPut.dataSet.forEach(val => {
                        matCodeCollection.push(val.inventoryCode);
                    })
                    
                    let opeartion = submitAndCalc;
                    if(this.isModify){
                        opeartion = updateData;
                    }else{
                        delete submitData.biReferenceId;
                    }
                    this.saveData(opeartion,submitData,matCodeCollection);
                }
            })
        },
        saveData(request, submitData,matCodeCollection) {
            request(submitData).then(data => {
                this.$HandleLoad.hide();
                let {success = false, message = '提交失败'} = data;
                if (success) {
                    message = '提交成功';
                    releaseSortingOrder(this.scanCodeInfo.postCode,matCodeCollection.join(',')).then(res => {})
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
        },
        getFormData(){
            return getSOList({
                formViewUniqueId: this.formViewUniqueId,
                transCode:this.transCode
            }).then(({success = true, formData = {}, attachment = []}) => {
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
                let materielMap  ={};
                this.biReferenceId = formData.biReferenceId;
                this.scanCodeInfo.postCode = formData.transCode;
                
                outPut.dataSet.map(box=>{
                    if(!materielMap[box.outPutMatCode]){
                        materielMap[box.outPutMatCode] = {
                            expend:true,
                            transMatchedCode: box.transMatchedCode,
                            transObjCode: box.outPutMatCode,
                            inventoryCode:box.outPutMatCode,
                            inventoryName:box.inventoryName_outPutMatCode,
                            thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                            thenLockQty: box.thenLockQty,//已上架
                            thenQtyBal: box.thenQtyBal,//
                            tdQty: box.tdQty,//本次出库
                            boxCodes:[{
                                ...this.transformViewData(box),
                                warehouseName:outPut.warehouseName_containerCodeOut
                            }]
                        }
                    }else{
                        materielMap[box.outPutMatCode].boxCodes.push({
                            ...this.transformViewData(box),
                            warehouseName:outPut.warehouseName_containerCodeOut
                        });
                    }

                    this.boxCodesMap[box.boxCode] = box;
                });

                for(var k in materielMap){
                    this.matters.push(materielMap[k]);
                }

            })
        },
        transformDataSource(box){
            return{
                expend:true,
                transMatchedCode: box.transCode,
                transObjCode: box.inventoryCode,
                inventoryCode:box.inventoryCode,
                inventoryName:box.inventoryName,
                tdProcessing: box.processing,
                assMeasureUnit: box.invSubUnitName,
                assMeasureDescription: box.invSubUnitComment,
                assMeasureScale: box.invSubUnitMulti,
                warehouseName: box.warehouseName,
                whOutCode: box.whOutCode,
                boxRule: box.boxRule,
                specification: box.specification,
                storehouseOutCode: box.storehouseCode,
                whOutCode: box.whOutCode,
                thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                thenLockQty: box.thenLockQty,//已上架
                thenQtyBal: box.thenQtyBal,//
                tdQty: box.boxQtyBal,//本次出库
                assistQty:  Math.ceil(box.boxQtyBal/box.invSubUnitMulti),
                batchNo: box.batchNo,
                productionDate: box.productionDate,
                boxCode: box.boxCode,
                postCode: this.scanCodeInfo.postCode,
                boxRule: box.boxRule
            }
        },
        transformViewData(box){
            return {
                expend:true,
                transMatchedCode: box.transMatchedCode,
                transObjCode: box.outPutMatCode,
                inventoryCode:box.outPutMatCode,
                inventoryName:box.inventoryName_outPutMatCode,
                tdProcessing: box.tdProcessing,
                assMeasureUnit: box.assMeasureUnit,
                assMeasureDescription: box.assMeasureDescription,
                assMeasureScale: box.assMeasureScale,
                boxRule: box.boxRule,
                specification: box.specification_outPutMatCode,
                storehouseOutCode: box.storehouseOutCode,
                thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                thenLockQty: box.thenLockQty,//已上架
                thenQtyBal: box.thenQtyBal,//
                tdQty: box.tdQty,//本次出库
                assistQty:  box.boxQtyBal/box.invSubUnitMulti,
                batchNo: box.batchNo,
                productionDate: box.productionDate,
                boxCode: box.boxCode
            }
        }
    },
    mounted(){
        this.$loading.hide();
       
        //扫库位码后切换库位的判断依据
        this.warehouse = {};
        //扫箱码后确定的申请单号信息
        this.postCode = '';
        //已扫箱码信息集合
        this.boxCodesMap = {};

         this.trayCode ='';
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
    height: 1.0rem;
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

