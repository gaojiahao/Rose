<template>
  <!-- 经办信息 （订单、主体等） -->
  <div class="basic-container">
    <div class="basic-info-main">
      <header class="basic_header">
        <div class="basic_title vux-1px-l">经办：{{values.name}}</div>
      </header>
      <div class="basic_detail">
        <div class="basic_detail_wrapper">
          <span class="basic_detail_value">{{values.position}}</span>
          <span class="basic_detail_value">{{values.unit}}</span>
          <span class="basic_detail_value">{{values.entity}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
var component = {
  props: ["values"]
};
export default Vue.component("TransactorView", component);
</script>

<style lang="scss">
// 基本信息 （订单、经办主体等）
.basic-container {
  color: #333;
  margin: 0.1rem;
  border-radius: 0.04rem;
  background-color: #fff;
  width: calc(100% - 0.2rem);
  .basic-info-main {
    width: 100%;
    padding: 0.15rem 0.15rem;
    box-sizing: border-box;
    .basic_header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .basic_title {
      font-size: 16px;
      font-weight: 600;
      line-height: 0.16rem;
      &:before {
        left: -0.15rem;
        width: 0.08rem;
        border-left: 0.08rem solid #3296fa;
      }
    }
    .basic_process_status {
      color: #fb880b;
      font-size: 0.1rem;
      border: 1px solid;
      line-height: 0.12rem;
      border-radius: 0.04rem;
      padding: 0.04rem 0.06rem;
    }

    .basic_top {
      display: flex;
      padding: 0.05rem;
      font-size: 0.12rem;
      margin-top: 0.1rem;
      align-items: center;
      line-height: 0.12rem;
      background-color: #f7f7f7;
      justify-content: space-between;
    }
    .basic_code_title {
      color: #999;
    }
    .basic_detail {
      margin-top: 0.2rem;
      font-size: 0.14rem;
      line-height: 0.14rem;
    }
    .basic_detail_wrapper {
      display: flex;
      margin-top: 0.1rem;
      &.spec_part {
        margin-top: 0.2rem;
      }
    }
    .basic_detail_title {
      color: #999;
    }
    .basic_detail_value {
      flex: 1;
      margin-left: 0.05rem;
    }
  }
}
</style>
