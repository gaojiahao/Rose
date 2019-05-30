<template>
  <!-- 基于config 动态渲染相关信息 -->
  <div class="warehouse-container" v-if="cfg.items.length">
    <header class="warehouse-header">
      <div class="warehouse_title vux-1px-l" v-if="name === 'rk'">入库</div>
      <div class="warehouse_title vux-1px-l" v-else-if="name === 'ck'">出库</div>
      <div class="warehouse_title vux-1px-l" v-else-if="name === 'baseinfo'">经办</div>
      <div class="warehouse_title vux-1px-l" v-else-if="name === 'comment'">备注</div>
      <div class="warehouse_title vux-1px-l" v-else>{{ name }}</div>
    </header>
    <div class="warehouse-main">
      <div>
        <img class="warehouse_img" :src="PicList[0].warehousePic" v-if="name === 'ck' || name === 'inPut'">
        <img class="warehouse_img" :src="PicList[1].warehousePic" v-else-if="name === 'rk' || name === 'outPut'">
        <img class="warehouse_img" :src="PicList[2].warehousePic" v-else>
      </div>
      <div class="warehouse_info">
        <div class="warehouse_info_item" v-for="(item, index) in cfg.items[0].items" :key="index" v-show="item.fieldLabel && !item.hiddenInRun">
          <span class="warehouse_item_title">{{item.fieldLabel}}:</span>
          <span class="warehouse_item_value">{{values[item.fieldCode]}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
  var component = {
    name: "ContentView",
    props: {
      values: {
        type: Object,
        default() {
          return {}
        }
      },
      cfg: {
        type: Object,
        default() {
          return {}
        }
      },
      name: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        activeIndex: 0,
        PicList: [
          { warehousePic: require('assets/iconfont/warehouse_out.png') },
          { warehousePic: require('assets/iconfont/warehouse_in.png') },
          { warehousePic: require('assets/iconfont/commonContent.png') }
        ]
      }
    },
    watch: {
      values: {
        handler(val){
          // console.log('cfg',this.cfg);
          // console.log('values',this.values);
          // console.log('name',this.name)
        }
      }
    },
    methods: {
      warehouseChange(item, index) {
        this.activeIndex = index;
      }
    },
  }
  export default Vue.component('ContentView',component)
</script>

<style scoped lang="scss">
  @import '~@/scss/color.scss';

  .warehouse-container {
    margin: .1rem;
    padding: .15rem;
    width: calc(100% - .2rem);
    background-color: #fff;
    color: #333;
    box-sizing: border-box;
    .warehouse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .warehouse_title {
        line-height: .16rem;
        font-size: 16px;
        font-weight: 600;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }

      .warehouse_switch {
        display: flex;
        line-height: .14rem;
        border: 1px solid;
        border-radius: .04rem;
        color: $main_color;
        font-size: .1rem;
      }
      .warehouse_switch_item {
        padding: .03rem .12rem;
        &.active {
          background-color: $main_color;
          color: #fff;
        }
      }
    }

    .warehouse-main {
      display: flex;
      margin-top: .22rem;
      font-size: .14rem;
      .warehouse_img {
        width: .5rem;
        height: .5rem;
      }

      .warehouse_info {
        margin-left: .17rem;
      }
      .warehouse_name {
        line-height: .14rem;
        font-weight: 600;
      }
      .warehouse_info_item {
        display: flex;
        align-items: baseline;
        & + .warehouse_info_item {
          margin-top: .06rem;
        }
      }
      .warehouse_item_title {
        color: #999;
      }
      .warehouse_item_value {
        flex: 1;
        margin-left: .08rem;
        line-height: .2rem;
      }
    }
  }
</style>
