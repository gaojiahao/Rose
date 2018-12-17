<template>
  <div class="pages sj-apply-container">
    <div class="basicPart no_count" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 选择客户-->
        <pop-dealer-list :defaultValue="dealerInfo" :defaultContact="contactInfo" @sel-dealer="selDealer" @sel-contact="selContact" >
        </pop-dealer-list>
        <!-- 商机明细 -->
        <div class="materiel_list">
          <div class="mater_list">
            <div class="each_mater">
              <div class="userInp_mode">
                <div class="title">商机明细</div>
                <group class="SJ_group" @group-title-margin-top="0">
                  <!-- 商机标题 -->
                  <x-input title="商机标题" text-align='right' v-model="formData.opportunityTitle"
                           placeholder='请填写'>
                    <template slot="label">
                      <span class='required'>商机标题
                      </span>
                    </template>
                  </x-input>
                  <!-- 预期销售额 -->
                  <x-input title="预期销售额" type="number" text-align='right' placeholder='请填写'
                           @on-blur="checkAmt" v-model.number="formData.tdAmount">
                    <template slot="label">
                      <span class='required'>预期销售额
                      </span>
                    </template>
                  </x-input>
                  <!-- 当前阶段 -->
                  <!-- <popup-radio title="流程状态" placeholder='请选择' :options="currentStage" v-model="formData.biProcessStatus">
                  </popup-radio> -->
                  <!-- 有效期 -->
                  <datetime v-model="formData.validUntil" placeholder='请选择日期' title="有效期至"></datetime>
                  <!-- 销售人员popup, 销售渠道popup -->
                  <pop-salesman-list title="销售人员" dealer-label-name="员工" :value="formData.salesPerson"
                                     v-model="formData.salesPerson"></pop-salesman-list>
                  <pop-salesman-list title="销售渠道" dealer-label-name="渠道商" :value="formData.salesChannels"
                                     v-model="formData.salesChannels"></pop-salesman-list>
                  <popup-picker title="分类标签" :data="currentType" v-model="categoryLabels"
                                placeholder="请选择" ></popup-picker>
                  <x-textarea title="商机内容" v-model="formData.comment" :max="200"></x-textarea>
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
    Cell, Popup, TransferDom,
    Group, XInput, CellBox, Datetime,
    XTextarea, numberComma, dateFormat,
    PopupRadio, AlertModule,PopupPicker
  } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import { submitAndCalc, saveAndStartWf, saveAndCommitTask, getDictByType } from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon.js'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopSalesmanList from 'components/Popup/PopSalesmanList'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import { toFixed } from '@/plugins/calc'
  const DRAFT_KEY = 'SJ_DATA';

  export default {
    data () {
      return {
        listId: '32a2c333-02a3-416f-a133-95c7a32da678',
        showDealerPop: false, // 是否显示客户的popup
        dealerInfo: {},
        formData: {
          modifer: '',
          biId: '', // 为空
          dealerDebit: '',
          drDealerLabel: '',
          dealerDebitContactPersonName: '',
          dealerDebitContactInformation: '',
          opportunityTitle: '',
          comment: '',
          tdAmount: '',
          biProcessStatus: '', // 与PC端一致
          validUntil: '',
          salesPerson: '', // 销售人员
          salesChannels: '', // 销售渠道
          categoryLabels: [],
          biComment: ''
        },
        biReferenceId: '',
        categoryLabels: [],
        currentType: [],
        contactInfo: {},
      }
    },
    directives: {TransferDom},
    components: {
      Cell, Popup, Group, XInput, PopupPicker,
      Datetime, XTextarea, PopupRadio,
      RPicker, PopDealerList, PopSalesmanList, PopBaseinfo
    },
    mixins: [common],
    filters: {numberComma},
    methods: {
      // 选中的客户
      selDealer (val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.formData.dealerDebitContactPersonName = this.dealerInfo.creatorName || '';
        this.formData.dealerDebitContactInformation = this.dealerInfo.dealerMobilePhone;
        this.formData.drDealerLabel = this.dealerInfo.dealerLabelName;
        this.formData.dealerDebit = this.dealerInfo.dealerCode;
      },
      selContact (val){
        let contactInfo = {...val};
        this.contactInfo = contactInfo;
        // 联系人
        this.formData.dealerDebitContactPersonName = contactInfo.dealerName || '';
        // 联系人电话
        this.formData.dealerDebitContactInformation = contactInfo.dealerMobilePhone || '';
      },
      // TODO 提交
      submitOrder () {
        let warn = '';
        let validateMap = [
          {
            key: 'opportunityTitle',
            message: '请填写商机标题'
          }, {
            key: 'tdAmount',
            message: '请填写预期销售额'
          },
          // {
          //   key: 'biProcessStatus',
          //   message: '请选择流程状态'
          // },
        ];
        if (JSON.stringify(this.dealerInfo) == '{}') {
          warn = '请选择客户';
        }
        if (!warn) {
          validateMap.every(item => {
            if (!this.formData[item.key]) {
              warn = item.message;
              return false;
            }
            else if (this.formData[item.key] < 0) {
              warn = '抱歉，销售额不允许为负数';
              return false;
            }
            return true
          });
        }
        // 有必填值为空，或者金额为0，展示错误提示
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
            this.formData.categoryLabels = this.categoryLabels[0];
            let formData = {
              creator: this.formData.handler,
              ...this.formData,
              modifer: this.formData.handler,
              handlerEntity: this.entity.dealerName,
            };
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: 'OPPT',
                  createdBy: formData.creator,
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
      // TODO 获取详情
      getFormData () {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {},attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          let matterList = [];
          this.attachment = attachment;
          // 获取合计
          let {order} = formData;
          // 客户信息
          this.dealerInfo = {
            creatorName: formData.dealerDebitContactPersonName || '', // 客户名
            dealerName: formData.dealerName_dealerDebit || '', // 公司名
            dealerMobilePhone: formData.dealerDebitContactInformation || '', // 手机
            dealerCode: formData.dealerDebit || '', // 客户编码
            dealerLabelName: formData.drDealerLabel || '客户', // 关系标签
            province: formData.province_dealerDebit || '', // 省份
            city: formData.city_dealerDebit || '', // 城市
            county: formData.county_dealerDebit || '', // 地区
            address: formData.address_dealerDebit || '', // 详细地址
          };
          this.contactInfo = {
            dealerName: formData.dealerDebitContactPersonName || '', // 联系人
            dealerMobilePhone: formData.dealerDebitContactInformation || '', // 手机
          }
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          // 基本信息
          this.formData = {
            ...this.formData,
            ...formData,
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
            validUntil: dateFormat(formData.validUntil, 'YYYY-MM-DD'),
            
          }
          this.categoryLabels = [formData.categoryLabels]
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide();
        })
      },
      // TODO 检查金额
      checkAmt (val) {
        if (val) {
          this.formData.tdAmount = Math.abs(toFixed(val));
        }
      },
      //获取分类标签
      getTypeLabel () {
        getDictByType('categoryLabels').then(({tableContent=[]})=>{
          let arr = []
          tableContent.forEach(item=>{
            arr.push(item.name)
          })
          this.currentType.push(arr);
        })

      },
      // TODO 是否保存草稿
      hasDraftData () {
        let formData = this.formData;
        if (formData.dealerDebit || formData.opportunityTitle ||formData.tdAmount || formData.biProcessStatus) {
          return {
            [DRAFT_KEY]: {
              formData,
              dealerInfo : this.dealerInfo,
              contactInfo: this.contactInfo,
              categoryLabels: this.categoryLabels,
            }
          };
        }
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.formData = draft.formData;
        this.dealerInfo = draft.dealerInfo;
        this.contactInfo = draft.contactInfo;
        this.categoryLabels = draft.categoryLabels;
        sessionStorage.removeItem(DRAFT_KEY)
      }
      this.getTypeLabel()
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

      /deep/ > .vux-label {
        color: #5077aa;
        font-weight: bold;
      }
      /deep/ > .vux-no-group-title {
        margin-top: 0.08rem;
      }
      /deep/> .weui-cells {
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
        /deep/ >.weui-cell {
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
