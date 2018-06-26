<template>
  <div class="pages">
    <div v-show="showPage">
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
      <div class="h_btm vux-1px-t">
        <span class="count_part">合计:{{totalCost}}</span>
        <!--<span class="h_button" @click="goflow">确定</span>-->
      </div>
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

  export default {
    components: {
      Cell,
      Group,
      Toast,
      Loading
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
      }
    },
    computed: {
      totalCost() {
        let {tenancy, rental} = this.formData;
        return `￥${numberComma(Number(tenancy) * Number(rental))}`;
      }
    },
    mixins: [common],
    methods: {
      // TODO 获取表单详情
      getFormData() {
        this.showLoading = true;
        let {query} = this.$route;
        createService.getFormData({
          formKey: query.formKey,
          transCode: query.transCode,
        }).then(data => {
          this.showLoading = false;
          this.showPage = true;
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
        }).catch(e => {
          this.showToastText(e.message);
        });
      },
    },
    created() {
      this.getFormData();
    }
  }
</script>

<style lang='scss' scoped>
  .h_title { //标题
    width: 100%;
    height: 120px;
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
    top: 90px;
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
    }
  }
</style>
