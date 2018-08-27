<template>
  <div class="pages">
    <div class="content">
      <!-- 顶部区域 -->
      <div class="app_top">
        <!-- 搜索栏 -->
        <r-search @search="searchMat"></r-search>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in matNature" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <!-- 主要内容区域 -->
      <r-scroll class="app_main" :options="scrollOptions" :has-next="hasNext" :no-data="!hasNext && !matterList.length"
                @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown" ref="bScroll">
        <div class="each_mater" v-for="(item, index) in matterList" :key='index' @click="goDetail(item)">
          <div class="mater_img">
            <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
          </div>
          <div class="mater_main">
            <!-- 物料名称 -->
            <div class="mater_name">
              <span class="whiNum">No.{{index + 1}}</span>
              {{item.inventoryName}}
            </div>
            <!-- 物料基本信息 -->
            <div class="mater_info vux-1px-b">
              <!-- 物料编码、规格 -->
              <div class="withColor">
                <!-- 物料编码 -->
                <div class="ForInline" style="display:inline-block">
                  <div class="mater_code">
                    <span class="title">编码</span>
                    <span class="num">{{item.inventoryCode}}</span>
                  </div>
                </div>
                <!-- 物料规格 -->
                <div class="ForInline" style="display:inline-block">
                  <div class="mater_spec">
                    <span class="title">规格</span>
                    <span class="num">{{item.specification || '无'}}</span>
                  </div>
                </div>
              </div>
              <!-- 物料分类、材质 -->
              <div class="withoutColor">
                <!-- 物料分类 -->
                <div class="mater_classify">
                  <span class="father">大类: {{item.inventoryType || '无'}}</span>
                  <span class="child">子类: {{item.inventorySubclass || '无'}}</span>
                </div>
                <!-- 物料材质等 -->
                <div class="mater_material">
                  <div>
                    <span class="type">属性: {{item.processing}}</span>
                    <span class="unit">单位: {{item.measureUnit || '无'}}</span>
                  </div>
                  <div>
                    <span class="color">颜色: {{item.inventoryColor || '无'}}</span>
                    <span class="spec">材质: {{item.material || '无'}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEditAds">新建另一条物料</div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  import { Tab, Icon, TabItem, Spinner, LoadMore } from 'vux'
  import { getList, getDictByType } from 'service/commonService'
  import RScroll from 'components/RScroll'
  import RSearch from 'components/search'

  const RFD_MATER_LIST = 'RFD_MATER_LIST';
  export default {
    components: {
      Tab, Icon, TabItem, Spinner, LoadMore, RScroll, RSearch,
    },
    data() {
      return {
        srhInpTx: '',
        matNature: [
          { name: '全部' },
          { name: '成品' },
          { name: '半成品' },
          { name: '商品' },
          { name: '原件' },
          { name: '虚拟件' },
          { name: '商品库存' },
          { name: '客供原料' },
          { name: '服务' },
        ],
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
        total : null
      }
    },
    methods: {
      goEditAds() {
        this.$router.push('/materlist/addMater');
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      goDetail(item) {
        this.$router.push({
          path: '/materlist/materDetail',
          query: {
            transCode: item.transCode
          }
        })
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
          filter[0].attendedOperation = 'and (';
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'inventoryCode',
              attendedOperation: 'or'
            },
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'inventoryName',
              attendedOperation: ')'
            },
          ];
        }
        return getList(2132, {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          //判断最近有无新增数据
          //console.log(this.total);
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
          //将总数量缓存
          if(this.activeIndex === 0 && this.page === 1){
            sessionStorage.setItem("WL",dataCount);
          }
          tableContent.forEach(item => {
            item.inventoryPic = item.inventoryPic
            ? `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400`
            : this.getDefaultImg();
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
      searchMat(val) {
        this.srhInpTx = val;
        this.activeTab = '';
        this.activeIndex = 0;
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
      getSession(){
        return new Promise(resolve=>{
          this.total = sessionStorage.getItem("WL");
          resolve()
        })
      },
      async getData(noReset){
        await this.getSession();
        if(noReset){
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

      }
    },
    watch: {
      $route: {
        handler(to, from) {
          // 判断是否重新请求页面
          if (to.meta.reload && to.path === '/materlist') {
            to.meta.reload = false;
            this.srhInpTx = '';
            this.activeTab = '';
            this.activeIndex = 0;
            this.resetCondition();
            this.getData(false)
          }
        },
      }
    },
    created() {
      (async()=>{
        await this.getSession();
        await this.getDictByType().then(() => {
                this.getMatList();
              });

      })()
      
    },
  }
</script>

<style lang='scss' scoped>
  .content {
    height: 90%;
    overflow: auto;
  }
  .childPage {
    bottom: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
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
        -webkit-appearance: none;
        appearance: none;
        &::-webkit-search-cancel-button {
          display: none;
        }
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
    height: calc(100% - .52rem - 36px);
    overflow: hidden;
    box-sizing: border-box;
    // 每个物料
    .each_mater {
      padding: .08rem;
      position: relative;
      box-sizing: border-box;
      display: flex;
      // 物料图片
      .mater_img {
        flex: 1;
        // margin-right: .2rem;
        display: inline-block;
        width: 1.2rem;
        height: 1.2rem;
        img {
          width: 100%;
          max-height: 100%;
        }
      }
      // 物料主体
      .mater_main {
        flex: 2;
        padding-left: .1rem;
        box-sizing: border-box;
        display: inline-block;
        // 物料名称
        .mater_name {
          color: #111;
          overflow: hidden;
          font-size: .14rem;
          font-weight: bold;
          max-height: .46rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          // 每个物料的索引
          .whiNum {
            color: #fff;
            font-weight: 200;
            padding: 0 .1rem;
            font-size: .1rem;
            display: inline-block;
            background: #ea5455;
            vertical-align: middle;
            margin: -.02rem .04rem 0 0;
          }
        }
        // 物料信息
        .mater_info {
          color: #757575;
          font-size: .12rem;
          margin-top: .04rem;
          padding-bottom: .04rem;
          // 有颜色包裹的
          .withColor {
            // 物料编码
            .mater_code {
              display: flex;
              .title,
              .num {
                font-size: .1rem;
                display: inline-block;
                padding: .01rem .04rem;
              }
              .title {
                color: #fff;
                background: #3f72af;
              }
              .num {
                color: #111;
                max-width: .9rem;
                overflow: hidden;
                white-space: nowrap;
                background: #dbe2ef;
                text-overflow: ellipsis;
              }
            }
            // 规格
            .mater_spec {
              @extend .mater_code;
              margin-left: .1rem;
              .title {
                color: #fff;
                background: #537791;
              }
              .num {
                color: #fff;
                max-width: .6rem;
                overflow: hidden;
                white-space: nowrap;
                background: #ff7f50;
                text-overflow: ellipsis;
              }
            }
          }
          // 没颜色包裹的
          .withoutColor {
            // 物料分类
            .mater_classify {
              font-size: .14rem;
              margin-top: .04rem;
              .father {
                margin-right: .1rem;
              }
            }
            // 物料颜色 材质
            .mater_material {
              font-size: .12rem;
              margin-top: .04rem;
              .type,
              .color {
                margin-right: .2rem;
              }
            }
          }
        }
      }
      // 下划线
      .vux-1px-b:after {
        border-bottom: 1px solid #e8e8e8;
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
