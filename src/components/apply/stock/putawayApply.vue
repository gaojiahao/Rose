<template>
    <div class='pages putaway-apply-container'>
        <div class="basicPart" ref="fill">
                <div class="scanCodeInfo">
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">申请单号</label>
                            <input 
                                type='text' 
                                v-model="scanCodeInfo.postCode" 
                                placeholder="请扫码" 
                                ref='postCode'
                                class='property_val' 
                                v-on:input="handlerScanPostCode"
                                @focus="handleOnFocus($event)" />
                            <i class="iconfont">&#xe661;</i>

                        </div>
                    </div>
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
                        title='上架明细'
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
import WebContext from 'service/commonService'
import { getStorageShelf, getWhbyStoragelocation } from 'service/wmsService'
import { getSOList } from 'service/detailService'

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
            formViewUniqueId: 'a1bccaee-37a8-4786-bbf4-e9cee9fbd081', // 修改时的UniqueId
            matterInfoConfig:{
                storehouseInCode:"库位编码",
                specification:"规格",
                batchNo:"批次号",
                productionDate:"生产日期"
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
        //扫申请单号
        handlerScanPostCode(){
            if(!this.scanCodeInfo.postCode) return;

            if(this.postCode && this.scanCodeInfo.postCode != this.postCode && this.matters.length>0){
                this.$vux.confirm.show({
                    content: '当前扫的申请单号与前面扫的申请单号不一致，是否更换？以重新获取待上架数据',
                    // 确定回调
                    onConfirm: () => {
                        this.postCode = this.scanCodeInfo.postCode;
                        this.scanCodeInfo.spCode = '';
                        this.warehouse = undefined;
                        this.matters = [];
                        this.boxCodesMap = {};
                        this.shelfList = [];
                    },
                    onCancel:() =>{
                        this.scanCodeInfo.postCode = this.postCode;
                        this.$refs.spCode.focus();
                    }
                })
            }else{
                this.postCode = this.scanCodeInfo.postCode;
                this.$refs.spCode.focus();
            }
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
                    
                    if(this.warehouse){
                        //如果已经存在仓库信息，需要拿最新扫的库位编码，找到对应的仓库，看是否与当前的仓库对应
                        //如果库位不在该仓库下，则最新扫的库位编码无效
                        //否则，就更换当前库位信息
                        if(warehouse.warehouseCode === this.warehouse.warehouseCode){
                            this.warehouse.spCode = this.scanCodeInfo.spCode;
                            this.$refs.boxCode.focus();
                        }else{
                            this.showTost = true;
                            this.tostText = '该库位与入库申请单选定的仓库不一致，请重新扫码!';
                            this.scanCodeInfo.spCode = '';
                            this.$refs.spCode.focus();
                        }
                    }else{
                        this.handlerSetMatters(warehouse.warehouseCode,this.scanCodeInfo.postCode,res=>{
                            if(!res.dataCount){
                                this.showTost = true;
                                this.tostText = '当前申请单号并没有待上架的数据或库位与入库申请单选定的仓库不一致，请重新扫码!';
                                this.scanCodeInfo.spCode = '';
                                this.$refs.spCode.focus();
                            }else{
                                //记录当前仓库&库位信息
                                this.warehouse = {
                                    ...warehouse,
                                    spCode:this.scanCodeInfo.spCode
                                };
                                this.$refs.boxCode.focus();
                            }
                        });
                    }
                }
            })
            
        },
         /**
        * 扫箱码
        */
        handlerScanBoxCode(){
            
            if(!this.handlerCheckBoxCode())  return;

            //记录已扫码信息,防止重复扫码
            this.boxCodesMap[this.scanCodeInfo.boxCode] = this.scanCodeInfo.boxCode;

            //idx 申请单对应物料的明细ID
            //boxRule 箱规
            //boxSeq 箱码序列号
            let [idx,boxRule,boxSeq] = this.scanCodeInfo.boxCode.split('-');
            idx = Number(idx);

            this.handlerAddBoxCodeToMatter(idx,boxRule);
            this.scanCodeInfo.boxCode = '';
            this.$refs.boxCode.focus();

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
                transMatchedCode: item.transCode,//被核销交易号
                transObjCode: item.inventoryCode,//物料编码
                tdProcessing:item.processing,//加工属性
                assMeasureUnit: item.invSubUnitName,//采购单位
                assMeasureDescription: item.invSubUnitComment,//产品规格
                assMeasureScale: item.invSubUnitMulti,//主计倍数
                storehouseInCode: item.storehouseInCode,
                thenTotalQtyBal: item.thenTotalQtyBal,
                thenLockQty: item.thenLockQty,
                thenQtyBal: item.thenQtyBal,
                tdQty: item.tdQty,
                batchNo: item.batchNo,
                productionDate: item.productionDate
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
                thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                thenLockQty: box.thenLockQty,//已上架
                thenQtyBal: box.thenQtyBal,//
                tdQty: box.tdQty,//本次上架
                assistQty:  box.assistQty,
                batchNo: box.batchNo,
                productionDate: box.productionDate,
                boxCode:box.boxCode,
                boxRule:box.boxRule
            }
        },
        handlerSetMatters(warehouseCode,postCode,callback){
            let params = {
                whCode: warehouseCode,
                page: 1,
                start: 0,
                limit: 10000,
                filter: JSON.stringify([{"operator":"like","value":postCode,"property":"transCode"}])
            };

            let materielMap = {};
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

            let boxCodeFlag = false;
            let [idx,boxRule,boxSeq] = this.scanCodeInfo.boxCode.split('-');
            idx = Number(idx);

            this.shelfList.map(mat=>{
                if(mat.idx === idx) boxCodeFlag  =true;
            });

            if(!boxCodeFlag){
                this.showTost = true;
                this.tostText = '此箱码与申请单数据不匹配，请重新扫码!';
                this.scanCodeInfo.boxCode = '';
                this.$refs.boxCode.focus();
                return false;
            }

            return true;
        },
        //往物料分组上添加箱码数据
        handlerAddBoxCodeToMatter(idx,boxRule){
            this.shelfList.map(mat=>{
                if(mat.idx === idx){
                    this.matters.map(m=>{
                        if(m.inventoryCode === mat.inventoryCode){
                            m.boxCodes.push({
                                ...this.transfromDataSource(mat),
                                boxCode: this.scanCodeInfo.boxCode,
                                warehouseName :this.warehouse.warehouseName,
                                storehouseInCode:this.scanCodeInfo.spCode,
                                postCode:this.postCode,
                                boxRule:boxRule,
                                tdQty:Number(boxRule),
                            });
                        }
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
                        assistQty: box.tdQty/box.invSubUnitMulti,
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

            if(!this.scanCodeInfo.spCode){
                this.$vux.alert.show({
                   content:"库位码不能为空!"
               });
               return;
            }

            if(this.matters.length===0){
                this.$vux.alert.show({
                    content:"上架明细不能为空!"
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

                this.scanCodeInfo.spCode = inPut.dataSet[0]['storehouseInCode'];
                this.scanCodeInfo.postCode = inPut.dataSet[0]['transMatchedCode'];
                this.warehouse = {
                    warehouseCode:inPut.containerCode,
                    warehouseName:inPut.warehouseName_containerCode
                }
                
                inPut.dataSet.map(box=>{
                    if(!materielMap[box.transObjCode]){
                        materielMap[box.transObjCode] = {
                            expend:true,
                            inventoryCode:box.transObjCode,
                            inventoryName:box.inventoryName_transObjCode,
                            thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                            thenLockQty: box.thenLockQty,//已上架
                            thenQtyBal: box.thenQtyBal,//
                            tdQty: box.tdQty,//本次上架
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
        //待上架明细
        this.shelfList = undefined;

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
    height: calc(100% - 1.60rem);
  }

</style>

