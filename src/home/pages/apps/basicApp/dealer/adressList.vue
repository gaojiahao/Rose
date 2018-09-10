<template>
  <div class="pages">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in dealerClassfiy" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.title}}
            </tab-item>
          </tab>
        </div>
      </div>
      <!-- 主要内容区域 -->
      <r-scroll class="app_main" :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !dealerList.length"
                @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
        <div class="client_ads vux-1px-b" :class="{visited: item.visited}" v-for="(item, index) in dealerList"
             :key="index" @click="goDetail(item, index)">
            <div class="cp_info user_info">
              <p class="cp_name">{{item.dealerName}}</p>
              <span class="user_phone" v-if="item.dealerMobilePhone">{{item.dealerMobilePhone}}</span>
              <span class="user_tel" v-if="item.dealerPhone">{{item.dealerPhone}}</span>
              <p class="cp_ads">{{item.province}}{{item.city}}{{item.county}}{{item.address}}</p>
            </div>
            <span class="iconfont icon-bianji" @click.stop="goEditAds(item, index)"></span>
          </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">新增</div>
    </div>
    <router-view></router-view>
  </div>

</template>

<script>
import { Tab, Icon, TabItem,Spinner,LoadMore } from 'vux'
import dealerService from 'service/dealerService.js'
import searchIcon from 'components/search'
import RScroll from 'components/RScroll'
export default {
  data(){
    return{
      dealerList : [],
      srhInpTx : '',
      activeIndex :0,
      dealerClassfiy :[],
      uniqueId:"7f01c808-d338-4711-8c99-319337078cc1",
      page : 1,
      limit :20,
      id : '',
      hasNext: true,
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
      total : null,
      clickVisited: false, // 判断是否点击过其它列表项
    }
  },
  components:{
    Tab, Icon, TabItem,Spinner,LoadMore,RScroll,searchIcon
  },
  methods:{
    // TODO 重置列表条件
    resetCondition() {
      this.dealerList = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.resetPullDown();
    },
    tabClick(item,index){
      this.activeIndex = index;
      this.uniqueId  = item.uniqueId;
      this.resetCondition();
      this.$refs.bScroll.scrollTo(0, 0);
      this.getDealer()
    },
    //搜索
    searchList(value){
      this.srhInpTx = value;
      this.resetCondition();
      this.getDealer()
    },
    // TODO 页面跳转
    goNextPage(item, index, path) {
      if (this.clickVisited) {
        return
      }
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.dealerList, index, {...item});
      setTimeout(() => {
        this.clickVisited = false;
        this.$router.push({
          path,
          query: {
            transCode: item.transCode
          }
        });
      }, 200);
    },
    // 编辑地址
    goEditAds(item, index){
      this.goNextPage(item, index, '/adress/edit_ads');
    },
    // TODO 跳转详情页
    goDetail(item, index){
      this.goNextPage(item, index, '/adress/adressDetail');
    },
    //获取往来列表
    getDealer(noReset = false){
        let filter;
        if(this.srhInpTx !== ''){
          filter = [
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'creatorName',
              attendedOperation: 'or'
            },
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName'
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
        return (async()=>{
          await dealerService.getId(this.uniqueId).then( data=>{
            if(data.length > 0){
              this.id = data[0].id;
            }
          }).catch(e=>{
            this.$vux.alert.show({
              content: e.message,
            })
          })
          await dealerService.getDealerList(this.id,data).then( ({dataCount = 0, tableContent = []}) => {
            //console.log(this.total);
            //判断最近有无新增数据
            let text = '';
            if(noReset && this.activeIndex ===0){
              if(this.total){
                text = dataCount - this.total === 0 ? '暂无新数据' : `新增${dataCount-this.total}条数据`
                this.$vux.toast.show({
                  text: text,
                  position:'top',
                  width:'50%',
                  type:"text",
                  time : 700
                })
              }
            }
            //将总数据缓存
            if(this.activeIndex === 0 && this.page === 1){
              sessionStorage.setItem("DL",dataCount);
            }
            this.dealerList = this.page === 1? tableContent : this.dealerList.concat(tableContent);
            this.hasNext = dataCount > (this.page-1)*this.limit + tableContent.length;
            if (!noReset) {
              this.$nextTick(() => {
                this.resetScroll();
              })
            }
          }).catch(e=>{
            this.resetScroll();
          })
        })()
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
        this.$vux.alert.show({
          content: e.message,
        })
      })
    },
    // TODO 重置下拉刷新、上拉加载的状态
    resetScroll() {
      this.$refs.bScroll.finishPullDown();
      this.$refs.bScroll.finishPullUp();
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getDealer();
    },
    // TODO 下拉刷新
    onPullingDown(refresh = true) {
      this.page = 1;
      if(refresh){
        this.getData(true);
        return;
      }
      this.getData();
    },
    //获取上次存储的列表总数量
    getSession(){
      return new Promise(resolve=>{
        this.total = sessionStorage.getItem("DL");
        resolve()
      })
    },
    async getData(noReset){
      await this.getSession();
      if(noReset){
        await this.getDealer(true).then(() => {
            this.$nextTick(() => {
              this.$refs.bScroll.finishPullDown().then(() => {
                this.$refs.bScroll.finishPullUp();
              });
            })
        });
        return
      }
      await this.getDealer();
    },
    // TODO 修改是否访问的状态
    changeVisitedStatus() {
      setTimeout(() => {
        let tmp = [...this.dealerList];
        tmp.forEach(item => {
          item.visited = false;
        });
        this.dealerList = tmp;
      }, 200)
    },
  },
  watch: {
    $route: {
      handler(to, from) {
        let {path = '', meta = {}} = to;
        if (path === '/adress') {
          this.changeVisitedStatus();
          // 判断是否重新请求页面
          if (meta.reload) {
            to.meta.reload = false;
            this.uniqueId = "7f01c808-d338-4711-8c99-319337078cc1";
            this.srhInpTx = '';
            this.activeIndex = 0;
            this.resetCondition();
            //修改不提示新增数据
            if(from.query.transCode){
              this.onPullingDown(false);
              return
            }
            //新增提示
            this.onPullingDown()
          }
        }
      },
    }
  },
  created(){
    this.getClassfiy();
    this.getData(false);
  },

}
</script>

<style lang='scss' scoped>
  @import '~@/scss/color';

  .vux-1px-l:before,
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .childPage {
    position: fixed;
    width: 100%;
    height: 100%;
    bottom:0;
    z-index: 5;
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
      transition: background-color 200ms linear;
      &.visited {
        background-color: $list_visited;
      }
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
        // font-weight: bold;
        // 用户姓名
        .user_name {
          margin-right: .08rem;
        }
        .user_phone {
          margin-right: .04rem;
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
  position: absolute;
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
