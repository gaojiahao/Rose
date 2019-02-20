<template>
  <!-- 往来联系部分 交易基本信息-->
  <div class="contact-container">
    <div class="contact-main">
      <header class="contact_header vux-1px-l">往来信息</header>
      <div class="contact_top" v-if="contactInfo.dealerContactPersonName || contactInfo.dealerMobilePhone">
        <div class="contact_top_item">
          <span class="contact_top_title">联系人: </span>{{contactInfo.dealerContactPersonName || '暂无'}}
        </div>
        <div class="contact_top_item">
          <span class="contact_top_title">手机号: </span>{{contactInfo.dealerMobilePhone || '暂无'}}
        </div>
      </div>
      <div class="contact_top" v-else-if="contactInfo.dealerCode_dealerCodeCredit">
        <div class="contact_top_item">
          <span class="contact_top_title">往来编码: </span>{{contactInfo.dealerCode_dealerCodeCredit || '暂无'}}
        </div>
        <div class="contact_top_item">
          <span class="contact_top_title">往来标签: </span>{{contactInfo.crDealerLabel || '暂无'}}
        </div>
      </div>
      <div class="contact_dealer">
        <div class="contact_dealer_item">
          <i class="icon icon-dealer2"></i>
          <span class="contact_dealer_title">往来名称：</span>
          <span class="contact_dealer_value">{{contactInfo.dealerName || contactInfo.dealerName_dealerCodeCredit}}</span>
        </div>
        <div class="contact_dealer_item" v-if="showAddress">
          <i class="icon icon-address"></i>
          <span class="contact_dealer_title">往来地址：</span>
          <span class="contact_dealer_value">{{contactInfo.address || '暂无'}}</span>
        </div>
      </div>
    </div>
    <div class="contact-other vux-1px-t" v-if="configs.length">
      <div class="contact_other_wrapper" v-for="(item, index) in configs" :key="index">
        <div class="contact_other_item">
          <span class="contact_other_title">{{item.fieldLabel}}：</span>
          <span class="contact_other_value">{{item.fieldValue || contactInfo[item.fieldCode]|| '暂无'}}</span>
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
      contactInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      configs: {
        type: Array,
        default() {
          return []
        }
      },
      showAddress: {
        type: Boolean,
        default: true
      }
    },
    filters: {
      dateFormat,
    }
  }
</script>

<style scoped lang="scss">
  .contact-container {
    color: #333;
    margin: .1rem;
    border-radius: .04rem;
    background-color: #fff;
    width: calc(100% - .2rem);
    .contact-main {
      width: 100%;
      padding: .15rem;
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
        margin-top: .03rem;
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
      display: flex;
      flex-wrap: wrap;
      padding: .08rem .15rem .15rem;
      &:before {
        border-color: #e8e8e8;
      }
      .contact_other_wrapper {
        display: flex;
        margin-top: .12rem;
        margin-right: .2rem;
        min-width: calc(50% - 0.2rem);
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
