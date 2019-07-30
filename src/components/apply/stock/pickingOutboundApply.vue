<template>
    <div class='pages cpxq-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="wrapper">
                <div class="scanCodeInfo">
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">申请单号</label>
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
                            <label class="required">货品箱码</label>
                            <input 
                                ref='boxCode'
                                type='text' 
                                v-model="scanCodeInfo.boxCode" 
                                placeholder="请扫码" 
                                @input="handlerSetMattersBox"
                                class='property_val' 
                                @focus="getFocus($event)" />
                            <i class="iconfont">&#xe661;</i>
                        </div>
                    </div>
                    
                </div>
                <wms-matter-part 
                    title='上架明细'
                    :matterModifyClass="matterModifyClass"
                    :matters="matters"
                    :handlerSelectItem="handlerSelectItem"
                    :showSelIcon="showSelIcon"
                    :handlerChangeState="handlerChangeState"    
                    :getGroupInfo="getGroupInfo">
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
            type="text" 
            :time="800" 
            is-show-mask 
            :text="tostText" 
            position="top" 
            width="20em" >
        </toast>
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
import { getPickingOutByBoxCode, releaseSortingOrder, getForPickingData } from 'service/wmsService'
import WebContext from 'service/commonService'

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
                this.selItems.map(sel => {
                    let mIdx,bIdx;
                    mIdx = Number(sel.split('_')[0]);
                    bIdx = Number(sel.split('_')[1]);
                    this.matters  = this.matters.filter((mat,matIdx) => {
                        if(matIdx === mIdx){
                            mat.boxCodes  = mat.boxCodes.filter((box,boxIdx) => {
                                return boxIdx !== bIdx;
                            });
                        }
                        return true;
                    });

                });
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
                res.tableContent.forEach(mat => {
                    this.matters.unshift({
                        expend:true,
                        transMatchedCode: mat.transCode,
                        transObjCode: mat.inventoryCode,
                        inventoryCode:mat.inventoryCode,
                        inventoryName:mat.inventoryName,
                        tdProcessing: mat.processing,
                        assMeasureUnit: mat.invSubUnitName,
                        assMeasureDescription: mat.invSubUnitComment,
                        assMeasureScale: mat.invSubUnitMulti,
                        boxRule: mat.boxRule,
                        thenTotalQtyBal: mat.thenTotalQtyBal,//待上架
                        thenLockQty: mat.thenLockQty,//已上架
                        thenQtyBal: mat.thenQtyBal,//
                        keepingDays_transObjCode: 1,
                        batchNo: mat.batchNo,
                        productionDate: mat.productionDate,
                        comment: '',
                        boxCodes:[]
                    });
                })
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
                boxCode:this.scanCodeInfo.boxCode,
                transCode: this.scanCodeInfo.postCode
            };

            let materielMap = {};
            getPickingOutByBoxCode(params).then(res => {
                if(res.tableContent.length === 0){
                    this.showTost = true;
                    this.tostText = '此箱码不存在！';
                    this.scanCodeInfo.boxCode = "";
                    this.$refs.postCode.focus();
                    return;
                }
                res.tableContent.map(box => {
                    this.matters.map(mat => {
                        if(box.inventoryCode === mat.inventoryCode){
                            mat.boxCodes.unshift({
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
                                boxRule: box.boxRule,
                                specification: box.specification,
                                storehouseInCode: box.storehouseCode,
                                whOutCode: box.whOutCode,
                                thenTotalQtyBal: box.thenTotalQtyBal,//待上架
                                thenLockQty: box.thenLockQty,//已上架
                                thenQtyBal: box.thenQtyBal,//
                                tdQty: box.boxQtyBal,//本次出库
                                assistQty:  box.boxQtyBal/box.invSubUnitMulti,
                                keepingDays_transObjCode: 1,
                                batchNo: box.batchNo,
                                productionDate: box.productionDate,
                                comment: '',
                                boxCode: box.boxCode,
                                postCode: this.scanCodeInfo.postCode,
                                boxRule: box.boxRule
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
        handlerSetMattersBox(){
            if(!this.scanCodeInfo.postCode) {
                this.showTost = true;
                this.tostText = '请先扫申请单号!';
                this.scanCodeInfo.boxCode = "";
                this.$refs.postCode.focus();
                return;
            };

            if(!this.scanCodeInfo.boxCode) return;

            if(this.scanCodeInfo.boxCode.split('-').length !=3){
                this.showTost = true;
                this.tostText = '箱码不符合规则，请重新扫码!'
                this.$refs.boxCode.focus();
                return;
            }

            if(this.boxCodesMap[this.scanCodeInfo.boxCode]){
                this.showTost = true;
                this.tostText = '该箱码已经扫过啦，请不要重复扫码哦!';
                this.$refs.boxCode.focus();
                return;
            }

            //记录已扫码信息,防止重复扫码
            this.boxCodesMap[this.scanCodeInfo.boxCode] = this.scanCodeInfo.boxCode;
            
            this.handlerSetMatters();
            this.scanCodeInfo.boxCode = '';
            this.$refs.boxCode.focus();
        },
        getDataSet(){
            let dataSet = [];
            let keyMap = {
                "transObjCode": "outPutMatCode",
                "inventoryName": "inventoryName_outPutMatCode",
                "assMeasureDescription": "specification_outPutMatCode",
                "assMeasureUnit": "measureUnit_outPutMatCode",
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
                        formData:JSON.stringify(formData)
                    }, matCodeCollection  = [];

                    formData.outPut.dataSet.forEach(val => {
                        matCodeCollection.push(val.inventoryCode);
                    })

                    submitAndCalc(submitData).then(data => {
                        this.$HandleLoad.hide()
                        let {success = false, message = '提交失败'} = data;
                        
                        if (success) {
                            message = '提交成功';
                            releaseSortingOrder(this.scanCodeInfo.postCode,matCodeCollection.join(',')).then(res => {
                                this.$router.back();
                            })
                        }
                        this.$vux.alert.show({
                            content: message
                        });
                    }).catch(e => {
                        this.$HandleLoad.hide();
                    })
                }
            })
        }
    },
    mounted(){
        this.$loading.hide();
        this.$nextTick(() => {
            this.fillBscroll = new Bscroll(this.$refs.fill, {click: true})
        })
       
        //扫库位码后确定的仓库信息
        //扫库位码后切换库位的判断依据
        this.warehouse = {};
        //扫箱码后确定的申请单号信息
        this.postCode = '';
        //已扫箱码信息集合
        this.boxCodesMap = {};
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

.materiel-wrapper{
    padding: 0 .15rem;
    font-size: .14rem;
    position: relative;
    background: #FFF;
    margin-bottom: .1rem;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    .header{
        height: .30rem;
        margin: .15rem 0 0 0;
        line-height: .30rem;
        color: #696969;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
    }
    .materiels{
        padding: 0.2em;
        font-size: 14px;
        .materiel-item{
            .materiel-info{
                font-weight: 600;
            }
            .box-codes{
                font-size: 12px;
                color: #696969;
                .mater_delete{
                    position: relative;
                    padding-left: 0.3rem;
                }
                .box-code{
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
                    
                    .matter-img {
                        width: .75rem;
                        height: .75rem;
                        display: inline-block;
                        img {
                            width: 100%;
                            max-height: 100%;
                        }
                    }
                    .matter-info{
                        -webkit-box-flex: 1;
                        -ms-flex: 1;
                        flex: 1;
                        position: relative;
                        margin-left: .12rem;
                        padding-bottom: .15rem;
                        .box-operate{
                            display: flex;
                            padding-top: .10rem;
                            -webkit-box-sizing: border-box;
                            box-sizing: border-box;
                            -webkit-box-pack: justify;
                            -ms-flex-pack: justify;
                            justify-content: space-between;
                        }
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
}
</style>

