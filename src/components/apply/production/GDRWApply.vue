<template>
<!--工单任务-->
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <pop-warehouse-list3 title="在制仓库" :default-value="warehouse" @sel-item="selWarehouse" :default-store="warehouseStoreInfo" 
                            @get-store="getStore" :filter-params="filterParams" :gl-params="glParams" isRequired isShowStore>
        </pop-warehouse-list3>
        <!-- 工单列表 -->
        <div class="materiel_list work_list">
          <div class="order-info" @click="getOrder" v-if="!workInfo.length">
            <div class="title">加工订单列表</div>
            <div class="seleted_icon">
              请选择<span class="icon-right"></span>
            </div>
          </div>
          <template v-else>
            <div class="order-detail" :class="{'has_top' : index > 0}" v-for="(item, index) in workInfo"
                 :key="index">
              <div class="work_info vux-1px-b">
                <r-column-title :title ="item.inventoryName" @click="deleteClick(index)"/>
                <r-column-item title="订单号" :value="item.transCode"/>
                <r-column-item :title="cItem.text" :value="item[cItem.fieldCode] || item[cItem.showFieldCode]" v-for="(cItem, cIndex) in matterEditConfig.property" :key="cIndex" />
                <r-column-item title="工艺路线编码" :value="item.proFlowCode"/>
                <r-column-item title="工艺路线名称" :value="item.technicsName"/>
              </div>
              <div class="edit_part" v-for="(dItem, dIndex) in matterEditConfig.editPart" :key="dIndex" >
                <!-- 可编辑的字段 -->
                <template v-if="!dItem.readOnly">
                  <!-- 下拉框 -->
                  <div class='each_property vux-1px-b' v-if="dItem.editorType === 'r2Selector'" @click="getSeletor(dItem.fieldCode, index)">
                    <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                    <div class='picker'>
                      <span class='mater_nature'>{{item[dItem.fieldCode] || "请选择"}}</span>
                      <span class='icon-right'></span>
                    </div>
                  </div>
                  <!-- 输入框（数字） -->
                  <div class='each_property vux-1px-b' v-if="dItem.editorType === 'r2Numberfield'">
                    <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                    <input type='number' v-model.number="item[dItem.fieldCode]" placeholder="请输入" class='property_val' 
                          @focus="getFocus($event)" @blur="checkAmt(item, index) "/>
                  </div>
                  <!-- 输入框（文字） -->
                  <div class='each_property vux-1px-b' v-if="dItem.editorType === 'r2Textfield'">
                    <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                    <input type='text' v-model="item[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                  </div>
                  <!-- 日期 -->
                  <div class='each_property vux-1px-b' v-if="dItem.editorType === 'r2Datefield'" @click="getDate(item,dItem)">
                    <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                    <div class='picker'>
                      <span class='mater_nature'>{{item[dItem.fieldCode] || "请选择"}}</span>
                      <span class='icon-right'></span>
                    </div>
                  </div>
                </template>
                <!--不可编辑的字段 -->
                <template v-else>
                  <div class='each_property readOnly'>
                    <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                    <span class='property_val'>{{item[dItem.fieldCode]}}</span>
                  </div>
                </template>
              </div>
              <div class='each_property vux-1px-b' @click="getSeletor('facilityName_facilityObjCode', index)">
                <label>设施</label>
                <div class='picker'>
                  <span class='mater_nature'>{{item.facilityName_facilityObjCode || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
            </div>
            <div></div>
          </template>
          <div class="sumbit-part" v-if="workInfo.length">
            <div class="add_more" @click="addMore">
              <span class="icon-add"></span>
              <span class="add_text">新增加工订单</span>
            </div>
          </div>
        </div>
        <!-- 工序popup -->
        <pop-work-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                        @sel-item="selWork" ref="matter" :ck-params="ckParams" ></pop-work-list>
        <pop-manager-list :show="showManagerPop" v-model="showManagerPop" @sel-item="selManager"
                          :defaultValue="defaultManager[managerIndex]"></pop-manager-list>
        <pop-work-facility-list :show="showFacilityPop" v-model="showFacilityPop" @sel-item="selFacility"
                                :defaultValue="defaultFacility[facilityIndex]">
        </pop-work-facility-list>
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
import { Popup, Datetime, XTextarea, numberComma, TransferDom } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getTaskBom } from 'service/materService'
import { updateData, submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
// mixins 引入
import Applycommon from 'mixins/applyCommon'
// 组件 引入
import PopWorkList from 'components/Popup/workList/PopWorkList'
import PopWarehouseList3 from 'components/Popup/PopWarehouseList3'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import PopManagerList from 'components/Popup/workList/PopManagerList'
import PopWorkFacilityList from 'components/Popup/workList/PopWorkFacilityList'
// 插件 引入
import { accMul } from 'plugins/calc/decimalsAdd'
import { toFixed } from '@/plugins/calc'
import { constants } from 'crypto';
const DRAFT_KEY = 'GDRW_DATA';

export default {
  directives: { TransferDom },
  components: {
    Popup, Datetime, XTextarea,
    PopBaseinfo, PopWorkList, PopManagerList,
    PopWarehouseList3, PopWorkFacilityList
  },
  data() {
    return {
      formData: {
        biComment: '', // 备注
        biProcessStatus:'', // 流程状态
      },
      filter: [ // bom请求参数
        {
          operator: "in",
          property: "whCode",
          value: ""
        },
        {
          operator: "in",
          property: "parentInvCode",
          value: ''
        }
      ],
      filterParams: [
        {
          property: 'warehouseType', 
          operator: 'eq', 
          value: '加工车间仓'
        }
      ],
      scanResult: '',
      warehouse: {},              // 仓库信息
      warehouseStoreInfo: {},     // 库位信息
      workInfo: [],               // 工序信息
      defaultManager:[],          // 
      defaultFacility: [],
      showWorkPop: false, // 是否显示物料的popup
      managerIndex: null,
      facilityIndex: null,
      showManagerPop: false,
      showFacilityPop: false, // 是否显示设备的popup
    }
  },
  mixins: [Applycommon],
  filters: {
    numberComma,
  },
  computed: {
    departId() {
      return this.formData.handlerUnit;
    },
    glParams() {
      return {
        groupId:  this.formData.handlerUnit
      }
    },
    ckParams() {
      return {
        whCode: this.warehouse.warehouseCode
      }
    }
  },
  watch: {
    // 此处监听 经办组织id
    departId: {
      handler(newVal, oldVal){
        this.glParams.groupId = newVal;
      }     
    },
    warehouse: {
      handler(val){
        this.ckParams.whCode = val.warehouseCode;
      }
    }
  },
  methods: {
    handlerMatterEditConfig:function(config){
       console.log(config);
    },
    getOrder(){
      if (!this.warehouse.warehouseCode){
        this.$vux.alert.show({
          content: '请选择在制仓库'
        })
        return
      }
      this.showWorkPop = true;
    },
    // 选择工序
    selWork(val) {
      this.workInfo = val;
      this.workInfo.forEach((item, index) => {
        // 数量赋初始值
        item.tdQty = item.thenQtyBal;
        // 请求bom
        this.filter[1].value = item.inventoryCode;
        this.getTaskBom(index).then(data => {
          item.boms = data
          this.$set(this.workInfo, index, {...item})
        })
      })
    },
    // 处理选择器，根据不同字段调用不同组件
    getSeletor(fieldCode, index) {
      if (fieldCode === 'dealerName_dealerDebit'){
        this.showManager(index)
      }
      else if (fieldCode === 'facilityName_facilityObjCode'){
        this.showFacility(index)
      }
    },
    // 显示组长pop
    showManager(index) {
      this.managerIndex = index;
      this.showManagerPop = !this.showManagerPop;
    },
    // 选择组长
    selManager(val) {
      let selItem = val;
      this.defaultManager[this.managerIndex] = selItem;
      this.workInfo[this.managerIndex].dealerName_dealerDebit = selItem.dealerName;
			this.workInfo[this.managerIndex].dealerDebit = selItem.dealerCode;
			this.workInfo[this.managerIndex].drDealerLabel = selItem.dealerLabelName;
    },
    // 显示设备pop
    showFacility(index) {
      this.facilityIndex = index;
      this.showFacilityPop = !this.showFacilityPop;
    },
    // 选择设备
    selFacility(val) {
      this.defaultFacility[this.facilityIndex] = val;
      this.workInfo[this.facilityIndex].facilityName_facilityObjCode = val.facilityName;
			this.workInfo[this.facilityIndex].facilityObjCode = val.facilityCode;
			this.workInfo[this.facilityIndex].facilityTypebase_facilityObjCode = val.facilityType;
    },
    // 选择的库位
    getStore(val) {
      this.warehouseStoreInfo = {...val};
    },
    // 校验数量
    checkAmt(item, index) {
      let {tdQty, thenQtyBal, numberWorkers} = item;
      item.tdQty = Math.abs(toFixed(tdQty))
      if (tdQty) {
        if (tdQty > thenQtyBal) {
          item.tdQty = thenQtyBal;
        }
        // 重新计算bom
        item.boms && item.boms.forEach(bom => {
          let tdQty = accMul(item.tdQty, bom.qty);
          bom.tdQty = Math.abs(toFixed(tdQty))
        })
      }
      if (numberWorkers) {
        item.numberWorkers = Math.round(numberWorkers);
      }
    },
    // 选中仓库
    selWarehouse(val) {
      this.warehouse = JSON.parse(val);
    },
    addMore() {
      this.showWorkPop = !this.showWorkPop;
    },
    // 刪除加工订单
    deleteClick(index) {
      this.workInfo.splice(index, 1)
    },
    // 提价订单
    submitOrder() {
       /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       */ 
      let warn = '',
          dataSet = [];
      if (!this.workInfo.length) {
        warn = '请选择加工订单';
      }
      if (!warn && !this.warehouse.warehouseCode) {
        warn = '请选择在制仓库';
      }
      if (!warn && !this.warehouseStoreInfo.warehouseCode) {
        warn = '请选择库位';
      }
      if (!warn) {
        // 动态组装 dataSet
        for (let item of this.workInfo) {
          let oItem = {};
          for (let sItem of this.submitMatterField){
            let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
            if (!sItem.hidden && !sItem.allowBlank && !val){
              if (sItem.text) warn = `${sItem.text}不为空`;
              break;
            }
            oItem[sItem.fieldCode] = val !== undefined ? val : null;
          }
          let bom = [];
          item.boms.forEach(bItem => {
            bom.push({
              tdQty: bItem.tdQty,
              storehouseInCode: this.warehouseStoreInfo.warehouseCode,
              proPointCode: item.proPointCode,
              processCode: item.transCode,
              processProCode: item.inventoryCode,
              outPutMatCode: bItem.inventoryCode,
              bomSpecificLoss: bItem.specificLoss,
              thenQtyStock: bItem.qtyBal,
              specification_outPutMatCode: bItem.specification,
              tdProcessing: bItem.processing,
              inventoryName_outPutMatCode: bItem.inventoryName,
              measureUnit_outPutMatCode: bItem.measureUnit,
              bomType: bItem.bomType,
              bomQty: bItem.qty,
              thenLockQty: bItem.tdQty,
              thenQtyBal: 0
            })
          })
          dataSet.push({
            processProQty: null,
            tdId: null,
            ...oItem,
            boms: bom
          });
        }
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn
        })
        return
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf; // 默认有工作流
          let wfPara = {
            [this.processCode]: {businessKey: this.businessKey, createdBy: ""}
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
              order: {
                containerCode: this.warehouse.warehouseCode,
                storehouseInCode: this.warehouseStoreInfo.warehouseCode,
                dataSet,
              },
            }),
            wfPara : JSON.stringify(wfPara)
          }
          if (this.isResubmit) { // 重新提交
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
          }
          if (!this.processCode.length){ // 无工作流
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
          }
          if (this.isModify) {
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      })
    },
    // 判断是否有弹窗需要关闭
    onHistoryBack() {
      if (this.showWorkPop) {
        this.showWorkPop = false;
        return false
      }
      return true
    },
     // 获取详情
    getFormData() {
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
        let {order} = formData;
        let {dataSet = []} = order;
        for (let item of dataSet) {
          item = {
            ...item,
            inventoryCode: item.transObjCode,
            inventoryName: item.inventoryName_outPutMatCode,
            procedureName: item.procedureName_proPointCode,
            technicsName: item.technicsName_proFlowCode,
            transCode: item.transMatchedCode,
            processing: item.tdProcessing || null,
          };
          item.boms.forEach(bom => {
            bom.inventoryCode = bom.outPutMatCode;
            bom.nventoryName =bom.inventoryName_outPutMatCode;
            bom.measureUnit = bom.measureUnit_outPutMatCode;
            bom.parentInvCode = bom.processProCode;
            bom.processing = bom.tdProcessing;
            bom.qty = bom.bomQty;
            bom.qtyBal = bom.thenQtyStock;
            bom.specification = bom.specification_outPutMatCode;
            bom.specificLoss = bom.bomSpecificLoss;
          })
          matterList.push(item);
        }
        this.workInfo = matterList;
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
          warehouseName: order.warehouseName_storehouseInCode,
          warehouseCode: order.storehouseInCode,
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
        this.biReferenceId = formData.biReferenceId;
        this.$loading.hide();
      })
    },
    getTaskBom(index) {
      this.filter[0].value = this.warehouse.warehouseCode;
      return getTaskBom({filter: JSON.stringify(this.filter)}).then(({tableContent = []}) => {
        tableContent.forEach(bom => {
          let tdQty1 = this.workInfo[index].tdQty;
          let tdQty = accMul(tdQty1, bom.qty, (1 + bom.specificLoss));
          bom.tdQty = toFixed(tdQty);
        });
        return tableContent;
      })
    },
    // 是否保存草稿
    hasDraftData () {
      if (!this.workInfo.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          workInfo: this.workInfo,
          warehouse: this.warehouse,
          warehouseStoreInfo: this.warehouseStoreInfo,
          formData: this.formData,
        }
      };
    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.workInfo = draft.workInfo;
      this.warehouse = draft.warehouse;
      this.warehouseStoreInfo = draft.warehouseStoreInfo;
      this.formData = draft.formData;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }
}
</script>

<style lang='scss'>
  @import '~scss/biz-app/bizApply';
  @import '~@/scss/color';
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .gdrw-apply-container {
    .scan {
      width: 100%;
      text-align: center;
    }
    // 备注
    .comment{
      margin-top: .1rem;
    }
    .work_list{
      box-sizing: border-box;
      margin-bottom: .1rem;
      font-size: .14rem;
      input {
        border: none;
        outline: none;
        font-size: .14rem;
      }
    }
    .order-info {
      display: flex;
      justify-content: space-between;
      padding: .18rem .15rem;
      background: #fff;
      .title {
        font-weight: bold;
        color: #3296FA;
      }
      .seleted_icon {
        display: flex;
        align-items: center;
      }
      .icon-right {
        width: .08rem;
        height: .14rem;
        margin-left: .1rem;
      }
    }
    .order-detail {
      background: #fff;
      padding: 0 .15rem;
      &.has_top {
        margin-top: .1rem;
      }
      .work_info{
        padding: .1rem 0;
      }
      .matter_name {
        color: #333;
        font-size: .14rem;
        font-weight: bold;
        line-height: .22rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .icon-shanchu1{
          color: red;
          font-weight: normal;
        }
      }
      .detail-item {
        display: inline-block;
        font-size: .12rem;
        color: #333;
        margin-right: .08rem;
        line-height: .22rem;
        .item-title{
          color: #999;
        }
      }
      .weui-cell {
        padding: 10px 0;
        font-size: .14rem;
        &:before {
          left: 0;
        }
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
    }
     // 新增更多
    .sumbit-part {
      width: 100%;
      display: flex;
      text-align: center;
      position: relative;
      background: #fff;
      .add_more {
        display: flex;
        color: #3296FA;
        font-weight: bold;
        text-align: center;
        align-items: center;
        margin: .1rem auto;
        border-radius: .15rem;
        padding: .06rem .08rem;
        border: 1px solid #3296FA;
        .icon-add {
          width: .14rem;
          height: .14rem;
          margin-right: .05rem;
          box-sizing: border-box;
        }
        .add_text {
          font-size: .12rem;
          line-height: .12rem;
        }
      }
    }
  }

</style>
