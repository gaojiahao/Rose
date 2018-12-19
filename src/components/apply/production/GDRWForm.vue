<template>
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- <div class="scan" @click="scanQRCode">扫一扫 {{scanResult}}</div> -->
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <pop-warehouse-list title="在制仓库" :default-value="warehouse" @sel-item="selWarehouse" 
                            :filter-params="filterParams" :is-required="true">
        </pop-warehouse-list>
        <!-- 工单列表 -->
        <div class="materiel_list">
          <div class="order-info" @click="showWorkPop = true" v-if="!workInfo.length">
            <div class="title">工序信息</div>
            <div class="mode">请选择工序</div>
            <span class="iconfont icon-youjiantou r-arrow"></span>
          </div>
          <template v-else>
            <div class="title">工序信息</div>
            <div class="order-detail" :class="{'vux-1px-t': index !== 0}" v-for="(item, index) in workInfo"
                 :key="index">
              <div class="detail-item top">
                <span class="info-item">{{item.inventoryName}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">订单号: {{item.transCode}}</span>
                <span class="info-item">工序名称: {{item.procedureName}}</span>
                <span class="info-item">工序编码: {{item.proPointCode}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">工艺路线名称: {{item.technicsName}}</span>
                <span class="info-item">工艺路线编码: {{item.proFlowCode}}</span>
              </div>
              <div class="detail-item">
                <span class="info-item">派工总数: {{item.productDemandQty}}</span>
                <span class="info-item">工序可派工: {{item.thenQtyBal}}</span>
              </div>
              <x-input text-align='right' placeholder='请填写' type='number' @on-blur="checkAmt(item,index)"
                       @on-focus="getFocus($event)" v-model.number='item.tdQty'>
                <template slot="label">
                  <span class="required">派工数量</span>
                </template>
              </x-input>
              <datetime v-model='item.promDeliTime'>
                <template slot="title">
                  <span class='required'>要求完工日期</span>
                </template>
              </datetime>
              <cell v-model="item.dealerName_dealerDebit" isLink @click.native="showManager(index)">
                <template slot="title">
                  <span class='required'>组长</span>
                </template>
              </cell>
              <x-input title="工人数量" text-align='right' placeholder='请填写' type='number' @on-blur="checkAmt(item,index)"
                       @on-focus="getFocus($event)" v-model.number='item.numberWorkers'>
              </x-input>
              <cell v-model="item.facilityName_facilityObjCode" title="设施" isLink @click.native="showFacility(index)">
              </cell>
            </div>
          </template>
        </div>
        <!-- 工序popup -->
        <pop-work-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                        @sel-work="selWork" ref="matter"></pop-work-list>
        <pop-manager-list :show="showManagerPop" v-model="showManagerPop" @sel-item="selManager" 
                          :defaultValue="defaultManager"></pop-manager-list>
        <pop-work-facility-list :show="showFacilityPop" v-model="showFacilityPop" @sel-item="selFacility" 
                                :defaultValue="defaultFacility">
        </pop-work-facility-list>
        <!--备注-->
        <div class='comment vux-1px-t'>
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
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
import { Popup, TransferDom, Group,
        Cell, numberComma, Datetime,
        XInput, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { saveAndStartWf, saveAndCommitTask, submitAndCalc } from 'service/commonService'
import { getTaskBom } from 'service/materService'
// mixins 引入
import Applycommon from 'components/mixins/applyCommon'
// 组件引入
import PopManagerList from 'components/Popup/workList/PopManagerList'
import PopWorkList from 'components/Popup/workList/PopWorkList'
import PopWorkFacilityList from 'components/Popup/workList/PopWorkFacilityList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import RPicker from 'components/RPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'

/* 引入微信相关 */
import { scanQRCode } from 'plugins/wx/api'
// 公共方法
import { accMul, accAdd, accSub } from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'GDRW_DATA';

export default {
  directives: {
    TransferDom
  },
  components: {
    Popup, PopWorkList,
    Group, Cell, Datetime,
    XInput, XTextarea, PopManagerList,
    RPicker, PopWorkFacilityList, PopWarehouseList, PopBaseinfo
  },
  data () {
    return {
      listId: '2372f734-93c1-11e8-85db-005056a136d0',
      showWorkPop: false, // 是否显示物料的popup
      showManagerPop: false,
      showFacilityPop: false, // 是否显示设备的popup
      formData: {
        biComment: '', // 备注
        biProcessStatus:'', // 流程状态
      },
      workInfo: [], // 工序信息
      defaultManager: {},
      defaultFacility: {},
      scanResult: '',
      warehouse: {}, // 选中仓库属性
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
      filterParams: [{property: 'warehouseType', operator: 'eq', value: '加工车间仓'}],
      managerIndex: null,
      facilityIndex: null,
    }
  },
  mixins: [Applycommon],
  filters: {
    numberComma,
  },
  methods: {
    // 选择工序
    selWork (val) {
      this.workInfo = JSON.parse(val);
      this.workInfo.forEach((item,index) => {
        // 数量赋初始值
        item.tdQty = item.thenQtyBal;
      })
    },
    // 显示组长pop
    showManager(index) {
      this.managerIndex = index;
      this.showManagerPop = !this.showManagerPop;
    },
    // 选择组长
    selManager (val) {
      this.defaultManager = JSON.parse(val);
      this.workInfo[this.managerIndex].dealerName_dealerDebit = this.defaultManager.dealerName;
			this.workInfo[this.managerIndex].dealerDebit = this.defaultManager.dealerCode;
			this.workInfo[this.managerIndex].drDealerLabel = this.defaultManager.dealerLabelName;
    },
    // 显示设备pop
    showFacility(index) {
      this.facilityIndex = index;
      this.showFacilityPop = !this.showFacilityPop;
    },
    // 选择设备
    selFacility (val) {
      this.defaultFacility = val;
      this.workInfo[this.facilityIndex].facilityName_facilityObjCode = this.defaultFacility.facilityName;
			this.workInfo[this.facilityIndex].facilityObjCode = this.defaultFacility.facilityCode;
			this.workInfo[this.facilityIndex].facilityTypebase_facilityObjCode = this.defaultFacility.facilityType;
    },
    // 校验数量
    checkAmt (item, index) {
      let {tdQty, thenQtyBal, numberWorkers} = item;
      if (tdQty) {
        if(tdQty > thenQtyBal){
          item.tdQty = thenQtyBal;
        }
        item.tdQty = Math.abs(toFixed(tdQty))
        // 重新计算bom
        item.boms && item.boms.forEach(bom => {
          let tdQty = accMul(item.tdQty, bom.qty);
          bom.tdQty = Math.abs(toFixed(tdQty))
        })
      }
      if(numberWorkers){
        item.numberWorkers = Math.round(numberWorkers);
      }     
    },
    // TODO 选中仓库
    selWarehouse (val) {
      this.warehouse = JSON.parse(val);
      this.filter[0].value = this.warehouse.warehouseCode;
      this.workInfo.forEach((item, index) => {
        this.filter[1].value = item.inventoryCode;
        // 获取bom 
        this.getTaskBom(index).then(data => {
          item.boms = data
          this.$set(this.workInfo, index, {...item})         
        })
      })
    },
    // 提价订单
    submitOrder () {
      let warn = '',
          dataSet = [];
      let validateMap = [
        {
          key: 'tdQty',
          message: '请填写派工数量'
        }, {
          key: 'dealerName_dealerDebit',
          message: '请选择组长'
        }, {
          key: 'promDeliTime',
          message: '请选择要求完工日期'
        }
      ];
      if (!this.workInfo.length) {
        warn = '请选择工序';
      }
      if (!warn && !this.warehouse.warehouseCode) {
        warn = '请选择在制仓库';
      }
      if (!warn) {
        this.workInfo.every(item => {
          validateMap.every(vItem => {
            if (!item[vItem.key] && item[vItem.key] !== 0) {
              warn = vItem.message;
              return false;
            }
            return true
          });
          let bom = [];
          item.boms.forEach(bItem => {
            bom.push({
              tdQty: bItem.tdQty,
              proPointCode: item.proPointCode,
              processCode: item.transCode,
              processProCode: item.inventoryCode,
              outPutMatCode: bItem.inventoryCode,
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
            transMatchedCode: item.transCode,
            processProQty: item.processProQty || null,
            transObjCode: item.inventoryCode,
            inventoryName_transObjCode: item.inventoryName,
            proPointCode: item.proPointCode,
            procedureName_proPointCode: item.procedureName,
            tdId: item.tdId || null,
            productDemandQty: item.productDemandQty,
            thenLockQty: item.thenLockQty,
            thenQtyBal: item.thenQtyBal,
            tdQty: item.tdQty,
            dealerName_dealerDebit: item.dealerName_dealerDebit,
            dealerDebit: item.dealerDebit,
            drDealerLabel: item.drDealerLabel,
            numberWorkers: item.numberWorkers,
            facilityName_facilityObjCode: item.facilityName_facilityObjCode,
            proFlowCode: item.proFlowCode || '',       
            technicsName_proFlowCode: item.technicsName,
            promDeliTime: item.promDeliTime,
            facilityObjCode: item.facilityObjCode || '', // 设备编码
            facilityTypebase_facilityObjCode: item.facilityTypebase_facilityObjCode || '',
            boms: bom
          })
          return true
        })   
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
            [this.processCode]: {businessKey: "WTSK", createdBy: ""}
          }
          if (this.isResubmit) {
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ""
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
                dataSet,
              },
            }),
            wfPara : JSON.stringify(wfPara)
          }
          if (this.isResubmit) { // 重新提交
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
          }
          if(!this.processCode.length){ // 无工作流
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
          }
          console.log(submitData)
          this.saveData(operation, submitData);
        }
      })
    },
    // TODO 启用企业微信扫一扫
    scanQRCode () {
      scanQRCode().then(({result = ''}) => {
        this.scanResult = result;
      })
    },
    // TODO 判断是否有弹窗需要关闭
    onHistoryBack () {
      if (this.showWorkPop) {
        this.showWorkPop = false;
        return false
      }
      return true
    },
     // TODO 获取详情
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
          let tdQty = accMul(tdQty1, bom.qty);
          bom.tdQty = toFixed(tdQty);
        });
        return tableContent;
      })
    },
  },
  created () {
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  @import '~@/scss/color';
  .gdrw-apply-container {
    .basicPart {
      height: 90%;
    }
    .scan {
      width: 100%;
      text-align: center;
    }
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
    // 备注
    .comment{
      margin-top: .1rem;
    }
    .order-info {
      position: relative;
      .title {
        font-size: .12rem;
      }
      .r-arrow {
        position: absolute;
        top: 50%;
        right: -1%;
        font-weight: bold;
        transform: translate(0, -50%);
      }
    }
    .order-detail {
      margin-bottom: .1rem;
      &:first-child {
        padding-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
      .detail-item {
        display: flex;
        flex-wrap: wrap;
        color: #757575;
        font-size: .12rem;
        &.top {
          color: #000;
          font-size: .14rem;
        }
      }
      .info-item {
        margin-right: .05rem;
      }
      .weui-cell {
        padding: 10px 0;
        font-size: .14rem;
        &:before {
          left: 0;
        }
      }
    }
  }

</style>
