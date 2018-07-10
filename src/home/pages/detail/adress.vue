<template>
  <div class="pages">
    <div class="ads_part">
      <div class="client_ads mg_auto vux-1px-b" v-for="(item, index) in 4" :key="index">
        <div class="user_info">
          <span class="user_name">刘治增</span>
          <span class="user_tel">15399909500</span>
        </div>
        <div class="cp_info">
          <p class="cp_name">深圳市瑞福登信息技术服务有限公司</p>
          <p class="cp_ads">广东省 深圳市 福田区 中康路120附近 卓越城2期 TOWERB 1706</p>
        </div>
        <span class="iconfont icon-bianji" @click="goEditAds"></span>
      </div>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">新增一个地址</div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{

    }
  },
  methods:{
    // 编辑地址
    goEditAds(){
      this.$router.push({ path:'/edit_ads'})
    }
  }
}
</script>

<style lang='scss' scoped>
// 居中
.mg_auto {
  width: 95%;
  margin: 10px auto;
  box-sizing: border-box;
}
// 下划线
.vux-1px-b:after {
  border-bottom: 1px solid #e8e8e8;
}
.ads_part {
  height: 90%;
  overflow: auto;
}
// 地址
.client_ads {
  position: relative;
  padding: .06rem .4rem .06rem .08rem;
  // 编辑
  .icon-bianji {
    right: 0;
    top: 50%;
    width: .35rem;
    display: block;
    font-size: .24rem;
    text-align: center;    
    position: absolute;
    transform: translate(0, -50%);
  }  
  // 用户信息
  .user_info {
    // color: #111;
    color: #4F90F9;
    font-size: .14rem;
    font-weight: 500;
    // 用户姓名
    .user_name {
      margin-right: .08rem;
    }
    // 用户电话
    .user_tel {
      font-family: sans-serif, -apple-system-font;
    }
  }
  // 公司信息
  .cp_info {
    font-size: .14rem;
    .cp_name {
      color: #111;
      // color: #4F90F9;
      font-weight: 500;
      
    }
    .cp_ads {
      font-weight: 200;
      color: #757575;
    }
  }
  .edit_part {
    top: 0;
    right: 0;
    width: .3rem;
    height: 100%;
    position: absolute;
    background: #4F90F9;
  }
}
// 确定
.btn {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 10%;
  position: fixed;
  background: #fff;
  .cfm_btn {
    top: 50%;
    left: 50%;
    width: 2.8rem;
    color: #fff;
    height: .44rem;
    line-height: .44rem;
    position: absolute;
    text-align: center;
    background: #5077aa;
    border-radius: .4rem;
    transform: translate(-50%, -50%);
    box-shadow: 0 2px 12px #5077aa;
  }
}
// 上划线
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}

</style>
