<template>
  <div class="just-word-item" :class="{visited: item.visited}">
    <!-- 交易号等信息 -->
    <div class="duty_top">
      <p class="duty_code">
        {{item.transCode}}
        <span class="duty_crt_man" v-if="item.processStatus">{{item.processStatus}}</span>
      </p>
      <span class="duty_status" :class="item.statusClass">{{item.statusName}}</span>
      <i class="iconfont" :class="item.whichIcon"></i>
    </div>
    <!-- 往来信息 -->
    <div class="dealer_part" v-if="item.dealerName">
      <div class="dealer_name">
        <span class="iconfont icon-kehu1"></span>{{item.dealerName}}
      </div>
    </div>
    <!-- 主要信息区域 -->
    <div class="main_container" v-if="item.opportunityTitle">
      <div class="content_part">{{item.opportunityTitle}}</div>
      <div class="other_info_part">
        <p class="info_with_comment">内容简介：{{item.comment || '无'}}</p>
        <p class="info_with_comment">备注：{{item.biComment || '无'}}</p>
      </div>
    </div>
    <!-- 主要信息区域 （没有客户往来） -->
    <div class="main_container when-is-nodealer">
      <slot name="list-item" :item="item">
        <div class="status_part" v-if="item.projectType || item.projectType_project">
          <span class="iconfont icon-503020"></span>
          <span class="status_name">{{item.projectType || item.projectType_project}}</span>
        </div>
        <!-- 主要信息 -->
        <div class="content_part">{{item.projectName || item.projectName_project}}</div>
        <!-- 其他信息 -->        
        <template v-if="item.detailItem.length > 1">
          <div class="other_info_part" v-if="task.taskName" v-for="(task, index) in item.detailItem" :key='index'>
            <p class="info_with_comment">任务{{ 1 + index }}：{{task.taskName}}</p>
          </div>
        </template>
        <template v-else>
          <div class="other_info_part" v-if="item.approvalComment_project || item.taskComment">
            <p class="info_with_comment" v-if="item.taskName">任务名称：{{item.taskName}}</p>
            <p class="info_with_comment" v-if="item.approvalComment_project || item.taskComment">说明简介：{{item.approvalComment_project || item.taskComment}}</p>
            <p class="info_with_comment" v-if="item.projectManager_project">项目经理：{{item.projectManager_project}}</p>
            <p class="info_with_comment" v-if="item.budgetProfitMargin_project">利润率：{{item.budgetProfitMargin_project | percent}}</p>
            <p class="info_with_comment" >备注：{{item.biComment || '无'}}</p>
          </div>
        </template>
      </slot>
      
    </div>
    <!-- 金额合计 -->
    <div class="order_count">
      <div class="money_part" v-if="!noCount">
        <span class="num" v-if="item.itemCount > 1">共{{item.itemCount}}笔</span>
        <span class="num">{{conutTitle}}:</span>
        <span class="money">
          <span class="symbol">￥</span>{{total | toFixed | numberComma(3)}}
        </span>
      </div>
    </div>
    <!-- 流程状态和修改时间 -->
    <div class="other_part">
      <p class="duty_time">{{item.modTime | dateFormat}}<span style="fontSize:.1rem;">[修改时间]</span></p>
      <div class="handle_man">
        {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
      </div>
    </div>
  </div>
</template>

<script>
import { numberComma, dateFormat } from 'vux'
import { toFixed } from '@/plugins/calc'
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
export default {
  name: "justWordItem",
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    },
    // 不展示合计
    noCount: {
      type: Boolean,
      default: false
    },
    conutTitle: {
      type: String,
      default: '合计'
    }
  },
  data() {
    return {}
  },
  computed: {
    total() {
      let {count, totalAmount, budgetIncome_project} = this.item;
      if(budgetIncome_project) {
        return budgetIncome_project
      }
      else if (count != null) {
        return count
      } else if (totalAmount || totalAmount === 0) {
        return totalAmount
      } 
    }
  },
  filters: {
    // TODO 转为百分比
    percent(val) {
      if (!val && val !== 0) {
        return '无';
      }
      let budget = accMul(val,100);
      return `${budget}%`;
    },
    toFixed,
    dateFormat,
    numberComma
  },
  methods: {
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
  }
}
</script>

<style scoped lang="scss">
@import '~@/scss/color';
.division-line {
  margin: 0 .02rem;
}
.just-word-item {
  width: 95%;
  position: relative;
  overflow: hidden;
  border-radius: .08rem;
  margin: .1rem auto .2rem;
  box-shadow: 0 2px 10px #e8e8e8;
  transition: background-color 200ms linear;
  &.visited {
    background-color: $list_visited;
  }
  .duty_top {
    height: .24rem;
    font-size: .14rem;
    line-height: .24rem;
    padding: .04rem .1rem 0;
    .duty_code { //任务编码
      float: left;
      color: #7D7D7D;
      .duty_crt_man { // 任务创建者
        $bgcolor: #5c7893;
        color: #fff;
        padding: .02rem;
        font-weight: bold;
        position: relative;
        background: $bgcolor;
        font-size: 0.12rem;
        border-radius: .02rem;
        &:before {    //左尖角
          width: 0;
          height: 0;
          bottom: 0;
          content: "";
          left: -.02rem;
          position: absolute;
          border-right: .04rem solid $bgcolor;
          border-top: .04rem solid transparent;
        }
      }
    }
    .icon-yishengxiao {
      top: 0;
      right: 10px;
      font-size: .55rem;
      color: #53d397;
      position: absolute;
    }
    .duty_status {
      float: right;
      font-weight: bold;
    }
    .duty_done_c {
      color: #53d397;
      &:before {
        border-right: .04rem solid #53d397;
      }
    }
    .duty_doing_c {
      color: #5077aa;
      &:before {
        border-right: .04rem solid #5077aa;
      }
    }
    .duty_fall_c {
      color: #474a56;
      &:before {
        border-right: .04rem solid #474a56;
      }
    }
  }
  %detailItem {
    width: 100%;
    color: #757575;
    padding: 0 .1rem;
    font-size: .14rem;
    box-sizing: border-box;
    .iconfont {
      font-size: .14rem;
      margin-right: .02rem;
    }
  }
  // 往来
  .dealer_part {
    @extend %detailItem;
    .dealer_name {
      padding: .04rem 0 .02rem;
    }
  }
  .main_container {
    width: 100%;
    padding: 0 .1rem;
    margin-top: .04rem;
    box-sizing: border-box;
    &.when-is-nodealer {
      margin-top: unset;
      .content_part {
        margin-top: .04rem;
      }
    }
    .status_part {
      color: #757575;
      font-size: .12rem;
      line-height: .24rem;
      .iconfont {
        font-size: .1rem;
      }
    }
    .content_part {
      color: #111;
      font-weight: bold;
      line-height: .16rem;
      padding-left: .05rem;
      border-left: .04rem solid #5077aa;
      .simple {
        color: #757575;
        font-size: .12rem;
      }
    }
    .other_info_part {
      width: 100%;
      color: #757575;
      font-size: .14rem;
      margin-top: .04rem;
      padding-left: .1rem;
      box-sizing: border-box;
      .info_with_comment {
        width: 2.4rem;
        height: .28rem;
        overflow: hidden;
        position: relative;
        line-height: .28rem;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

    }
  }
  .other_part {
    width: 100%;
    display: flex;
    color: #7D7D7D;
    font-size: .14rem;
    align-items: center;
    padding: 0 .1rem .04rem;
    box-sizing: border-box;
    justify-content: space-between;
  }
  /* 合计栏 */
  .order_count {
    width: 100%;
    display: flex;
    font-size: .14rem;
    align-items: center;
    padding: .04rem .1rem;
    box-sizing: border-box;
    justify-content: flex-end;

    .num {
      color: #7D7D7D;
    }
    .money {
      font-size: .16rem;
      color: #c93d1b;
      font-weight: bold;
    }
  }

  .symbol {
    font-size: .1rem;
  }

  /* vux组件样式 */
  .vux-1px-t:before,
  .vux-1px-b:after {
    border-color: #E8E8E8;
  }
}
</style>
