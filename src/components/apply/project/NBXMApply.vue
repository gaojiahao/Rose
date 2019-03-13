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
            <!--项目经理-->
            <template v-if="item.fieldCode === 'projectManagerName'">
              <pop-manager-list class="vux-1px-t" :requestParams="item.requestParams" 
                                @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>
            </template>
            <template v-else>
              <!-- 下拉框 -->
              <r-picker :title="item.fieldLabel" :data="item.remoteData" :value="ProjectApproval[item.fieldCode]"
                      v-model="ProjectApproval[item.fieldCode]" :required="!item.allowBlank"
                      v-if="item.xtype === 'r2Combo' || item.xtype === 'r2Selector'"></r-picker>
              <!-- 输入框（文字） -->
              <div class='each_property' v-if="item.xtype === 'r2Textfield'">
                <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                <input type='text' v-model="ProjectApproval[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
              </div>
              <!-- 输入框（数字） -->
              <div class='each_property ' v-if="item.xtype === 'r2Numberfield' || item.xtype === 'r2Permilfield'">
                <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                <input type='number' v-model.number="ProjectApproval[item.fieldCode]" placeholder="请输入" class='property_val' 
                       @focus="getFocus($event)" @blur="checkAmt(ProjectApproval, item.fieldCode, ProjectApproval[item.fieldCode])"/>
              </div>
              <!-- 日期 -->
              <div class='each_property' v-if="item.xtype === 'r2Datefield'" @click="getDate(ProjectApproval,item)">
                <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                <div class='picker'>
                  <span class='mater_nature'>{{ProjectApproval[item.fieldCode] || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
              <!-- 文本框 -->
              <x-textarea v-model="ProjectApproval[item.fieldCode]" :max="100" v-if="item.xtype === 'r2TextArea'">
                <template slot="label">
                  <span :class="{required : !item.allowBlank}" style="display: block; width: 4em;">{{item.fieldLabel}}</span>
                </template>
              </x-textarea>
            </template>
          </div>
        </div>
        <!-- 备注 -->
        <div class="comment">         
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
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
  import { saveProjectApproval, findProjectApproval } from 'service/projectService'
  import { getDictByType, getDictByValue, requestData, update} from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  import common from '@/mixins/common'
  // 组件 引入
  import RPicker from 'components/basicPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopManagerList from 'components/Popup/PopManagerList'
  import OpButton from 'components/apply/commonPart/OpButton'
  import { accMul, accAdd, accSub } from '@/home/pages/maps/decimalsAdd'
  import { toFixed } from '@/plugins/calc'
  const DRAFT_KEY = 'XMLX_DATA';
  export default {
    mixins: [ApplyCommon, common],
    components: {
      RPicker, PopBaseinfo, XTextarea, PopManagerList, OpButton
    },
    data() {
      return {
        listId: '630a9b96-f257-48b6-b0bc-fd64c455d92b',
        ProjectApproval: {},
        formData: {
          biComment: '',
          biProcessStatus: '',
          biProcessStatus: '',
        },
        defaultManager: {}, // 项目经理的默认值
        hasDefault: false, // 是否为界面回写
      }
    },
    computed: {
      projectType() {
        return this.ProjectApproval.projectType
      }
    },
    watch: {
      // 监听大类变化，修改子类
      projectType: {
        handler(newVal, oldVal){
          let type = ''; // 当前项目大类对应的类型，请求子类的参数
          for (let item of this.otherConfig){
            if (item.fieldCode === 'projectType'){
              for (let dItem of item.remoteData){
                if (dItem.name === newVal){
                  type = dItem.originValue;
                  break;
                }
              }
            }
            if (item.fieldCode === 'projectSubclass'){
              let requestParams = {
                url: item.dataSource.data.url,
                data: {
                  value: type
                }
              }
              requestData(requestParams).then(({tableContent = []}) => {
                if (this.ProjectApproval.projectSubclass != null) {
                  this.ProjectApproval.projectSubclass = tableContent[0].name
                }
                else {
                  this.$set(this.ProjectApproval, 'projectSubclass', tableContent[0].name)
                }
                tableContent.forEach(dItem => {
                  dItem.originValue = dItem.value;
                  dItem.name = dItem[item.displayField]
                  dItem.value = dItem[item.displayField];
                })
                item.remoteData = tableContent;
              })
            }
          }
        }
      }
    },
    methods: {
      // 选择日期
      getDate(sItem, dItem){
        let startDate = '', endDate = '';
        // 当存在开始日期，选在结束日期时不能小于开始日期
        if (dItem.fieldCode === 'expectEndDate' && sItem.expectStartDate){
          startDate = sItem.expectStartDate;
          endDate = '';
        }
        // 当存在结束日期，选在开始日期时不能大于结束日期
        else if (dItem.fieldCode === 'expectStartDate' && sItem.expectEndDate){
          endDate = sItem.expectEndDate;
          startDate = '';
        }
        this.$vux.datetime.show({
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
      // 提交
      save () {
        /**
         * @warn 提示文字
         * 
         */
        let warn = '';
        // 校验 <项目> 必填字段
        warn = this.verifyData(this.otherConfig, this.ProjectApproval);
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
            let operation = saveProjectApproval;
            if (this.isModify){
              operation = update;
            }
            let submitData = {
              listId: this.listId,
              formData: {
                comment: {
                  biComment: this.formData.biComment || '',
                },
                baseinfo: {
                  id: '',
                  handlerEntity: this.entity.dealerName,
                  ...this.formData,
                  
                },
                projectApproval: this.ProjectApproval
              },
              wfParam: null
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // 选中项目经理
      selManager (val) {
        let sel = JSON.parse(val);
        this.$set(this.ProjectApproval, 'projectManagerName', sel.dealerName)
        this.$set(this.ProjectApproval, 'phoneNumber', sel.dealerMobilePhone)
        this.$set(this.ProjectApproval, 'projectManager', sel.dealerCode)
      },
      // 获取显示数据
      getFormData () {
        return findProjectApproval(this.transCode).then(({formData = {}}) => {
          this.hasDefault = true;
          this.defaultManager = {
            dealerName: formData.projectApproval.projectManagerName,
            dealerMobilePhone: formData.projectApproval.phoneNumber,
          };
          formData.projectApproval.expectStartDate = this.changeDate(formData.projectApproval.expectStartDate);
          formData.projectApproval.expectEndDate = this.changeDate(formData.projectApproval.expectEndDate);
          this.ProjectApproval = formData.projectApproval;
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
        if (!this.ProjectApproval.projectName && !this.ProjectApproval.projectType &&  !this.ProjectApproval.projectManagerName) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            ProjectApproval: this.ProjectApproval,
            formData: this.formData
          }
        };
      },
      // 校验数字
      checkAmt(item, key, val) {
        item[key] = Math.abs(toFixed(val));
      }
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.ProjectApproval = draft.ProjectApproval;
        this.formData = draft.formData;
        this.defaultManager = {
          dealerName: this.ProjectApproval.projectManager,
          dealerMobilePhone: this.ProjectApproval.phoneNumber,
        };
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
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
