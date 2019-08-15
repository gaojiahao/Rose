<template>
    <div class='pages tally-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="scanCodeInfo">
                <div class="vux-1px-t">
                    <div class='each_property' >
                        <label class="required">入库库位</label>
                        <input 
                            type='text' 
                            ref='spCode'
                            v-model="scanCodeInfo.spCode" 
                            placeholder="请扫码" 
                            v-on:input="handlerScanSpinfo"
                            class='property_val' 
                            @focus="handleOnFocus($event)" />
                        <i class="iconfont">&#xe661;</i>
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
                            v-on:input="handlerScanBoxCode"
                            class='property_val' 
                            @focus="handleOnFocus($event)" />
                        <i class="iconfont">&#xe661;</i>
                    </div>
                </div>
                
            </div>
            <div  class="wms-matter-part">
                <wms-matter-part 
                    title='理货明细'
                    :matterModifyClass="matterModifyClass"
                    :matters="matters"
                    :handlerSelectItem="handlerSelectItem"
                    :showSelIcon="showSelIcon"
                    :handlerChangeState="handlerChangeState"    
                    :getGroupInfo="getGroupInfo"
                    :matterInfoConfig="matterInfoConfig"
                    :getSpecialInfo="getSpecialInfo"
                    :inputDisable="true"
                    >
                </wms-matter-part>
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
        <toast  v-model="showTost" type="text" :time="1500" is-show-mask :text="tostText" position="top" width="20em" ></toast>
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
import { getStorageShelf, getWhbyStoragelocation,getInventoryInfoByBoxCode} from 'service/wmsService'
import WebContext from 'service/commonService'
import { getSOList } from 'service/detailService'

// 插件引入
import Bscroll from 'better-scroll'
import { debug, debuglog } from 'util';
export default {
    data(){
        return {
            scanCodeInfo:{
                spCode:'',
                boxCode:'',
                postCode:''
            },
            matters:[],
            selItems: [],                               // 选中的要删除的物料
            matterModifyClass : false,                  // 删除状态,
            btnIsHide:false,
            showTost:false,
            tostText:'',
            formViewUniqueId: '845aaba6-a46b-44a7-b629-a794d46f2536', // 修改时的UniqueId
            matterInfoConfig:{
                outWarehouseName:"出库仓",
                storehouseOutCode:"出库库位",
                inPutWarehouseName:"入库仓",
                storehouseInCode:"入库库位",
                specification:"规格",
                locationStock:"库位库存",
                lockQty:"箱码库存"
            },
        }
    },
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
        RNumber,
        OpButton,
        WmsMatterPart,
        Toast
    },
    methods:{
        // 输入框获取焦点，内容选中
        handleOnFocus(e) {
            event.currentTarget.select();
        },
        //扫库位以确定库位信息
        //通过申请单号+仓库编码获取待上架物料
        handlerScanSpinfo(){
            if(!this.scanCodeInfo.spCode) return;

            getWhbyStoragelocation({
              location:this.scanCodeInfo.spCode
            }).then(res=>{
                
                if(!res.dataCount){
                    this.showTost = true;
                    this.tostText = '该库位未绑定仓库，请绑定后再扫!';
                    this.scanCodeInfo.spCode = '';
                    this.$refs.spCode.focus();
                }else{
                    let warehouse = res.tableContent[0];

                    //记录当前仓库&库位信息
                    this.warehouse = {
                        inPutWarehouseCode:warehouse.warehouseCode,
                        inPutWarehouseName:warehouse.warehouseName,
                        spCode:this.scanCodeInfo.spCode
                    };

                    this.$refs.boxCode.focus();
                }
            })
            
        },
         /**
        * 扫箱码
        */
        handlerScanBoxCode(){

            
            if(!this.handlerCheckBoxCode())  return;

            let boxCode = this.scanCodeInfo.boxCode;
            let boxRule = this.scanCodeInfo.boxCode.split('-')[2];

            getInventoryInfoByBoxCode({
              boxCode:boxCode
            }).then(res=>{
                if(res.dataCount>0){
                    let mat = res.tableContent[0];

                    if(mat.storehouseCode === this.scanCodeInfo.spCode){
                        this.showTost = true;
                        this.tostText = `该箱码已经在库位${mat.storehouseCode}中，请另扫箱码!`;
                        this.scanCodeInfo.boxCode = '';
                        this.$refs.boxCode.focus();
                        return;
                    }
                    let exist = false;
                    this.matters.map(m=>{
                        if(m.inventoryCode === mat.inventoryCode){
                            m.boxCodes.unshift(this.transfromDataSource(mat,boxCode,boxRule));
                            exist = true;
                        }
                    });

                    if(!exist){
                        this.matters.unshift({
                            ...mat,
                            expend:true,
                            boxCodes:[this.transfromDataSource(mat,boxCode,boxRule)]
                        });

                        //记录出库仓信息
                        //同一个单据，出库仓只能是一个
                        if(this.warehouse && !this.warehouse.outPutWarehouseCode){
                            this.warehouse.outPutWarehouseCode = mat.warehouseCode;
                            this.warehouse.outPutWarehouseName = mat.warehouseName;
                        }
                    }
                    //记录已扫码信息,防止重复扫码
                    this.boxCodesMap[this.scanCodeInfo.boxCode] = this.scanCodeInfo.boxCode;
                    this.scanCodeInfo.boxCode = '';
                }else{
                    this.showTost = true;
                    this.tostText = '此箱码没有对应的物料信息!';
                    this.scanCodeInfo.boxCode = '';
                }
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
            });
        },
        transfromDataSource(mat,boxCode,boxRule){
            return{
                transObjCode: mat.inventoryCode,//物料编码
                inventoryName:mat.inventoryName,
                tdProcessing:mat.processing,//物料属性
                assMeasureUnit:mat.assMeasureUnit,//辅助计量单位
                thenQtyStock:mat.thenQtyStock,//可用库存
                assMeasureScale:mat.assMeasureScale,//与主计量单位倍数
                boxCode:boxCode,
                boxRule:boxRule,
                specification:mat.specification,//规格
                warehouseName_storehouseOutCode:mat.storehouseName,//出库库区
                storehouseOutCode :mat.storehouseCode,//出库库位
                locationStock:mat.qtyBalance,//库位库存
                lockQty:mat.qty,//箱码库存
                tdQty:mat.qty,//调拨数量
                inPutWarehouseName:this.warehouse.inPutWarehouseName,//入库仓
                storehouseInCode:this.warehouse.spCode,//入库库位
                outWarehouseName:mat.warehouseName,
            }
        },
        transfromViewData(box){
            return {
                transObjCode: box.transObjCode,//物料编码
                inventoryCode:box.transObjCode,//物料编码
                inventoryName:box.inventoryName_transObjCode,
                tdProcessing:box.tdProcessing,//物料属性
                assMeasureUnit:box.assMeasureUnit,//辅助计量单位
                thenQtyStock:box.thenQtyBal,//可用库存
                assMeasureScale:box.assMeasureScale,//与主计量单位倍数
                boxCode:box.boxCode,
                boxRule:box.boxRule,
                specification:box.specification_transObjCode,//规格
                warehouseName_storehouseOutCode:box.storehouseName,//出库库区
                outWarehouseName:this.warehouse.outPutWarehouseName,//出库仓
                storehouseOutCode :box.storehouseOutCode,//出库库位
                inPutWarehouseName:this.warehouse.inPutWarehouseName,//入库仓
                storehouseInCode:box.storehouseInCode,//入库库位
                locationStock:box.thenQtyStock,//库位库存
                lockQty:box.lockQty,//箱码库存
                tdQty:box.tdQty,//调拨数量
            }
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
            let all = 0,done=0;
            mat.boxCodes.map(b=>{
                done+= b.tdQty;
                all += b.lockQty;
            });
            return {
                all:all,
                done:done
            }
        },
        getSpecialInfo(box){
            return `数量：<strong style="color: #3d92f0;">${box.tdQty}</<strong>`
        },
        groupSumByFileds(a,f,v,k){
            let s = 0;
            a.map(i=>{
                if(i[f] === v) s+=i[k];
            });
            return s;
        },
        //校验箱码
        handlerCheckBoxCode(){
            if(!this.scanCodeInfo.spCode){
                this.showTost = true;
                this.tostText = '请先扫库位!'
                this.scanCodeInfo.boxCode = '';
                return false;
            }

            if(!this.scanCodeInfo.boxCode) return;

            if(this.scanCodeInfo.boxCode.split('-').length !=3){
                this.showTost = true;
                this.tostText = '箱码不复合规则，请重新扫码!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return false;
            }

            if(this.boxCodesMap[this.scanCodeInfo.boxCode]){
                this.showTost = true;
                this.tostText = '该箱码已经扫过啦，请不要重复扫码哦!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return false;
            }

            return true;
        },
        getDataSet(){
            let dataSet = [];
            this.matters.map(mat=>{
                mat.boxCodes.map(box=>{
                    dataSet.push({
                        ...box,
                        assistQty:box.tdQty/box.assMeasureScale,//辅计数量
                    });
                });
            });
            return dataSet;
        },
        handlerSubmit(){
            if(!this.scanCodeInfo.spCode){
                this.$vux.alert.show({
                   content:"入库库位码不能为空!"
               });
               return;
            }

            if(this.matters.length===0){
                this.$vux.alert.show({
                    content:"理货明细不能为空!"
                });
                return;
            }
             // 准备提交
            this.$vux.confirm.show({
                content: '确认提交?',
                // 确定回调
                onConfirm: () => {
                    const currentUser = WebContext.WebContext.currentUser;
                    let data={};
                    let formData={
                        handlerName: currentUser.name,
                        handlerUnitName: currentUser.depts && currentUser.depts[0] ? currentUser.depts[0].name : '',
                        handlerRoleName: currentUser.isSysRoleList[0].name,
                        handler: currentUser.userId,
                        handlerUnit:  currentUser.depts && currentUser.depts[0] ? currentUser.depts[0].id : '',
                        handlerRole: currentUser.isSysRoleList[0].id,
                        creator: currentUser.userId,
                        modifer: currentUser.userId,
                        biId:'',
                        handlerEntity: currentUser.entityId,
                        biProcessStatus:null,
                        containerInWarehouseManager:'',
                        biComment:'',
                        inPut:{
                            containerCodeOut:this.warehouse.outPutWarehouseCode,
                            containerCode:this.warehouse.inPutWarehouseCode,
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

                this.warehouse = {
                    inPutWarehouseCode:inPut.containerCode,
                    inPutWarehouseName:inPut.warehouseName_containerCode,
                    outPutWarehouseCode:inPut.containerCodeOut,
                    outPutWarehouseName:inPut.warehouseName_containerCodeOut
                }
                
                inPut.dataSet.map(box=>{
                    if(!materielMap[box.transObjCode]){
                        materielMap[box.transObjCode] = {
                            expend:true,
                            ...this.transfromViewData(box),
                            boxCodes:[this.transfromViewData(box)]
                        }
                    }else{
                        materielMap[box.transObjCode].boxCodes.push(this.transfromViewData(box));
                    }

                    this.boxCodesMap[box.boxCode] = box;
                });

                for(var k in materielMap){
                    this.matters.push(materielMap[k]);
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
        },
    },
    mounted(){
        this.$loading.hide();
       
        //扫库位码后确定的仓库信息
        //扫库位码后切换库位的判断依据
        this.warehouse = undefined;
        //扫箱码后确定的申请单号信息
        this.postCode = '';
        //已扫箱码信息集合
        this.boxCodesMap = {};

        this.$refs.spCode.focus();
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
    height: calc(100% - 1.0rem);
  }

</style>

