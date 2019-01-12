<template>
  <div class="pages" :class="{'no-add': !action.add}">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <search-icon @search='searchList' :placeHolder='placeHolder'></search-icon>
        <tab :line-width='2' default-color='#333' active-color='#3296FA'>
          <tab-item v-for="(item, index) in warehouseClassfiy" :key="index" :selected="index === activeIndex"
                    @on-item-click="tabClick(item, index)">{{item.name}}
          </tab-item>
        </tab>
      </div>
      <!-- 主要内容区域 -->
      <r-scroll class="app_main" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !warehouseList.length"
                @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
        <div class="basic-item-wrapper" :class="{visited: item.visited}" v-for="(item, index) in warehouseList"
             :key="index" @click="goDetail(item, index)">
          <div class="basic-main">
            <div class="basic-header">
              <span class="basic_code vux-1px-l">仓库编码：{{item.warehouseCode}}</span>
              <span class="basic_status" :class="item.statusClass">{{item.warehouseStatus}}</span>
            </div>
            <div class="basic-info-wrapper">
              <img class="basic-img" :src="item.warehousePic" alt="warehouse-img" @error="getDefaultImg(item)">
              <div class="basic-detail">
                <div class="basic_name">{{item.warehouseName}}</div>
                <div class="basic_detail_item" v-if="item.detailAddress">
                  <span class="basic_detail_title">地址:</span>
                  <span class="basic_detail_value">{{item.detailAddress}}</span>
                </div>
                <div class="basic_detail_item">
                  <span class="basic_detail_title">类型:</span>
                  <span class="basic_detail_value">{{item.warehouseType}}</span>
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
  import {Tab, TabItem, dateFormat} from 'vux'
  import {getList, getDictByType} from 'service/commonService'
  import {getAppDetail} from 'service/appSettingService'
  import searchIcon from 'components/search'
  import RScroll from 'components/RScroll'
  import addBtn from 'components/list/commonPart/addBtn'

  export default {
    data() {
      return {
        listId: '64a41c48-4e8d-4709-bd01-5d60ad6bc625',
        warehouseList: [],
        srhInpTx: '',
        tabSelect: '全部',
        activeIndex: 0,
        warehouseClassfiy: [{name: '全部'}, {name: '个人仓'}, {name: '加工车间仓'}, {name: '一般部门仓'}, {name: '客户仓'}, {name: '加工商仓'}],
        placeHolder: '名称/编码',
        page: 1,
        limit: 20,
        id: 2129,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullDownRefresh: true,
          pullUpLoad: true,
        },
        total: null,
        clickVisited: false, // 判断是否点击过其它列表项
        action: {}, // 表单允许的操作
      }
    },
    components: {
      Tab, TabItem, searchIcon, RScroll, addBtn,
    },
    methods: {
      // TODO 重置列表条件
      resetCondition() {
        this.warehouseList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.resetPullDown();
      },
      //tab切换
      tabClick(item, index) {
        this.activeIndex = index;
        this.resetCondition();
        this.tabSelect = '';
        //this.srhInpTx= '';
        this.tabSelect = item.name;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getwarehouse()
      },
      //搜索
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
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
          let query = {
            transCode: item.transCode
          }
          //新增仓库，根据tab默认选中仓库类型
          if (!item.transCode && path === '/warehouse/edit_warehouse' && this.tabSelect !== '全部') {
            query.warehouseType = this.tabSelect;
          }
          this.$router.push({
            path,
            query
          });
        }, 200);
      },
      // 编辑地址
      goEditAds(item, index) {
        this.goNextPage(item, index, '/warehouse/edit_warehouse');
      },
      goDetail(item, index) {
        this.goNextPage(item, index, '/warehouse/warehouseDetail');
      },
      //获取仓库类型
      getwarehouseType() {
        return getDictByType('warehouseRelType').then(data => {
          this.warehouseClassfiy = [];
          this.warehouseClassfiy.push({name: '全部'});
          this.warehouseClassfiy = this.warehouseClassfiy.concat(data.tableContent);
        })
      },
      //获取仓库列表
      getwarehouse(noReset = false) {
        let filter = [];
        if (this.tabSelect !== '全部') {
          filter = [{
            operator: 'eq',
            value: this.tabSelect,
            property: 'warehouseType',
          }];
          if (this.srhInpTx) {
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
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit
        }
        if (filter) {
          data.filter = JSON.stringify(filter);
        }
        return getList(this.id, data).then(({dataCount = 0, tableContent = []}) => {
          // console.log(this.total);
          //判断最近有无新增数据
          let text = '';
          if (noReset && this.activeIndex === 0) {
            if (this.total) {
              text = dataCount - this.total === 0 ? '暂无新数据' : `新增${dataCount - this.total}条数据`;
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
            let {warehouseProvince = '', warehouseCity = '', warehouseDistrict = '', warehouseAddress = ''} = item;
            this.setStatus(item);
            item.warehousePic = item.warehousePic
              ? `/H_roleplay-si/ds/download?url=${item.warehousePic}&width=400&height=400`
              : this.getDefaultImg();
            item.detailAddress = !warehouseProvince && !warehouseCity && !warehouseDistrict && !warehouseAddress
              ? ''
              : `${warehouseProvince}${warehouseCity}${warehouseDistrict}${warehouseAddress}`;
          });
          //将总数据缓存
          if (this.activeIndex === 0 && this.page === 1) {
            sessionStorage.setItem("CK", dataCount);
          }
          this.warehouseList = this.page === 1 ? tableContent : this.warehouseList.concat(tableContent);
          this.$loading.hide();
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
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
      onPullingDown(refresh = true) {
        this.page = 1;
        if (refresh) {
          this.getData(true);
          return
        }
        this.getData();
      },
      //获取上次存储的列表总数量
      getSession() {
        return new Promise(resolve => {
          this.total = sessionStorage.getItem("CK");
          resolve()
        })
      },
      async getData(noReset) {
        await this.getSession();
        if (noReset) {
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
      // TODO 获取应用详情
      getAppDetail() {
        return getAppDetail(this.listId).then(([data = {}]) => {
          let {action} = data;
          this.action = action;
        })
      },
      // TODO 设置状态的class
      setStatus(item) {
        switch (item.warehouseStatus) {
          case '使用中':
            item.statusClass = 'duty_done_c';
            break;
          default:
            item.statusClass = 'duty_fall_c';
        }
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/default/warehouse.png');
        if (item) {
          item.warehousePic = url;
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
          if (path === '/warehouse') {
            this.changeVisitedStatus();
            // 判断是否重新请求页面
            if (meta.reload) {
              to.meta.reload = false;
              this.srhInpTx = '';
              this.activeIndex = 0;
              this.resetCondition();
              if (from.query.transCode) {
                this.onPullingDown(false);
                return
              }
              this.onPullingDown();
            }
          }
        },
      }
    },
    created() {
      this.$loading.show();
      this.getAppDetail();
      this.getwarehouseType();
      this.getData(false)
    },

  }
</script>

<style lang='scss' scoped>
  @import '~@/scss/color';

  /* 没有新增 */
  .no-add {
    .content {
      height: 100%;
    }
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
