<template>
  <div class="pages house-detail-container">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide form">
          <h1 class="h_title">
            房屋立项
          </h1>
          <div class="h_main">
            <div class="h_main_part">
              <group :title="lItem.title" v-for="(lItem,lIndex) in listData" :key="lIndex">
                <cell v-for="(item, index) in lItem.items" :title="item.title" :value="item.value" :key="index"
                      primary="content"></cell>
              </group>
            </div>
          </div>
        </div>
        <flow-detail class="swiper-slide" :trans-code="transCode"></flow-detail>
      </div>
    </div>
    <div class="h_btm vux-1px-t" v-if="canSubmit">
      <span class="h_button reject" @click="submit(2)">拒绝</span>
      <span class="h_button" @click="submit(1)">同意</span>
    </div>
    <loading :show="showLoading"></loading>
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>
</template>

<script>
  import {Cell, Group, XTextarea, numberComma, Toast} from 'vux'
  import createService from './../service/createService'
  import Loading from './components/loading'
  import common from './mixins/common'
  import Swiper from 'swiper'
  import FlowDetail from './components/FlowDetail'

  export default {
    components: {
      Cell,
      Group,
      Toast,
      Loading,
      FlowDetail,
    },
    data() {
      return {
        formData: {},
        listData: [
          {
            title: '请选择地点类型',
            items: [
              {
                title: '地点类型',
                key: 'office',
                value: '',
              }, {
                title: '处理类型',
                key: 'moveType',
                value: '',
              }
            ]
          }, {
            title: '请填写明细',
            items: [
              {
                title: '新增/搬家原因',
                key: 'moveReason',
                value: '',
              }, {
                title: '入驻人数',
                key: 'checkInNumber',
                value: '',
              }, {
                title: '房屋面积',
                key: 'area',
                value: '',
              }, {
                title: '月租',
                key: 'rental',
                value: '',
              }, {
                title: '付款方式',
                key: 'paymentType',
                value: '',
              }, {
                title: '租期',
                key: 'tenancy',
                value: '',
              }, {
                title: '租期开始时间',
                key: 'begin',
                value: '',
              }, {
                title: '租期结束时间',
                key: 'end',
                value: '',
              }
            ]
          }, {
            title: '费用归属',
            items: [
              {
                title: '费用所属事业部',
                key: 'costBU',
                value: '',
              }, {
                title: '费用所属部门',
                key: 'costDepartment',
                value: '',
              }, {
                title: '核算归属省份',
                key: 'checkProvince',
                value: '',
              }, {
                title: '费用所属银行',
                key: 'costBank',
                value: '',
              }
            ]
          }
        ],
        showPage: false,
        listid: '',
        formKey: '',
        transCode: '',
        taskId: '',
        canSubmit: false,
        pageSwiper: null,
      }
    },
    computed: {
      totalCost() {
        let {tenancy = 0, rental = 0} = this.formData;
        return `￥${numberComma(Number(tenancy) * Number(rental))}`;
      }
    },
    mixins: [common],
    methods: {
      // TODO 获取表单详情
      getFormData() {
        this.showLoading = true;
        createService.getFormData({
          formKey: this.formKey,
          transCode: this.transCode,
        }).then(data => {
          this.showLoading = false;
          this.showPage = true;
          let {formData = {}, success = true, message = ''} = data;
          // 请求失败提示
          if (!success) {
            this.showToastText(message);
            return;
          }

          formData.begin = this.changeDate(formData.begin);
          formData.end = this.changeDate(formData.end);
          formData.crtTime = this.changeDate(formData.crtTime);
          formData.modTime = this.changeDate(formData.modTime);

          this.formData = formData;
          this.listData.forEach(lItem => {
            lItem.items.forEach(item => {
              item.value = formData[item.key]
            })
          })
        }).catch(e => {
          this.showToastText(e.message);
        });
      },
      // TODO 审批
      submit(result = 1) {
        this.showLoading = true;
        createService.examineTask(this.taskId, {
          result,
          transCode: this.transCode,
          comment: '',
        }).then(data => {
          this.showLoading = false;
          let {message, success} = data;
          if (success && message.indexOf('null') === -1) {
            this.showToastText('提交成功');
            setTimeout(() => {
              this.$router.go(-1);
            }, 1000)
          } else {
            this.showToastText('提交失败');
          }
        }).catch(e => {
          this.showToastText(e.message);
        })
      },
    },
    created() {
      let {query} = this.$route;
      this.listid = query.list;
      this.formKey = query.formKey;
      this.transCode = query.transCode;
      this.taskId = query.taskId;
      this.canSubmit = query.canSubmit === '1';
      this.getFormData();
      this.$nextTick(() => {
        this.pageSwiper = new Swiper('.swiper-container', {});
      })
    }
  }
</script>

<style lang='scss' scoped>
  .house-detail-container {
    .swiper-container {
      height: 100%;
      .form {
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
    .h_title { //标题
      width: 100%;
      height: 80px;
      line-height: 80px;
      font-size: 34px;
      text-align: center;
      color: #fff;
      font-weight: 200;
      background: #5077AA;
      position: relative;
      .h_user {
        line-height: initial;
        font-size: 16px;
        font-weight: normal;
        position: absolute;
        left: 50%;
        bottom: 20%;
        transform: translate(-50%);
        display: flex;
        align-items: center;
        .right_arrow {
          fill: #fff;
        }
      }
    }

    .h_main {
      width: 90%;
      max-width: 600px;
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 4px;
      z-index: 100;
      padding-bottom: 56px;
      .h_main_part {
        background: #fff;
        margin-top: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px #e8e8e8;
      }
    }

    .h_btm {
      width: 100%;
      height: 44px;
      line-height: 44px;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 101;
      margin-top: 20px;
      box-sizing: border-box;
      display: flex;
      .count_part {
        flex: 2.5;
        background: #fff;
        color: #000;
        display: inline-block;
        text-align: center;
        font-weight: bold;
      }
      .h_button {
        flex: 1;
        color: #fff;
        background: #5077AA;
        display: inline-block;
        text-align: center;
        &.reject {
          background-color: #ccc;
        }
      }
    }
  }
</style>
