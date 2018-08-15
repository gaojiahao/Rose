<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 项目名称-->
        <r-picker title="项目名称" :data="projectList" mode="3" placeholder="请选择项目名称"
                  v-model="projectTask.projectName"></r-picker>

        <!-- 有效期至 -->
        <div class="or_ads mg_auto box_sd">
          <p class="title">实际情况</p>
          <!--<div class="mode" @click="clickDateSelect">{{'请选择有效期'}}</div>-->
          <group>
            <datetime title="实际完成日期"></datetime>
            <x-input type="number" title="实际工时" text-align="right" placeholder="请填写实际工时"></x-input>
          </group>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton, Datetime,} from 'vux'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
  import ApplyCommon from './../mixins/applyCommon'
  import RPicker from 'components/RPicker'
  import {getProjectPlanProjectName, saveProjectTask, updateProjectTask, findProjectTask} from 'service/projectService'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon,
      Cell,
      Group,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      RPicker,
      Datetime,
    },
    data() {
      return {
        projectList: [],
        formData: {},
        jsonData: {
          bomType: {
            bomType: ''
          },
          comment: {
            biComment: ''
          },
        },
        projectTask: {
          projectName: '', // 项目名称
          taskName: '', // 任务名称
          actualCompleteTime: '', // 实际完成日期
          actualTime: '', // 实际工时
          comment: '' // 备注
        }
      }
    },
    methods: {
      // TODO 提交
      save() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'dealerInfo',
            message: '往来信息'
          },
        ];
        validateMap.every(item => {
          if (!this[item.key]) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
        if (!warn && !this.matterList.length) {
          warn = '请选择物料';
        }
        this.matterList.every(item => {
          if (!item.price) {
            warn = '请输入单价';
            return false
          }
          dataSet.push({
            inventoryName_transObjCode: item.inventoryName,
            transObjCode: item.inventoryCode,
            comment: item.comment || null,
            priceType: item.priceType || null,
            price: item.price
          });
          return true
        });
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
            let operation = submitAndCalc;
            let submitData = {
              listId: 'ee4ff0a1-c612-419d-afd7-471913d57a2a',
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                dealerDebitContactPersonName: this.dealerInfo.creatorName || '',
                dealerDebitContactInformation: this.dealerInfo.mobilePhone || '',
                order: {
                  dealerDebit: this.dealerInfo.dealerCode || '',
                  drDealerLabel: this.dealerInfo.dealerLabelName || '客户',
                  drDealerPaymentTerm: this.drDealerPaymentTerm || '现付',
                  dataSet
                }
              }),
            };

            if (this.transCode) {
              operation = saveAndCommitTask
            }
            console.log(submitData)
            this.saveData(operation, submitData);
          }
        });
      },
      clickDateSelect() {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.formData.validUntil,
          onConfirm: (value) => {
            this.formData.validUntil = value;
          }
        })
      },
      getProjectList() {
        return getProjectPlanProjectName().then(({tableContent = []}) => {
          let tmp = [];
          tableContent.forEach(item => {
            item.projectName && tmp.push(item.projectName);
          });
          this.projectList = tmp;
        })
      }
    },
    created() {
      this.getProjectList();
    },
  }
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';

  .xmrw-apply-container {
    .or_ads {
      padding: .06rem .08rem;
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
