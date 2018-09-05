<template>
  <div class="main_content">
    <span class="iconfont icon--"></span>
    <div class="warehouse-name m_size_name">{{warehouse.warehouseName}}</div>
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
      top: .02rem;
      left: -.01rem;
      font-size: .14rem;
      position: absolute;
    }
    &:last-of-type{
      padding-top: 0.06rem;
      .iconfont{
        top: .08rem;
        font-size: .15rem;
        font-weight: bold;
      }
    }
    

    // 仓库名称
    .warehouse-name {
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
