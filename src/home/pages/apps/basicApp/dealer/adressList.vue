<template> 
  <div class="pages" :class="{'no-add': !action.add}">
    <div class="content">
      <slot name="nav"></slot>
      <!-- 顶部区域 -->
      <div class="app_top">
        <searchIcon @search='searchList' :placeHolder='placeHolder'></searchIcon>
        <tab :line-width='2' default-color='#333' active-color='#3296FA'>
          <tab-item v-for="(item, index) in dealerClassfiy" :key="index" :selected="index === activeIndex"
                    @on-item-click="tabClick(item, index)">{{item.title}}
          </tab-item>
        </tab>
      </div>
      <!-- 主要内容区域 -->
      <r-scroll class="app_main" :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !dealerList.length"
                @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
        <div class="basic-item-wrapper" :class="{visited: item.visited}" v-for="(item, index) in dealerList"
             :key="index" @click="goDetail(item, index)">
          <div class="basic-main">
            <div class="basic-header">
              <span class="basic_code vux-1px-l">往来编码：{{item.dealerCode}}</span>
              <span class="basic_status" :class="item.statusClass">{{item.dealerStatus}}</span>
            </div>
            <div class="basic-info-wrapper">
              <img class="basic-img" :src="item.dealerPic" alt="dealer-img" @error="getDefaultImg(item)">
              <div class="basic-detail">
                <div class="basic_name">{{item.dealerName}}</div>
                <div class="basic_detail_item">
                  <span class="basic_detail_title">地址:</span>
                  <span class="basic_detail_value">{{item.detailAddress}}</span>
                </div>
                <div class="basic_detail_item">
                  <span class="basic_detail_title">类型:</span>
                  <span>{{item.dealerLabelName}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="basic-bottom vux-1px-t">
            <div class="basic-bottom-wrapper">
              <div class="basic_bottom_item basic_handler">
                <i class="icon icon-handler"></i>
                <span>创建人：{{item.creatorName}}</span>
              </div>
              <div class="basic_bottom_item basic_mod_time">
                <i class="icon icon-mod-time"></i>
                <span>创建时间：{{item.crtTime | dateFormat('YYYY-MM-DD HH:mm')}}</span>
              </div>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEditAds"></add-btn>
    <router-view></router-view>
  </div>
  
</template>

<script>
  import {Tab, Icon, TabItem, dateFormat} from 'vux'
  import dealerService from 'service/dealerService'
  import {getAppDetail} from 'service/app-basic/appSettingService'
  import searchIcon from 'components/search/search'
  import RScroll from 'plugins/scroll/RScroll'
  import addBtn from 'components/list/commonPart/addBtn'

  export default {
    data() {
      return {
        page: 1,
        limit: 20,
        tabItem: '全部',  // 选中的tab
        activeIndex: 0,
        placeHolder: '名称/编码',
        listId: 'c0375170-d537-4f23-8ed0-a79cf75f5b04',
        uniqueId: "7f01c808-d338-4711-8c99-319337078cc1",
        total: null,
        hasNext: true,
        clickVisited: false, // 判断是否点击过其它列表项
        scrollOptions: {
          click: true,
          pullDownRefresh: true,
          pullUpLoad: true,
        },
        id: '',
        action: {}, // 表单允许的操作
        srhInpTx: '',
        dealerList: [],
        dealerClassfiy: [],
      }
    },
    components: {
      Tab, Icon, TabItem, RScroll, searchIcon, addBtn
    },
    methods: {
      // 重置列表条件
      resetCondition() {
        this.dealerList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.resetPullDown();
      },
      tabClick(item, index) {
        this.tabItem = item.title;
        this.activeIndex = index;
        this.uniqueId = item.uniqueId;
        this.resetCondition();
        this.$refs.bScroll.scrollTo(0, 0);
        this.getDealer()
      },
      //搜索
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.resetCondition();
        this.getDealer()
      },
      // 页面跳转
      goNextPage(item, index, path) {
        if (this.clickVisited) {
          return
        }
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.dealerList, index, {...item});
        setTimeout(() => {
          this.clickVisited = false;
          let query = {
            transCode: item.transCode
          }
          //新增往来，根据tab默认选中往来类型
          if (!item.transCode && path === '/adress/edit_ads' && this.tabItem !== '全部') {
            query.dealerType = this.tabItem;
          }
          this.$router.push({ path, query });
        }, 200);
      },
      // 编辑地址
      goEditAds(item, index) {
        this.goNextPage(item, index, '/adress/edit_ads');
      },
      // 跳转详情页
      goDetail(item, index) {
        this.goNextPage(item, index, '/adress/adressDetail');
      },
      //获取往来列表
      getDealer(noReset = false) {
        let filter;
        if (this.srhInpTx !== '') {
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
        let data = {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit
        }
        if (filter) {
          data.filter = JSON.stringify(filter);
        }
        return (async () => {
          await dealerService.getId(this.uniqueId).then(data => {
            if (data.length > 0) {
              this.id = data[0].id;
            }
          }).catch(e => {
            this.$vux.alert.show({
              content: e.message,
            })
          })
          await dealerService.getDealerList(this.id, data).then(({dataCount = 0, tableContent = []}) => {
            //判断最近有无新增数据
            let text = '';
            if (noReset && this.activeIndex === 0) {
              if (this.total) {
                text = dataCount - this.total === 0 ? '暂无新数据' : `新增${dataCount - this.total}条数据`
                this.$vux.toast.show({
                  text: text,
                  position: 'top',
                  width: '50%',
                  type: "text",
                  time: 700
                })
              }
            }
            tableContent.forEach(item => {
              let {province = '', city = '', county = '', address = ''} = item;
              this.setStatus(item);
              item.dealerPic = item.dealerPic
                ? `/H_roleplay-si/ds/download?url=${item.dealerPic}&width=400&height=400`
                : this.getDefaultImg();
              item.detailAddress = !province && !city && !county && !address ? '暂无' : `${province}${city}${county}${address}`;
            });
            //将总数据缓存
            if (this.activeIndex === 0 && this.page === 1) {
              sessionStorage.setItem("DL", dataCount);
            }
            this.dealerList = this.page === 1 ? tableContent : this.dealerList.concat(tableContent);
            this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
            if (!noReset) {
              this.$nextTick(() => {
                this.resetScroll();
              })
            }
          }).catch(e => {
            this.resetScroll();
          })
        })()
      },
      //往来分类
      getClassfiy() {
        dealerService.getDealerClassfiy(this.page).then(data => {
          data.map(item => {
            if (item.title === '往来对象') {
              item.title = '全部';
            }
          })
          this.dealerClassfiy = data;
        }).catch(e => {
          this.$vux.alert.show({
            content: e.message,
          })
        })
      },
      // 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.$refs.bScroll.finishPullDown();
        this.$refs.bScroll.finishPullUp();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getDealer();
      },
      // 下拉刷新
      onPullingDown(refresh = true) {
        this.page = 1;
        if (refresh) {
          this.getData(true);
          return;
        }
        this.getData();
      },
      //获取上次存储的列表总数量
      getSession() {
        return new Promise(resolve => {
          this.total = sessionStorage.getItem("DL");
          resolve()
        })
      },
      async getData(noReset) {
        await this.getSession();
        if (noReset) {
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
      // 修改是否访问的状态
      changeVisitedStatus() {
        setTimeout(() => {
          let tmp = [...this.dealerList];
          tmp.forEach(item => {
            item.visited = false;
          });
          this.dealerList = tmp;
        }, 200)
      },
      // 获取应用详情
      getAppDetail() {
        return getAppDetail(this.listId).then(([data = {}]) => {
          let {action} = data;
          this.action = action;
        })
      },
      // 设置状态的class
      setStatus(item) {
        switch (item.dealerStatus) {
          case '使用中':
            item.statusClass = 'duty_done_c';
            break;
          default:
            item.statusClass = 'duty_fall_c';
        }
      },
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/default/dealer.png');
        if (item) {
          item.dealerPic = url;
        }
        return url
      },
    },
    filters: {
      dateFormat,
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
              if (from.query.transCode) {
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
    created() {
      this.getAppDetail();
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

  /* 没有新增 */
  .no-add {
    .content {
      height: 100%;
    }
  }

  .childPage {
    position: fixed;
    width: 100%;
    height: 100%;
    bottom: 0;
    z-index: 100;
    background: #fff;
  }

  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }

  .content {
    height: calc(100% - .78rem);
    overflow: auto;
  }

  .app_top {
    width: 100%;
  }

  .app_main {
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    height: calc(100% - .94rem);
  }

  .basic-item-wrapper {
    margin: .1rem;
    width: calc(100% - .2rem);
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    transition: background-color 200ms linear;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
    &.visited {
      background-color: $list_visited;
    }
    .basic-main {
      padding: .15rem .15rem 0;
    }
    .basic-header {
      display: flex;
      justify-content: space-between;
      .basic_code {
        position: relative;
        left: -.15rem;
        padding-left: .14rem;
        line-height: .12rem;
        font-size: .12rem;
        &:before {
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .basic_status {
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .duty_done_c {
      color: #333;
    }
    .duty_fall_c {
      color: #999;
    }

    .basic-info-wrapper {
      display: flex;
      margin-top: .16rem;
      .basic-img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .basic-detail {
        flex: 1;
        margin-left: .12rem;
      }
      .basic_name {
        line-height: .14rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .basic_detail_item {
        display: flex;
        margin-top: .12rem;
        line-height: .16rem;
        font-size: .12rem;
        & + .basic_detail_item {
          margin-top: .08rem;
        }
      }
      .basic_detail_title {
        margin-right: .06rem;
        color: #999;
      }
      .basic_detail_value {
        flex: 1;
      }
    }

    .basic-bottom {
      margin-top: .15rem;
      padding: .15rem .1rem;
      line-height: .14rem;
      font-size: .12rem;
      &:before {
        border-color: #e8e8e8;
        color: #e8e8e8;
      }
      .basic-bottom-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: .07rem .1rem;
        background-color: #f7f7f7;
        border-radius: .2rem;
        white-space: nowrap;
      }
      .basic_bottom_item {
        display: flex;
        align-items: center;
        color: #999;
      }
      .basic_handler {
        margin-right: .15rem;
      }
      .icon {
        display: inline-block;
        margin-right: .05rem;
        width: .16rem;
        height: .16rem;
      }
    }
  }

</style>
