<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-11 16:20:08
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2019-12-30 17:30:00
 -->
<template>
  <div class="vux-1px-t btn" v-if="action.add">
    <div class="cfm_btn" @click="goEdit"> 
      <!-- <span class="icon-add"></span> -->
      <span>新建</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    action: {
      type: Object,
      default: {}
    },
    goEdit: {
      type: Function,
      required: true
    }
  }
}
</script>

<style lang='scss' scoped>
// 确定
.btn {
  left: 0;
  bottom: 0;
  width: 100%;
  height: .78rem;
  position: absolute;
  background: #fff;
  .icon-add {
    width: .18rem;
    height: .18rem;
    display: inline-block;
  }
  .cfm_btn {
    top: 50%;
    left: 50%;
    width: 90%;
    display: flex;
    height: .44rem;
    // @include font_color();
    color: #fff;
    position: absolute;
    border-radius: 4px;
    align-items: center;
    line-height: .44rem;
    justify-content: center;
    border: 1px solid;
    @include boder_color();
    @include bg_color();
    transform: translate(-50%, -50%);
    background: #fff;
    box-shadow: 0 2px 5px #fff;
    span + span {
      margin-left: .1rem;
    }
  }
}</style>
