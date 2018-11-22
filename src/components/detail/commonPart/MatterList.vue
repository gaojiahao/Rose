<template>
  <div class="materiel_ct_list">
    <div class="title">
      <span class="iconfont icon-Shape"></span>物料列表
    </div>
    <div class="mater_list" v-if="matterList.length">
      <matter-item :item="item" v-for="(item, index) in matterList" :key='index'>
        <!-- 物料详情 -->
        <template slot="other" slot-scope="{item}">
          <slot name="matterOther" :item="item"></slot>
        </template>
      </matter-item>
    </div>
    <div class="mater_list" v-if="Object.keys(orderList).length">
       <div class="each_mater"
              v-for="(oItem, key) in orderList" :key='key'>
          <div class="order_code">
            <span class="order_title">所属订单</span>
            <span class="order_num">{{key}}</span>
          </div>
          <div class="order_matter">
            <matter-item :item="item" v-for="(item, index) in oItem" :key='index'>
              <!-- 物料详情 -->
              <template slot="other" slot-scope="{item}" v-if="$scopedSlots.matterOther">
                <slot name="matterOther" :item="item" ></slot>
              </template>
            </matter-item>
          </div>
       </div>
    </div>
    <!-- 金额明细 -->
    <price-total :amt="noTaxAmount" :tax-amt="taxAmount" :count="count" v-if="count"></price-total>
  </div>
</template>

<script>
// vux组件引入
import { numberComma } from 'vux'
// 方法引入
import { toFixed } from '@/plugins/calc'
// 内部组件引入
import FormCell from 'components/detail/commonPart/FormCell'
import MatterItem from 'components/detail/commonPart/MatterItem'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
export default {
  name: 'MatterList',
  props: {
    matterList: {
      type: Array,
      default(){
        return []
      }
    },
    orderList: {
      type: Object,
      default(){
        return{}
      }
    },
    // 金额（不含税）
    noTaxAmount: {
      type: Number,
      default: 0
    },
    // 税金
    taxAmount: {
      type: Number,
      default: 0
    },
    // 合计
    count: {
      type: Number,
      default: 0
    },
  },
  components: {
    FormCell,  
    PriceTotal,
    MatterItem
  },
  filters: {
    toFixed,
    numberComma
  }
}
</script>
<style scoped lang="scss">
.materiel_ct_list {
  position: relative;
  background: #FFF;
  padding: .06rem .08rem;
  .title {
    color: #111;
    font-weight: bold;
    font-size: .16rem;
    .icon-Shape {
      font-size: .14rem;
      font-weight: normal;
    }
  }
  .each_mater{
    padding: .04rem 0 0;
    position: relative;
    box-sizing: border-box;
  }
  .order_code {
      display: flex;
      color: #fff;
      font-size: .12rem;
      font-weight: bold;
      > span {
        display: inline-block;
        padding: 0 .04rem;
      }
      .order_title {
        background: #1160aa;
      }
      // 订单号
      .order_num {
        background: #9bb4da;
        border-top-right-radius: .08rem;
      }
    }
}

</style>
