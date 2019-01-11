<template>
  <div class="materiel_ct_list">
    <div class="mater_list" v-if="matterList.length">
      <matter-item :item="item" v-for="(item, index) in matterList" :key='index' @on-show-more="onShowMore">
        <!-- 物料详情 -->
        <template slot="other" slot-scope="{item}">
          <slot name="matterOther" :item="item"></slot>
        </template>
      </matter-item>
    </div>
    <div class="mater_list" v-if="Object.keys(orderList).length">
      <div class="each_mater" :class="{'vux-1px-t': oIndex}"
           v-for="(oItem, key, oIndex) in orderList" :key='key'>
        <div class="order_code">
          <slot name="orderTitle">
            <span class="order_title">所属订单：</span>
          </slot>
          <span class="order_num">{{key || '未查询到相关订单，请检查数据是否正确'}}</span>
        </div>
        <div class="order_matter">
          <matter-item :item="item" v-for="(item, index) in oItem" :key='index' @on-show-more="onShowMore">
            <!-- 物料详情 -->
            <template slot="other" slot-scope="{item}" v-if="$scopedSlots.matterOther">
              <slot name="matterOther" :item="item"></slot>
            </template>
          </matter-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {numberComma} from 'vux'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  // 内部组件引入
  import MatterItem from 'components/detail/commonPart/MatterItem'

  export default {
    name: 'MatterList',
    props: {
      matterList: {
        type: Array,
        default() {
          return []
        }
      },
      orderList: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    components: {
      MatterItem
    },
    methods: {
      onShowMore(item) {
        this.$emit('on-show-more', item);
      }
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
    margin: 0 .1rem;
    /*padding: 0 .15rem;*/
    width: calc(100% - .2rem);
    background-color: #fff;
    color: #333;
    box-sizing: border-box;
    .title {
      color: #111;
      font-weight: bold;
      font-size: .16rem;
      .icon-Shape {
        font-size: .14rem;
        font-weight: normal;
      }
    }
    .each_mater {
      /*padding: .15rem;*/
      position: relative;
      box-sizing: border-box;
    }
    .order_code {
      display: flex;
      position: relative;
      padding: .15rem .15rem 0;
      line-height: .16rem;
      color: #999;
      font-size: .12rem;
      > span {
        display: inline-block;
      }
      .order_title {
        position: relative;
        &:before {
          content: " ";
          position: absolute;
          left: -.15rem;
          top: 0;
          width: .08rem;
          bottom: 0;
          border-left: .08rem solid #3296FA;
          color: #3296FA;
          transform-origin: 0 0;
          transform: scaleX(0.5);
        }
      }
      // 订单号
      .order_num {
        color: #696969;
      }
    }
  }

</style>
