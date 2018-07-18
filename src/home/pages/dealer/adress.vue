<template>
  <div class="pages">
    <div class="ads_part">
      <div class="client_ads mg_auto vux-1px-b" v-for="(item, index) in dealerList" :key="index" @click="goDetail(item)">
        <div class="user_info">
          <span class="user_name">{{item.creatorName}}</span>
          <span class="user_tel">{{item.dealerMobilePhone}}</span>
        </div>
        <div class="cp_info">
          <p class="cp_name">{{item.dealerName}}</p>
          <p class="cp_ads">{{item.province}}{{item.city}}{{item.county}}{{item.address}}</p>
        </div>
        <span class="iconfont icon-bianji" @click.stop="goEditAds(item)"></span>
      </div>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">新增一个地址</div>
    </div>
    <router-view></router-view>
  </div>
  
</template>

<script>
import dealerService from '../../service/dealerService.js'
export default {
  data(){
    return{
      dealerList : []

    }
  },
  methods:{
    // 编辑地址
    goEditAds(item){
      this.$router.push({ 
        path:'/adress/edit_ads',
        query:{
          transCode: item.transCode
        }
      })
      
    },
    goDetail(item){
      this.$router.push({ 
        path:'/adress/adressDetail',
        query:{
          transCode: item.transCode
        }
      })

    }

  },
  created(){
    (async()=>{
      let id = '';
      await dealerService.getId().then( data=>{
        console.log(data);
        if(data.length > 0){
          id = data[0].id;
        }
      })
      await dealerService.getDealerList(id).then( data=>{
        console.log(data);
        this.dealerList = data.tableContent;
      })
    })()
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
    color: #5077aa;
    font-size: .14rem;
    font-weight: bold;
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
    box-shadow: 0 2px 5px #5077aa;
  }
}
// 上划线
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}

</style>
