<template>
  <div class="pages">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <div class="search_part">
          <input class="srh_inp" type="text" v-model="srhInpTx">
          <div class="pop_cancel" @click="searcDealer">搜索</div>
          <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
          <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="srhInpTx = ''"></icon>
        </div>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in dealerClassfiy" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.title}}
            </tab-item>
          </tab>
        </div>
      </div>
      <!-- 主要内容区域 -->
      <div class="app_main mescroll" id="mescroll">
        <div>
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
import {Tab, Icon, TabItem,AlertModule} from 'vux'
import { resolve } from 'url';
import { rejects } from 'assert';
let isBack = false,
    path = '',
    query = {};
export default {
  data(){
    return{
      dealerList : [],
      srhInpTx : '',
      activeIndex :0,
      dealerClassfiy :[],
      uniqueId:"7f01c808-d338-4711-8c99-319337078cc1",
      isBack : false,
      path: '',
      query :'',
      scroll : null,
      page : 1,
      id : ''
    }
  },
  components:{
    Tab, Icon, TabItem
  },
  methods:{
    tabClick(item,index){
      this.activeIndex = index;
      this.uniqueId  = item.uniqueId;
      this.scroll.resetUpScroll();
      // this.getDealer()
    },
    searcDealer(){
      this.page = 1;
      this.scroll.resetUpScroll();
      this.srhInpTx = '';
    },
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
      if(isBack){
        query.transCode = item.transCode;
        console.log(path,query);
        this.$router.push({
          path : path,
          query : query
        })
      }
      else{
        this.$router.push({ 
          path:'/adress/adressDetail',
          query:{
            transCode: item.transCode
          }
        })
      }      
    },
    //获取往来列表
    getDealer(){
      return new Promise((resolve,reject)=>{
        let filter;
        if(this.srhInpTx != ''){
          filter = [
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerCode',
              attendedOperation: 'or'
            },
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName'
            }
          ];
        }
        if(this.page === 1){
          this.dealerList = []
        }
        let data = {
          limit : 20,
          page : this.page,
          start : (this.page-1)*20
        }
        if(filter){
          data.filter = JSON.stringify(filter);
        }
        (async()=>{
          await dealerService.getId(this.uniqueId).then( data=>{
            if(data.length > 0){
              this.id = data[0].id;
            }
          }).catch(e=>{
            AlertModule.show({
              content: e.message,
            })
          })
          await dealerService.getDealerList(this.id,data).then( data=>{
            this.dealerList = this.page === 1? data.tableContent : this.dealerList.concat(data.tableContent);
            resolve(data.tableContent)
          }).catch(e=>{
            AlertModule.show({
              content: e.message,
            })
          })
        })()
      })        
    },
    //往来分类
    getClassfiy(){    
      dealerService.getDealerClassfiy(this.page).then(data=>{
        data.map(item=>{
          if(item.title ==='往来对象'){
            item.title = '全部';
          }
        })
        this.dealerClassfiy = data;
      }).catch(e=>{
        AlertModule.show({
          content: e.message,
        })
      })
    }
  },
  created(){
    this.getClassfiy()
  },
  mounted() {
    let Mescroll = this.Mescroll;
    this.$nextTick(() => {
      this.scroll = new Mescroll("mescroll", {
        up: {
          use: true,
          isBounce: false,
          auto: true,
          isBoth: false,
          callback: (page,mescroll)=>{
            this.page = page.num;
            this.getDealer().then(data => {
              let len = data.length;
              let hasNext = len >= page.size;
              mescroll.endSuccess(len, hasNext)
            })
          }
        },
        down: {
          use: false,
          isBoth: false,
          auto: false,
        }
      })
    })
  },
  beforeRouteEnter: (to, from, next) => {
      if (from.path !== '/home') {
        isBack = true;
        path = from.path;
        query = from.query;
      }
      next()
  }
}
</script>

<style lang='scss' scoped>
  .childPage {
    position: fixed;
    width: 100%;
    height: 100%;
    bottom:0;
    background: #fff;
  }
  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }
  .app_top {
    width: 100%;
    padding-top: .1rem;
    // 搜索
    .search_part {
      width: 100%;
      display: flex;
      height: .3rem;
      padding: 0 .08rem;
      line-height: .3rem;
      position: relative;
      box-sizing: border-box;
      // 搜索输入框
      .srh_inp {
        flex: 5;
        outline: none;
        border: none;
        color: #2D2D2D;
        font-size: .16rem;
        padding: 0 .3rem 0 .4rem;
        background: #F3F1F2;
        border-top-left-radius: .3rem;
        border-bottom-left-radius: .3rem;
      }
      // 取消 按钮
      .pop_cancel {
        flex: 1;
        color: #fff;
        font-size: .14rem;
        text-align: center;
        background: #3f72af;
        border-top-right-radius: .3rem;
        border-bottom-right-radius: .3rem;
      }
      // 搜索icon
      .serach_icon {
        top: 50%;
        left: .14rem;
        fill: #2D2D2D;
        position: absolute;
        transform: translate(0, -50%);
      }
      // 清除icon
      .clear_icon {
        top: 50%;
        right: 14%;
        width: .3rem;
        height: .3rem;
        z-index: 100;
        display: block;
        font-size: .12rem;
        line-height: .3rem;
        text-align: center;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    // 过滤
    .filter_part {
      margin-top: .04rem;
    }
  }
  .app_main {
    margin-top: .08rem;
    // height: calc(100% - .52rem - 44px);
    // overflow: auto;
    position:fixed;
    left:0;
    top:0.88rem;
    bottom:0.67rem;
    box-sizing: border-box;
    height:auto;
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
