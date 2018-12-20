<template>
  <div class='pages cpxq-apply-container'>
    <div class="basicPart when-is-form" ref="fill">
      <div class="wrapper">
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
                <div class="title">需求信息</div>
                <group class="XQ_group" @group-title-margin-top="0">
                  <x-input title="标题" text-align='right' v-model="formData.demandTitle"
                           placeholder='请填写'>
                    <template slot="label">
                      <span class='required'>标题
                      </span>
                    </template>
                  </x-input>
                  <x-textarea title="描述" v-model="formData.demandDescribe" :max="200">
                    <template slot="label">
                      <label class="required" style="width: 3em; display: block;">描述</label>
                    </template>
                  </x-textarea>
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
  import { Group, Popup, XInput, XTextarea } from 'vux'
  import RPicker from 'components/RPicker';
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopDealerList from 'components/Popup/PopDealerList'
  // 请求 引入
  import {
    submitAndCalc,
    updateData,
    saveAndStartWf,
    saveAndCommitTask
  } from 'service/commonService'
  import { getSOList } from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  const DRAFT_KEY = 'CPXQ_DATA';
  export default {
    name: 'ApplyCPXQForm',
    data() {
      return {
        listId: 'b30f4d3e-b23d-11e8-96a5-005056a136d0',
        formViewUniqueId: 'b018ef18-f0d1-41a8-985e-29de19e6b705',
        formData: {
          biId: '',
          demandTitle: '', // 标题
          demandDescribe: '', // 描述
          biComment: '', // 备注
        },
        biReferenceId: '',
        dealerInfo: {},
        contactInfo: {},
        uploadStyle : {}
      }
    },
    mixins: [ApplyCommon],
    components: {
      Group, XInput, XTextarea,
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
      // 提交/修改
      save () {
        let requiredMap = {
          demandTitle: '标题',
          demandDescribe: '描述'
        };
        for (let key in this.formData) {
          if (typeof(this.formData[key]) === 'string' && this.formData[key].indexOf(' ') >= 0) {
            this.formData[key] = this.formData[key].replace(/\s/g, '');
          }
        }
        let warn = '';
        !warn && Object.entries(requiredMap).every(([key, msg]) => {
          if (!this.formData[key]) {
            warn = `${msg}不能为空`;
            return false;
          }
          return true;
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
            this.$HandleLoad.show();
            let formData = this.formData,
                dealerInfo = {
                  productDealerCode: this.dealerInfo.dealerCode,  // 往来编码
                  address_productDealerCode: this.dealerInfo.address, // 往来地址
                  demandDealerLabel: this.dealerInfo.dealerLabelName,  // 往来关系标签
                  dealerName_productDealerCode: this.dealerInfo.dealerName, // 往来名称
                },
                contactInfo = {
                  dealerDebitContactPersonName: this.contactInfo.dealerName, // 往来联系人 名称
                  dealerDebitContactInformation: this.contactInfo.dealerMobilePhone // 往来联系人 信息 (不敢相信PC这里存的是电话)
                },
                operation = this.processCode.length ? saveAndStartWf : submitAndCalc;
            let submitData = {
              biComment: '',
              listId: this.listId,
              biReferenceId: this.biReferenceId,
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...formData,
                ...dealerInfo,
                ...contactInfo
              }),
            };
            if (this.transCode) {
              operation = updateData;
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // 获取用户数据
      getFormData () {
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
          this.attachment = data.attachment
          this.biReferenceId = biReferenceId;
          this.formData = {
            ...this.formData,
            ...formData
          };
          this.dealerInfo = {
            dealerCode: formData.productDealerCode,  // 往来编码
            address: formData.address_productDealerCode, // 往来地址
            dealerLabelName: formData.demandDealerLabel,  // 往来关系标签
            dealerName: formData.dealerName_productDealerCode // 往来名称
          }
          this.$loading.hide();
        })
      },
      // 是否保存草稿
      hasDraftData () {
        let formData = this.formData;
        if (formData.demandTitle || formData.demandDescribe ||  formData.processStatus) {
          return {
            [DRAFT_KEY]: {
              formData: this.formData,
              dealerInfo: this.dealerInfo
            }
          };
        }
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.formData = JSON.parse(data).formData;
        this.dealerInfo = JSON.parse(data).dealerInfo;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';
  .materiel_list .mater_list .each_mater {
    padding: unset;
  }
  .cpxq-apply-container {
    .XQ_group {
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
