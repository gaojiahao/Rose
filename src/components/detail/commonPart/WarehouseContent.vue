<template>
  <div class="main_content">
    <span v-if="warehouse.warehouseIcon" class="iconfont" :class="warehouse.warehouseIcon" ></span>
    <span v-else class="iconfont icon--" ></span>
    
    <div class="warehouse_name m_size_name">
      <span v-if="warehouse.warehouseAction">{{warehouse.warehouseAction}} - </span>{{warehouse.warehouseName}}
    </div>
    <div class="other_info s_size_name">
      <span class="title">类型：</span>
      <span class="content">{{warehouse.warehouseType || '暂无'}}</span>
    </div>
    <div class="other_info s_size_name">
      <span class="title">地址：</span>
      <span class="content" v-if="noAddress">暂无</span>
      <span class="content" v-else>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}{{warehouse.warehouseAddress}} </span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "WarehouseContent",
    props: {
      warehouse: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    data() {
      return {}
    },
    computed: {
      noAddress() {
        let {warehouseProvince = '', warehouseCity = '', warehouseDistrict = '', warehouseAddress = ''} = this.warehouse;
        return !warehouseProvince && !warehouseCity && !warehouseDistrict && !warehouseAddress;
      }
    },
  }
</script>

<style scoped lang="scss">
  .main_content {
    position: relative;
    padding: 0 .1rem .06rem .2rem;
    .iconfont {
      top: .03rem;
      left: -.01rem;
      font-size: .14rem;
      position: absolute;
      font-weight: bold;
    }
    &:last-of-type{
      padding-top: .06rem;
      .iconfont{
        top: .07rem;
        font-size: .15rem;
      }
      .icon-- {
        top: .08rem;
        font-size: .16rem;
      }
    }
    // 仓库名称
    .warehouse_name {
      font-weight: bold;
    }
    // 其他信息
    .other_info {
      color: #454545;
      font-weight: 200;
    }
    .m_size_name {
      font-size: .18rem;
    }
    .s_size_name {
      font-size: .14rem;
    }
  }
</style>
