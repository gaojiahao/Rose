<template>
  <div class="warehouse-container">
    <header class="warehouse-header">
      <div class="warehouse_title vux-1px-l">仓库信息</div>
      <div class="warehouse_switch" v-if="warehouseList.length > 1">
        <div class="warehouse_switch_item" :class="{active: activeIndex === index}"
             v-for="(item, index) in warehouseList" @click="warehouseChange(item,index)">
          {{item.warehouseAction}}
        </div>
      </div>
    </header>
    <div class="warehouse-main" v-for="(item, index) in warehouseList" v-show="activeIndex === index">
      <img class="warehouse_img" :src="item.warehousePic" alt="">
      <div class="warehouse_info">
        <div class="warehouse_name">{{item.warehouseName}}</div>
        <div class="warehouse_info_item">
          <span class="warehouse_item_title">仓库类型:</span>
          <span class="warehouse_item_value">{{item.warehouseType}}</span>
        </div>
        <div class="warehouse_info_item">
          <span class="warehouse_item_title">仓库地址:</span>
          <span class="warehouse_item_value">{{item.address}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "WarehouseContent",
    props: {
      // 入库
      warehouse: {
        type: Object,
        default() {
          return {}
        }
      },
      // 出库
      warehouseOut: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        activeIndex: 0,
      }
    },
    computed: {
      noAddress() {
        let {warehouseProvince = '', warehouseCity = '', warehouseDistrict = '', warehouseAddress = ''} = this.warehouse;
        return !warehouseProvince && !warehouseCity && !warehouseDistrict && !warehouseAddress;
      },
      warehouseList() {
        let tmp = [];
        let warehouseIn = JSON.parse(JSON.stringify(this.warehouse));
        let warehouseOut = JSON.parse(JSON.stringify(this.warehouseOut));
        Object.values(warehouseIn).length ? tmp.push(warehouseIn) : '';
        Object.values(warehouseOut).length ? tmp.push(warehouseOut) : '';
        warehouseIn.type = 'in';
        warehouseOut.type = 'out';
        tmp.forEach(item => {
          let {warehouseProvince = '', warehouseCity = '', warehouseDistrict = '', warehouseAddress = ''} = item;
          item.warehousePic = require(`assets/iconfont/warehouse_${item.type}.png`);
          item.address = !warehouseProvince && !warehouseCity && !warehouseDistrict && !warehouseAddress
            ? '暂无'
            : `${warehouseProvince}${warehouseCity}${warehouseDistrict}${warehouseAddress}`
        });
        return tmp
      },
    },
    methods: {
      handleData(item){

      },
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
        margin-top: .1rem;
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
