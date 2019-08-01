<template>
  <div class="finance-list-item" :class="{visited: item.visited}">
    <!-- 订单编码, 总金额 -->
    <div class="order-top vux-1px-b">
      <div class="order_code">
        <span class="code vux-1px-l">{{item.transCode}}</span>
        <span class="status" :class="item.statusClass">{{item.biStatus}}</span>
      </div>
      <div class="order_code">
        <span class="">{{item.dealerName_dealerDebit}}</span>
      </div>
      <!-- <div class="order_amount" v-show="isHasCount">
        <p class="amount">总支付￥{{item.count | toFixed | numberComma(3)}}</p>
        <p class="num">共{{item.itemCount}}笔</p>
      </div> -->
    </div>
    <ul class="order-cost">
      <li class="each_cost" :class="{'vux-1px-b' : mIndex < item.detailItem.length-1}" v-for="(mItem, mIndex) in item.detailItem" :key="mIndex">
        <!-- <div class="cost_name">
          <slot name="costName" :mItem="mItem">
            <span class="name">{{mItem.dealerName_dealerDebit}}</span>
          </slot>  
        </div> -->
        <div class="cost_amount">
          <slot name="cost_info" :mItem="mItem">
            <div class="each_amount">
              <!-- <span class="costName">{{mItem.dealerName_dealerDebit}}</span> -->
              <span class="title">{{mItem.fundName_cashOutCode}}</span>
            </div>
            <div class="each_amount">
              <span class="money">￥{{mItem.tdAmount | numberComma}}</span>
              <span class="title">支付金额</span>
            </div>
          </slot>
        </div>
      </li>
    </ul>
    <div class="order-creator">
      <div class="creator">
        <span class="icon icon-handler"></span>
        <span>经办人：{{item.handlerName}}</span>
      </div>
      <div class="creator modTime">
        <span class="icon icon-mod-time"></span>
        <span>修改时间：{{item.modTime | dateFormat("YYYY-MM-DD HH:mm")}}</span>
      </div>
    </div>

  </div>
</template>
<script>
  import {numberComma, dateFormat} from 'vux'
  import {toFixed} from '@/plugins/calc'
  export default {
    name: "materListItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      isHasCount: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {

      }
    },
    filters: {
      dateFormat,
      numberComma,
      toFixed,
    },
    
  }
</script>
<style lang="scss" scoped>
  @import '~@/scss/color';
   /* vux组件样式 */
  .vux-1px-t:before,
  .vux-1px-b:after {
    border-color: #E8E8E8;
  }
  .finance-list-item {
    position: relative;
    overflow: hidden;
    margin: .1rem;
    padding: .15rem 0;
    box-sizing: border-box;
    font-size: .12rem;
    transition: background-color 200ms linear;
    box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.5);
    border-radius: .04rem;
    &.visited {
      background-color: $list_visited;
    }
    // 订单编码，报销或者借款合计
    .order-top {
      padding: 0 .15rem;
      line-height: .14rem;
      .order_code {
        color: #333;  
        display: flex;
        padding-bottom: .15rem;
        justify-content: space-between;
        .code {
          position: relative;
          left: -.15rem;
          padding-left: .14rem;
          line-height: .12rem;
          font-size: .12rem;
          &:before {
            width: .08rem;
            border-left: .08rem solid #3296FA;
          }
        }
        .duty_done_c {
          color: #3296FA;
        }
        .duty_fall_c {
          color: #999;
        }
      }
      .order_amount {
        text-align: center;
        padding: .1rem 0 .16rem 0 ;
        .amount {
          font-size: .2rem;
          color: #FA7138;
          font-weight: bold;
        }
        .num {
          color: #999;
          margin-top: .11rem;
        }
        
      }
    }
    // 每一条费用
    .order-cost {
      padding: 0 .18rem 0 .12rem;
      .each_cost {
        padding: .15rem 0;
        .cost_name {
          display: flex;
          align-items: center;
          margin-bottom: .11rem;
          .name {
            padding: .04rem .13rem;
            line-height: .14rem;
            position: relative;
            color: #fff;
            &:before {
              content: "";
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              background: #4978B0;
              border-radius: .02rem;
              z-index: -1;
              transform: skew(-10deg)
            }
          }
          .type {
            color: #696969;
            margin-left: .05rem;
          }
         
        }
        .cost_amount {
          display: flex;
          // justify-content: space-between;
          align-items: flex-end;
          .each_amount{
            text-align: center;
            flex: 1;
            &:first-child{
              text-align: left;
            }
            &:last-child{
              text-align: right
            }
            span {
              display: block;
            }
            .money {
              font-size: .16rem;
              line-height: .16rem;
              font-weight: bold;
              color: #333;
              margin-bottom: .11rem;
            }
            .title {
              color: #999;
            }
            &.count {
              .money {
                font-size: .2rem;
                color: #FA7138;
                font-weight: bold;
                line-height: .2rem;

              }
            }
          }
        }
        
      }

    }
    // 订单创建人
    .order-creator {
      color: #999;
      height: .3rem;
      display: flex;
      margin: 0 .12rem;
      align-items: center;
      justify-content: space-around;
      background: #F7F7F7;
      border-radius: .21rem;
      box-sizing: border-box;
      .icon {
        width: .16rem;
        height: .16rem;
        margin-right: .05rem;
      }
      .creator {
        // margin-left: .1rem;
        display: flex;
        align-items: center;
      }
      .modTime {
        margin-left: .15rem;
      }

    }
  }
</style>


