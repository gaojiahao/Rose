<template>
  <div class="main_content">
    <span v-if="warehouse.warehouseIcon" class="iconfont" :class="warehouse.warehouseIcon" ></span>
    <span v-else class="iconfont icon--" ></span>
    
    <div class="warehouse_name m_size_name">
      {{warehouse.WAREHOUSE_NAME}}
    </div>
    <div class="other_info s_size_name">
      <span class="title">仓库编码：</span>
      <span class="content">{{warehouse.CONTAINER_CODE || '暂无'}}</span>
    </div>
    <div class="other_info s_size_name">
      <span class="title">仓库类型：</span>
      <span class="content">{{warehouse.WAREHOUSE_TYPE || '暂无'}}</span>
    </div>
    <div class="other_info s_size_name">
      <span class="title">所属省仓：</span>
      <span class="content">{{warehouse.PROVINCE_OR_MUNICIPALITY_NAME || '暂无'}}</span>
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
    padding: .06rem .1rem .06rem .2rem;
    background-color: #fff;
    .iconfont {
      top: .1rem;
      left: -.01rem;
      font-size: .14rem;
      position: absolute;
      font-weight: bold;
    }
    .icon-- {
      left: .05rem;
      display: inline-block;
      width: .14rem;
      height: .2rem;
      background: url(./../../assets/warehouse.png) no-repeat center;
    }
    &:last-of-type{
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
      
    }
    .m_size_name {
      font-size: .18rem;
    }
    .s_size_name {
      font-size: .14rem;
    }
  }
</style>
