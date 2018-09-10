<template>
  <div class="pages">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <search-icon @search='searchList'></search-icon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in warehouseClassfiy" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item}}
            </tab-item>
          </tab>
        </div>
      </div>
      <!-- 主要内容区域 -->
       <r-scroll class="app_main" :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !warehouseList.length"
                @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
         <div class="client_ads vux-1px-b" :class="{visited: item.visited}" v-for="(item, index) in warehouseList"
              :key="index" @click="goDetail(item, index)">
            <div class="user_info">
              <span class="user_name">{{item.warehouseCode}}</span>
              <span class="user_tel">{{item.warehouseType}}</span>
            </div>
            <div class="cp_info">
              <p class="cp_name">{{item.warehouseName}}</p>
            </div>
            <span class="iconfont icon-bianji" @click.stop="goEditAds(item, index)"></span>
          </div>
       </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">新增</div>
    </div>
    <router-view></router-view>
    <load-icon :show='Loadding'></load-icon>
  </div>

</template>

<script>
import { Tab,TabItem} from 'vux'
import { getList} from 'service/commonService'
import LoadIcon from 'components/Loading.vue'
import searchIcon from 'components/search'
import RScroll from 'components/RScroll'
export default {
  data(){
    return{
      warehouseList : [],
      srhInpTx : '',
      tabSelect:'全部',
      activeIndex :0,
      warehouseClassfiy :['全部','个人仓','客户仓','部门仓','加工商仓','渠道商仓'],
      page : 1,
      limit :20,
      id : 2129,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
      Loadding : true,
      total : null,
      clickVisited: false, // 判断是否点击过其它列表项
    }
  },
  components:{
    Tab,TabItem,LoadIcon,searchIcon,RScroll
  },
  methods:{
    // TODO 重置列表条件
    resetCondition() {
      this.warehouseList = [];
      this.page = 1;
      this.hasNext = true;
      this.$refs.bScroll.resetPullDown();
    },
    //tab切换
    tabClick(item,index){
      this.activeIndex = index;
      this.resetCondition();
      this.tabSelect='';
      //this.srhInpTx= '';
      this.tabSelect=item;
      this.$refs.bScroll.scrollTo(0, 0);
      this.getwarehouse()
    },
    //搜索
    searchList(value){
      this.srhInpTx = value;
      this.resetCondition();
      this.getwarehouse()
    },
    // TODO 页面跳转
    goNextPage(item, index, path) {
      if (this.clickVisited) {
        return
      }
      this.clickVisited = true;
      item.visited = true;
      this.$set(this.warehouseList, index, {...item});
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
      this.goNextPage(item, index, '/warehouse/edit_warehouse');
    },
    goDetail(item, index){
      this.goNextPage(item, index, '/warehouse/warehouseDetail');
    },
    //获取仓库列表
    getwarehouse(noReset = false){
        let filter=[];
        if(this.tabSelect != '全部'){
            filter=[{
                operator: 'eq',
                value: this.tabSelect,
                property: 'warehouseType',
            }];
            if(this.srhInpTx){
              filter[0].attendedOperation = 'and (';
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
                  property: 'warehouseCode',
                  attendedOperation: ')'
                  }
              ];
            }
        } else {
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
                  property: 'warehouseCode',
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
        return getList(this.id,data).then( ({dataCount = 0, tableContent = []}) => {
          // console.log(this.total);
          //判断最近有无新增数据
          let text = '';
          if(noReset && this.activeIndex ===0){
            if(this.total){
              text = dataCount - this.total === 0 ? '暂无新数据' : `新增${dataCount-this.total}条数据`;
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
            sessionStorage.setItem("CK",dataCount);
          }
          this.warehouseList = this.page === 1? tableContent : this.warehouseList.concat(tableContent);
          this.Loadding = false;
          this.hasNext = dataCount > (this.page-1)*this.limit + tableContent.length;
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e=>{
          this.resetScroll();
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
      this.getwarehouse();
    },
    // TODO 下拉刷新
   onPullingDown() {
      this.page = 1;
      this.getData(true)
    },
    //获取上次存储的列表总数量
    getSession(){
      return new Promise(resolve=>{
        this.total = sessionStorage.getItem("CK");
        resolve()
      })
    },
    async getData(noReset){
      await this.getSession();
      if(noReset){
        await this.getwarehouse(true).then(() => {
            this.$nextTick(() => {
              this.$refs.bScroll.finishPullDown().then(() => {
                this.$refs.bScroll.finishPullUp();
              });
            })
        });
        return
      }
      await this.getwarehouse();
    },
    // TODO 修改是否访问的状态
    changeVisitedStatus() {
      setTimeout(() => {
        let tmp = [...this.warehouseList];
        tmp.forEach(item => {
          item.visited = false;
        });
        this.warehouseList = tmp;
      }, 200)
    },
  },
  watch: {
    $route: {
      handler(to, from) {
        let {path = '', meta = {}} = to;
        if (path === '/warehouse') {
          this.changeVisitedStatus();
          // 判断是否重新请求页面
          if (meta.reload) {
            to.meta.reload = false;
            this.srhInpTx = '';
            //this.activeIndex = 0;
            this.resetCondition();
            this.onPullingDown();
          }
        }
      },
    }
  },
  created(){
    this.getData(false)
  },

}
</script>

<style lang='scss' scoped>
  @import '~@/scss/color';

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
