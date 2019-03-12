<template>
  <div class='pages cpxq-apply-container'>
    <div class="basicPart" ref="fill">
      <div class="wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" 
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <div class="materiel_list">
          <div :class="{'vux-1px-t': index > 0}" v-for="(item, index) in otherConfig" :key="index">
            <!--被授权者-->
            <template v-if="item.fieldCode === 'authorized'">
              <div class='each_property' @click="getAuthorized">
                <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                <div class='picker'>
                  <span class='mater_nature'>{{formData[item.fieldCode] || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
              <pop-handler-list :show="showAuthorized" :default-value="currentAuthorized" :requestParams="item.requestParams"
                    v-model="showAuthorized" @sel-handler="selHandler"></pop-handler-list>
            </template>
            <template v-else>
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
              <div class='each_property' v-if="item.xtype === 'r2Datefield'" @click="getDate(formData,item)">
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
            </template>
          </div>
        </div>
        <!--备注-->
        <div class='comment'>
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file :default-value="attachment" @on-upload="onUploadFile" :biReferenceId="biReferenceId" :contain-style="uploadStyle"></upload-file>
      </div>
    </div>
    <op-button :hide="btnIsHide" @on-submit="save" ></op-button>
  </div>
</template>

<script>
  // vux 引入
  import { Group, Popup, XInput, XTextarea, Datetime } from 'vux'
  import RPicker from 'components/basicPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import OpButton from 'components/apply/commonPart/OpButton'
  import PopHandlerList from 'components//Popup/PopHandlerList'
  // 请求 引入
  import {
    submitAndCalc,
    updateData,
    saveAndStartWf,
    saveAndCommitTask,
    requestData
  } from 'service/commonService'
  import { getSOList } from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  const DRAFT_KEY = 'CPBUG_DATA';
  export default {
    name: 'ApplyCPXQForm',
    data() {
      return {
        listId: 'f27a8921-6bb4-4256-a2a2-525dd34455f7',
        formViewUniqueId: '9a38a5ea-44f7-4dae-8c3c-d998987cfbcd',
        formData: {
          biId: '',
          biComment: '', // 备注
        },
        biReferenceId: '',
        uploadStyle : {},
        showAuthorized: false,
        currentAuthorized: {}
      }
    },
    mixins: [ApplyCommon],
    components: {
      Group, XInput, XTextarea, Datetime ,
      RPicker, PopBaseinfo, OpButton, PopHandlerList
    },
    computed: {
      bugType() {
        return this.formData.bugType
      }
    },
    watch: {
      // 监听大类变化，根据子类
      bugType: {
        handler(val){
          if (val){
            let type = '';
            for (let item of this.otherConfig){
              if (item.fieldCode === 'bugType'){
                for (let dItem of item.remoteData){
                  if (dItem.name === val){
                    type = dItem.type;
                    break;
                  }
                }
              }
              if (item.fieldCode === 'bugSubclass'){
                let requestParams = {
                  url: item.dataSource.data.url,
                  data: {
                    value: type
                  }
                }
                requestData(requestParams).then(({tableContent = []}) => {
                  if (this.formData.bugSubclass != null) {
                    this.formData.bugSubclass = tableContent[0].name
                  }
                  else {
                    this.$set(this.formData, 'bugSubclass', tableContent[0].name)
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
      getAuthorized(){
        this.showAuthorized = true;
      }, 
      selHandler(val){
        this.currentAuthorized = {...val};
        this.formData.authorized = val.nickname;
      },
      // 选择日期
      getDate(sItem, dItem){
        this.$vux.datetime.show({
          confirmText: '确认',
          cancelText: '取消',
          onConfirm: (val)=> {
            if (sItem[dItem.fieldCode] == null){
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
        this.submitMatterField.every(item => {
          if (!item.hidden && !item.allowBlank && !this.formData[item.fieldCode]){
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
                operation = this.processCode.length ? saveAndStartWf : submitAndCalc;
            let submitData = {
              biComment: '',
              listId: this.listId,
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...formData,
              }),
            };
            if (this.biReferenceId){
              submitData.biReferenceId = this.biReferenceId
            }
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
          this.$loading.hide();
        })
      },
      // 是否保存草稿
      hasDraftData () {
        let formData = this.formData;
        if (formData.bugTitle || formData.bugDescribe) {
          return {
            [DRAFT_KEY]: {
              formData: this.formData,
            }
          };
        }
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply.scss';
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
