<template>
  <div class="pages house-detail-container">
    <div class="swiper-container" v-show="showPage">
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
        <flow-detail class="swiper-slide" :work-flow="workFlow"></flow-detail>
      </div>
    </div>
    <!-- 审批按钮 -->
    <r-action :actions="actions" @on-action="showConfirmPop"></r-action>
    <loading :show="showLoading"></loading>
    <task-confirm :show="showConfirm" v-model="showConfirm" :can-empty="result === 1"
                  @on-confirm="confirm"></task-confirm>
  </div>
</template>

<script>
  import detail from './../mixins/detail'

  export default {
    mixins: [detail],
    data() {
      return {
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
      }
    },
    computed: {
      totalCost() {
        let {tenancy = 0, rental = 0} = this.formData;
        return `￥${numberComma(Number(tenancy) * Number(rental))}`;
      }
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
