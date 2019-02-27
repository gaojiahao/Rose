<template>
  <div class="pages" :class="{'no-add': !action.add}">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <r-search @search="searchMat" :placeHolder='placeHolder'></r-search>
        <tab :line-width='2' default-color='#333' active-color='#3296FA'>
          <tab-item v-for="(item, index) in matNature" :key="index" :selected="index === activeIndex"
                    @on-item-click="tabClick(item, index)">{{item.name}}
          </tab-item>
        </tab>
      </div>
      <!-- 主要内容区域 -->
      <r-scroll class="app_main" :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !matterList.length"
                @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
        <div class="matter-item-wrapper" :class="{visited: item.visited, 'vux-1px-b': index !== matterList.length - 1}"
             v-for="(item, index) in matterList" :key='index' @click="goDetail(item, index)">
          <img class="matter-img" :src="item.inventoryPic" alt="matter-img" @error="getDefaultImg(item)">
          <div class="matter-info-wrapper">
            <div class="matter_name">{{item.inventoryName}}</div>
            <div class="matter_info_main">
              <span class="matter_main_item">编码：{{item.inventoryCode}}</span>
              <span class="matter_main_item specification">规格：{{item.specification || '无'}}</span>
            </div>
            <div class="matter_detail">
              <div class="matter_info_item" v-for="field in item.fields">
                <span class="matter_info_title">{{field.alias}}:</span>
                <span>{{field.fieldValue || '无'}}</span>
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
  import {Tab, Icon, TabItem,} from 'vux'
  import {getList, getDictByType, getListViewById} from 'service/commonService'
  import {getMatList} from 'service/materService'
  import {getAppDetail} from 'service/app-basic/appSettingService'
  import RScroll from 'components/RScroll'
  import RSearch from 'components/search'
  import addBtn from 'components/list/commonPart/addBtn'

  const RFD_MATER_LIST = 'RFD_MATER_LIST';
  export default {
    components: {
      Tab, Icon, TabItem, RScroll, RSearch, addBtn,
    },
    data() {
      return {
        listId: '78a798f8-0f3a-4646-aa8b-d5bb1fada28c',
        srhInpTx: '',
        matNature: [
          {name: '全部'},
          {name: '成品'},
          {name: '半成品'},
          {name: '商品'},
          {name: '原件'},
          {name: '虚拟件'},
          {name: '商品库存'},
          {name: '客供原料'},
          {name: '服务'},
        ],
        placeHolder: '名称/编码',
        activeTab: '',
        activeIndex: 0,
        matterList: [],
        limit: 10,
        page: 1,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullDownRefresh: true,
          pullUpLoad: true,
        },
        total: null,
        clickVisited: false, // 判断是否点击过其它列表项
        action: {}, // 表单允许的操作
        listFields: [],
      }
    },
    methods: {
      goEditAds() {
        let queryObj = {
          path: '/materlist/addMater'
        };
        if (this.activeTab.length) {
          queryObj.query = {
            matterType: this.activeTab
          }
        }
        this.$router.push(queryObj);
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 跳转到详情页
      goDetail(item, index) {
        if (this.clickVisited) {
          return
        }
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.matterList, index, {...item});
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path: '/materlist/materDetail',
            query: {
              transCode: item.transCode
            }
          });
        }, 200);
      },
      // TODO 重置列表条件
      resetCondition() {
        this.matterList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.$refs.bScroll.resetPullDown();
      },
      // TODO tab点击
      tabClick(item, index) {
        // 全部传空
        this.activeTab = index ? item.name : '';
        this.activeIndex = index;
        this.resetCondition();
        this.getMatList();
      },
      // TODO 获取tab
      getDictByType() {
        return getDictByType('processing').then(({tableContent}) => {
          let [active = {}] = tableContent;
          this.activeTab = '';
          tableContent.unshift({name: '全部'});
          this.matNature = [...tableContent];
        });
      },
      // TODO 获取物料列表
      getMatList(noReset = false) {
        let filter = [
          {
            operator: 'eq',
            value: this.activeTab,
            property: 'processing',
          }
        ];
        // 选择全部时修改operator
        if (!this.activeIndex) {
          filter[0].operator = 'like';
        }
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              link: 'or',
              property_1: 'inventoryCode',
              operator_1: 'like',
              value_1: this.srhInpTx,
              property_2: 'inventoryName',
              operator_2: 'like',
              value_2: this.srhInpTx,
            }
          ];
        }
        return getMatList({
          limit: this.limit,
          page: this.page,
          filter: JSON.stringify(filter),
          listViewID: 2132,
          sort: JSON.stringify([
            {property: 'effectiveTime', direction: 'desc'},
            {property: 'inventoryName', direction: 'desc'}
          ]),
        }).then(({dataCount = 0, tableContent = []}) => {
          //判断最近有无新增数据
          //console.log(this.total);
          let text = '';
          let listFields = this.listFields;
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
          //将总数量缓存
          if (this.activeIndex === 0 && this.page === 1) {
            sessionStorage.setItem("WL", dataCount);
          }
          tableContent.forEach(item => {
            item.inventoryPic = item.inventoryPic
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400`
              : this.getDefaultImg();
            item.fields = listFields.map(field => {
              return {
                ...field,
                fieldValue: item[field.fieldCode],
              }
            });
          });
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.matterList = this.page === 1 ? tableContent : [...this.matterList, ...tableContent];
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
          this.resetScroll();
        });
      },
      // TODO 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.$refs.bScroll.finishPullDown();
        this.$refs.bScroll.finishPullUp();
      },
      // TODO 搜索物料
      searchMat({val = '', property = ''}) {
        this.srhInpTx = val;
        // this.activeTab = '';
        // this.activeIndex = 0;
        this.resetCondition();
        this.getMatList();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getMatList();
      },
      // TODO 下拉刷新
      onPullingDown() {
        this.page = 1;
        this.getData(true)
      },
      //获取上次存储的列表总数量
      getSession() {
        return new Promise(resolve => {
          this.total = sessionStorage.getItem("WL");
          resolve()
        })
      },
      async getData(noReset) {
        await this.getSession();
        if (noReset) {
          await this.getMatList(true).then(() => {
            this.$nextTick(() => {
              this.$refs.bScroll.finishPullDown().then(() => {
                this.$refs.bScroll.finishPullUp();
              });
            })
          });
          return
        }
        await this.getMatList();
      },
      // TODO 修改是否访问的状态
      changeVisitedStatus() {
        setTimeout(() => {
          let tmp = [...this.matterList];
          tmp.forEach(item => {
            item.visited = false;
          });
          this.matterList = tmp;
        }, 200);
      },
      // TODO 获取应用详情
      getAppDetail() {
        return getAppDetail(this.listId).then(([data = {}]) => {
          let {action} = data;
          this.action = action;
        })
      },
      // TODO 获取列表展示字段
      getListViewById() {
        return getListViewById('eae9040e-bcb3-4ab9-bef6-639041b1d21b').then(([data = {}]) => {
          let content = JSON.parse(data.content || '{}');
          let {fields = []} = content;
          let showFieldList = [
            'inventoryType',
            'inventorySubclass',
            'measureUnit',
            'processing',
          ];
          this.listFields = fields.filter(item => !item.isHidden && showFieldList.includes(item.fieldCode));
        })
      },
    },
    watch: {
      $route: {
        handler(to, from) {
          let {path = '', meta = {}} = to;
          if (path === '/materlist') {
            this.changeVisitedStatus();
            // 判断是否重新请求页面
            if (meta.reload) {
              to.meta.reload = false;
              this.srhInpTx = '';
              this.activeTab = '';
              this.activeIndex = 0;
              this.resetCondition();
              this.getData(false);
            }
          }
        },
      }
    },
    created() {
      (async () => {
        await this.getAppDetail();
        await this.getSession();
        await this.getListViewById();
        await this.getDictByType().then(() => {
          this.getMatList();
        });
      })()
    },
  }
</script>

<style lang='scss' scoped>
  @import '~@/scss/color';

  %ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

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

  .childPage {
    bottom: 0;
    z-index: 5;
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
  }

  .app_top {
    width: 100%;
  }

  .app_main {
    position: relative;
    height: calc(100% - .94rem);
    overflow: hidden;
    box-sizing: border-box;
  }

  .matter-item-wrapper {
    display: flex;
    padding: .15rem;
    width: 100%;
    color: #333;
    transition: background-color 200ms linear;
    box-sizing: border-box;
    &.visited {
      background-color: $list_visited;
    }
    &:after {
      left: .23rem;
      border-color: #e8e8e8;
      color: #e8e8e8;
    }
    .matter-img {
      width: .95rem;
      height: .95rem;
    }
    .matter-info-wrapper {
      flex: 1;
      margin-left: .2rem;
      .matter_name {
        line-height: .19rem;
        font-size: .14rem;
        font-weight: 600;
      }

      /* 编码与规格 */
      .matter_info_main {
        display: flex;
      }
      .matter_main_item {
        @extend %ellipsis;
        margin-top: .12rem;
        padding: .04rem .05rem;
        max-width: 1.2rem;
        line-height: .12rem;
        background-color: #FAECE7;
        color: #FA7138;
        font-size: .12rem;
        & + .matter_main_item {
          margin-left: .08rem;
        }
        &.specification {
          max-width: .85rem;
        }
      }

      /* 其他属性 */
      .matter_detail {
        display: flex;
        flex-wrap: wrap;
      }
      .matter_info_item {
        margin: .08rem .12rem 0 0;
        line-height: .12rem;
        font-size: .12rem;
      }
      .matter_info_title {
        color: #999;
      }
    }
  }

</style>
