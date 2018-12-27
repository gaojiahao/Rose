<template>
  <!-- 往来联系部分 交易基本信息-->
  <div :class="{contacts_part : hasClass}">
    <div class="info_title">
      <span class="title">客户信息</span>
    </div>
    <div class="main_content vux-1px contact_whole">
      <div class="title vux-1px-r">
        <p>客户名称</p>
        <p v-show="showAllContact">联系人</p>
        <p v-show="showAllContact">手机号</p>
        <p>地址</p>
      </div>
      <div class="content">
        <p>{{contactInfo.dealerName}}</p>
        <p v-show="showAllContact">{{contactInfo.dealerContactPersonName || '暂无'}}</p>
        <p v-show="showAllContact">{{contactInfo.dealerMobilePhone || '暂无'}}</p>
        <p v-if="!noAddress">{{contactInfo.province}}{{contactInfo.city}}{{contactInfo.county}}{{contactInfo.address}}</p>
        <p v-else>暂无</p>
      </div>
    </div>
    <div class="check_more vux-1px" @click="showAllContact = true" v-show="!showAllContact">        
      查看更多详情 <span class="icon-filter-down"></span>
    </div>
    <!-- <div class="main_content" :class="{'vux-1px-b' : payment || logistics}">
      <span class="iconfont icon-kehu1"></span>
      <div class="cp_name m_size_name">{{contactInfo.dealerName}}</div>
      <div class="other_info s_size_name">
        <span class="title">联系人: </span>
        <span class="content">{{contactInfo.dealerContactPersonName || '暂无'}}</span>
      </div>
      <div class="other_info s_size_name">
        <span class="title">手机: </span>
        <span class="content">{{contactInfo.dealerMobilePhone || '暂无'}}</span>
      </div>
      <div class="other_info s_size_name">
        <span class="title">地址: </span>
        <span class="content" v-if="noAddress">暂无</span>
        <span class="content" v-else>{{contactInfo.province}}{{contactInfo.city}}{{contactInfo.county}}{{contactInfo.address}}</span>
      </div>
    </div>
    <div class="other_content" :class="{'no-bottom': $slots.other && !validUntil}" v-if="payment || logistics">
      <div class="trade_info s_size_name" v-if="payment">
        <span class="title">结算方式: </span>
        <span class="mode">{{contactInfo.payment || '暂无'}}</span>
      </div>
      <div class="trade_info s_size_name" v-if="logistics">
        <span class="title">物流条款: </span>
        <span class="mode">{{contactInfo.logistics || '暂无'}}</span>
      </div>
    </div>
    <div class="valid vux-1px-t" v-if="validUntil">
       <span class="title">有效期至: </span>
        <span class="mode">{{contactInfo.validUntil || '暂无'}}</span>
    </div> -->
    <!-- <slot name="other"></slot> -->
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
      return {
        showAllContact: false,
      }
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
  .vux-1px:before,.vux-1px-r:after{
    border-color: #ECEDEC;
  }
  .contacts_part {
    margin-bottom: .1rem;
    padding: .15rem .11rem 0.15rem .18rem;
    width: 100%;
    background: #fff;
    box-sizing: border-box;
    font-size: .14rem;
    // 标题
    .info_title {
      width: .83rem;
      height: .41rem;
      background: url('/src/assets/iconfont/handler_bg.png');
      background-size: cover;
      margin: 0 auto;
      position: relative;
      .title {
        position: absolute;
        left: .16rem;
        top: .1rem;
        line-height: .14rem;
        color: #fff;

      }
    }
    // 往来信息
    .main_content {
      margin-top: .21rem;
      display: flex;
      .basic_mod{
        box-sizing: border-box;
        line-height: .29rem;
      }
      .title {
        width: .88rem;        
        color: #999;
        @extend .basic_mod;
        padding: .05rem 0 .05rem .11rem;
      }
      .content {
        flex: 1;
        color: #333;
        @extend .basic_mod;
        padding: .05rem .17rem .05rem .15rem;
      }
    }
    // 查看更多
    .check_more {
      width: 1.29rem;
      height: .34rem;
      margin: .3rem auto .11rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      .icon-filter-down{
        width: .11rem;
        height: .05rem;
        margin-left: .02rem;
      }
      &.vux-1px:before{
        border-color: #979797;
        border-radius: .34rem;
      }
    }
    .other {
      padding-bottom: .06rem;
      font-size: .14rem;
      .title {
        font-weight: bold;
      }
      .mode {
        color: #454545;
      }
    }
  }
</style>
