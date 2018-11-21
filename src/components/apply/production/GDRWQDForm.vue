<template>
  <div class="pages gdrwqd-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!--<div class="scan" @click="scanQRCode">扫一扫 {{scanResult}}</div>-->
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态"
                  v-model="biProcessStatus" :hasBorder="false"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <div class="title">工序信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell isLink title='工序名称' v-model="workInfo.procedureName || '请选择'"
                  @click.native="showWorkPop = !showWorkPop"></cell>
            <cell title='工序编码' v-model="workInfo.proPointCode" :disabled="!workInfo.proPointCode"></cell>
            <cell title='工序待启动' v-model="workInfo.thenQtyBal" :disabled="!workInfo.thenQtyBal"></cell>
            <cell title='启动数量' v-model="workInfo.tdQty" :disabled="!workInfo.tdQty"></cell>
            <x-input title="工人" v-model="workInfo.dealerName" :disabled='!workInfo.dealerName' text-align="right"
                     :placeholder="workInfo.qtyBal ? '请填写':''" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>工人</span>
              </template>
            </x-input>
            <cell title='借方往来标签' v-model="workInfo.dealerLabel" :disabled="!workInfo.dealerLabel"></cell>
            <cell title='物料名称' v-model="workInfo.inventoryName" :disabled="!workInfo.inventoryName">
              <template slot="title">
                <span class='required'>物料名称
                </span>
              </template>
            </cell>
            <cell title='物料编码' v-model="workInfo.inventoryCode" :disabled="!workInfo.inventoryCode">
              <template slot="title">
                <span class='required'>物料编码
                </span>
              </template>
            </cell>
          </group>
          <!-- 物料popup -->
          <pop-work-start-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                               @sel-work="selWork"></pop-work-start-list>
        </div>
        <div class="warehouse or_ads mg_auto" v-show="workInfo.whInCode">
          <div class="title">仓库</div>
          <div class="mode">
            <span class="mode-item">{{workInfo.wareName}}</span>
            <span class="mode-item">{{workInfo.whInCode}}</span>
          </div>
          <div class="cp_info" v-show="workInfo.wareAddress">
            <i class="iconfont icon-icon-test"></i>
            <span class="cp_ads">{{workInfo.wareAddress}}</span>
          </div>
        </div>
        <!--<pop-manager-list title='验收者' @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>-->
        <pop-facility-list @sel-item="selFacility" :default-value="facility"></pop-facility-list>
        <div class="materiel_list" v-show="bomList.length">
          <bom-list :boms="bomList">
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">数量: {{bom.tdQty}}{{bom.measureUnit}}</span>
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
  import { getBomWorkStart } from 'service/Product/gdService'
  // mixins 引入
  import Applycommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopManagerList from 'components/Popup/PopManagerList'
  import PopWorkStartList from 'components/Popup/workList/PopWorkStartList'
  import PopFacilityList from 'components/Popup/workList/PopFacilityList'
  import RPicker from 'components/RPicker'
  import BomList from 'components/detail/commonPart/BomList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  /* 引入微信相关 */
  import { scanQRCode } from 'plugins/wx/api'
  /* 方法引入 */
  import { toFixed } from '@/plugins/calc'
  import { accMul } from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'GDRWQD_DATA';
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup, PopWorkStartList,
      Group, Cell, Datetime,
      XInput, XTextarea, PopManagerList, RPicker,
      PopFacilityList, BomList, PopBaseinfo
    },
    data() {
      return {
        listId: 'c54b3325-a5c1-4d75-a3c4-c6cf0e988aae',
        showWorkPop: false, // 是否显示物料的popup
        dealer: {},
        formData: {
          biComment: '', // 备注
        },
        workInfo: {}, // 工序信息
        defaultManager: {},
        biProcessStatus: '', // 流程状态
        scanResult: '',
        bomList: [],
        facility: {},
      }
    },
    mixins: [Applycommon],
    filters: {
      numberComma,
    },
    methods: {
      // 选择工序
      selWork (val) {
        val.tdQty = val.thenQtyBal;
        this.workInfo = val;
        getBomWorkStart(this.workInfo.inventoryCode).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.tdQty = toFixed(accMul(item.qty, val.tdQty), 3);
          });
          this.bomList = tableContent;
        })
      },
      // 选择员工
      selManager (val) {
        this.defaultManager = JSON.parse(val);
        // 员工 工号
        this.workInfo.dealerDebit = this.defaultManager.dealerCode;
      },
      // 提价订单
      submitOrder () {
        let warn = '',
          dataSet = [],
          outPutDataSet = [];
        if (!this.workInfo.procedureName) {
          warn = '请选择工序'
        }
        let checkData = [
          {key: 'dealerName', msg: '请填写工人'},
          {key: 'tdQty', msg: '请填写验收数量'},
          {key: 'wareName', msg: '请填写仓库'},
        ];
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
          proPointCode: workInfo.proPointCode, // 工序编码
          thenQtyBal: workInfo.thenQtyBal, // 工序待启动
          tdQty: workInfo.tdQty, // 启动数量
          dealerDebit: workInfo.dealerCode, // 工人
          drDealerLabel: workInfo.dealerLabel, // 标签
          proFlowCode: workInfo.proFlowCode || '', // 工艺编码
          facilityObjCode: this.facility.facilityCode || '', // 设施编码
          facilityTypebase_facilityObjCode: this.facility.facilityType || '', // 设施类型
          transObjCode: this.workInfo.inventoryCode, // 物料编码
        });

        this.bomList.forEach(item => {
          outPutDataSet.push({
            inventoryName_outPutMatCode: item.inventoryName,
            outPutMatCode: item.inventoryCode,
            tdProcessing: item.processing,
            specification_outPutMatCode: item.specification,
            measureUnit_outPutMatCode: item.measureUnit,
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
              [this.processCode]: {businessKey: "PGRW", createdBy: ""}
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
                order: {
                  containerCode: workInfo.whInCode,
                  dataSet,
                },
                outPut: {
                  containerCode: workInfo.whInCode,
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
      // TODO 是否保存草稿
      hasDraftData () {
        if (!this.workInfo.procedureName) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            workInfo: this.workInfo,
            bomList: this.bomList,
            facility: this.facility,
            formData: this.formData,
            biProcessStatus: this.biProcessStatus,
          }
        };
      },
      // TODO 启用企业微信扫一扫
      scanQRCode () {
        scanQRCode().then(({result = ''}) => {
          this.scanResult = result;
        })
      },
      // TODO 选择设施
      selFacility (item) {
        this.facility = item;
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.workInfo = draft.workInfo;
        this.bomList = draft.bomList;
        this.facility = draft.facility;
        this.formData = draft.formData;
        this.biProcessStatus = draft.biProcessStatus;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  @import '~@/scss/color';

  .gdrwqd-apply-container {
    .basicPart {
      height: 90%;
    }
    .scan {
      width: 100%;
      text-align: center;
    }
    .pop-company-container {
      margin-top: .1rem;
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
    .warehouse {
      .mode {
        font-size: 0;
      }
      .mode-item {
        margin-right: .1rem;
        font-size: .16rem;
        &:last-child {
          margin-right: 0;
        }
      }
      .icon-icon-test {
        font-size: .1rem;
      }
    }
  }

</style>
