<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 商机明细 -->
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">招聘信息</div>
                <group class="SJ_group" @group-title-margin-top="0">
                  <popup-picker :data="groupList" v-model="formData.applicationDepartment" placeholder="请选择">
                    <template slot="title">
                        <span class="required">申请部门</span>
                    </template>
                  </popup-picker>
                  <popup-picker :data="roleList" v-model="formData.applicationPost" placeholder="请选择">
                    <template slot="title">
                        <span class="required">申请岗位</span>
                    </template>
                  </popup-picker>
                  <x-input text-align='right' placeholder='请填写' type='number' @on-blur="checkAmt(formData.recruitmentPeople)"
                       @on-focus="getFocus($event)" v-model.number='formData.recruitmentPeople'>
                    <template slot="label">
                        <span class="required">招聘人数</span>
                    </template>
                  </x-input>
                  <x-textarea title="任职要求" v-model="formData.jobRequirements" :max="100"></x-textarea>
                  <x-textarea title="岗位描述" v-model="formData.postDescription" :max="100"></x-textarea>
                  <x-textarea title="招聘原因" v-model="formData.recruitmentReson" :max="100"></x-textarea>
                  <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
                </group>
              </div>
            </div>
          </div>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
      </div>
    </div>
    <div class='btn-no-amt vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div>
      <div class="btn-item" @click="submitOrder">提交</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {
    Cell,Group, XInput, Datetime, XTextarea, dateFormat, PopupPicker
  } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import { getDepartMentWage, getAllRoleInfo } from 'service/hr/employeeService'
  import { submitAndCalc, saveAndStartWf, saveAndCommitTask, getDictByType } from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon.js'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  const DRAFT_KEY = 'ZHJH_DATA';

  export default {
    data () {
      return {
        formData: {
          biId: '', // 为空
          biComment: '',
          biProcessStatus: ''
        },
        biReferenceId: '',
        MobileWarn: false,
        idCardWarn: false,
        groupList: [],
        roleList: []
      }
    },
    components: {
      Cell,Group, XInput, 
      Datetime, XTextarea, PopupPicker,
      RPicker, PopBaseinfo,
    },
    mixins: [common],
    methods: {
      // 获取所有的部门
      getDepartMentWage(){
        getDepartMentWage().then(data => {
          let arr = []
          data.tableContent.forEach(item => {
            arr.push(item.GROUP_NAME)
          })
          this.groupList.push(arr);
        })
      },
      // 获取所有的岗位
      getAllRoleInfo(){
        getAllRoleInfo().then(data => {
          let arr = []
          data.tableContent.forEach(item => {
            arr.push(item.roleName)
          })
          this.roleList.push(arr);
        })
      },
      // TODO 提交
      submitOrder () {
        let warn = '';
        let validateMap = [
          {
            key: 'applicationDepartment',
            message: '请选择申请部门'
          },
          {
            key: 'applicationPost',
            message: '请选择申请岗位'
          },
          {
            key: 'recruitmentPeople',
            message: '请填写招聘人数'
          },

        ];
        if (!warn) {
          validateMap.every(item => {
            if (!this.formData[item.key]) {
              warn = item.message;
              return false;
            }
            return true
          });
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let formData = {
              creator: this.formData.handler,
              ...this.formData,
              modifer: this.formData.handler,
              handlerEntity: this.entity.dealerName,
              applicationDepartment: this.formData.applicationDepartment[0],
              applicationPost: this.formData.applicationPost[0]
            };
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify(formData),
            };
            if (this.isResubmit) {
              operation = saveAndCommitTask;
              submitData.biReferenceId = this.biReferenceId;
              submitData.wfPara = JSON.stringify({
                businessKey: this.transCode,
                createdBy: this.formData.creator || this.formData.handler,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              });
            }
            // 无工作流
            if (!this.processCode.length) {
              operation = submitAndCalc;
              delete submitData.wfPara;
              delete submitData.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 是否保存草稿
      hasDraftData () {
        let formData = this.formData;
        if (formData.applicationDepartment || formData.applicationPost) {
          return {
            [DRAFT_KEY]: {
              formData
            }
          };
        }
      },
      // 处理小数
      checkAmt(val) {
        this.formData.recruitmentPeople = Math.round(val);
      }
    },
    created () {
      this.getDepartMentWage();
      this.getAllRoleInfo();
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';
  .materiel_list .mater_list .each_mater {
    padding: unset;
  }
  .sj-apply-container {
    .SJ_group {
      /deep/ .vux-no-group-title {
        margin-top: 0.08rem;
      }
      /deep/ .weui-cells {
        font-size: .16rem;
        .vux-tap-active {
          .vux-label {
            color: #5077aa;
            font-weight: bold;
          }
        }
        &:after {
          border-bottom: none;
        }
      }
      .vux-cell-box {
        &:before{
          left: 0;
        }
        /deep/ .weui-cell {
          padding: 10px 0;
        }
      }
    }
    .weui-cell {
      padding: 10px 0;

      &:before {
        left: 0;
      }
    }

  }
</style>
