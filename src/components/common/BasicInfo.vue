<template>
  <!-- 经办信息 （订单、主体等） -->
  <div class="basic_info">
    <!-- 订单编码栏 -->
    <div class="serial_bar vux-1px-b">
      <div>
        <span class="iconfont icon-dingdan1"></span>
        <span class="l_size_name">{{basicInfo.TRANS_CODE}}</span>
      </div>
      <!--<p class="work_status" :class="basicInfo.dyClass">{{basicInfo.biStatus}}</p>-->
    </div>
    <!-- 经办信息 -->
    <div class="handle_info vux-1px-b">
      <div class="each_handle s_size_name">
        <span class="title">经办人：</span>
        <span class="content">{{basicInfo.saleOwnerN || '无'}}</span>
      </div>
      <div class="each_handle s_size_name">
        <span class="title">经办角色：</span>
        <span class="content">{{basicInfo.HANDLER_ROLE_NAME || '无'}}</span>
      </div>
      <div class="each_handle s_size_name">
        <span class="title">经办部门：</span>
        <span class="content">{{basicInfo.HANDLER_UNIT_NAME || '无'}}</span>
      </div>
      <div class="each_handle s_size_name">
        <span class="title">所属区域：</span>
        <span class="content">{{basicInfo.HANDLER_AREA_NAME || '无'}}</span>
      </div>
    </div>
    <!-- 创建时间 完成时间 -->
    <div class="time_info s_size_name">
      <div class="each_time" v-if="basicInfo.creatorName">
        <span class="title">创建人：</span>
        <span class="content">{{basicInfo.creatorName}}</span>
      </div>
      <div class="each_time" v-if="basicInfo.crtTime">
        <span class="title">创建时间：</span>
        <span class="content">{{basicInfo.crtTime | dateFormat }}</span>
      </div>
      <div class="each_time" v-if="basicInfo.ownCode">
        <span class="title">销量归属交易号：</span>
        <span class="content">{{basicInfo.ownCode}}</span>
      </div>
      <div class="each_time" v-if="basicInfo.TRANS_NAME">
        <span class="title">交易类型：</span>
        <span class="content">{{basicInfo.TRANS_NAME}}</span>
      </div>
      <div class="each_time" v-if="basicInfo.EFFECTIVE_TIME">
        <span class="title">生效时间：</span>
        <span class="content">{{basicInfo.EFFECTIVE_TIME | dateFormat}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { dateFormat } from 'vux'
  export default {
    name: "BasicInfo",
    props: {
      basicInfo: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    filters: {
      dateFormat
    }
  }
</script>

<style scoped lang="scss">
  // 基本信息 （订单、经办主体等）
  .basic_info {
    width: 100%;
    padding: 0 .1rem;
    background: #fff;
    margin-bottom: .1rem;
    box-sizing: border-box;
    // 订单栏
    .serial_bar {
      display: flex;
      padding: .04rem 0;
      align-items: center;
      justify-content: space-between;
      .icon-dingdan1 {
        position: relative;
        top: .05rem;
        display: inline-block;
        width: .14rem;
        height: .2rem;
        background: url(./../../assets/transCode.jpg) no-repeat center;
      }
      // 表单状态
      .work_status {
        color: #fff;
        font-size: .12rem;
        font-weight: bold;
        padding: .01rem .04rem;
        background: #53d397;
        border-radius: .12rem;
      }
      // 进行中
      .doing_work {
        background: #5077aa;
      }
      // 已失效
      .invalid_work {
        background: #474a56;
      }
    }
    // 经办主体
    .handle_info {
      padding: .06rem 0;
      .each_handle {
        margin: .04rem 0;
      }
      .title {
        font-weight: bold;
      }
      .content {
        color: #454545;
      }
    }
    // 创建时间
    .time_info {
      @extend .handle_info;
      .each_time {
        @extend .each_handle;
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
  }
</style>
