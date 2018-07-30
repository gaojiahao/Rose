<template>
  <div class="inPage">
    <div class="msg_list">
      <div class="each_msg vux-1px-b">
        <div class="app_img">
          <img :src='defaultImg' alt="appImg">
        </div>
        <div class="msg_info">
          <div class="app_name">销售订单</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
      defaultImg: require('assets/sales-stock.png')
    }
  }
}
</script>

<style lang='scss' scoped>
.each_msg {
  display: flex;
  padding: .1rem;
  box-sizing: border-box;
  .app_img {
    width: .3rem;
    height: .3rem;
    img {
      width: 100%;
      border-radius: .06rem;
    }
  }
}
</style>
