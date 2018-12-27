<template>
  <!-- 经办信息 （订单、主体等） -->
  <div class="basic_info">
    <!-- 订单编码栏 -->
    <div class="basic_top">
      <div class="serial_bar">
        <span class="trans_code">{{workFlowInfo.transCode}}</span>
        <span class="work_status" :class="workFlowInfo.dyClass">{{workFlowInfo.biStatus}}</span>
      </div>
      <div class="work_proStatus">
        <span class="status">流程状态：{{orderInfo.biProcessStatus || "无"}}</span>
      </div>
    </div>
    <!-- 经办信息 -->
    <div class="handler_info">
      <div class="info_title">
        <span class="title">经办信息</span>
      </div>
      <div class='info_content info_content_part'>
        <div class="each_handle" >
          <p class="each_info">
            <label>经办人：</label>
            <span>{{orderInfo.handlerName}}</span>
          </p>
          <p class="each_info">
            <label>修改时间：</label>
            <span>{{orderInfo.modTime | dateFormat('YYYY-MM-DD')}}</span>
          </p>
        </div>
        <div class="each_handle">
          <p class="each_info">
            <label>经办主体：</label>
            <span>{{orderInfo.handlerEntityName  || '无'}}</span>
          </p>
          <p class="each_info">
            <label>经办组织：</label>
            <span>{{orderInfo.handlerUnitName  || '无'}}</span>
          </p>
        </div>
        <div class="each_handle" v-if="showMore">
          <p class="each_info">
            <label>创建人：</label>
            <span>{{orderInfo.creatorName}}</span>
          </p>
          <p class="each_info">
            <label>经办职位：</label>
            <span>{{orderInfo.handlerRoleName || '无'}}</span>
          </p>
        </div>
      </div>
      <div class="check_more vux-1px" @click="showMore = true" v-show="!showMore">        
        查看更多<span class="icon-filter-down"></span>
      </div>
    </div>
  </div>
</template>

<script>
  import { dateFormat } from 'vux'
import { fail } from 'assert';
  export default {
    name: "BasicInfo",
    props: {
      workFlowInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      orderInfo: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data(){
      return {
        showMore: false,
      }
    },
    filters: {
      dateFormat
    }
  }
</script>

<style scoped lang="scss">
  // 基本信息 （订单、经办主体等）
  .vux-1px:before{
    border-color: #979797;
    border-radius: .34rem;
  }
  .basic_info {
    width: 100%;
    background: #fff;
    margin-bottom: .1rem;
    box-sizing: border-box;
    margin-bottom: .1rem;
    position: relative;
    z-index: -10;
    .basic_top {
      padding: .1rem 0 .03rem .25rem;
      color: #333;
      // 订单栏
      .serial_bar {
        display: flex;
        align-items: center;
        // 编码
        .trans_code{
          font-size: .14rem;
          color: #666;
        }
        // 表单状态
        .work_status {
          margin-left: .1rem;
          padding: .05rem .06rem;
          color: #3296FA;
          font-size: .1rem;
          text-align: center;
          line-height: .14rem;
          position: relative;
          &:before{
            content: " ";
            position: absolute;
            left: 0;
            top: 0;
            width: 200%;
            border: 1px solid #3296FA;
            color: #3296FA;
            height: 200%;
            transform-origin: left top;
            transform: scale(0.5);
            border-radius: .24rem .24rem .24rem 0;
          }
        }
        // 进行中
        .doing_work {
          color: #333;
          &:before{
            border-color: #333;
          }
        }
        // 已失效
        .invalid_work {
          border-color: #999;
          &:before{
            border-color: #999;
          }
        }
      }
      .work_proStatus {
        margin-top: .02rem;
        .status {
          position: relative;
          font-size: .16rem;
          line-height: .22rem;
          display: inline-block;
          &:before{
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: calc(100% + .1rem);
            height: .08rem;
            background: #F9D40A;
            z-index: -1;

          }
        }
      }
    }
    .handler_info {
      padding: .19rem .25rem .12rem;
      font-size: .14rem;
      .info_title{
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
      .info_content{
        margin-top: .13rem;
        .each_handle{
          display: flex;  
        }
        .each_info{
          line-height: .24rem;
          color: #333;
          flex: 1;
          label{
            color: #999;
          }
        }
      }

    }
    .check_more {
      width: 1.29rem;
      height: .34rem;
      margin: .25rem auto 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      .icon-filter-down{
        width: .11rem;
        height: .05rem;
        margin-left: .02rem;
      }
    }
    .vux-1px-b:after {
      border-color: #e8e8e8;
    }
  }
</style>
