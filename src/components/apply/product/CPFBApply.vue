<template>
  <div class='pages cpfb-apply-container'>
    <div class="basicPart when-is-form" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo"
                         :defaultContact="contactInfo"></pop-dealer-list>
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">发布信息</div>
                <group class="CP_group" @group-title-margin-top="0">
                 <div v-for="(item, index) in otherConfig" :key="index">
                   <template v-if="item.xtype === 'r2Textfield'">
                      <x-input text-align='right' v-model="formData[item.fieldCode]"
                           placeholder='请填写' class="vux-1px-b">
                        <template slot="label">
                          <span :class="{required : !item.allowBlank}">{{item.fieldLabel}}</span>
                        </template>
                      </x-input>
                   </template>
                   <template v-if="item.xtype === 'r2Combo'">
                     <popup-picker  :data="item.remoteData" v-model="formData[item.fieldCode]"
                                placeholder="请选择" :columns="1">
                      <template slot="title">
                        <span :class="{required : !item.allowBlank}">{{item.fieldLabel}}</span>
                      </template>
                    </popup-picker>
                   </template>
                   <template v-if="item.xtype === 'r2TextArea'">
                     <x-textarea v-model="formData[item.fieldCode]" :max="200" class="vux-1px-b">
                       <template slot="label">
                          <span :class="{required : !item.allowBlank}" style="display: block; width: 3em;">{{item.fieldLabel}}</span>
                        </template>
                     </x-textarea>
                   </template>
                 </div>
                  <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
                </group>
              </div>
            </div>
          </div>
        </div>
        <upload-file :default-value="attachment" @on-upload="onUploadFile" :biReferenceId="biReferenceId" :contain-style="uploadStyle"></upload-file>
      </div>
    </div>
    <div class='btn vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  // vux 引入
  import { Group, XInput, XTextarea, PopupPicker } from 'vux'
  import RPicker from 'components/public/RPicker';
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopDealerList from 'components/Popup/PopDealerList'
  // 请求 引入
  import {
    submitAndCalc,
    updateData,
    saveAndStartWf,
    saveAndCommitTask,
    getDictByType,
  } from 'service/commonService'
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'mixins/applyCommon'
  const DRAFT_KEY = 'CPFB_DATA';
  export default {
    name: 'ApplyCPFBForm',
    data() {
      return {
        listId: 'eb8a01a3-7a74-439b-bc44-8d58cbfa6166',
        formViewUniqueId: 'b018ef18-f0d1-41a8-985e-29de19e6b705',
        formData: {
          biId: '',
          biComment: '', // 备注
          launchType: [], // 类型
          launchTitle: '', // 标题
          launchDescribe: '', // 描述
          biProcessStatus: '', // 流程状态
        },
        biReferenceId: '',
        dealerInfo: {},
        contactInfo: {},
        uploadStyle : {},
      }
    },
    mixins: [ApplyCommon],
    components: {
      Group, XInput, XTextarea, PopupPicker,
      RPicker, PopBaseinfo, PopDealerList
    },
    methods: {
      // 选择联系人
      selContact(val) {
        this.contactInfo = {...val};
      },
      // 选择客户
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.formData.launchDealerCode = this.dealerInfo.dealerCode;
      },
      // 提交/修改物料
      save() {
        let requiredMap = {
          launchDealerCode: '客户',
          launchTitle: '标题',
          launchType: '类型',
          launchDescribe: '描述',
        };
        for (let key in this.formData) {
          if (typeof(this.formData[key]) === 'string' && this.formData[key].indexOf(' ') >= 0) {
            this.formData[key] = this.formData[key].replace(/\s/g, '');
          }
        }
        let warn = '';
        if (!this.dealerInfo.dealerCode){
          warn = '请选择客户'
        }
        !warn && this.otherConfig.every(item => {
          if (!item.allowBlank && (!this.formData[item.fieldCode] || !this.formData[item.fieldCode].length)) {
              warn = `${item.fieldLabel}不能为空`;
              return false;
          }
          return true;
        })
        // !warn && Object.entries(requiredMap).every(([key, msg]) => {
        //   if (!this.formData[key]) {
        //     warn = `${msg}不能为空`;
        //     return false;
        //   }
        //   return true;
        // });
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
            let formData = this.formData,
                dealerInfo = {
                  launchDealerCode: this.dealerInfo.dealerCode,  // 往来编码
                  address_launchDealerCode: this.dealerInfo.address, // 往来地址
                  launchDealerLabel: this.dealerInfo.dealerLabelName,  // 往来关系标签
                  dealerName_launchDealerCode: this.dealerInfo.dealerName, // 往来名称
                },
                contactInfo = {
                  dealerDebitContactPersonName: this.contactInfo.dealerName, // 往来联系人 名称
                  dealerDebitContactInformation: this.contactInfo.dealerMobilePhone // 往来联系人 信息 
                },
                operation = this.processCode.length ? saveAndStartWf : submitAndCalc;

            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...formData,
                ...dealerInfo,
                ...contactInfo,
                launchType: formData.launchType[0]
              }),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: this.businessKey,
                  createdBy: formData.creator,
                }
              }),
            };
            if (this.transCode) {
              operation = this.processCode.length ? saveAndCommitTask : updateData;
              submitData.biReferenceId = this.biReferenceId;
              submitData.wfPara = JSON.stringify({
                businessKey: this.transCode,
                createdBy: formData.creator,
                transCode: this.transCode,
                result: 3,
                taskId: this.taskId,
                comment: ''
              });
            }
            // 无工作流
            if (!this.processCode.length) {
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
      // 重新提交时 读取数据
      getFormData() {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {}, biReferenceId = ''} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          this.attachment = data.attachment;
          this.biReferenceId = biReferenceId;
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          this.formData = {
            ...this.formData,
            ...formData,
            ...this.handlerDefault
          };

          this.$loading.hide();
        })
      },
      // 是否保存草稿
      hasDraftData() {
        let draftList = ['biProcessStatus', 'launchTitle', 'launchDescribe', 'launchType'];
        let formData = this.formData;
        let isRecord = false;
        draftList.every((item) => {
          if (formData[item]) {
            isRecord = true;
            return false
          }
          return true
        }, true);
        if (isRecord) {
          return {
            [DRAFT_KEY]: {
              formData: this.formData,
              dealerInfo: this.dealerInfo,
              contactInfo: this.contactInfo,
            }
          };
        }
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.formData = JSON.parse(data).formData;
        this.dealerInfo = JSON.parse(data).dealerInfo;
        this.contactInfo = JSON.parse(data).contactInfo;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';
  .materiel_list .mater_list .each_mater {
    padding: unset;
  }
  .cpfb-apply-container {
    .CP_group {
      /deep/  .vux-label {
        color: #5077aa;
        font-weight: bold;
      }
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
