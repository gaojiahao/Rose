<template>
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- <div class="scan" @click="scanQRCode">扫一扫 {{scanResult}}</div> -->
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态"
                  v-model="biProcessStatus" :hasBorder="false"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <div class="title">工序信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell isLink title='工单启动号' v-model="workInfo.transCode || '请选择'"
                  @click.native="showWorkPop = !showWorkPop"></cell>
            <cell title='工单派工号' v-model="workInfo.orderCode" :disabled="!workInfo.orderCode"></cell>
            <cell title='工序名称' v-model="workInfo.procedureName" :disabled="!workInfo.procedureName"></cell>
            <cell title='可验收余额' v-model="workInfo.qtyBal" :disabled="!workInfo.qtyBal"></cell>
            <x-input title="本次验收" type="number" v-model.number="workInfo.tdQty" :disabled='!workInfo.qtyBal'
                     text-align="right"
                     :placeholder="workInfo.qtyBal ? '请填写':''" @on-focus="getFocus($event)"
                     @on-blur="checkAmt(workInfo)">
              <template slot="label">
                <span class='required'>本次验收
                </span>
              </template>
            </x-input>
            <cell title="后置工序" v-model="workInfo.rearProcedureName" :disabled="!workInfo.rearProcedureName"></cell>
            <cell title="工艺路线编码" v-model="workInfo.proFlowCode" :disabled="!workInfo.rearProcedureName"></cell>
            <cell title="工艺路线名称" v-model="workInfo.technicsName" :disabled="!workInfo.rearProcedureName"></cell>
            <cell title="物料名称" v-model="workInfo.inventoryName" :disabled="!workInfo.inventoryName">
              <template slot="title">
                <span class='required'>物料名称
                </span>
              </template>
            </cell>
            <cell title="物料编码" v-model="workInfo.matCode" :disabled="!workInfo.matCode">
              <template slot="title">
                <span class='required'>物料编码
                </span>
              </template>
            </cell>
            <cell title="制造费用" v-model="workInfo.skinFee" :disabled="!workInfo.skinFee"></cell>
            <cell title="工价" v-model="workInfo.wages" :disabled="!workInfo.wages"></cell>
          </group>
          <!-- 物料popup -->
          <pop-work-check-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                               @sel-work="selWork" ref="matter"></pop-work-check-list>
        </div>
        <pop-manager-list title='验收者' @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>
        <pop-warehouse-list title="入库仓库" :filter-params="filterParams" :default-value="warehouse"
                            @sel-item="selWarehouse" isRequired></pop-warehouse-list>
        <div class="materiel_list" v-show="bomList.length">
          <bom-list :boms="bomList">
            <template slot-scope="{bom}" slot="specification">
              <div class="content-unit">
                <span>型号规格：{{bom.specification || "无"}}</span>
              </div>
            </template>
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">数量: {{bom.tdQty}}{{bom.measureUnit}}</span>
                <span class="number-unit">bom数量: {{bom.qty}}</span>
              </div>
            </template>
          </bom-list>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t'>
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
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
  import {
    Popup, TransferDom, Group,
    Cell, numberComma, Datetime,
    XInput, XTextarea
  } from 'vux'
  // 请求 引入
  import { saveAndStartWf, saveAndCommitTask, submitAndCalc } from 'service/commonService'
  import { getBomWorkCheck } from 'service/Product/gdService'
  import { getSOList } from 'service/detailService'
  // mixins 引入
  import Applycommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopManagerList from 'components/Popup/PopManagerList'
  import PopWarehouseList from 'components/Popup/PopWarehouseList'
  import PopWorkCheckList from 'components/Popup/workList/PopWorkCheckList'
  import RPicker from 'components/RPicker'
  import BomList from 'components/detail/commonPart/BomList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  /* 引入微信相关 */
  import { scanQRCode } from 'plugins/wx/api'
  import { toFixed } from '@/plugins/calc'
  import { accMul } from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'GDYS_DATA';
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup, PopWorkCheckList,
      Group, Cell, Datetime,
      XInput, XTextarea, PopManagerList, RPicker,
      PopWarehouseList, BomList, PopBaseinfo
    },
    data () {
      return {
        listId: 'f9f1e0cb-7edf-43aa-b2f2-527e2525b96e',
        showWorkPop: false, // 是否显示物料的popup
        dealer: {},
        formData: {
          biComment: '', // 备注
        },
        workInfo: {}, // 工序信息
        defaultManager: {},
        biProcessStatus: '', // 流程状态
        scanResult: '',
        warehouse: {},
        filterParams: [{property: 'warehouseType', operator: 'eq', value: '加工车间仓'}],
        bomList: [],
      }
    },
    mixins: [Applycommon],
    filters: {
      numberComma,
    },
    methods: {
      // 选择工序
      selWork (val) {
        val.tdQty = val.qtyBal;
        this.workInfo = val;
        getBomWorkCheck({
          transCode: val.transCode,
          inventoryCode: val.matCode
        }).then(({tableContent = []}) => {
          this.bomList = tableContent;
          this.setBomQty();
        })
      },
      // 选择员工
      selManager (val) {
        this.defaultManager = JSON.parse(val);
        // 员工 工号
        this.workInfo.dealerDebit = this.defaultManager.dealerCode;
      },
      // 检验本次验收数量
      checkAmt (item) {
        let {tdQty, qtyBal} = item;
        if (tdQty) {
          if (tdQty > qtyBal) {
            item.tdQty = qtyBal;
          }
          this.setBomQty();
        }
      },
      // 提价订单
      submitOrder () {
        let warn = '',
          dataSet = [],
          outPutDataSet = [];
        if (!this.workInfo.transCode) {
          warn = '请选择工序'
        }
        let checkData = [
          {key: 'tdQty', msg: '请填写验收数量'},
          {key: 'dealerDebit', msg: '请选择验收者'}
        ]
        if (!warn) {
          checkData.every(item => {
            if (!this.workInfo[item.key]) {
              warn = item.msg;
              return false;
            }
            return true;
          })
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          })
          return
        }
        let workInfo = this.workInfo;
        // 赋值
        dataSet.push({
          transMatchedCode: workInfo.transCode, // 工单任务号
          orderCode: workInfo.orderCode, // 工单任务号
          processCode: workInfo.processCode,
          proPointCode: workInfo.proPointCode, // 工序编码
          thenQtyBal: workInfo.qtyBal, // 可验收余额
          tdQty: workInfo.tdQty, // 本次验收
          rearProPointCode: workInfo.rearProPointCode || '', // 后置工序编码
          dealerDebit: workInfo.dealerDebit, // 验收人
          proFlowCode: workInfo.proFlowCode || '',
          transObjCode: workInfo.matCode, // 物料编码
          tdProcessing: workInfo.processing,// 加工属性
          skinFee: workInfo.skinFee,
          wages: workInfo.wages
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
            bomType: item.bomType,
            bomQty: item.qty,
            tdQty: item.tdQty,
          })
        });

        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf; // 默认有工作流
            let wfPara = {
              [this.processCode]: {businessKey: "WTAC", createdBy: ""}
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
                biProcessStatus: this.biProcessStatus || null, // 流程状态
                containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null,
                order: {
                  containerCode: this.warehouse.warehouseCode,
                  dataSet,
                },
                outPut: {
                  containerCode: this.warehouse.warehouseCode,
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
            this.saveData(operation, submitData);
          }
        })
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
      // TODO 是否保存草稿
      // hasDraftData () {
      //   if (!this.workInfo.transCode) {
      //     return false
      //   }
      //   return {
      //     [DRAFT_KEY]: {
      //       workInfo: this.workInfo,
      //       defaultManager: this.defaultManager,
      //       formData: this.formData,
      //       warehouse: this.warehouse,
      //       bomList: this.bomList,
      //     }
      //   };
      // },
      // TODO 启用企业微信扫一扫
      scanQRCode () {
        scanQRCode().then(({result = ''}) => {
          this.scanResult = result;
        })
      },
      // TODO 选择仓库
      selWarehouse (item) {
        this.warehouse = JSON.parse(item);
      },
      // TODO 设置bom的数量
      setBomQty () {
        let tdQty = this.workInfo.tdQty;
        this.bomList = this.bomList.map(item => {
          return {
            ...item,
            tdQty: toFixed(accMul(item.qty, tdQty), 3)
          }
        });
      },
    },
    created () {
      // let data = sessionStorage.getItem(DRAFT_KEY);
      // if (data) {
      //   let draft = JSON.parse(data);
      //   this.workInfo = draft.workInfo;
      //   this.defaultManager = draft.defaultManager;
      //   this.formData = draft.formData;
      //   this.warehouse = draft.warehouse;
      //   this.bomList = draft.bomList;
      //   sessionStorage.removeItem(DRAFT_KEY);
      // }
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
  }

</style>
