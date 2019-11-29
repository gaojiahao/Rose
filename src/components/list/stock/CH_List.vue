<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList' :place-holder="'名称或编码'"></searchIcon>
        <div class="tab-container" ref="tabContainer">
          <div class="tab-item" :class="{active: index === activeIndex}" v-for="(item, index) in listView"
               @click="tabClick(item, index)" ref="tabs" :key="index">
            {{item.view_name}}
          </div>
        </div>
      </div>
      <div class="swiper-container list-container">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="(slide, key) in listMap" :key="key">
            <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="slide.hasNext"
                      :no-data="!slide.hasNext && !slide.listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                      ref="bScroll">
              <!-- 库位库存表 -->
              <template v-if="activeTab.includes('库位库存')">
                <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index' @click="getFlow(item)">
                  <div class="classification-header-wrapper">
                    <img class="classification_img" :src="item.inventoryPic" alt="icon">
                    <div class="classification_app">
                      <div class="app_top">
                        <div class="app_name">{{item.inventoryName}}</div>
                        <div class="app_flow">{{item.invProcessing}}</div>
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                        <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                      </div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="mater-info">
                    <div class="mater_detail">
                      <div class="mater">
                        <span class="title">仓库名称: </span>{{item.warehouseName || '暂无'}}
                      </div>
                      <div class="mater">
                        <span class="title">仓库编码: </span>{{item.whCode || '无'}}
                      </div>
                      <div class="mater">
                        <span class="title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                      </div>
                      <template>
                      </template>
                      <div class="mater">
                        <span class="title">库位名称: </span>{{item.storehouseName || '无'}}
                      </div>
                      <div class="mater">
                        <span class="title">库位编码: </span>{{item.storehouseCode || '无'}}
                      </div>
                    </div>
                    <div class="mater_amt_wrapper">
                      <div class="mater_amt">{{item.qtyBalance | numberComma}}
                      </div>
                      <div class="text">数量余额</div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="classification-bottom">
                    <div class="classification_bottom_item days">
                      <div class="classification_bottom_value">{{item.drQty || 0 | numberComma}}</div>
                      <div class="classification_bottom_title">增加数量</div>
                    </div>
                    <div class="classification_bottom_item">
                      <div class="classification_bottom_value">{{item.crQty || 0 | numberComma }}</div>
                      <div class="classification_bottom_title">减少数量</div>
                    </div>
                    <div class="classification_bottom_item amt noticed">
                      <div class="classification_bottom_value">
                        {{item.qtyLocked | numberComma}}
                      </div>
                      <div class="classification_bottom_title">工作流占用</div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 库存表 -->
              <template v-else-if="activeTab.includes('库存')">
                <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
                  <div class="classification-header-wrapper">
                    <img class="classification_img" :src="item.inventoryPic" alt="icon">
                    <div class="classification_app">
                      <div class="app_top">
                        <div class="app_name">{{item.inventoryName}}</div>
                        <div class="app_flow">{{item.invProcessing}}</div>
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                        <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">仓库名称: </span>{{item.warehouseName || '无'}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">仓库编码: </span>{{item.whCode || '无'}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                      </div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="classification-bottom">
                    <div class="classification_bottom_item days">
                      <div class="classification_bottom_value">{{item.drQty || 0 | numberComma}}</div>
                      <div class="classification_bottom_title">入库数量</div>
                    </div>
                    <div class="classification_bottom_item">
                      <div class="classification_bottom_value">{{item.crQty || 0 | numberComma }}</div>
                      <div class="classification_bottom_title">出库数</div>
                    </div>
                    <div class="classification_bottom_item amt noticed">
                      <div class="classification_bottom_value">
                        {{item.qtyBalance | numberComma}}
                      </div>
                      <div class="classification_bottom_title">在库库存</div>
                    </div>
                  </div>
                  <div class="classification-bottom">
                    <div class="classification_bottom_item days noticed">
                      <div class="classification_bottom_value">{{item.orderQtyLocked || 0 | numberComma }}</div>
                      <div class="classification_bottom_title">计划占用</div>
                    </div>
                    <div class="classification_bottom_item noticed">
                      <div class="classification_bottom_value">{{item.qtyLocked || 0 | numberComma}}</div>
                      <div class="classification_bottom_title">工作流占用</div>
                    </div>
                    <div class="classification_bottom_item amt noticed">
                      <div class="classification_bottom_value">
                        {{item.useAbleQtyBalance | numberComma}}
                      </div>
                      <div class="classification_bottom_title">可用库存</div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- 核销余额表 -->
              <template v-else-if="activeTab.includes('核销余额')">
                <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
                  <div class="classification-header-wrapper">
                    <img class="classification_img" :src="item.inventoryPic" alt="icon">
                    <div class="classification_app">
                      <div class="app_top">
                        <div class="app_name">{{item.inventoryName}}</div>
                        <div class="app_flow">{{item.processing}}</div>
                      </div>
                      <div class="classification_detail_part">
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">实例编码: </span>{{item.transCode}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">应用名称: </span>{{item.appName}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">应用类型: </span>{{item.appType}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">记账日期与时间: </span>{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}
                        </div>
                      </div>
                      <div class="classification_detail_part">
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">物料编码: </span>{{item.inventoryCode}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                          <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">保质期天数: </span>{{item.shelfLife}}
                          <span class="classification_detail_title">质龄: </span>{{item.qualityAge}}
                          <span class="classification_detail_title">临保: </span>{{item.nearKeepingDays}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">生产日期: </span>{{item.productDate | dateFormat('YYYY-MM-DD')}}
                          <span class="classification_detail_title">到期日期: </span>{{item.dueDate | dateFormat('YYYY-MM-DD')}}
                        </div>
                      </div>
                      <div class="classification_detail_part">
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">入库数: </span>{{item.inQty || 0 | numberComma}}
                          <span class="classification_detail_title">出库数: </span>{{item.outQty || 0 | numberComma}}
                        </div>
                        <div class="classification_detail_item">
                          <span class="classification_detail_title">可用库存: </span>{{item.qtyBalance || 0 | numberComma}}
                          <span class="classification_detail_title">账龄天数: </span>{{item.agingTime || 0 | numberComma}}
                          <span class="classification_detail_title">库龄天数: </span>{{item.stockTime || 0 | numberComma}}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="mater-info">
                    <div class="mater_detail">
                      <div class="mater">
                        <span class="title">仓库名称: </span>{{item.whName || '暂无'}}
                      </div>
                      <div class="mater">
                        <span class="title">仓库编码: </span>{{item.whCode || '无'}}
                      </div>
                      <div class="mater">
                        <span class="title">仓库关系类型: </span>{{item.whType || '无'}}
                      </div>
                    </div>
                    <div class="mater_amt_wrapper">
                      <div class="mater_amt">{{item.isNeer}}
                      </div>
                      <div class="text">是否临保</div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="activeTab.includes('加工在制')">
                <div class="classification-item-wrapper" v-for='(item, index) in listData' :key='index'>
                  <div class="classification-header-wrapper">
                    <img class="classification_img" :src="item.inventoryPic" alt="icon">
                    <div class="classification_app">
                      <div class="app_top">
                        <div class="app_name">{{item.inventoryName}}</div>
                        <div class="app_flow">{{item.invProcessing}}</div>
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">物料编码: </span>{{item.matCode}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">产品规格: </span>{{item.specification || '无'}}
                        <span class="classification_detail_title">主计量单位: </span>{{item.measureUnit || '无'}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">仓库名称: </span>{{item.warehouseName || '无'}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">仓库编码: </span>{{item.whCode || '无'}}
                      </div>
                      <div class="classification_detail_item">
                        <span class="classification_detail_title">仓库关系类型: </span>{{item.warehouseType || '无'}}
                      </div>
                    </div>
                  </div>
                  <div class="classification-split"></div>
                  <div class="classification-bottom">
                    <div class="classification_bottom_item days">
                      <div class="classification_bottom_value">{{item.drQty || 0 | numberComma}}</div>
                      <div class="classification_bottom_title">入库数量</div>
                    </div>
                    <div class="classification_bottom_item">
                      <div class="classification_bottom_value">{{item.crQty || 0 | numberComma }}</div>
                      <div class="classification_bottom_title">出库数</div>
                    </div>
                    <div class="classification_bottom_item amt">
                      <div class="classification_bottom_value">
                        {{item.orderQtyLocked || 0 | numberComma}}
                      </div>
                      <div class="classification_bottom_title">计划占用</div>
                    </div>
                  </div>
                  <div class="classification-bottom">
                    <div class="classification_bottom_item days noticed">
                      <div class="classification_bottom_value">{{item.qtyBalance || 0 | numberComma }}</div>
                      <div class="classification_bottom_title">可用库存</div>
                    </div>
                    <div class="classification_bottom_item noticed">
                      <div class="classification_bottom_value">{{item.qtyLocked || 0 | numberComma}}</div>
                      <div class="classification_bottom_title">工作流占用</div>
                    </div>
                    <div class="classification_bottom_item amt">
                      <div class="classification_bottom_value">
                        {{item.amountBalance | numberComma}}
                      </div>
                      <div class="classification_bottom_title">金额余额</div>
                    </div>
                  </div>
                </div>
              </template>
            </r-scroll>
          </div>
        </div>
      </div>
      <!-- 展开状态 -->
      <div v-transfer-dom>
        <popup v-model="flowShow" position="bottom" height="80%">
          <r-scroll class="flow_list_wrapper" ref="flowListWrapper"
                    :options="FlowScrollOptions" :has-next="FlowHasNext"
                    :no-data="!FlowHasNext && !flowData.length" @on-pulling-up="onPullingUpFlow">
            <div class="flow">
              <div class='flow_top'>
                <div class="title">流水详情</div>
                <div class="name">
                  {{flowTitle.inventoryName}}<span class="symbol">[{{flowTitle.invProcessing}}]</span>
                </div>
              </div>
              <div class="flow_list">
                <div class='each_flow' v-for='(Fitem,Findex) in flowData' :key="Findex" @click.stop="Fitem.showList = !Fitem.showList">
                  <!--展开状态-->
                  <div class="duty_top">
                    <!-- 实例编码 -->
                    <div class='transCode'>
                      <span class="order_title">编码</span>
                      <span class="order_num">{{Fitem.transCode}}</span>
                    </div>
                    <!-- 时间 -->
                    <div class="time">
                      {{Fitem.calcTime | dateFormat}}
                    </div>
                  </div>

                  <!-- 数量，金额 -->
                  <div class='show_list'>
                    <!-- 应用名称 -->
                    <div class="app_name">
                      {{Fitem.appTitle}}<span class="symbol">[应用]</span>
                    </div>
                    <div class="num_info">
                      <!-- 数量 -->
                      <div class="count">
                        <div class="num_part" v-if='Fitem.drQty>0'>
                          <span class="symbol">本次数量: </span>
                          <span class="number_incre">+ {{Fitem.drQty}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.crQty>0'>
                          <span class="symbol">本次数量: </span>
                          <span class="number_redu">- {{Fitem.crQty}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次数量: </span>
                          <span>不变</span>
                        </div>
                      </div>
                      <!-- 金额 -->
                      <div class="amount_money">
                        <div class="num_part" v-if='Fitem.drAmnt>0'>
                          <span class="symbol">本次金额: </span>
                          <span class="number_incre">+ {{Fitem.drAmnt}}</span>
                        </div>
                        <div class="num_part" v-else-if='Fitem.crAmnt>0'>
                          <span class="symbol">本次金额: </span>
                          <span class="number_redu">- {{Fitem.crAmnt}}</span>
                        </div>
                        <div class="num_part" v-else>
                          <span class="symbol">本次金额: </span>
                          <span>不变</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="summary_part vux-1px-t">
                    <div class="number">
                      <span class="symbol">当前数量: </span>{{Fitem.qtyBalance}}
                    </div>
                    <div class="price">
                      <span class="symbol">当前余额: ￥</span>{{Fitem.amountBalance}}
                    </div>
                  </div>
                </div>
                <div>
                </div>
              </div>
            </div>
          </r-scroll>
          <div class="btn when_less">
            <span class="cfm_btn" @click="flowShow = false">关闭</span>
          </div>

        </popup>
      </div>
    </div>
  </div>
</template>

<script>
import listCommon from 'mixins/kmListCommon'
import {getListClassfiy, getViewList} from 'service/kmService'

const BASE_PARAMS = {
    page: 1,
    limit: 20,
    hasNext: true,
    listData: [],
  };

export default {
  data() {
    return {
      uniqueId : 1400,
      filterArr: [
          {"operator": "like", "value": "", "property": "cashCode"}
      ],
      listMap: {},
    }
  },
  mixins: [listCommon],
  computed: {
      // 当前滑块
      currentItem() {
        if(this.listView.length){
          let {view_id} = this.listView[this.activeIndex];
          return this.listMap[view_id];
        }
      },
      // 当前滚动容器
      currentScroll() {
        return this.$refs.bScroll[this.activeIndex]
      }
    },
    methods: {
      // 重置列表条件
      resetCondition() {
        if(this.listView.length){
          let view_id = this.listView[this.activeIndex] && this.listView[this.activeIndex]['view_id'];
          this.listMap[view_id] = {...BASE_PARAMS};
          this.currentScroll.scrollTo(0, 0);
          this.currentScroll.resetPullDown();
        }
      },
      // tab切换
      tabClick(val, index) {
        if (index === this.activeIndex) {
          this.currentScroll.scrollTo(0, 0);
          return;
        }
        this.activeIndex = index;
        this.activeTab = val.view_name;
        this.calc_rel_code = val.calc_rel_code;
        this.view_id = val.view_id;
        this.currentScroll.scrollTo(0, 0);
        this.resetCondition();
        this.getList();
        this.listSwiper.slideTo(index);
      },
      //获取列表视图
      getClassfiy() {
        return getListClassfiy({
          account_code: this.uniqueId,
          device_type: 'phone'
        }).then(({data = []}) => {
          let [first = {}] = data;
          let listMap = {};
          data.forEach(item => {
            listMap[item.view_id] = {...BASE_PARAMS};
          });
          this.listMap = listMap;
          this.listView = data;
          this.activeTab = first.view_name;
          this.calc_rel_code = first.calc_rel_code;
          this.view_id = first.view_id;
          this.getView();
          this.getListData();
          this.initSwiper();
          this.$nextTick(() => {
            this.listSwiper.update();
          })
        })
      },
      //获取列表数据
      getListData(noReset = false) {
        if(this.currentItem){
          let {page, limit} = this.currentItem;
        return getViewList({
          user_code: 1,
          page: page,
          limit: limit,
          view_scope: 'data',
          device_type: 'phone',
          view_id: this.view_id,
          filter: this.serachVal,
          calc_rel_code: this.calc_rel_code,
          start: (page - 1) * limit,
        }).then(({data = [], total = 0}) => {
          this.currentItem.hasNext = total > (page - 1) * limit + data.length;
          data.forEach(item => {
            item.status = false;
            item.draftDueDate && (item.draftDueDate = dateFormat(item.draftDueDate,'YYYY-MM-DD'));
            // 物料图标 初始化
          if (item.inventoryPic) {
            item.inventoryPic = `/H_roleplay-si/ds/download?url=${item.inventoryPic}&width=400&height=400`;
          } else {
            // 设置默认物料图片
            this.getDefaultImg(item)
          }
          });
          this.listData = page === 1 ? data : this.listData.concat(data);
          this.currentItem.listData = page === 1 ? data : [...this.currentItem.listData, ...data];
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
          // 判断最近有无新增数据
          let text = '';
          if (noReset && this.activeIndex === 0) {
            if (this.total) {
              text = total - this.total === 0 ? '暂无新数据' : text = `新增${total - this.total}条数据`;
              this.$vux.toast.show({
                text: text,
                position: 'top',
                width: '50%',
                type: "text",
                time: 700
              })
            }
          }
          //列表总数据缓存
          if (this.activeIndex === 0 && page === 1) {
            sessionStorage.setItem(this.applyCode, total);
          }
          this.$loading.hide();
        }).catch(e => {
          this.resetScroll();
        })
        }
      },
      //根据视图获取订单数据
      async getList(noReset = false) {
        await this.getView();
        await this.getListData(noReset);
      },
      // 重置下拉刷新、上拉加载的状态
      resetScroll() {
        this.currentScroll.finishPullDown();
        this.currentScroll.finishPullUp();
      },
      // 上拉加载
      onPullingUp() {
        this.currentItem.page++;
        this.getListData();
      },
      // 下拉刷新
      onPullingDown() {
        this.currentItem.page = 1;
        this.getData(true);
      },
      async getData(noReset) {
        await this.getSession();
        if (noReset) {
          await this.getList(true).then(() => {
            this.$nextTick(() => {
              this.currentScroll.finishPullDown().then(() => {
                this.currentScroll.finishPullUp();
              });
            })
          });
          return
        }
        await this.getList();
      },
      // 初始化swiper
      initSwiper() {
        this.$nextTick(() => {
          this.listSwiper = new this.Swiper('.list-container', {
            touchAngle: 30,
            on: {
              slideChangeTransitionStart: () => {
                let index = this.listSwiper.activeIndex;
                let tab = this.listView[index];
                this.activeIndex = index;
                this.activeTab = tab.view_name;
                this.calc_rel_code = tab.calc_rel_code;
                this.view_id = tab.view_id;
                this.scrollToShow(index);
                // 已有数据则不重新请求
                if (this.currentItem.listData.length) {
                  return
                }
                this.resetCondition();
                this.getListData();
              },
            },
          });
        })
      },
      // 滑动显示完整名字
      scrollToShow(index) {
        let $container = this.$refs.tabContainer;
        let paddingLeft = parseFloat(getComputedStyle($container).paddingLeft);
        let $activate = this.$refs.tabs[index];
        $container.scrollLeft = $activate.offsetLeft - paddingLeft;
      }
    }
}
</script>

<style lang='scss' scoped>
  @import '~scss/subject/subList';
  .list-container {
    height: calc(100% - .96rem);
    .list_wrapper {
      height: 100%;
      background-color: #fff;
    }
  }
  .classification-item-wrapper {
    color: #333;
    margin: .1rem;
    position: relative;
    border-radius: 4px;
    background: #FFF;
    padding: .2rem .15rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
    .classification-header-wrapper {
      display: flex;
      .classification_img {
        width: .5rem;
        height: .5rem;
        border-radius: .04rem;
      }
      .classification_app {
        flex: 1;
        margin-left: .12rem;
      }
      .app_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .app_name {
        line-height: .18rem;
        font-size: .14rem;
        font-weight: bold;
      }
      .app_flow {
        padding: .04rem .06rem;
        line-height: .12rem;
        border: 1px solid;
        border-radius: .04rem;
        font-size: .1rem;
        &.cashOut {
          color: #FB880B;
        }
        &.cashIn {
          color: #00D38B;
        }
      }
      .iconfont {
        font-size: .1rem;
        font-weight: bold;
      }
      .classification_detail_part {
        & + .classification_detail_part {
          margin-top: .12rem;
        }
      }
      .classification_detail_item {
        margin-top: .1rem;
        line-height: .12rem;
        font-size: .12rem;
        & + .classification_detail_item {
          margin-top: .08rem;
        }
      }
      .classification_detail_title {
        color: #696969;
        & + .classification_detail_title {
          margin-left: .06rem;
        }
      }
    }

    /* 分割线 */
    .classification-split {
      position: relative;
      margin: .17rem 0 .12rem;
      height: 1px;
      border-top: 1px dashed #DEDFE6;
    }

    .mater-info {
      display: flex;
      justify-content: space-between;
      .mater_detail {
        flex: 1;
      }
      .mater {
        line-height: .18rem;
        font-size: .12rem;
        .title {
          color: #999;
        }
        & + .mater {
          margin-top: .02rem;
        }
        span {
          & + span {
            margin-left: .06rem;
          }
        }
      }
      .mater_amt_wrapper {
        text-align: center;
      }
      .mater_amt {
        line-height: .17rem;
        color: #FA7138;
        font-size: .18rem;
        font-weight: 600;
      }
      .symbol {
        font-size: .12rem;
      }
      .text {
        margin-top: .08rem;
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
      }
    }

    .mater-name {
      font-weight: 600;
      font-size: .14rem;
      line-height: .18rem;
    }
    .flow-info {
      margin-top: .12rem;
      line-height: .12rem;
      font-size: .12rem;
      .flow_info_item {
        display: flex;
        & + .flow_info_item {
          margin-top: .08rem;
        }
        /* 账户大类 */
        .flow_account_sub {
          margin-left: .1rem;
          .title {
            color: #696969;
          }
        }
        .title {
          color: #999;
        }
      }
    }
    .classification-bottom {
      font-size: .12rem;
      text-align: center;
      position: relative;
      line-height: .12rem;
      .classification_bottom_item {
        &.days, &.amt {
          position: absolute;
        }
        &.days {
          left: 0;
        }
        &.amt {
          top: -1px;
          right: 0;
        }
        &.noticed {
          .classification_bottom_value {
            font-weight: bold;
            font-size: .16rem;
          }
        }
      }
      .classification_bottom_value {
        font-size: .14rem;
      }
      .classification_bottom_title {
        margin-top: .08rem;
        color: #999;
      }
      .symbol {
        font-size: .12rem;
      }
      & + .classification-bottom {
        margin-top: .2rem;
      }
    }
  }

  .tab-container {
    display: flex;
    align-items: center;
    padding: 0 .15rem;
    width: 100%;
    height: .46rem;
    color: #333;
    white-space: nowrap;
    overflow: auto;
    box-sizing: border-box;
    .tab-item {
      line-height: .14rem;
      font-size: .14rem;
      & + .tab-item {
        margin-left: .2rem;
      }
      padding-right: .15rem;
      &.active {
        line-height: .18rem;
        color: #3296FA;
        font-size: .18rem;
        font-weight: 600;
      }
    }
  }


</style>
