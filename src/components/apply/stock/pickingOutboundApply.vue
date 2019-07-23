<template>
    <div class='pages cpxq-apply-container'>
        <div class="basicPart" ref="fill">
            <div class="wrapper">
                <div class="scanCodeInfo">
                    <div class="vux-1px-t">
                        <div class='each_property' >
                            <label class="required">申请单号</label>
                            <input 
                                type='text' 
                                v-model="scanCodeInfo.postCode" 
                                placeholder="请扫码" 
                                class='property_val' 
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
                                @change="handlerSetMattersBox"
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
import { getPickingOutByBoxCode } from 'service/wmsService'
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
                done += mat.tdQty;
            });

            return {
                all:mat.thenQtyBal,
                done:done,
                todo:mat.thenQtyBal - done
            }
        },
        handlerSetMatters(callback){
            let params = {
                boxCode:this.scanCodeInfo.boxCode,
                transCode: this.scanCodeInfo.postCode
            };

            let materielMap = {};
            getPickingOutByBoxCode(params).then(res => {
                res.tableContent.map(m => {
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
                        assMeasureUnit: mat.invSubUnitName,
                        assMeasureDescription: mat.invSubUnitComment,
                        assMeasureScale: mat.invSubUnitMulti,
                        warehouseName: mat.warehouseName,
                        boxRule: mat.boxRule,
                        storehouseInCode: mat.storehouseCode,
                        whOutCode: mat.whOutCode,
                        thenTotalQtyBal: mat.thenTotalQtyBal,//待上架
                        thenLockQty: mat.thenLockQty,//已上架
                        thenQtyBal: mat.thenQtyBal,//
                        tdQty: mat.boxQtyBal,//本次出库
                        assistQty:  mat.boxQtyBal/mat.invSubUnitMulti,
                        keepingDays_transObjCode: 1,
                        batchNo: mat.batchNo,
                        productionDate: mat.productionDate,
                        comment: '',
                        boxCodes:[]
                    });
                    this.warehouse = {
                        warehouseName: mat.warehouseName,
                        whOutCode: mat.whOutCode
                    };
                }
                this.postCode = this.scanCodeInfo.postCode;
                callback && callback();
            });
        },
        handlerSetMattersBox(){
            if(!this.scanCodeInfo.postCode) {
                this.showTost = true;
                this.tostText = '请先扫申请单号!';
                this.scanCodeInfo.boxCode = "";
                return;
            };

            if(!this.scanCodeInfo.boxCode) return;

            if(this.scanCodeInfo.boxCode.split('-').length !=5){
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

            let [postCode,matCode,batchNo,boxRule] = this.scanCodeInfo.boxCode.split('-');

            //箱码所属申请单号不一致，并且上一次扫码的申请单号有待上架数据
            if(this.postCode && this.postCode != postCode && this.matters.length>0){
                this.$vux.confirm.show({
                    content: '当前扫的箱码与前面扫的箱码所属的申请单号不一致，是否切换单据数据，以重新获取待上架数据？',
                    // 确定回调
                    onConfirm: () => {
                        this.matters = [];
                        this.handlerSetMatters(() => {
                            this.handlerAddBoxCodeToMatter(matCode,boxRule);
                            this.scanCodeInfo.boxCode = '';
                        });
                    },
                    onCancel:() =>{
                        this.scanCodeInfo.postCode = this.postCode;
                        this.scanCodeInfo.boxCode = '';
                    }
                })
            }else{
                //如果是第一次扫箱码，需通过申请单号获取待上架的物料
                if(this.postCode){
                    this.handlerSetMatters(() => {
                        this.handlerAddBoxCodeToMatter(matCode,boxRule);
                        this.scanCodeInfo.boxCode = '';
                    });
                }else{
                    this.handlerAddBoxCodeToMatter(matCode,boxRule);
                    this.scanCodeInfo.boxCode = '';
                }
                this.$refs.boxCode.focus();
            }
        },
        //往物料分组上添加箱码数据
        handlerAddBoxCodeToMatter(matCode,boxRule){
            this.matters.map(mat => {
                let temMat = Object.assign({},mat);
                delete temMat.boxCodes;
                mat.inventoryCode === matCode && mat.boxCodes.push({
                    ...temMat,
                    boxCode: this.scanCodeInfo.boxCode,
                    postCode:this.postCode,
                    tdQty:temMat.boxRule,
                });
            });
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
                    };

                    submitAndCalc(submitData).then(data => {
                        this.$HandleLoad.hide()
                        let {success = false, message = '提交失败'} = data;
                        if (success) {
                            message = '提交成功';
                            // this.$emit('change', true);
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

