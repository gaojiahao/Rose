<template>
  <!-- 往来联系部分 交易基本信息-->
  <div :class="{contacts_part : hasClass}">
    <div class="main_content vux-1px-b">
      <span class="iconfont icon-kehu1"></span>
      <div class="cp_name m_size_name">{{contactInfo.dealerName}}</div>
      <div class="other_info s_size_name">
        <span class="title">手机：</span>
        <span class="content">{{contactInfo.dealerMobilePhone || '暂无'}}</span>
      </div>
      <div class="other_info s_size_name">
        <span class="title">地址：</span>
        <span class="content" v-if="noAddress">暂无</span>
        <span class="content" v-else>{{contactInfo.province}}{{contactInfo.city}}{{contactInfo.county}}{{contactInfo.address}}</span>
      </div>
    </div>
    <div class="other_content">
      <div class="trade_info s_size_name" v-if="payment">
        <span class="title">结算方式：</span>
        <span class="mode">{{contactInfo.payment || '暂无'}}</span>
      </div>
      <div class="trade_info s_size_name" v-if="logistics">
        <span class="title">物流条款：</span>
        <span class="mode">{{contactInfo.logistics || '暂无'}}</span>
      </div>
    </div>
    <div class="valid vux-1px-t" v-if="validUntil">
       <span class="title">有效期至：</span>
        <span class="mode">{{contactInfo.validUntil || '暂无'}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "contactPart",
    props: {
      //外层div是否有contacts_part
      hasClass : {
        type: Boolean,
        default : true
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
      validUntil : {
        type : Boolean,
        default : false

      }
    },
    data() {
      return {}
    },
    computed:{
      noAddress() {
        let {province = '', city = '', county = '', address = ''} = this.contactInfo;
        return !province && !city && !county && !address;
      }
    },
    created(){
    }
  }
</script>

<style scoped lang="scss">
  .contacts_part {
    margin-bottom: .1rem;
    padding: .06rem .1rem 0;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
    .main_content {
      position: relative;
      padding: 0 .1rem .06rem .2rem;
    }
    .iconfont {
      top: .02rem;
      left: -.01rem;
      font-size: .16rem;
      position: absolute;
    }
    // 公司信息
    .cp_name {
      font-weight: bold;
    }
    // 其他信息
    .other_info {
      color: #454545;
      font-weight: 200;
    }
    .other_content {
      padding: .06rem 0;
      .trade_info {
        margin: .04rem 0;
        .title {
          font-weight: bold;
        }
        .mode {
          color: #454545;
          font-weight: 200;
        }
      }
    }
    .valid{
      padding: .06rem 0;
      font-size: .14rem;
      .title {
          font-weight: bold;
        }
        .mode {
          color: #454545;
          font-weight: 200;
        }
    }
    .l_size_name {
      color: #111;
      padding: .06rem 0;
      font-size: .22rem;
      font-weight: 400;
    }
    .m_size_name {
      font-size: .18rem;
    }
    .s_size_name {
      font-size: .14rem;
    }
    .vux-1px-b:after {
      border-color: #e8e8e8;
    }
    .vux-1px-t:before {
      border-color: #e8e8e8;
    }
  }
</style>
