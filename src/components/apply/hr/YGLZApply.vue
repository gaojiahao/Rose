<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 商机明细 -->
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">员工信息</div>
                <group class="SJ_group" @group-title-margin-top="0">
                  <pop-salesman-list title="员工" dealer-label-name="员工" :value="formData.salesPerson"
                                     v-model="formData.turnoverName" required>
                    <template slot="title">
                      <span class='required'>员工
                      </span>
                    </template>
                  </pop-salesman-list>
                  <popup-picker title="部门" :data="groupList" v-model="formData.turnoverDepartMent"
                                placeholder="请选择"></popup-picker>
                  <popup-picker title="岗位" :data="roleList" v-model="formData.turnoverPost"
                                placeholder="请选择"></popup-picker>
                  <datetime v-model="formData.turnoverDate" placeholder='请选择日期' title="离职日期"></datetime>
                  <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
                </group>
              </div>
            </div>
          </div>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
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
    Cell, Group, XInput, Datetime, XTextarea, dateFormat, PopupPicker
  } from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {getAllGroup, getAllRoleInfo} from 'service/hr/employeeService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask, getDictByType} from 'service/commonService'
  // mixins 引入
  import common from 'mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/public/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopSalesmanList from 'components/Popup/PopSalesmanList'
  // 方法引入
  const DRAFT_KEY = 'YGLZ_DATA';

  export default {
    data() {
      return {
        listId: 'da7f15cc-d2d7-11e8-b8ca-0279b2c6a380',
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
      Cell, Group, XInput,
      Datetime, XTextarea, PopupPicker,
      RPicker, PopBaseinfo, PopSalesmanList
    },
    mixins: [common],
    methods: {
      // 获取所有的部门
      getAllGroup() {
        getAllGroup().then(data => {
          let arr = []
          data.tableContent.forEach(item => {
            arr.push(item.groupName)
          })
          this.groupList.push(arr);
        })
      },
      // 获取所有的岗位
      getAllRoleInfo() {
        getAllRoleInfo().then(data => {
          let arr = []
          data.tableContent.forEach(item => {
            arr.push(item.roleName)
          })
          this.roleList.push(arr);
        })
      },
      // 提交
      submitOrder() {
        let warn = '';
        let validateMap = [
          {
            key: 'turnoverName',
            message: '员工'
          }
        ];
        if (!warn) {
          validateMap.every(item => {
            if (!this.formData[item.key]) {
              warn = `请选择${item.message}`;
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
              turnoverDepartMent: this.formData.turnoverDepartMent && this.formData.turnoverDepartMent[0],
              turnoverPost: this.formData.turnoverPost && this.formData.turnoverPost[0]
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
      // 是否保存草稿
      hasDraftData() {
        let formData = this.formData;
        if (formData.profileName || formData.idCard) {
          return {
            [DRAFT_KEY]: {
              formData
            }
          };
        }
      },
    },
    created() {
      this.getAllGroup();
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
  @import '~scss/biz-app/bizApply.scss';

  .materiel_list .mater_list .each_mater {
    padding: unset;
  }

  .sj-apply-container {
    .SJ_group {

      /deep/ > .vux-label {
        color: #5077aa;
        font-weight: bold;
      }
      /deep/ > .vux-no-group-title {
        margin-top: 0.08rem;
      }
      /deep/ > .weui-cells {
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
        &:before {
          left: 0;
        }
        /deep/ > .weui-cell {
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
