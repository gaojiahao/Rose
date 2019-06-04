<template>
  <div class="r-grid">
    <div class="r-row vux-1px-b" v-for="(row,rIndex) in value">
      <template
        v-for="(item, index) in cfg.columns"
        class="cell when-is-right"
        v-if="item.hidden == false"
      >
        <div class="item">
          <span :key="index">{{item.text}}：</span>
          <span>{{row[item.fieldCode]||'无'}}</span>
        </div>
      </template>
      <div @click="onShowMore(row,rIndex)" class="show-more">
        查看详情
        <i class="icon-more"></i>
      </div>
    </div>
    <grid-detail
      :show="showDetail"
      :item="detail"
      :columns="cfg.columns"
      v-model="showDetail"
      @on-confirm="doDetailEdit"
    />
  </div>
</template>
<script>
import Vue from "vue";
var component = {
  props: ["cfg", "value"],
  data() {
    return {
      showDetail: false,
      detail: {}
    };
  },
  methods: {
    doDetailEdit() {},
    checkAmt() {},
    onShowMore(row) {
      this.detail = row;
      this.showDetail = true;
    }
  }
};
export default Vue.component("RGrid", component);
</script>

<style lang="scss">
.r-row {
  margin: 0.05rem 0 0.05rem;
  line-height: 0.22rem;
  font-size: 0.12rem;
  span:nth-child(2n + 1) {
    color: #aaa;
  }
  span:nth-child(2n) {
    font-weight: 400;
    font-size: 0.13rem;
  }
  &.vux-1px-b:after {
    border-color: #e8e8e8;
  }
  &.vux-1px-b:last-child:after {
    border: none;
  }
  .show-more {
    text-align: right;
    color: blue;
  }
  .icon-more {
    display: inline-block;
    width: 0.2rem;
    height: 0.04rem;
  }
  .item {
    display: inline-flex;
    margin-right: 0.2rem;
  }
}
.r-row:first-child {
  margin-top: 0rem;
}
.r-row:last-child {
  margin-bottom: 0rem;
}
</style>