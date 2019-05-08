<template>
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <!-- 物料列表 -->
        <div class="materiel_list work_list">
          <div class="vux-1px-t" v-for="(dItem,dIndex) in fundConfig" :key="dIndex" >
            <!-- 可编辑的字段 -->
            <template v-if="!dItem.readOnly">
              <div class='each_property' v-if="dItem.fieldCode === 'transMatchedCode'" @click="showWorkPop = true">
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <div class='picker'>
                  <span class='mater_nature'>{{workInfo[dItem.fieldCode] || workInfo[dItem.displayField] || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
              <!-- 下拉框 -->
              <div class='each_property' v-if="dItem.xtype === 'r2Selector' && dItem.fieldCode !== 'transMatchedCode'" @click="showManager()">
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <div class='picker'>
                  <span class='mater_nature'>{{workInfo[dItem.fieldCode] || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
              <!-- 输入框（数字） -->
              <div class='each_property ' v-if="dItem.xtype === 'r2Numberfield'">
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <input type='number' v-model.number="workInfo[dItem.fieldCode]" placeholder="请输入" class='property_val' 
                      @focus="getFocus($event)" @blur="checkAmt(workInfo) "/>
              </div>
               <!-- 输入框（数字） -->
              <div class='each_property ' v-if="dItem.xtype === 'r2Permilfield'">
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <input type='number' v-model.number="workInfo[dItem.fieldCode]" placeholder="请输入" class='property_val' 
                      @focus="getFocus($event)" @blur="checkAmt(workInfo) "/>
              </div>
              <!-- 输入框（文字） -->
              <div class='each_property' v-if="dItem.xtype === 'r2Textfield'">
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <input type='text' v-model="workInfo[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
              </div>
              <!-- 日期 -->
              <div class='each_property' v-if="dItem.xtype === 'r2Datefield'" @click="getDate(workInfo,dItem)">
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <div class='picker'>
                  <span class='mater_nature'>{{workInfo[dItem.fieldCode] || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
              <!-- 单选 -->
              <div class='each_property' v-if="dItem.xtype === 'r2Checkbox'">
                <!-- <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label> -->
                <x-switch :title="dItem.fieldLabel" v-model="workInfo[dItem.fieldCode]"></x-switch>
              </div>
            </template>
            <!--不可编辑的字段 -->
            <template  v-else>
              <div class='each_property readOnly'>
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <span class='property_val'>{{workInfo[dItem.fieldCode] || workInfo[dItem.showFieldCode]}}</span>
              </div>
            </template>
          </div>
          <!-- 物料popup -->
          <pop-work-check-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                               @sel-work="selWork" ref="matter"></pop-work-check-list>
        </div>
        <pop-manager-list :show="showManagerPop" v-model="showManagerPop" @sel-item="selManager"
                          :defaultValue="defaultManager"></pop-manager-list>
        <pop-warehouse-list2 title="入库仓库" :filter-params="filterParams" :default-value="warehouse" :default-store="warehouseStoreInfo" 
                            @get-store="getStore" @sel-item="selWarehouse" :gl-params="glParams" isRequired isShowStore></pop-warehouse-list2>
        <div class="materiel_list work_list" v-show="bomList.length">
          <bom-list :boms="bomList">
            <template slot-scope="{bom}" slot="specification">
              <div class="content-unit">
                <span>产品规格: {{bom.specification || "无"}}</span>
              </div>
            </template>
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">数量: {{bom.tdQty}}{{bom.measureUnit}}</span>
                <span class="number-unit">bom数量: {{bom.qty}}</span>
                <span class="number-unit">损耗率: {{bom.specificLoss}}</span>
              </div>
            </template>
          </bom-list>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t'>
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部提交确认栏 -->
    <div class='btn-no-amt vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div>
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { XTextarea,XSwitch } from 'vux'
// 请求 引入
import { saveAndStartWf, saveAndCommitTask, submitAndCalc, updateData } from 'service/common/commonService'
import { getBomWorkCheck } from 'service/Product/gdService'
import { getSOList } from 'service/detailService'
// mixins 引入
import Applycommon from 'mixins/applyCommon'
// 组件引入
import PopManagerList from 'components/Popup/workList/PopManagerList'
import PopWarehouseList2 from 'components/Popup/PopWarehouseList2'
import PopWorkCheckList from 'components/Popup/workList/PopWorkCheckList'
import BomList from 'components/detail/commonPart/BomList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
// 插件 引入
import { toFixed } from '@/plugins/calc'
import { accMul,accAdd } from 'plugins/calc/decimalsAdd'
import { constants } from 'crypto';

const DRAFT_KEY = 'GDYS_DATA';
export default {
  mixins: [Applycommon],
  components: {
    BomList, XTextarea, PopBaseinfo,
    PopManagerList, PopWorkCheckList, PopWarehouseList2, XSwitch
  },
  data () {
    return {
      listId: 'f9f1e0cb-7edf-43aa-b2f2-527e2525b96e',
      formData: { biComment: '' },
      filterParams: [{ property: 'warehouseType', operator: 'eq', value: '加工车间仓' }],
      scanResult: '',
      biProcessStatus: '',    // 流程状态
      dealer: {},
      workInfo: {},           // 工序信息
      warehouse: {},
      defaultManager: {},
      warehouseStoreInfo: {},
      bomList: [],
      showWorkPop: false,     // 是否显示物料的popup
      showManagerPop: false,
    }
  },
  computed: {
    glParams() {
      return {
        isLastProPoint:  this.workInfo.isLastProPoint,
        warehouseType: '加工车间仓,一般部门仓'
      }
    },
  },
  methods: {
    // 选择工序
    selWork (val) {
      console.log('val',val)
      val.tdQty = val.qtyBal;
      val.differenceNum = 0;
      val.checkLossQty = 0;
      val.productDemandQty = val.qtyBal;
      this.workInfo = val;
      this.defaultManager = {};
      getBomWorkCheck({
        startCode: val.orderCode,
        processCode: val.processCode,
        parentInvCode: val.matCode
      }).then(({tableContent = []}) => {
        this.bomList = tableContent;
        this.setBomQty();
      })
    },
    // 显示组长pop
    showManager() {
      this.showManagerPop = !this.showManagerPop;
    },
    // 选择员工
    selManager (val) {
      this.defaultManager = val;
      // 员工 工号
      this.workInfo.dealerName_dealerDebit = this.defaultManager.dealerName;
      this.workInfo.dealerDebit = this.defaultManager.dealerCode;
    },
    // 检验本次验收数量
    checkAmt (item) {
      let {tdQty, qtyBal} = item;
      item.tdQty = Math.abs(toFixed(tdQty));
      item.differenceNum = item.differenceNum || 0; 
      item.checkLossQty = item.checkLossQty || 0;
      item.productDemandQty = item.differenceNum + item.tdQty + item.checkLossQty;
      if (tdQty) {
        if (tdQty > qtyBal) {
          item.tdQty = qtyBal;
        }
        this.setBomQty();
      }
    },
    // 选择的库位
    getStore(val){
      this.warehouseStoreInfo = {...val};
    },
    //计算合格扣料数(可验收,bom数量,损耗率,物料属性)
    calcThenTotalQtyBal(thenQtyBal,bomQty,bomSpecificLoss,tdProcessing) {
      let qty = 0;
      if(thenQtyBal && bomQty){
        qty = toFixed(thenQtyBal * bomQty);
        if (bomSpecificLoss) qty = toFixed(qty + qty * Number(bomSpecificLoss));
        if(tdProcessing == '包装物') qty = Math.ceil(qty);
      }
      return qty;
    },
    //计算数量(本次验收合格数,不合格数,损耗数,bom数量,损耗率,物料属性)
    calcTdQty(tdQty,differenceNum,checkLossQty,bomQty,bomSpecificLoss,tdProcessing) {
      let qty = 0;
      let productDemandQty = 0;
      productDemandQty = tdQty + differenceNum + checkLossQty;
      if(productDemandQty && bomQty){
        qty = toFixed(productDemandQty * bomQty);
        if (bomSpecificLoss) {
          qty = toFixed(qty + qty * Number(bomSpecificLoss));
        }
      }
      return qty;
    },
    //是否关闭工单
    checkWhether(val) {
      let whether = 0;
      if(val) {
        whether = 1;
      } else {
        whether = 0;
      }
      return whether;
    },
    // 提价订单
    submitOrder () {
        /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * @outPutDataSet bom提交的数据
       */ 
      let warn = '',
        dataSet = [],
        outPutDataSet = [];
      if (!this.workInfo.transCode) {
        warn = '请选择工序'
      }
      if (!this.defaultManager.dealerCode) {
        warn = '验收者不能为空'
      }
      if (!warn && !this.warehouse.warehouseCode) {
        warn = '请选择入库仓库'
      }
      if (!warn && !this.warehouseStoreInfo.warehouseCode) {
        warn = '请选择库位'
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      let workInfo = this.workInfo;
      // // 赋值
      dataSet.push({
        transMatchedCode: workInfo.transCode, // 工单任务号
        orderCode: workInfo.orderCode, // 工单任务号
        processCode: workInfo.processCode,
        proPointCode: workInfo.proPointCode, // 工序编码
        thenQtyBal: workInfo.qtyBal, // 可验收余额
        tdQty: workInfo.tdQty, // 本次验收
        differenceNum: workInfo.differenceNum, //不合格数
        checkLossQty: workInfo.checkLossQty, //损耗数
        productDemandQty: workInfo.productDemandQty,
        rearProPointCode: workInfo.rearProPointCode || '', // 后置工序编码
        dealerDebit: this.defaultManager.dealerCode, // 验收人
        proFlowCode: workInfo.proFlowCode || '',
        transObjCode: workInfo.matCode, // 物料编码
        tdProcessing: workInfo.processing,// 加工属性
        skinFee: workInfo.skinFee,
        wages: workInfo.wages,
        whether: this.checkWhether(workInfo.whether),
      });
      this.bomList.forEach(item => {
        outPutDataSet.push({
          inventoryName_outPutMatCode: item.inventoryName,
          outPutMatCode: item.inventoryCode,
          proPointCode: workInfo.proPointCode,
          transMatchedCode: workInfo.transCode,
          orderCode: workInfo.orderCode,
          processCode: workInfo.processCode,
          parentInventoryCode: workInfo.matCode,
          processProCode: workInfo.matCode,
          tdProcessing: item.processing,
          specification_outPutMatCode: item.specification,
          measureUnit_outPutMatCode: item.measureUnit,
          containerCodeOut: item.whCode,
          warehouseName_storehouseOutCode: item.warehouseName,
          storehouseOutCode: item.warehouseCode,
          thenTotalQtyStock: item.qtyBalance,
          locationStock: item.storehouseQtyBal,          
          bomType: item.bomType,
          bomQty: item.qty,
          thenTotalQtyBal: this.calcThenTotalQtyBal(workInfo.qtyBal,item.qty,item.specificLoss,item.processing),
          bomSpecificLoss: item.specificLoss,
          tdQty: this.calcTdQty(workInfo.tdQty,workInfo.differenceNum,workInfo.checkLossQty,item.qty,item.specificLoss,item.processing),
        })
      });

      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf; // 默认有工作流
          let wfPara = {
            [this.processCode]: {
              businessKey: this.businessKey,
              createdBy: "",
              acceptor: workInfo.dealerDebit,
              inWarehouseName: this.warehouse.warehouseName,
            }
          }
          if (this.isResubmit && !this.isModify) {
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: this.formData.biComment,
            }
          }
          let submitData = {
            listId: this.listId,
            biComment: this.formData.biComment,
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              biProcessStatus: this.biProcessStatus || null, // 流程状态
              containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null,
              order: {
                containerCode: this.warehouse.warehouseCode,
                warehouseName_containerCode: this.warehouse.warehouseName,
                storehouseInCode: this.warehouseStoreInfo.warehouseCode,
                warehouseInType: this.warehouseStoreInfo.warehouseType,
                dataSet
              },
              outPut: {
                // containerCode: this.warehouse.warehouseCode,
                dataSet: outPutDataSet,
              },
            }),
            wfPara: JSON.stringify(wfPara)
          }
          if (this.isResubmit) { // 重新提交
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
          }
          if (!this.processCode.length) { // 无工作流
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
          }
          if (this.isModify){ // 修改
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      })
    },
    // 获取详情
    getFormData () {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode: this.transCode
      }).then(data => {
        let {success = true, formData = {}} = data;
        // http200时提示报错信息
        if (!success) {
          this.$vux.alert.show({
            content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
          });
          return;
        }
        this.attachment = data.attachment;
        let matterList = [];
        // 获取合计
        let {order,outPut} = formData,
            {dataSet = []} = order;
        let boms = outPut.dataSet;
        this.workInfo = {
          ...dataSet[0],
          matCode: dataSet[0].transObjCode,
          inventoryName: dataSet[0].inventoryName_transObjCode,
          procedureName: dataSet[0].procedureName_proPointCode,
          technicsName: dataSet[0].technicsName_proFlowCode,
          qtyBal: dataSet[0].thenQtyBal,
          transCode: dataSet[0].transMatchedCode,
          processing: dataSet[0].tdProcessing || null,
          wareName: order.warehouseName_containerCode,
          whInCode: order.containerCode,
          wareAddress: order.warehouseAddress_containerCode,
          dealerName: dataSet[0].dealerName_dealerDebit,
          dealerCode: dataSet[0].dealerDebit, // 工人
          dealerLabel: dataSet[0].drDealerLabel, // 标签
        }
        this.defaultManager = {
          dealerName: dataSet[0].dealerName_dealerDebit,
          dealerCode: dataSet[0].dealerDebit, // 工人
          dealerLabel: dataSet[0].drDealerLabel, // 标签
        }
        this.facility = {
          facilityName: dataSet[0].facilityName_facilityObjCode,
          facilityCode: dataSet[0].facilityObjCode,
          facilityType: dataSet[0].facilityTypebase_facilityObjCode,
        }
        boms.forEach(bom => {
          bom.inventoryCode = bom.outPutMatCode;
          bom.inventoryName =bom.inventoryName_outPutMatCode;
          bom.measureUnit = bom.measureUnit_outPutMatCode;
          bom.parentInvCode = bom.processProCode;
          bom.processing = bom.tdProcessing;
          bom.qty = bom.bomQty;
          bom.whCode = bom.containerCodeOut,
          bom.specification = bom.specification_outPutMatCode || '无';
          bom.specificLoss = bom.bomSpecificLoss || 0;
          bom.warehouseCode = bom.storehouseOutCode; 
        })
        this.bomList = boms;
        // 仓库
        this.warehouse = {
          warehouseCode: order.containerCode,
          warehouseName: order.warehouseName_containerCode,
          warehouseType: order.warehouseType_containerCode,
          warehouseProvince: order.warehouseProvince_containerCode,
          warehouseCity: order.warehouseCity_containerCode,
          warehouseDistrict: order.warehouseDistrict_containerCode,
          warehouseAddress: order.warehouseAddress_containerCode,
        };
        this.warehouseStoreInfo = {
          warehouseCode: order.storehouseInCode,
          warehouseName: order.warehouseName_storehouseInCode,
          warehouseType: order.warehouseInType,
          warehouseAddress: order.warehouseAddress_storehouseInCode,
        }
        this.handlerDefault = {
          handler: formData.handler,
          handlerName: formData.handlerName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
        };
        // 基本信息
        this.formData = {
          ...this.handlerDefault,
          biComment: formData.biComment,
          biId: formData.biId,
          biProcessStatus: formData.biProcessStatus,
          creator: formData.creator,
          modifer: formData.modifer,
        }
        this.biProcessStatus = formData.biProcessStatus;
        this.biReferenceId = formData.biReferenceId;
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData () {
      if (!this.workInfo.transCode) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          workInfo: this.workInfo,
          defaultManager: this.defaultManager,
          formData: this.formData,
          warehouse: this.warehouse,
          warehouseStoreInfo: this.warehouseStoreInfo,
          bomList: this.bomList,
        }
      };
    },
    // 启用企业微信扫一扫
    scanQRCode () {
      scanQRCode().then(({result = ''}) => {
        this.scanResult = result;
      })
    },
    // 选择仓库
    selWarehouse (item) {
      this.warehouse = JSON.parse(item);
    },
    // 设置bom的数量
    setBomQty () {
      let tdQty = this.workInfo.tdQty;
      this.bomList = this.bomList.map(item => {
        return {
          ...item,
          tdQty: this.calcTdQty(this.workInfo.tdQty,this.workInfo.differenceNum,this.workInfo.checkLossQty,item.qty,item.specificLoss,item.processing),
        }
      });
    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.workInfo = draft.workInfo;
      this.defaultManager = draft.defaultManager;
      this.formData = draft.formData;
      this.warehouse = draft.warehouse;
      this.warehouseStoreInfo = draft.warehouseStoreInfo;
      this.bomList = draft.bomList;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizApply';
  @import '~@/scss/color';

  .gdrw-apply-container {
    
    .scan {
      width: 100%;
      text-align: center;
    }
    .work_list{
      padding: 0 .15rem;
      box-sizing: border-box;
      background: #fff;
      margin-bottom: .1rem;
      font-size: .14rem;
      input {
        border: none;
        outline: none;
        font-size: .14rem;
      }
    }
    .each_property {
      padding: .18rem 0;
      display: flex;
      justify-content: space-between;
      line-height: .14rem;
      label{
        color: #696969;
      }
      .add{
        color: #3296FA;
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
      .weui-cell {
        padding: 0;
        color: #696969;
        width: 100%;
        .weui-cell__ft {
          float:right;
        }
      }
    }
  }

</style>
