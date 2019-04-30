<template>
  <!-- 基于config 动态渲染仓库相关信息 -->
  <div class="warehouse-container">
    <header class="warehouse-header">
      <div class="warehouse_title vux-1px-l">仓库信息</div>
      <div class="warehouse_switch" v-if="warehouseConfig.length > 1">
        <div class="warehouse_switch_item" :class="{active: activeIndex === index}"
             v-for="(item, index) in warehouseConfig" :key="index" @click="warehouseChange(item, index)">
          {{item.warehouseAction}}
        </div>
      </div>
    </header>
    <div class="warehouse-main">
      <div v-for="(item, index) in PicList" :key="index" v-show="activeIndex === index">
        <img class="warehouse_img" :src="item.warehousePic">
      </div>
      <div class="warehouse_info" v-if="warehouseConfig[activeIndex]">
        <div class="warehouse_info_item" v-for="(item, index) in warehouseConfig[activeIndex].config" :key="index" v-show="item.fieldLabel">
          <span class="warehouse_item_title">{{item.fieldLabel}}:</span>
          <span class="warehouse_item_value">{{warehouse[item.fieldCode]}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "WarehouseContent",
    props: {
      warehouseConfig: {
        type: Array,
        required: true
      },
      warehouse: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        activeIndex: 0,
        PicList: [
          { warehousePic: require('assets/iconfont/warehouse_out.png') },
          { warehousePic: require('assets/iconfont/warehouse_in.png') }
        ]
      }
    },
    methods: {
      warehouseChange(item, index) {
        this.activeIndex = index;
      }
    },
  }
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
