<template>
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <div class="scan" @click="scanQRCode">扫一扫 {{scanResult}}</div>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <div class="title">工序信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell isLink title='工序名称' v-model="workInfo.procedureName || '请选择'" @click.native="showWorkPop = !showWorkPop" ></cell>
            <cell title='工序编码' v-model="workInfo.proPointCode" :disabled="!workInfo.proPointCode"></cell>
            <cell title='工序待验收' v-model="workInfo.thenQtyStock" :disabled="!workInfo.thenQtyStock"></cell>
            <cell title='工序可派工' v-model="workInfo.thenQtyBal" :disabled="!workInfo.thenQtyBal"></cell>
            <x-input title="派工数量" type="number" text-align="right" v-model.number="workInfo.tdQty"  :disabled='!workInfo.thenQtyBal'
                    :placeholder="workInfo.thenQtyBal ? '请填写':''" @on-focus="getFocus($event)" @on-blur='checkAmt(workInfo)'>
              <template slot="label">
                <span class='required'>派工数量
                </span>
              </template>
            </x-input>
          </group>
          <!-- 物料popup -->
          <pop-work-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                          @sel-work="selWork" ref="matter"></pop-work-list>
        </div>
        <pop-manager-list title='工人' @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>
        <pop-facility-list  @sel-item="selFacility" :defaultValue="defaultFacility"></pop-facility-list>
        <div class="materiel_list">
          <div class="title">加工订单信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell title='加工订单号' v-model="workInfo.processCode" :disabled="!workInfo.processCode"></cell>
            <cell title='成品名称' v-model="workInfo.inventoryName" :disabled="!workInfo.inventoryName"></cell>
            <cell title='加工订单数量' v-model="workInfo.processProQty" :disabled="!workInfo.processProQty"></cell>
          </group>
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
import { Popup, TransferDom, Group,
        Cell, numberComma, Datetime,
        XInput, XTextarea } from 'vux'
// 请求 引入
import { saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
// mixins 引入
import Applycommon from 'components/mixins/applyCommon'
// 组件引入
import PopManagerList from 'components/Popup/PopManagerList'
import PopWorkList from 'components/Popup/workList/PopWorkList'
import PopFacilityList from 'components/Popup/workList/PopFacilityList'
import RPicker from 'components/RPicker'

/* 引入微信相关 */
import {scanQRCode} from 'plugins/wx/api'

const DRAFT_KEY = 'GDRW_DATA';

export default {
  directives: {
    TransferDom
  },
  components: {
    Popup, PopWorkList,
    Group, Cell, Datetime,
    XInput, XTextarea, PopManagerList,
    RPicker, PopFacilityList
  },
  data() {
    return {
      listId: '2372f734-93c1-11e8-85db-005056a136d0',
      showWorkPop: false,                             // 是否显示物料的popup
      showFacilityPop :false,                         // 是否显示设备的popup
      formData: {
        biComment : '',                               //备注
        biProcessStatus :''                           //流程状态
      },
      workInfo: {},                                    // 工序信息
      defaultManager: {},
      defaultFacility : {},
      scanResult: '',
    }
  },
  mixins: [Applycommon],
  filters: {
    numberComma,
  },
  methods: {
    // 选择工序
    selWork(val) {
      this.workInfo = val;
    },
    // 选择员工
    selManager(val) {
      this.defaultManager = JSON.parse(val);
      // 员工 工号
      this.workInfo.dealerDebit = this.defaultManager.dealerCode;
      // 类型
      this.workInfo.drDealerLabel = this.defaultManager.dealerLabelName;
    },
    //选择设备
    selFacility(val){
      this.defaultFacility = val;
      this.workInfo.facilityObjCode  = this.defaultFacility.facilityCode;
      this.workInfo.facilityTypebase_facilityObjCode  = this.defaultFacility.facilityType;
    },
    //校验数量
    checkAmt(item){
      let {tdQty, thenQtyBal} = item;
      if (tdQty) {
        if(tdQty > thenQtyBal){
          item.tdQty = thenQtyBal;
        }
      }
    },
    //提价订单
    submitOrder() {
      let warn = '',
          dataSet = [];
      if(!this.workInfo.colId){
        warn = '请选择工序'
      }
      let checkData = [
        { key: 'tdQty', msg: '请填写派工数量'},
        { key: 'dealerDebit', msg: '请选择工人'}
      ]
      if(!warn){
        checkData.every(item => {
          if(!this.workInfo[item.key]){
            warn = item.msg;
            return false;
          }
          return true;
        })
      }
      if(warn){
        this.$vux.alert.show({
          content: warn
        })
        return
      }
      let obj = {
        proPointCode: this.workInfo.proPointCode,
        thenQtyStock: this.workInfo.thenQtyStock,
        thenQtyBal: this.workInfo.thenQtyBal,
        tdQty: this.workInfo.tdQty,
        dealerDebit: this.workInfo.dealerDebit,
        drDealerLabel: this.workInfo.drDealerLabel,
        proFlowCode: this.workInfo.proFlowCode || '',
        facilityObjCode: this.workInfo.facilityObjCode || '', //设备编码
        facilityTypebase_facilityObjCode: this.workInfo.facilityTypebase_facilityObjCode || '',
        processCode: this.workInfo.processCode,
        transObjCode: this.workInfo.inventoryCode,
        processProQty: this.workInfo.processProQty
      }
      // 赋值
      dataSet.push(obj);
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf;//默认有工作流
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
                dataSet
              }
            }),
            wfPara : JSON.stringify(wfPara)
          }
          if (this.isResubmit) {//重新提交
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
          }
          if(!this.processCode.length){//无工作流
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
    hasDraftData() {
      if (!this.workInfo.proPointCode) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          workInfo : this.workInfo,
          formData : this.formData,
          defaultManager : this.defaultManager
        }
      };
    },
    // TODO 启用企业微信扫一扫
    scanQRCode() {
      scanQRCode().then(({result = ''}) => {
        this.scanResult = result;
      })
    },
    // TODO 判断是否有弹窗需要关闭
    onHistoryBack() {
      if (this.showWorkPop) {
        this.showWorkPop = false;
        return false
      }
      return true
    },
  },
  created(){
    let data = sessionStorage.getItem(DRAFT_KEY);
    if(data){
      this.workInfo = JSON.parse(data).workInfo;
      this.defaultManager = JSON.parse(data).defaultManager;
      this.formData = JSON.parse(data).formData;
      sessionStorage.removeItem(DRAFT_KEY);
    }
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
