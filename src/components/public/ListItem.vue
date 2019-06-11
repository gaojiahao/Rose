<template>
  <div class="r-row">
    <template v-for="(value,index) in fieldsObj">
      <div class="item">
        <span :key="index">{{value}}：</span>
        <span>{{item[index]}}</span>
      </div>
    </template>
  </div>
</template>
<script>
import Vue from "vue";
export default Vue.component("ListItem", {
  props: ["fieldsObj", "item"]
});
</script>
<style lang="scss">
.r-row {
  color: #333;
  overflow: hidden;
  font-size: 0.12rem;
  background: #fff;
  position: relative;
  margin: 0.15rem 0.1rem;
  border-radius: 0.04rem;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 0.1rem 0 0.15rem 0.1rem;
  -webkit-transition: background-color 200ms linear;
  -o-transition: background-color 200ms linear;
  transition: background-color 200ms linear;
  -webkit-box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
  box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
  line-height: 0.22rem;
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

