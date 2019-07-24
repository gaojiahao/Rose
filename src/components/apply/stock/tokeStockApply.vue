<template>
    <div class='pages cpxq-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="wrapper">
                <div class="scanCodeInfo">
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">盘点仓位</label>
                            <input 
                                type='text' 
                                ref='spCode'
                                v-model="scanCodeInfo.spCode" 
                                placeholder="请扫码" 
                                @change="handlerSetSpinfo"
                                class='property_val' 
                                @click="handerClickSpCodeDiv"
                                @blur="handerOnBlur(($event))"
                                @focus="handerOnFocus($event)" />
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
                                @change="handlerSetMattersBox"
                                class='property_val' 
                                 @blur="handerOnBlur(($event))"
                                @focus="handerOnFocus($event)" />
                            <i class="iconfont">&#xe661;</i>
                        </div>
                    </div>
                </div>
                <wms-matter-part 
                    title='盘点明细'
                    :matterModifyClass="matterModifyClass"
                    :matters="matters"
                    :handlerSelectItem="handlerSelectItem"
                    :showSelIcon="showSelIcon"
                    :handlerChangeState="handlerChangeState"    
                    :getGroupInfo="getGroupInfo"
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

        <toast 
            v-model="showTost" 
            type="text" :time="800" is-show-mask :text="tostText" position="top" width="20em" ></toast>
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
import {  getWhbyStoragelocation,getLocationOfinventory } from 'service/wmsService'
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
            },
            matters:[],
            selItems: [],                               // 选中的要删除的物料
            matterModifyClass : false,                  // 删除状态,
            btnIsHide:false,
            showTost:false,
            tostText:'',
            formViewUniqueId: 'a1bccaee-37a8-4786-bbf4-e9cee9fbd081', // 修改时的UniqueId
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
        handerClickSpCodeDiv(e){
            e.preventDefault();
            e.stopPropagation();
            return false;
        },
        handerOnBlur(e){
            event.currentTarget.nextElementSibling.style['color'] = '';
            event.currentTarget.nextElementSibling.style['fontWeight'] = '';
        },
        // 输入框获取焦点，内容选中
        handerOnFocus(e) {
            event.currentTarget.select();
            event.currentTarget.nextElementSibling.style['color'] = '#3296FA';
            event.currentTarget.nextElementSibling.style['fontWeight'] = 'bold';
        },
        //扫库位以确定库位信息
        handlerSetSpinfo(){
            if(!this.scanCodeInfo.spCode) return;

            //如果已经扫库位码，获取到正确的仓库信息,并且已经扫了箱码
            if(this.warehouse && this.matters.length>0){
                if(this.scanCodeInfo.spCode != this.warehouse.spCode){
                    this.$vux.confirm.show({
                        content: '确定要变更仓位?如果确定，待上架物料将会清空',
                        // 确定回调
                        onConfirm: () => {
                            //变换仓位
                            //重新获取仓库信息
                            //清空箱码，申请单号信息
                            //清空待上架物料
                            this.getWarehouse(this.handlerSetMatters);
                            this.scanCodeInfo.boxCode = '';
                            this.matters = [];
                        },
                        onCancel:() =>{
                            this.scanCodeInfo.spCode = this.warehouse.spCode;
                        }
                    })
                }
            }else{
                this.getWarehouse(this.handlerSetMatters);
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
                                    box.isDelete = true;
                                    delete this.boxCodesMap[box.boxCode];
                                });
                            }
                        });

                        this.matters = this.matters.filter(mat=>{
                            mat.boxCodes = mat.boxCodes.filter(box=> !box.isDelete);
                            return true;
                        })
                    });
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
        handlerSetMatters(){
            let params = {
                whCode: this.warehouse.warehouseCode,
                storehouseCode:this.scanCodeInfo.spCode,
                page: 1,
                start: 0,
                limit: 1000
            };

            let materielMap = {};
            getLocationOfinventory(params).then(res=>{
                res.tableContent.map(m=>{
                    materielMap[m.inventoryCode] = m;
                });
                for(var k in materielMap){
                    let mat = materielMap[k];
                    this.matters.push({
                        expend:true,
                        transMatchedCode: mat.transCode,
                        transObjCode: mat.inventoryCode,
                        inventoryCode:mat.inventoryCode,
                        inventoryName:mat.inventoryName,
                        tdProcessing: mat.processing,
                        assMeasureUnit: mat.measureUnit,
                        specification: mat.specification,
                        assMeasureScale: mat.invSubUnitMulti,
                        warehouseName_storehouseInCode: mat.storehouseInCode,
                        storehouseInCode: mat.storehouseInCode,
                        thenTotalQtyBal: mat.storehouseQtyBal,//账面数
                        thenLockQty: mat.thenLockQty,//已上架
                        thenQtyBal: mat.storehouseQtyBal,//
                        tdQty: mat.tdQty,//本次上架
                        assistQty:  mat.tdQty/mat.measureUnit,
                        keepingDays_transObjCode: 1,
                        batchNo: mat.batchNo,
                        productionDate: mat.productionDate,
                        comment: '',
                        boxCodes:[]
                    });
                }
            });
        },
       /**
        * 扫箱码
        * 箱码规则 申请单号-物料编码-生产日期-批次号-序号
        * 通过解析箱码获取申请单号等信息
        * 如果是第一次扫码，则会通过申请单号、以及仓库信息、获取待上架的物料
        * 如果不是第一次扫码，则在相应的物料下添加箱码
        */
        handlerSetMattersBox(){
            if(!this.scanCodeInfo.spCode){
                this.showTost = true;
                this.tostText = '请先扫库位!'
                this.scanCodeInfo.boxCode = '';
                return;
            }

            if(!this.scanCodeInfo.boxCode) return;

            if(this.scanCodeInfo.boxCode.split('-').length !=5){
                this.showTost = true;
                this.tostText = '箱码不复合规则，请重新扫码!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return;
            }

            if(this.boxCodesMap[this.scanCodeInfo.boxCode]){
                this.showTost = true;
                this.tostText = '该箱码已经扫过啦，请不要重复扫码哦!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return;
            }

            //记录已扫码信息,防止重复扫码
            this.boxCodesMap[this.scanCodeInfo.boxCode] = this.scanCodeInfo.boxCode;

            let [postCode,matCode,batchNo,boxRule] = this.scanCodeInfo.boxCode.split('-');

            this.handlerAddBoxCodeToMatter(matCode,boxRule);

        },
        //往物料分组上添加箱码数据
        handlerAddBoxCodeToMatter(matCode,boxRule){
            this.matters.map(mat=>{
                let temMat = Object.assign({},mat);
                delete temMat.boxCodes;
                mat.inventoryCode === matCode && mat.boxCodes.push({
                    ...temMat,
                    boxCode: this.scanCodeInfo.boxCode,
                    warehouseName :this.warehouse.warehouseName,
                    storehouseInCode:this.scanCodeInfo.spCode,
                    boxRule:boxRule,
                    tdQty:Number(boxRule),
                });
            });
        },
        getDataSet(){
            let dataSet = [];
            this.matters.map(mat=>{
                mat.boxCodes.map(box=>{
                    dataSet.push({
                       ...box
                    });
                });
            });
            return dataSet;
        },
        handlerSubmit(){
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
                            containerCode:this.warehouse.warehouseCode,
                            dataSet:this.getDataSet()
                        }
                    };

                    let submitData={
                        listId: this.$route.params.listId,
                        biComment: '',
                        biReferenceId:this.biReferenceId,
                        formData:JSON.stringify(formData),
                    };

                   
                    if(this.isModify){
                        updateData(submitData).then(data => {
                            this.$HandleLoad.hide()
                            let {success = false, message = '提交失败'} = data;
                            if (success) {
                                message = '提交成功';
                                // this.$emit('change', true);
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
                    }else{
                         submitAndCalc(submitData).then(data => {
                            this.$HandleLoad.hide()
                            let {success = false, message = '提交失败'} = data;
                            if (success) {
                                message = '提交成功';
                                // this.$emit('change', true);
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
                    }
                   
                }
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

                this.scanCodeInfo.spCode = inPut.dataSet[0]['storehouseInCode'];
                
                inPut.dataSet.map(box=>{
                    if(!materielMap[box.transObjCode]){
                        materielMap[box.transObjCode] = {
                            expend:true,
                            transMatchedCode: box.transMatchedCode,
                            transObjCode: box.transObjCode,
                            inventoryCode:box.transObjCode,
                            inventoryName:box.inventoryName_transObjCode,
                            tdProcessing: box.processing,
                            assMeasureUnit: box.measureUnit,
                            assMeasureDescription: box.assMeasureDescription,
                            assMeasureScale: box.assMeasureScale,
                            warehouseName_storehouseInCode: box.warehouseName_storehouseInCode,
                            thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                            thenLockQty: box.thenLockQty,//已上架
                            thenQtyBal: box.thenQtyBal,//
                            tdQty: box.tdQty,//本次上架
                            assistQty:  box.assistQty,
                            batchNo: box.batchNo,
                            productionDate: box.productionDate,
                            comment: box.comment,
                            boxCodes:[{
                                ...box,
                                specification:box.specification_transObjCode,
                                warehouseName:inPut.warehouseType_containerCode
                            }]
                        }
                    }else{
                        materielMap[box.transObjCode].boxCodes.push({
                            ...box,
                            specification:box.specification_transObjCode,
                            warehouseName:inPut.warehouseType_containerCode
                        });
                    }

                    this.boxCodesMap[box.boxCode] = box;
                });

                for(var k in materielMap){
                    this.matters.push(materielMap[k]);
                }

            })
        },
        //通过库位编码获取仓库信息
        getWarehouse(callback){
            getWhbyStoragelocation({
                location:this.scanCodeInfo.spCode
            }).then(res=>{
                if(res.dataCount===0){
                    this.showTost = true;
                    this.tostText = '该库位未绑定仓库，请绑定后再扫!';
                    this.scanCodeInfo.spCode = '';
                }else{
                    this.warehouse = {
                        ...res.tableContent[0],
                        spCode:this.scanCodeInfo.spCode
                    }
                    this.$refs.boxCode.focus();

                    callback && callback();
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
        this.$nextTick(() => {
            this.fillBscroll = new Bscroll(this.$refs.fill, {click: true})
        })
       
        //扫库位码后确定的仓库信息
        //扫库位码后切换库位的判断依据
        this.warehouse = {};

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
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    input{  
      border: none;
      outline: none;
      font-size: .14rem;
    }
    label{
      color: #696969;
    }
    // .add{
    //   color: #3296FA;
    // }
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

</style>

