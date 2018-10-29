<template>
  <div class="pages gdrw-apply-container">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <div class="title">工序信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell isLink title='工序名称' v-model="workInfo.procedureName || '请选择'"
                  @click.native="showWorkPop = !showWorkPop"></cell>
            <cell title='工单任务号' v-model="workInfo.transCode" :disabled="!workInfo.transCode"></cell>
            <cell title='工艺路线名称' v-model="workInfo.technicsName" :disabled="!workInfo.technicsName"></cell>
            <cell title='工艺路线编码' v-model="workInfo.proFlowCode" :disabled="!workInfo.proFlowCode"></cell>
          </group>
          <!-- 工序pop -->
          <pop-work-gdbll-list :show="showWorkPop" v-model="showWorkPop" :defaultValue="workInfo"
                               @sel-work="selWork"></pop-work-gdbll-list>
        </div>
        <div class="materiel_list">
          <div class="title">加工订单信息</div>
          <group class='costGroup' group-title-margin-top="0">
            <cell title='加工订单号' v-model="workInfo.processCode" :disabled="!workInfo.processCode"></cell>
            <cell title='成品名称' v-model="workInfo.inventoryName" :disabled="!workInfo.inventoryName"></cell>
            <cell title='成品编码' v-model="workInfo.matCode" :disabled="!workInfo.matCode"></cell>
            <x-input title="补领料数量" v-model="workInfo.tdQty" :disabled='!workInfo.inventoryName' text-align="right"
                     :placeholder="workInfo.inventoryName ? '请填写':''" @on-focus="getFocus($event)">
              <template slot="label">
                <span class='required'>补领料数量</span>
              </template>
            </x-input>
          </group>
        </div>
        <!--项目信息-->
        <div class="or_ads mg_auto" @click="showProjectPop = !showProjectPop">
          <div class="title">项目名称</div>
          <div v-if='project.PROJECT_NAME'>
            <div class="cp_info">
              <p class="cp_name">{{project.PROJECT_NAME}}</p>
            </div>
          </div>
          <div v-else>
            <div class="mode required">请选择项目名称</div>
          </div>
          <i class="iconfont icon-youjiantou r_arrow"></i>
        </div>
        <pop-project-list :show="showProjectPop" v-model="showProjectPop" :defaultValue="project"
                          @sel-project="selProject"></pop-project-list>

        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" ></upload-file>
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
  import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
  // mixins 引入
  import Applycommon from 'components/mixins/applyCommon'
  // 组件引入
  import PopManagerList from 'components/Popup/PopManagerList'
  import PopWorkList from 'components/Popup/workList/PopWorkList'
  import PopWorkGdbllList from 'components/Popup/workList/PopWorkGDBLLList'
  import PopProjectList from 'components/Popup/PopProjectList'

  const DRAFT_KEY = 'GDBLL_DATA';
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup, PopWorkList,
      Group, Cell, Datetime,
      XInput, XTextarea, PopManagerList,
      PopProjectList, PopWorkGdbllList,
    },
    data() {
      return {
        listId: '6ebcad8b-449c-422a-960f-53ccf98fd4ba',
        showWorkPop: false,                             // 是否显示物料的popup
        transMode: [],                                  // 结算方式 数组
        matterList: [],                                 // 物料列表
        dealer: {},
        numMap: {},                                     // 用于记录订单物料的数量和价格
        contact: {},
        formData: {},
        dealerInfo: {},
        workInfo: {},                                    // 工序信息
        defaultManager: {},
        showProjectPop: false,
        project: {},
        defaultProject: [],
      }
    },
    mixins: [Applycommon],
    filters: {
      numberComma,
    },
    methods: {
      // 选择工序
      selWork(val) {
        this.workInfo = {
          tdQty: '',
          ...val,
        };
      },
      // TODO 提交订单
      submitOrder() {
        let warn = '',
          dataSet = [];
        if (!this.workInfo.transCode) {
          warn = '请选择工序'
        }
        if (!warn && !this.workInfo.tdQty) {
          warn = '请填写补领料数量';
        }
        if (!warn && !this.project.PROJECT_NAME) {
          warn = '请选择项目';
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          })
          return
        }
        let obj = {
          transMatchedCode: this.workInfo.transCode,
          proPointCode: this.workInfo.proPointCode,
          tdQty: this.workInfo.tdQty,
          transObjCode: this.workInfo.matCode,
          proFlowCode: this.workInfo.proFlowCode,
          processCode: this.workInfo.processCode,
          tdProcessing: this.workInfo.processing,
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
                biProcessStatus: this.currentStage,
                order: {
                  dataSet,
                  project: this.project.PROJECT_NAME,
                  departmentName: this.formData.handlerUnitName,
                }
              }),
              wfPara: JSON.stringify(wfPara)
            }
            if (this.isResubmit) {//重新提交
              operation = saveAndCommitTask;
              submitData.biReferenceId = this.biReferenceId;
            }
            if (!this.processCode.length) {//无工作流
              operation = submitAndCalc;
              delete submitData.wfPara;
              delete submitData.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
            }
            console.log(operation)
            console.log(submitData)
            // this.saveData(operation, submitData);
          }
        })
      },
      // TODO 选择项目
      selProject(sel) {
        this.project = {...sel};
      },
      // TODO 是否保存草稿
      hasDraftData() {
        if (!this.workInfo.procedureName) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            workInfo: this.workInfo,
            project: this.project,
            formData: this.formData
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.workInfo = draft.workInfo;
        this.project = draft.project;
        this.formData = draft.formData;
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
