<template>
  <div class="pages xmlx-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus" 
                      requiredField="nickname" :processStatus="formData.biProcessStatus"></pop-baseinfo>
         <div class="materiel_list">
          <div :class="{'vux-1px-t': index > 0}" v-for="(item, index) in otherConfig" :key="index">
            <template v-if="!item.readOnly">
              <!--项目经理-->
              <template v-if="item.fieldCode === 'projectTaskName'">
                <pop-job-list class="vux-1px-t" :requestParams="item.requestParams" 
                              @sel-item="selJob" :defaultValue="defaultJob"></pop-job-list>
              </template>
              <template v-else>
                <!-- 下拉框 -->
                <r-picker :title="item.fieldLabel" :data="item.remoteData" :value="jobLog[item.fieldCode]"
                        v-model="jobLog[item.fieldCode]" :required="!item.allowBlank"
                        v-if="item.xtype === 'r2Combo'"></r-picker>
                <!-- 输入框（文字） -->
                <div class='each_property' v-if="item.xtype === 'r2Textfield'">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <input type='text' v-model="jobLog[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 输入框（数字） -->
                <div class='each_property' v-if="item.xtype === 'r2Numberfield'">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <input type='number' v-model.number="jobLog[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"
                        @blur="checkAmt(jobLog, item.fieldCode, jobLog[item.fieldCode])"/>
                </div>
                <!-- 日期 -->
                <div class='each_property' v-if="item.xtype === 'r2Datefield'" @click="getDate(jobLog,item)">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{jobLog[item.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
                <!-- 文本框 -->
                <x-textarea v-model="jobLog[item.fieldCode]" v-if="item.xtype === 'r2TextArea'" placeholder="请输入">
                  <template slot="label">
                    <span :class="{required : !item.allowBlank}" style="display: block; width: 4em;">{{item.fieldLabel}}</span>
                  </template>
                </x-textarea>
              </template>
            </template>
            <template v-else>
              <div class='each_property'>
                <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                <span class='property_val'>{{jobLog[item.fieldCode]}}</span>
              </div>
            </template>
          </div>
        </div>
        <!-- 备注 -->
        <div class="comment">         
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile"></upload-file>
      </div>
    </div>
    <!-- 底部按钮 -->
    <op-button :hide="btnIsHide" @on-submit="save"></op-button>
  </div>
</template>
<script>
  // vux组件引入
  import {
    XTextarea, dateFormat
  } from 'vux'
  // 请求 引入
  import { jobLog, saveJobLog } from 'service/projectService'
  import { getDictByType, getDictByValue, requestData, update} from 'service/common/commonService'
  // mixins 引入
  import ApplyCommon from 'mixins/applyCommon'
  import common from '@/mixins/common'
  // 组件 引入
  import RPicker from 'components/public/basicPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopJobList from 'components/Popup/PopJobList'
  import OpButton from 'components/apply/commonPart/OpButton'
  import { accMul, accAdd, accSub } from 'plugins/calc/decimalsAdd'
  import { toFixed } from '@/plugins/calc'
  const DRAFT_KEY = 'XMLX_DATA';
  export default {
    mixins: [ApplyCommon, common],
    components: {
      RPicker, PopBaseinfo, XTextarea, PopJobList, OpButton
    },
    data() {
      return {
        listId: '630a9b96-f257-48b6-b0bc-fd64c455d92b',
        jobLog: {},
        formData: {
          biComment: '',
          biProcessStatus: '',
          biProcessStatus: '',
        },
        defaultJob: {}, // 项目经理的默认值
        hasDefault: false, // 是否为界面回写
      }
    },
    computed: {
      projectType() {
        return this.jobLog.projectType
      }
    },
    methods: {
      // 校验数字
      checkAmt(jobLog, code, val){
        this.jobLog[code] = toFixed(val, 1);
      },
      // 提交
      save () {
        /**
         * @warn 提示文字
         * 
         */
        let warn = '';
        // 校验 <项目> 必填字段
        warn = this.verifyData(this.otherConfig, this.jobLog);
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveJobLog;
            if (this.$route.query.transCode){
              operation = update;
            }
            let submitData = {
              listId: this.listId,
              formData: {
                comment: {
                  biComment: this.formData.biComment,
                },
                baseinfo: {
                  id: '',
                  handlerEntity: this.entity.dealerName,
                  ...this.formData,
                  
                },
                jobLog: {
                  groupName: this.formData.groupName,
                  roleName: this.formData.roleName,
                  hourlyCost: '',
                  jobLogId: '',
                  logGroupCode: '',
                  logRoleCode: '',
                  missionCost: '',
                  ...this.jobLog
                }
              },
              wfParam: null
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // 选中项目经理
      selJob (val) {
        let sel = JSON.parse(val);
        this.jobLog = {
          ...this.jobLog,
          projectName: sel.projectName,
          dealerName: sel.dealerName,
          executor: sel.executor,
          projectTaskName: sel.taskName,
          projectTaskId: sel.taskId
        }
      },
      // 获取显示数据
      getFormData () {
        return jobLog(this.transCode).then(({formData = {}}) => {
          this.hasDefault = true;
          this.defaultJob = {
            dealerName: formData.jobLog.projectManager,
            dealerMobilePhone: formData.jobLog.phoneNumber,
          };
          formData.jobLog.expectStartDate = this.changeDate(formData.jobLog.expectStartDate);
          formData.jobLog.expectEndDate = this.changeDate(formData.jobLog.expectEndDate);
          this.jobLog = formData.jobLog;
          this.$nextTick(() => {
            // 渲染完后重置为false
            this.hasDefault = false;
          })
          this.handlerDefault = {
            handler: formData.baseinfo.handler,
            handlerName: formData.baseinfo.handlerName,
            handlerUnit: formData.baseinfo.handlerUnit,
            handlerUnitName: formData.baseinfo.handlerUnitName,
            handlerRole: formData.baseinfo.handlerRole,
            handlerRoleName: formData.baseinfo.handlerRoleName,
          };
          // 基本信息
          this.formData = {
            ...this.formData,
            ...this.handlerDefault,
            biComment: formData.comment.biComment,
            id: formData.baseinfo.id,
            biProcessStatus: formData.baseinfo.biProcessStatus,
            creator: formData.baseinfo.creator,
            modifer: formData.baseinfo.modifer,
            handlerEntity: formData.baseinfo.handlerEntity,
          }
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide()
        })
      },
      // 保存草稿数据
      hasDraftData () {
        // 是否选择项目经理
        if (!this.jobLog.projectName && !this.jobLog.projectType &&  !this.jobLog.projectManagerName) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            jobLog: this.jobLog,
            formData: this.formData
          }
        };
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.jobLog = draft.jobLog;
        this.formData = draft.formData;
        this.defaultJob = {
          dealerName: this.jobLog.projectManager,
          dealerMobilePhone: this.jobLog.phoneNumber,
        };
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply';
  .materiel_list {
    background: #fff;
    padding: 0 .15rem;
    font-size: .14rem;
    color: #333;
    .weui-cell {
      padding: .1rem 0;
      /deep/ .weui-textarea {
        text-align: right;
      }
    }
  }
  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    input {  
      border: none;
      outline: none;
      font-size: .14rem;
    } 
    label {
      color: #696969;
    }
    .required {
      color: #3296FA;
      font-weight: bold;
    }
    .property_val {
      text-align: right;
      flex: 1;
      margin-left: .1rem;
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
</style>
