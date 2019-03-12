<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <!-- 费用明细-->
        <div class="leave_list">
          <div class="leave_item" :class="{'has_border' : sIndex > 0}" v-for="(sItem, sIndex) in costList" :key="sIndex">
            <div class="leave_title vux-1px-b" v-show="costList.length>1">
              <label>请假{{sIndex+1}}</label>
              <span class="iconfont icon-shanchu1" @click="deleteCost(sIndex)"></span>
            </div>
            <div v-for="(dItem,dIndex) in matterEditConfig.editPart" :key="dIndex" :class="{'vux-1px-b': dIndex < matterEditConfig.editPart.length-1}">
              <!-- 可编辑的字段 -->
              <template v-if="!dItem.readOnly">
                <!-- 下拉框 -->
                <r-picker :title="dItem.text" :data="dItem.remoteData" :value="sItem[dItem.fieldCode]"
                        v-model="sItem[dItem.fieldCode]" :required="!dItem.allowBlank"
                        v-if="dItem.editorType === 'r2Combo' || dItem.editorType === 'r2Selector'"></r-picker>
                <!-- 输入框（数字） -->
                <div class='each_property ' v-if="dItem.editorType === 'r2Numberfield'">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <input type='number' v-model.number="sItem[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 输入框（文字） -->
                <div class='each_property' v-if="dItem.editorType === 'r2Textfield'">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <input type='text' v-model="sItem[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 日期 -->
                <div class='each_property' v-if="dItem.editorType === 'r2Datefield'" @click="getDate(sItem,dItem)">
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{sItem[dItem.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
              </template>
              <!--不可编辑的字段 -->
              <template  v-else>
                <div class='each_property readOnly'>
                  <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
                  <span class='property_val'>{{sItem[dItem.fieldCode]}}</span>
                </div>
              </template>
            </div>
          </div>
          <div class="vux-1px-t" :class="[this.actions.includes('stop') ? 'resubmit-part' : 'sumbit-part']">
            <div class="add_more" @click="addCost">
              <span class="icon-add"></span>
              <span class="add_text">新增请假</span>
            </div>
            <span class="add_more stop" v-if="this.actions.includes('stop')" @click="stopOrder">终止提交</span>
          </div>
        </div>
         <div class='comment'>
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide"
               @on-submit="submitOrder" ></op-button>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, XInput, XTextarea} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon'
  // 组件引入
  import RPicker from 'components/basicPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import OpButton from 'components/apply/commonPart/OpButton'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'QJ_DATA';
  export default {
    data() {
      return {
        costList: [{}],
        formData: {
          biId: '', // 为空
          biComment: '',
        },
        biReferenceId: '',
      }
    },
    components: {
      Cell, Group, XInput, XTextarea,
      RPicker, PopBaseinfo, OpButton
    },
    mixins: [common],
    watch: {
      costList: {
        handler(val) {
          val.forEach(item => {
            // 计算请假天数
            let leaveStartDate = item.leaveStartDate,
		            leaveStartTime = item.leaveStartTime,
                leaveEndDate = item.leaveEndDate,
                leaveEndTime = item.leaveEndTime;
            if (leaveStartDate && leaveEndDate && leaveStartTime == null && leaveEndTime == null) {
              item.leaveDays = (new Date(leaveEndDate) - new Date(leaveStartDate))/(24*60*60*1000) + 1;
            }
            else if (leaveStartDate && leaveStartTime && leaveEndDate && leaveEndTime) {
              let dt = (new Date(leaveEndDate) - new Date(leaveStartDate))/(24*60*60*1000);
              if (leaveStartTime ==  leaveEndTime ) {
                dt = dt + 0.5;
              }
              else if (leaveStartTime == "上午" && leaveEndTime == "下午") {
                dt = dt + 1;
              }else if (leaveStartTime == "下午" && leaveEndTime == "上午") {
                dt;
              }
              item.leaveDays = dt
            }
          })
        },
        deep: true,
      },     
    },
    methods: {
      // 点击增加费用
      addCost() {
        this.costList.push({})
      },
      // 删除费用明细
      deleteCost(index) {
        this.costList.splice(index, 1);
      },
      // 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        for (let item of this.costList) {
          let oItem = {};
          for (let sItem of this.submitMatterField){
            if (!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
              warn = `${sItem.text}不为空`
              break;
            }
            oItem[sItem.fieldCode] = item[sItem.fieldCode] != null ? item[sItem.fieldCode] : null
          }
          dataSet.push(oItem);
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
            delete this.formData.userCode
            let formData = {
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              order: {
                dataSet,
              },
            };
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: this.businessKey,
                  createdBy: formData.creator,
                  '部门ID': this.formData.handlerUnit
                }
              }),
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
      // 获取详情
      getFormData() {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {}, attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          this.attachment = attachment;
          // 获取合计
          let {order} = formData;
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.formData = {
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
          };
          this.costList = [];
          order.dataSet.forEach(item => {
            this.costList.push({
              ...item,
              exptName: item.costName_expCode, // 费用名称
              expCode: item.expCode, // 费用编码
              expSubject: item.expSubject, // 费用科目
              costType: item.costType_expCode, // 费用类型
            })
          })
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide();
        })
      },
      // 是否保存草稿
      hasDraftData() {
        if (Object.values(this.costList[0]).length){
          return {
            [DRAFT_KEY]: {
              costList: this.costList,
              formData: this.formData
            }
          };
        }
        
      },
      // 选择日期
      getDate(sItem, dItem){
        let startDate = '', endDate = '';
        // 当存在开始日期，选在结束日期时不能小于开始日期
        if (dItem.fieldCode === 'leaveEndDate' && sItem.leaveStartDate){
          startDate = sItem.leaveStartDate;
          endDate = '';
        }
        // 当存在结束日期，选在开始日期时不能大于结束日期
        else if (dItem.fieldCode === 'leaveStartDate' && sItem.leaveEndDate){
          endDate = sItem.leaveEndDate;
          startDate = '';
        }
        this.$vux.datetime.show({
          value: '', // 其他参数同 props
          confirmText: '确认',
          cancelText: '取消',
          startDate: startDate,
          endDate: endDate,
          onConfirm: (val)=> {
            if (sItem[dItem.fieldCode] == null){
              this.$set(sItem, dItem.fieldCode, val)
              return
            }
            sItem[dItem.fieldCode] = val;
          },
        })
      },
      splitConfig(editMatterPop, editMatterPopConfig){
        editMatterPopConfig.editPart = editMatterPop;
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.costList = draft.costList;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';
  .vux-1px-b:after{
    border-color: #e8e8e8;
  }
  .leave_list{
    font-size: .14rem;
    input {
      border: none;
      outline: none;
      font-size: .14rem;
    }
    .leave_item {
      background: #fff;
      padding: 0 .15rem;
      &.has_border {
        margin-top: .1rem;
      }
      .leave_title{
        display: flex;
        justify-content: space-between;
        height: .4rem;
        line-height: .4rem;
        label{
          color: #333;
          font-weight: bold;
        }
        span{
          color: red;
        }
      }
    }
  }
  .fill_wrapper{
    padding-bottom: .1rem;
  }
  .each-info{
    background-color: #fff;
    padding: 0 .15rem;
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
  // 新增更多
  .sumbit-part {
    width: 100%;
    display: flex;
    text-align: center;
    position: relative;
    background: #fff;
    .add_more {
      display: flex;
      color: #3296FA;
      font-weight: bold;
      text-align: center;
      align-items: center;
      margin: .1rem auto;
      // margin: 0 auto .2rem;
      border-radius: .15rem;
      padding: .06rem .08rem;
      border: 1px solid #3296FA;
      .icon-add {
        width: .14rem;
        height: .14rem;
        box-sizing: border-box;
        margin: .015rem .05rem 0 0;
      }
      .add_text {
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .symbol {
      left: 50%;
      bottom: 25%;
      color: #757575;
      font-size: .12rem;
      position: absolute;
      transform: translate(-50%, 0);
    }
    .native {
      margin-right: .24rem;
      background: #ea5455;
      box-shadow: 0 2px 5px #ea5455;
    }

  }
  .resubmit-part {
    display: flex;
    padding: .1rem .15rem;
    background: #fff;
    font-size: .12rem;
    text-align: center;
    position: relative;
    justify-content: flex-end;
    .add_more {
      color: #FFF;
      font-weight: bold;
      text-align: center;
      background: #3296FA;
      border-radius: .04rem;
      padding: .08rem .04rem;
      &.stop {
        color: #a1a1a1;
        background: #dfdfdf;
      }
      & + .add_more {
        margin-left: .1rem;
      }
    }
  }

</style>
