<template>
  <div class="pages">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <div class="search_part">
          <input class="srh_inp" type="text" v-model="srhInpTx">
          <div class="pop_cancel" @click="searcwarehouse">搜索</div>
          <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
          <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="clear"></icon>
        </div>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in warehouseClassfiy" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item}}
            </tab-item>
          </tab>
        </div>
      </div>
      <!-- 主要内容区域 -->
      <div class="app_main" ref='addressMain'>
        <div class='address_wrapper'>
          <div class="client_ads vux-1px-b" v-for="(item, index) in warehouseList" :key="index" @click="goDetail(item)">
            <div class="user_info">
              <span class="user_name">{{item.warehouseCode}}</span>
              <span class="user_tel">{{item.warehouseName}}</span>
            </div>
            <div class="cp_info">
              <p class="cp_name">{{item.warehouseRelType}}</p>
              <!-- <p class='cp_label'>
                <span>{{item.warehouseLabelName}}</span>
              </p> -->
              <!-- <p class="cp_ads">{{item.warehouseProvince}}{{item.warehouseCity}}{{item.warehouseDistrict}}{{item.warehouseAddress}}</p> -->
              
            </div>
            <span class="iconfont icon-bianji" @click.stop="goEditAds(item)"></span>
          </div>
          <load-more tip="加载中" v-show="hasNext"></load-more>
          <load-more :show-loading="false" tip="暂无数据" v-show="!warehouseList.length && !hasNext"></load-more>
        </div>
        <spinner class="pullDownRefresh" type="android" :style="{top: pullDownTop + 'px'}"></spinner>
      </div>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">新增一个仓库</div>
    </div>
    <router-view></router-view>
    <load-icon :show='Loadding'></load-icon>
  </div>
  
</template>

<script>
import { Tab, Icon, TabItem,Spinner,AlertModule,LoadMore } from 'vux'
import warehouseService from 'service/warehouseService.js'
import LoadIcon from 'components/Loading.vue'
import BScroll from 'better-scroll'
const PULL_DOWN_REFRESH_HEIGHT = 30;
let isBack = false,
    path = '',
    query = {};
export default {
  data(){
    return{
      warehouseList : [],
      srhInpTx : '',
      tabSelect:'全部',
      activeIndex :0,
      warehouseClassfiy :['全部','个人仓','客户仓','部门仓','加工商仓','渠道商仓'],
      bScroll : null,
      page : 1,
      limit :20,
      id : 2129,
      hasNext: true,
      pullDownTop: -PULL_DOWN_REFRESH_HEIGHT,
      Loadding : true
    }
  },
  components:{
    Tab, Icon, TabItem,Spinner,LoadIcon,LoadMore
  },
  methods:{
    // TODO 重置列表条件
    resetCondition() {
      this.warehouseList = [];
      this.page = 1;
      this.hasNext = true;
      this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
    },
    tabClick(item,index){
      this.activeIndex = index;
      this.resetCondition();
      this.tabSelect='';
      this.srhInpTx= '';
      this.tabSelect=item;
      this.bScroll.scrollTo(0, 0);
      this.getwarehouse()
    },
    searcwarehouse(){
      this.resetCondition();
      this.getwarehouse()
    },
    clear(){
      this.srhInpTx = '';
      this.resetCondition();
      this.getwarehouse();

    },
    // 编辑地址
    goEditAds(item){
      this.$router.push({ 
        path:'/warehouse/edit_warehouse',
        query:{
          transCode: item.transCode
        }
      })      
    },
    goDetail(item){
      this.$router.push({ 
        path:'/warehouse/warehouseDetail',
        query:{
          transCode: item.transCode
        }
      })
          
    },
    //获取仓库列表
    getwarehouse(){
        let filter=[];
        if(this.tabSelect != '全部'){
            filter=[{
                operator: 'eq',
                value: this.tabSelect,
                property: 'warehouseRelType',
            }];
        }   
        if(this.srhInpTx != ''){
            filter = [
                ...filter,
                {
                operator: 'like',
                value: this.srhInpTx,
                property: 'warehouseName',
                attendedOperation: 'or'
                },
                {
                operator: 'like',
                value: this.srhInpTx,
                property: 'warehouseType'
                }
            ];
        }
        let data = {
          limit : this.limit,
          page : this.page,
          start : (this.page-1)*this.limit
        }
        if(filter){
          data.filter = JSON.stringify(filter);
        }
        warehouseService.getwarehouseList(this.id,data).then( data=>{
            this.Loadding = false;
            this.warehouseList = this.page === 1? data.tableContent : this.warehouseList.concat(data.tableContent);
            this.hasNext = data.dataCount > (this.page-1)*this.limit + data.tableContent.length;
            this.$nextTick(() => {
              this.bScroll.refresh();
              this.bScroll.finishPullDown();
              this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
              if (!this.hasNext) {
                return
              }
              this.bScroll.finishPullUp();
            })
          }).catch(e=>{
            this.bScroll.finishPullDown();
            this.pullDownTop = -PULL_DOWN_REFRESH_HEIGHT;
            AlertModule.show({
              content: e.message,
            })
          })  
    },
    //仓库分类
    // getClassfiy(){    
    //   warehouseService.getwarehouseClassfiy(this.page).then(data=>{
    //     data.map(item=>{
    //       if(item.title ==='仓库对象'){
    //         item.title = '全部';
    //       }
    //     })
    //     this.warehouseClassfiy = data;
    //   }).catch(e=>{
    //     AlertModule.show({
    //       content: e.message,
    //     })
    //   })
    // },
    // TODO 初始化better-scroll
    initScroll() {
      this.$nextTick(() => {
        this.bScroll = new BScroll(this.$refs.addressMain, {
          click: true,
          pullDownRefresh: {
            threshold: 50,
            stop: PULL_DOWN_REFRESH_HEIGHT
          },
          pullUpLoad: {
            threshold: 20
          },
        });
        // 绑定滚动加载事件
        this.bScroll.on('pullingUp', () => {
          if (!this.hasNext) {
            return
          }
          this.page++;
          this.getwarehouse();
        });
        // 绑定下拉刷新事件
        this.bScroll.on('pullingDown', () => {
          this.page = 1;
          this.getwarehouse();
        });
        // 下拉的时候展示下拉刷新的图标
        this.bScroll.on('scroll', ({x, y}) => {
          if (y > 0) {
            if (y > PULL_DOWN_REFRESH_HEIGHT) {
              this.pullDownTop = 0;
            } else {
              this.pullDownTop = y - PULL_DOWN_REFRESH_HEIGHT;
            }
          }
        })
      });
    },
  },
  watch: {
    $route: {
      handler(to, from) {
        // 判断是否重新请求页面
        console.log(to);
        if (to.meta.reload && to.path === '/warehouse') {
          to.meta.reload = false;
          this.srhInpTx = '';
          //this.activeIndex = 0;
          this.resetCondition();
          this.getwarehouse();
        }
      },
    }
  },
  created(){
    this.initScroll();
    //this.getClassfiy();
    this.getwarehouse();
  },
  // activated() {
  //   if (this.bScroll) {
  //     this.bScroll.refresh();
  //   }
  // },
  
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
  .content{
    height:90%;
    overflow: auto;
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
    position: relative;
    margin-top: .08rem;
    height: calc(100% - .52rem - 44px);
    overflow: hidden;
    box-sizing: border-box;
    .address_wrapper {
      min-height: calc(100% + 1px);
      overflow: hidden;
    }
    .pullDownRefresh {
      display: block;
      margin: 0 auto;
      height: 30px;
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      transition: top;
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
          font-weight: bold;
        }
        .cp_label{
          span{
            padding :0.02rem;
            background: #3f72af;
            color:#fff;
          }
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
