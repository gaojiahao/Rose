<template>
  <div class="finance-list-item" :class="{visited: item.visited}">
    <!-- 订单编码, 总金额 -->
    <div class="order-top vux-1px-b">
      <div class="order_code">
        <div class="code"> 
          <span class='icon-code'></span>
          <span>{{item.transCode}}</span>
        </div>
        <div class="status" :class="item.statusClass">{{item.biStatus}}</div>
      </div>
      <div class="order_amount">
        <p class="amount">总支付￥{{item.count | toFixed | numberComma(3)}}</p>
        <p class="num">共{{item.itemCount}}笔</p>
      </div>
    </div>
    <ul class="order-cost">
      <li class="each_cost" :class="{'vux-1px-b' : mIndex < item.detailItem.length-1}" v-for="(mItem, mIndex) in item.detailItem" :key="mIndex">
        <div class="cost_name">
          <span class="name">{{item.costName_expCode}}</span>
          <span class="type">科目：{{mItem.expSubject}}</span>
          <span class='type'>类型：{{mItem.costType_expCode}}</span>
        </div>
        <div class="cost_amount">
          <div class="each_amount">
            <span class="money">￥{{mItem.noTaxAmount | numberComma}}</span>
            <span class="title">抵扣后金额</span>
          </div>
          <div class="each_amount">
            <span class="money">￥{{mItem.taxAmount | numberComma}}</span>
            <span class="title">可抵扣税金</span>
          </div>
          <div class="each_amount">
            <span class="money">￥{{mItem.tdAmount | numberComma}}</span>
            <span class="title">申请金额</span>
          </div>
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
        <span>修改时间：{{item.modTime | dateFormat("YYYY-MM-DD")}}</span>
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
  .finance-list-item{
    position: relative;
    overflow: hidden;
    margin-top: .1rem;
    margin: .1rem .07rem 0 .13rem;
    padding: .15rem 0;
    box-sizing: border-box;
    font-size: .12rem;
    transition: background-color 200ms linear;
    box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.5);
    &.visited {
      background-color: $list_visited;
    }
    .order-top{
      padding: 0 .18rem 0 .12rem;
      line-height: .14rem;
      .order_code{
        display: flex;
        justify-content: space-between;
        color: #333;  
        .code{
          display: flex;
          align-items: center;
          font-size: .14rem;
          .icon-code{
            width: .14rem;
            height: .14rem;
            margin-right: .05rem;
          }
        }
        .duty_done_c {
          color: #3296FA;
        }
        .duty_fall_c {
          color: #999;
        }
      }
      .order_amount{
        text-align: center;
        padding: .2rem 0 .16rem 0 ;
        .amount{
          font-size: .24rem;
          color: #FA7138;
          font-weight: bold;
        }
        .num{
          color: #999;
          margin-top: .11rem;
        }
        
      }
    }
    .order-cost{
      padding: 0 .18rem 0 .12rem;
      .each_cost{
        padding: .15rem 0;
        .cost_name{
          display: flex;
          align-items: center;
          margin-bottom: .11rem;
          .name{
            width: .5rem;
            height: .22rem;
            background: url('/src/assets/iconfont/icon_jux.png');
            background-size: cover;
            text-align: center;
            color: #fff;
          }
          .type{
            color: #696969;
            margin-left: .05rem;
          }
         
        }
        .cost_amount{
          display: flex;
          justify-content: space-between;
          .each_amount{
            text-align: center;
            span{
              display: block;
            }
            .money{
              font-size: .16rem;
              line-height: .16rem;
              font-weight: bold;
              color: #333;
              margin-bottom: .11rem;
            }
            .title{
              color: #999;
            }
          }
        }
      }

    }
    .order-creator{
      height: .3rem;
      display: flex;
      align-items: center;
      margin: 0 .18rem 0 .12rem;
      box-sizing: border-box;
      background: #F7F7F7;
      border-radius: .21rem;
      color: #999;
      .icon{
        width: .16rem;
        height: .16rem;
        margin-right: .05rem;
      }
      .creator{
        margin-left: .1rem;
        display: flex;
        align-items: center;
      }
      .modTime{
        margin-left: .26rem;
      }

    }
  }
</style>


