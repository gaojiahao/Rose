<template>
  <div class="pages">
    <h1 class="m_title">
      会议立项
    </h1>
    <div class="m_main">
      <div class="m_main_part">
        <group :title="lItem.title" v-for="(lItem,lIndex) in listData" :key="lIndex">
          <cell v-for="(item, index) in lItem.items" :title="item.title" :value="item.value" :key="index"></cell>
        </group>
        <group title="费用合计">
          <cell title="金额合计" :value="totalCost"></cell>
        </group>
      </div>
    </div>
    <div class="m_btm vux-1px-t">
      <span class="count_part">合计:{{totalCost}}</span>
      <!--<span class="m_button" @click="goflow">确定</span>-->
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
        ]
      }
    },
    computed: {
      totalCost() {
        let {roomNumber, roomAveragePrice, siteFees, wayFees, repastFees} = this.formData;
        return `￥${numberComma(Number(roomNumber) * Number(roomAveragePrice) + Number(siteFees) + Number(wayFees) + Number(repastFees))}`;
      },
    },
    mixins: [common],
    components: {Group, Cell, Loading, Toast},
    methods: {
      // TODO 获取表单详情
      getFormData() {
        let {query} = this.$route;
        createService.getFormData({
          formKey: query.formKey,
          transCode: query.transCode,
        }).then(data => {
          let {formData} = data;
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
        })
      },
    },
    created() {
      this.getFormData();
    }
  }
</script>

<style lang="scss">
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
    }
  }
</style>
