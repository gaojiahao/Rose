<template>
  <div class="pages gdrwqd-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!--<div class="scan" @click="scanQRCode">扫一扫 {{scanResult}}</div>-->
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus=false></pop-baseinfo>
        <!-- 物料列表 -->
        <div class="materiel_list work_list">
          <div class="vux-1px-t" v-for="(item, index) in fundConfig" :key="index" >
            <div class='each_property' v-if="item.fieldCode === 'procedureName_proPointCode'" @click="showWorkPop = true">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <div class='picker'>
                <span class='mater_nature'>{{workInfo[item.displayField] || "请选择"}}</span>
                <span class='icon-right'></span>
              </div>
            </div>
            <div class='each_property readOnly' v-else>
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <span class='property_val'>{{workInfo[item.fieldCode] || workInfo[item.showFieldCode] || workInfo[item.displayField]}}</span>
            </div>
          </div> 
        </div>
        <pop-work-start-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                               @sel-work="selWork"></pop-work-start-list>
        <div class="work_list warehouse " v-show="workInfo.whInCode">
          <div class="user_info">
            <span class="user_name">{{workInfo.wareName}}</span>
            <span class="user_tel">{{workInfo.whInCode}}</span>
          </div>
          <div class="cp_info">
            <span class="icon-dealer-address"></span>
            <span class="cp_ads">
              {{workInfo.wareAddress}}
            </span>
          </div>
        </div>
        <!--<pop-manager-list title='验收者' @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>-->
        <!-- <pop-facility-list @sel-item="selFacility" :default-value="facility"></pop-facility-list> -->
        <div class="materiel_list work_list" v-show="bomList.length">
          <bom-list :boms="bomList">
            <template slot-scope="{bom}" slot="specification">
              <div class="content-unit">
                <span>产品规格: {{bom.specification}}</span>
              </div>
            </template>
            <template slot-scope="{bom}" slot="number">
              <div class="number-part">
                <span class="main-number">数量: {{bom.tdQty || 0}}{{bom.measureUnit}}</span>
                <span class="number-unit">bom数量: {{bom.qty}}</span>
                <span class="number-unit">损耗率: {{bom.specificLoss}}</span>
              </div>
            </template>
          </bom-list>
        </div>
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
  import {
    Popup, TransferDom, Group,
    Cell, numberComma, Datetime,
    XInput, XTextarea
  } from 'vux'
  // 请求 引入
  import { saveAndStartWf, saveAndCommitTask, submitAndCalc, updateData } from 'service/commonService'
  import { getBomWorkStart } from 'service/Product/gdService'
  import { getSOList } from 'service/detailService'
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
            item.tdQty = toFixed(accMul(item.qty, val.tdQty, (1 + item.specificLoss)), 2);
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
          facilityObjCode: workInfo.facilityCode || '', // 设施编码
          facilityTypebase_facilityObjCode: workInfo.facilityType || '', // 设施类型
          transObjCode: this.workInfo.inventoryCode, // 物料编码
        });

        this.bomList.forEach(item => {
          outPutDataSet.push({
            outPutMatCode: item.inventoryCode,
            inventoryName_outPutMatCode: item.inventoryName,
            processProCode: item.parentInvCode,
            tdProcessing: item.processing,
            specification_outPutMatCode: item.specification,
            measureUnit_outPutMatCode: item.measureUnit,
            bomType: item.bomType,
            bomQty: item.qty,
            bomSpecificLoss: item.specificLoss,
            tdQtyCopy1: item.tdQty,
          })
        });

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
             if (this.isModify) {
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
            inventoryCode: dataSet[0].transObjCode,
            inventoryName: dataSet[0].inventoryName_transObjCode,
            procedureName: dataSet[0].procedureName_proPointCode,
            technicsName: dataSet[0].technicsName_proFlowCode,
            transCode: dataSet[0].transMatchedCode,
            processing: dataSet[0].tdProcessing || null,
            wareName: order.warehouseName_containerCode,
            whInCode: order.containerCode,
            wareAddress: order.warehouseAddress_containerCode,
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
            bom.qtyBal = bom.thenQtyStock;
            bom.specification = bom.specification_outPutMatCode || '无';
            bom.specificLoss = bom.bomSpecificLoss || 0;
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
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide();
        })
      },
      // 是否保存草稿
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
          }
        };
      },
      // 启用企业微信扫一扫
      scanQRCode () {
        scanQRCode().then(({result = ''}) => {
          this.scanResult = result;
        })
      },
      // 选择设施
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
        sessionStorage.removeItem(DRAFT_KEY);
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  @import '~@/scss/color';

  .gdrwqd-apply-container {
    .scan {
      width: 100%;
      text-align: center;
    }
    .pop-company-container {
      margin-top: .1rem;
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
    }
    .warehouse {
      padding: .1rem .15rem;
      .mode {
        font-size: 0;
      }
      // 用户信息
      .user_info {
        line-height: .14rem;
        // 用户姓名
        .user_name {
          color: #3296FA
        }
      }
      // 地址
      .cp_info {
        color: #111;
        display: flex;
        margin-top: .1rem;
        align-items: center;
        .icon-dealer-address {
          width: .12rem;
          height: .14rem;
          margin-right: .06rem;
        }
        .cp_ads {
          flex: 1;
          font-size: .12rem;
          color: #999;
        }
      }
    }
  }

</style>
