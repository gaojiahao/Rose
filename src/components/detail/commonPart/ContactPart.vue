<template>
  <!-- 往来联系部分 交易基本信息-->
  <div class="contact-container">
    <div class="contact-main">
      <header class="contact_header vux-1px-l">往来信息</header>
      <div class="contact_top">
        <div class="contact_top_item">
          <span class="contact_top_title">联系人: </span>{{contactInfo.dealerContactPersonName || '暂无'}}
        </div>
        <div class="contact_top_item">
          <span class="contact_top_title">手机号: </span>{{contactInfo.dealerMobilePhone || '暂无'}}
        </div>
      </div>
      <div class="contact_dealer">
        <div class="contact_dealer_item">
          <i class="icon icon-dealer2"></i>
          <span class="contact_dealer_title">往来名称：</span>
          <span class="contact_dealer_value">{{contactInfo.dealerName}}</span>
        </div>
        <div class="contact_dealer_item">
          <i class="icon icon-address"></i>
          <span class="contact_dealer_title">往来地址：</span>
          <span class="contact_dealer_value">{{address || '暂无'}}</span>
        </div>
      </div>
    </div>
    <div class="contact-other vux-1px-t">
      <div class="contact_other_wrapper">
        <div class="contact_other_item">
          <span class="contact_other_title">物流条款：</span>
          <span class="contact_other_value">{{contactInfo.logistics}}</span>
        </div>
        <div class="contact_other_item">
          <span class="contact_other_title">账期天数：</span>
          <span class="contact_other_value">{{contactInfo.pamentDays || 0}}天</span>
        </div>
      </div>
      <div class="contact_other_wrapper">
        <div class="contact_other_item">
          <span class="contact_other_title">账单到期日：</span>
          <span class="contact_other_value">{{contactInfo.advancePaymentDueDate | dateFormat('YYYY-MM-DD HH:mm') || '暂无'}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {dateFormat} from 'vux'

  export default {
    name: "contactPart",
    props: {
      //外层div是否有contacts_part
      hasClass: {
        type: Boolean,
        default: true
      },
      contactInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否展示付款方式
      payment: {
        type: Boolean,
        default: true
      },
      // 是否展示物流条款
      logistics: {
        type: Boolean,
        default: true
      },
      //是否展示有限期
      validUntil: {
        type: Boolean,
        default: false

      }
    },
    data() {
      return {
        showAllContact: false,
      }
    },
    computed: {
      address() {
        let {province = '', city = '', county = '', address = ''} = this.contactInfo;
        return !province && !city && !county && !address ? '' : `${province}${city}${county}${address}`;
      }
    },
    filters: {
      dateFormat,
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .contact-container {
    margin: .1rem;
    width: calc(100% - .2rem);
    background-color: #fff;
    color: #333;
    .contact-main {
      padding: .15rem .15rem .24rem;
      width: 100%;
      box-sizing: border-box;
      .contact_header {
        line-height: .16rem;
        font-size: 16px;
        font-weight: 600;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .contact_top {
        margin-top: .2rem;
        display: flex;
        line-height: .14rem;
        font-size: .14rem;
      }
      .contact_top_item {
        flex: 1;
      }
      .contact_top_title {
        color: #999;
      }

      .contact_dealer {
        margin-top: .17rem;
      }
      .contact_dealer_item {
        display: flex;
        line-height: .22rem;
        font-size: .14rem;
        & + .contact_dealer_item {
          margin-top: .05rem;
        }
      }
      .icon {
        display: inline-block;
        width: .16rem;
        height: .16rem;
      }
      .contact_dealer_title {
        margin-left: .08rem;
        color: #999;
      }
      .contact_dealer_value {
        flex: 1;
      }
    }

    .contact-other {
      padding: .24rem .15rem .15rem;
      &:before {
        border-color: #e8e8e8;
      }
      .contact_other_wrapper {
        display: flex;
        margin-top: .12rem;
      }
      .contact_other_item {
        flex: 1;
        display: flex;
        line-height: .14rem;
        font-size: .14rem;
      }
      .contact_other_title {
        color: #999;
      }
    }
  }
</style>
