<template>
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <div class="title">工序信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell isLink title='工单任务号' v-model="workInfo.transCode || '请选择'" @click.native="showWorkPop = !showWorkPop" ></cell>
            <cell title='工序名称' v-model="workInfo.procedureName" :disabled="!workInfo.procedureName"></cell>
            <cell title='可验收余额' v-model="workInfo.qtyBal" :disabled="!workInfo.qtyBal"></cell>
            <x-input title="本次验收" type="number" v-model.number="workInfo.tdQty" :disabled='!workInfo.qtyBal' text-align="right" 
                    :placeholder="workInfo.qtyBal ? '请填写':''"  @on-focus="getFocus($event)" @on-blur="checkAmt(workInfo)">
              <template slot="label">
                <span class='required'>本次验收
                </span>
              </template>
            </x-input>
            <cell title="后置工序" v-model="workInfo.rearProcedureName" :disabled="!workInfo.rearProcedureName"></cell>
          </group>
          <!-- 物料popup -->
          <pop-work-check-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                          @sel-work="selWork" ref="matter"></pop-work-check-list>
        </div>
        <pop-manager-list title='验收者' @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态"
                  v-model="biProcessStatus" :hasBorder = "false"></r-picker>
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
import PopWorkCheckList from 'components/Popup/workList/PopWorkCheckList'
import RPicker from 'components/RPicker'
const DRAFT_KEY = 'GDYS_DATA';
export default {
  directives: {
    TransferDom
  },
  components: {
    Popup, PopWorkCheckList,
    Group, Cell, Datetime,
    XInput, XTextarea, PopManagerList,RPicker
  },
  data() {
    return {
      listId: 'f9f1e0cb-7edf-43aa-b2f2-527e2525b96e',
      showWorkPop: false,                             // 是否显示物料的popup
      dealer: {},
      formData: {
        biComment : '',//备注
      },
      workInfo: {},                                    // 工序信息
      defaultManager: {},
      biProcessStatus : '',//流程状态
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
    },
    //检验本次验收数量
    checkAmt(item){
      let { tdQty, qtyBal} = item;
      if(tdQty){
        if(tdQty > qtyBal){
          item.tdQty = qtyBal;
        }
      }
    },
    //提价订单
    submitOrder() {
      let warn = '',
          dataSet = [];
      if(!this.workInfo.transCode){
        warn = '请选择工序'
      }
      let checkData = [
        { key: 'tdQty', msg: '请填写验收数量'},
        { key: 'dealerDebit', msg: '请选择验收者'}
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
        transMatchedCode : this.workInfo.transCode,//工单任务号
        proPointCode: this.workInfo.proPointCode,//工序编码
        thenQtyBal: this.workInfo.qtyBal,//可验收余额
        tdQty: this.workInfo.tdQty,//本次验收
        rearProPointCode : this.workInfo.rearProPointCode,//后置工序编码
        dealerDebit: this.workInfo.dealerDebit,//验收人
        proFlowCode: this.workInfo.proFlowCode || '',
        transObjCode: this.workInfo.matCode, //物料编码
        processCode: this.workInfo.processCode,//加工订单编码
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
              biProcessStatus : this.biProcessStatus || null,//流程状态
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
      if (!this.workInfo.transCode) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          workInfo : this.workInfo,
          defaultManager : this.defaultManager,
          formData : this.formData
        }
      };
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
