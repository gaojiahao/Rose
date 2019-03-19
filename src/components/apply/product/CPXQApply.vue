<template>
  <div class='pages cpxq-apply-container'>
    <div class="basicPart" ref="fill">
      <div class="wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         :defaultContact="contactInfo" v-if="Object.keys(dealerParams).length"></pop-dealer-list>
        <div class="materiel_list">
          <div :class="{'vux-1px-t': index > 0}" v-for="(item, index) in otherConfig" :key="index">
            <!-- 下拉框 -->
            <r-picker :title="item.fieldLabel" :data="item.remoteData" :value="formData[item.fieldCode]"
                    v-model="formData[item.fieldCode]" :required="!item.allowBlank"
                    v-if="item.xtype === 'r2Combo' || item.xtype === 'r2Selector'"></r-picker>
            <!-- 输入框（文字） -->
            <div class='each_property' v-if="item.xtype === 'r2Textfield'">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <input type='text' v-model="formData[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
            </div>
            <!-- 输入框（数字） -->
            <div class='each_property ' v-if="item.xtype === 'r2Numberfield'">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <input type='number' v-model.number="formData[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
            </div>
            <!-- 日期 -->
            <div class='each_property' v-if="item.xtype === 'r2Datefield'" @click="getDate(formData, item)">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <div class='picker'>
                <span class='mater_nature'>{{formData[item.fieldCode] || "请选择"}}</span>
                <span class='icon-right'></span>
              </div>
            </div>
            <!-- 文本框 -->
            <x-textarea v-model="formData[item.fieldCode]" :max="100" v-if="item.xtype === 'r2TextArea'">
              <template slot="label">
                <span :class="{required : !item.allowBlank}" style="display: block; width: 3em;">{{item.fieldLabel}}</span>
              </template>
            </x-textarea>
          </div>
        </div>
        <!--备注-->
        <div class='comment'>
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file :default-value="attachment" @on-upload="onUploadFile" :biReferenceId="biReferenceId" :contain-style="uploadStyle"></upload-file>
      </div>
    </div>
    <op-button :hide="btnIsHide" @on-submit="save" ></op-button>
  </div>
</template>

<script>
// vux 引入
import { XTextarea, Datetime } from 'vux'
// 请求 引入
import { updateData, requestData, submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/common/commonService'
import { getSOList } from 'service/detailService'
// mixins 引入
import ApplyCommon from 'mixins/applyCommon'
// 组件 引入
import RPicker from 'components/public/basicPicker'
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'

const DRAFT_KEY = 'CPXQ_DATA';

export default {
  name: 'ApplyCPXQForm',
  data() {
    return {
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
    XTextarea, Datetime ,
    RPicker, PopBaseinfo, PopDealerList, OpButton
  },
  computed: {
    bigType() {
      return this.formData.demandType
    }
  },
  watch: {
    // 监听大类变化，根据子类
    bigType: {
      handler(val) {
        if (val) {
          let type = '';
          for (let item of this.otherConfig) {
            if (item.fieldCode === 'demandType') {
              for (let dItem of item.remoteData) {
                if (dItem.name === val) {
                  type = dItem.type;
                  break;
                }
              }
            }
            if (item.fieldCode === 'demandSubclass') {
              console.log('item:', item);
              let requestParams = {
                url: item.dataSource.data.url,
                data: {
                  value: type
                }
              }
              requestData(requestParams).then(({tableContent = []}) => {
                if (this.formData.demandSubclass != null) {
                  this.formData.demandSubclass = tableContent[0].name
                }
                else {
                  this.$set(this.formData, 'demandSubclass', tableContent[0].name)
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
      
    }
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
    // 选择日期
    getDate(sItem, dItem) {
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: (val)=> {
          if (sItem[dItem.fieldCode] == null) {
            this.$set(sItem, dItem.fieldCode, val)
            return
          }
          sItem[dItem.fieldCode] = val;
        },
      })
    },    
    // 提交/修改
    save () {
      for (let key in this.formData) {
        if (typeof(this.formData[key]) === 'string' && this.formData[key].indexOf(' ') >= 0) {
          this.formData[key] = this.formData[key].replace(/\s/g, '');
        }
      }
      let warn = '';
      if (Object.keys(this.dealerParams).length && !this.dealerInfo.dealerCode) {
        warn = '请选择客户'
      }
      !warn && this.submitMatterField.every(item => {
        if (!item.hidden && !item.allowBlank && !this.formData[item.fieldCode]) {
          warn = `${item.fieldLabel}不能为空`;
          return false;
        }
        return true;
      })
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
              dealerInfo = Object.keys(this.dealerParams).length ? {
                productDealerCode: this.dealerInfo.dealerCode,  // 往来编码
                address_productDealerCode: this.dealerInfo.address, // 往来地址
                demandDealerLabel: this.dealerInfo.dealerLabelName,  // 往来关系标签
                dealerName_productDealerCode: this.dealerInfo.dealerName, // 往来名称
              } : {},
              contactInfo = Object.keys(this.dealerParams).length? {
                dealerDebitContactPersonName: this.contactInfo.dealerName, // 往来联系人 名称
                dealerDebitContactInformation: this.contactInfo.dealerMobilePhone // 往来联系人 信息 (不敢相信PC这里存的是电话)
              }: {},
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
        this.handlerDefault = {
          handle: formData.handler,
          handlerName: formData.handlerName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
        }
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
        this.contactInfo = {
          dealerName: formData.dealerDebitContactPersonName,
          dealerMobilePhone: formData.dealerDebitContactInformation,
        }
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData () {
      let formData = this.formData;
      if (formData.demandTitle || formData.demandDescribe ||  formData.biProcessStatus) {
        return {
          [DRAFT_KEY]: {
            formData: this.formData,
            dealerInfo: this.dealerInfo,
            contactInfo: this.contactInfo
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
      this.contactInfo = JSON.parse(data).contactInfo;
      sessionStorage.removeItem(DRAFT_KEY);
    }
  },
}
</script>

<style lang="scss" scoped>
  @import '~scss/biz-app/bizApply.scss';
  .materiel_list {
    background: #fff;
    padding: 0 .15rem;
    font-size: 0.14rem;
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
    input{  
      border: none;
      outline: none;
      font-size: .14rem;
    }
    label{
      color: #696969;
    }
    // .add{
    //   color: #3296FA;
    // }
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
</style>
