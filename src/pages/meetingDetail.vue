<template>
  <div class="pages">
    <!--<div class="swiper-container"  v-show="showPage">-->
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide form">
          <h1 class="m_title">
            会议立项
          </h1>
          <div class="m_main">
            <div class="m_main_part">
              <group :title="lItem.title" v-for="(lItem,lIndex) in listData" :key="lIndex">
                <cell v-for="(item, index) in lItem.items" :title="item.title" :value="item.value" :key="index"
                      primary="content"></cell>
              </group>
              <group title="费用合计">
                <cell title="金额合计" :value="totalCost"></cell>
              </group>
            </div>
          </div>
        </div>
        <flow-detail class="swiper-slide" :trans-code="transCode"></flow-detail>
      </div>
    </div>
    <div class="m_btm vux-1px-t" v-if="canSubmit">
      <span class="m_button reject" @click="submit(2)">拒绝</span>
      <span class="m_button" @click="submit(1)">同意</span>
    </div>
    <loading :show="showLoading"></loading>
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>
</template>

<script>
  import {Group, Cell, Toast, numberComma} from 'vux'
  import createService from './../service/createService'
  import Loading from './components/loading'
  import common from './mixins/common'
  import Swiper from 'swiper'
  import FlowDetail from './components/FlowDetail'

  export default {
    name: "mettingDetail",
    data() {
      return {
        formData: {},
        listData: [
          {
            title: '请填写会议安排明细',
            items: [
              {
                title: '开始日期',
                key: 'begin',
                value: '',
              }, {
                title: '结束日期',
                key: 'end',
                value: '',
              }, {
                title: '省份',
                key: 'province',
                value: '',
              }, {
                title: '城市',
                key: 'city',
                value: '',
              }, {
                title: '酒店名称',
                key: 'hotelName',
                value: '',
              }, {
                title: '房间均价',
                key: 'roomAveragePrice',
                value: '',
              }, {
                title: '房间数量',
                key: 'roomNumber',
                value: '',
              }, {
                title: '总人数',
                key: 'headCount',
                value: '',
              }, {
                title: '场地费用',
                key: 'siteFees',
                value: '',
              }, {
                title: '路费合计',
                key: 'wayFees',
                value: '',
              }, {
                title: '餐饮合计',
                key: 'repastFees',
                value: '',
              }
            ]
          }, {
            title: '请填写会议相关事宜',
            items: [
              {
                title: '人员范围',
                key: 'personScope',
                value: '',
                isTextArea: true
              }, {
                title: '会议议程',
                key: 'agenda',
                value: '',
                isTextArea: true
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
        canSubmit: false, // 是否允许操作
        pageSwiper: null,
      }
    },
    computed: {
      totalCost() {
        let {roomNumber = 0, roomAveragePrice = 0, siteFees = 0, wayFees = 0, repastFees = 0} = this.formData;
        return `￥${numberComma(Number(roomNumber) * Number(roomAveragePrice) + Number(siteFees) + Number(wayFees) + Number(repastFees))}`;
      },
    },
    mixins: [common],
    components: {Group, Cell, Loading, Toast, FlowDetail},
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

<style lang="scss">
  .pages {
    .swiper-container {
      height: 100%;
      .form {
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
    .m_title { //标题
      width: 100%;
      height: 120px;
      line-height: 80px;
      font-size: 34px;
      text-align: center;
      color: #fff;
      font-weight: 200;
      background: #5077AA;
      position: relative;
      .m_user {
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

    .m_main {
      width: 90%;
      max-width: 600px;
      position: absolute;
      top: 90px;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 4px;
      z-index: 100;
      padding-bottom: 56px;
      .m_main_part {
        background: #fff;
        margin-top: 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px #e8e8e8;
      }
    }

    .m_btm {
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
      .m_button {
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
