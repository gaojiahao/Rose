<template>
  <!-- 物料列表 -->
  <div class="materiel_ct_list">
    <!-- 传入的物料是数组 -->
    <div class="mater_list" v-if="matterList.length">
      <matter-item :item="item" v-for="(item, index) in matterList" :key='index' @on-show-more="onShowMore(item, index)"
                   v-show="showAllMatter || index < 3"></matter-item>
      <div class="matter-more-wrapper" v-show="matterList.length > 3 && !showAllMatter">
        <div class="matter-more" @click="clickMore('')">
          <span>查看更多商品</span>
          <i class="icon-filter-down"></i>
        </div>
      </div>
    </div>
    <pop-matter-detail :show="showMatterDetail" :item="matterDetail" :check-amt="checkAmt" v-model="showMatterDetail" @on-confirm="doDetailEdit"></pop-matter-detail>
  </div>
</template>

<script>
// vux组件引入
import {numberComma} from 'vux'
// 方法引入
import {toFixed} from '@/plugins/calc'
import Vue from 'vue';
import PopMatterDetail from 'components/Public/PopMatterDetail'
var component = {
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
    orderTitle: {
      type: String,
      default: ''
    },
    btnIsHide: {
        type: Boolean,
        default: false
    },
    checkAmt: {
        type: Function
    }
  },
  components: { PopMatterDetail },
  filters: { toFixed, numberComma },
  data() {
    return {
      orderListMap: {},
      showAllMatter: false,
      showMatterDetail:false,
      matterDetail:{},
      matterDetailIndex:0,
      matterDetailKey:0
    }
  },
  watch: {

  },
  methods: {
    onShowMore(item, index, key) {
      this.matterDetail = JSON.parse(JSON.stringify(item));
      this.showMatterDetail = true;
      this.matterDetailIndex = index;
      if (key) {
        this.matterDetailKey = key;
      }
      //this.$emit('on-show-more', item, index, key);
    },
    doDetailEdit:function(detail){
        this.$emit('on-detailEdit',detail,this.matterDetailIndex,this.matterDetailKey)
    },
    clickMore(key) {
      // 显示更多物料
      if (key) {
        this.orderListMap[key] = true;
      } else {
        this.showAllMatter = true;
      }
    },
  }
}
export default Vue.component('MatterListView',component)
</script>
<style scoped lang="scss">
  .materiel_ct_list {
    color: #333;
    margin: .1rem;
    position: relative;
    box-sizing: border-box;
    background-color: #fff;
    width: calc(100% - .2rem);
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
          top: 0;
          bottom: 0;
          content: " ";
          width: .08rem;
          left: -.15rem;
          color: #3296FA;
          position: absolute;
          transform-origin: 0 0;
          transform: scaleX(0.5);
          border-left: .08rem solid #3296FA;
        }
      }
      // 订单号
      .order_num {
        color: #696969;
      }
    }
    .matter-more-wrapper {
      display: flex;
      padding-bottom: .15rem;
      justify-content: center;
      .matter-more {
        display: flex;
        font-size: .14rem;
        align-items: center;
        line-height: .14rem;
        padding: .1rem .15rem;
        border-radius: .17rem;
        border: 1px solid rgba(151, 151, 151, 1);
      }
      .icon-filter-down {
        width: .11rem;
        height: .05rem;
        margin-left: .05rem;
        display: inline-block;
      }
    }
  }
</style>