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
                <div class="title">员工信息</div>
                <group class="SJ_group" @group-title-margin-top="0">
                  <!-- 商机标题 -->
                  <x-input title="员工" text-align='right' v-model="formData.profileName"
                           placeholder='请填写'>
                    <template slot="label">
                      <span class='required'>员工
                      </span>
                    </template>
                  </x-input>
                  <!-- 预期销售额 -->
                  <x-input title="身份证号" type="number" text-align='right' placeholder='请填写'
                           @on-blur="checkIdCard" v-model="formData.idCard">
                    <template slot="label">
                      <span class='required'>身份证号
                      </span>
                    </template>
                  </x-input>
                  <x-input title="紧急联系人"  text-align='right' placeholder='请填写'
                            v-model.number="formData.urgentContact">
                  </x-input>
                  <x-input title="联系方式" type="number" text-align='right' placeholder='请填写'
                           @on-blur="checkMobile" v-model.number="formData.profileContact">
                  </x-input>
                  <x-input title="地址"  text-align='right' placeholder='请填写'
                           v-model.number="formData.profileAddress">
                  </x-input>
                  <x-input title="学历"  text-align='right' placeholder='请填写'
                           v-model.number="formData.education">
                  </x-input>
                  <!-- 有效期 -->
                  <datetime v-model="formData.contractPeriod" placeholder='请选择日期' title="合同期限"></datetime>
                  <datetime v-model="formData.entryDate" placeholder='请选择日期' title="入职日期"></datetime>
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
    Cell,Group, XInput, Datetime, XTextarea, dateFormat,
  } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import { submitAndCalc, saveAndStartWf, saveAndCommitTask, getDictByType } from 'service/commonService'
  // mixins 引入
  import common from 'components/mixins/applyCommon.js'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  const DRAFT_KEY = 'YGDA_DATA';

  export default {
    data () {
      return {
        listId: '223f9387-d2d7-11e8-b8ca-0279b2c6a380',
        formData: {
          biId: '', // 为空
          biComment: '',
          biProcessStatus: ''
        },
        biReferenceId: '',
        MobileWarn: false,
        idCardWarn: false,
      }
    },
    components: {
      Cell,Group, XInput,
      Datetime, XTextarea,
      RPicker, PopBaseinfo
    },
    mixins: [common],
    methods: {
      //校验手机号
      checkMobile(){
        let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if(this.formData.profileContact && !reg.test(this.formData.profileContact)){
          this.MobileWarn = true;
          return
        }
        this.MobileWarn = false;
      },
      // 校验身份证
      checkIdCard(){
        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if(this.formData.idCard && !reg.test(this.formData.idCard)){
          this.idCardWarn = true;
          return
        }
        this.idCardWarn = false;
      },
      // TODO 提交
      submitOrder () {
        let warn = '';
        let validateMap = [
          {
            key: 'profileName',
            message: '员工'
          }, {
            key: 'idCard',
            message: '身份证号'
          },
        ];
        if (!warn) {
          validateMap.every(item => {
            if (!this.formData[item.key]) {
              warn = `请填写${item.message}`;
              return false;
            }
            return true
          });
        }
        if (!warn && this.MobileWarn) {
          warn = '联系方式格式不正确'
        }
        if (!warn && this.idCardWarn) {
          warn = '身份证号格式不正确'
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
        if (formData.profileName || formData.idCard) {
          return {
            [DRAFT_KEY]: {
              formData
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
