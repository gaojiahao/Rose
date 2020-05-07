<template>
  <!-- 经办信息 （订单、主体等） -->
  <div class="basic-container">
    <div class="basic-info-main">
      <header class="basic_header">
        <div class="basic_title vux-1px-l">状态：{{values.status}}</div>
        {{values.effectiveTime}}
      </header>
      <div class="form-base-info">
        <div class="form-base-info-item"><b>{{values.createBy}}</b> 在 {{values.createAt}} 创建</div>
        <div class="form-base-info-item"><b>{{values.modifyBy}}</b> 在 {{values.modifyAt}} 修改</div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
var component = {
  props: ["values"]
};
export default Vue.component("BaseinfoView", component);
</script>
<style lang="less">
.form-base-info {
  font-size: 0.1rem;
  padding-top: 0.15rem;
  color: #999;
}
.form-base-info-item {
  display: inline;
  white-space: nowrap;
}
</style>
