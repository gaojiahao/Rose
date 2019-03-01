<template>
  <div class="pop-warehouse-container vux-1px-t" @click="warehouseClick">
    <!-- 仓库信息 -->
    <div class="warehouse-info">
      <div v-if="selItems.warehouseName">
        <div class="user_info">
          <span class="user_name">{{selItems.warehouseName}}</span>
          <span class="user_tel">{{selItems.warehouseCode}}</span>
        </div>
        <div class="cp_info" v-if="!noAddress">
          <span class="icon-dealer-address"></span>
          <span class="cp_ads">
            <!-- {{selItems.warehouseProvince}}{{selItems.warehouseCity}}{{selItems.warehouseDistrict}}{{selItems.warehouseAddress}} -->
            {{selItems.warehouseAddress}}
          </span>
        </div>
      </div>
      <div v-else>
        <div class="no-warehouse">
          <div class="picker">
            <span class="mode required">请选择库位</span>
          </div>
        </div>
      </div>
    </div>
    <span class="icon-right"></span>
    <!-- 仓库popup -->
    <div v-transfer-dom>
      <popup v-model="storeStorePop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="popup-top">
          <i class="icon-close" @click="onHide"></i>
        </div>
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide"></d-search>
          <!-- 仓库列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-mater-list-item box_sd" :class="{'seleted' : showSelIcon(item)}" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="pop-list-main">
                <img class="warehouse_img" :src="require('assets/default/warehouse.png')" alt="warehouse_img">
                <div class="pop-list-info">
                  <!--联系人电话 -->
                  <div class="withColor">
                    <span class="name">{{item.warehouseName}}</span>
                    <span class="type">{{item.warehouseType}}</span>
                  </div>
                  <!-- 地址 -->
                  <div class="warehouse-address">
                    <span>{{item.warehouseProvince}}{{item.warehouseCity}}{{item.warehouseDistrict}}{{item.warehouseAddress}}</span>
                  </div>
                </div>
              </div>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup, TransferDom} from 'vux'
  import {getObjWarehouseRel} from 'service/listService'
  import RScroll from 'components/RScroll'
  import DSearch from 'components/search'

  export default {
    name: "PopWarehouseStoreList",
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      // 请求参数
      storeParams: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll, DSearch,
    },
    data() {
      return {
        storeStorePop: false,
        srhInpTx: '', // 搜索框内容
        selItems: {}, // 哪些被选中了
        listData: [],
        limit: 10,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
      }
    },
    computed: {
      noAddress() {
        let {warehouseProvince = '', warehouseCity = '', warehouseDistrict = '', warehouseAddress = ''} = this.selItems;
        return !warehouseProvince && !warehouseCity && !warehouseDistrict && !warehouseAddress
      }
    },
    watch: {
      defaultValue: {
        handler(val) {
          this.selItems = this.defaultValue ? {...this.defaultValue} : {};
        },
        immediate: true,
      },
      storeParams: {
        handler(oldVal, newVal) {
          let oldId = JSON.stringify(oldVal),
              newId = JSON.stringify(newVal);
          // 匹配当前选择的往来id 如果不一致则重新发起请求
          if(newId !== oldId) {
            this.resetCondition();
            this.getObjWarehouseRel();
          }
        },
        immediate: true,
      },
    },
    methods: {
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.storeStorePop = false;
      },
      clearList() {
        this.srhInpTx = '';
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getObjWarehouseRel()
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.warehouseCode === sItem.warehouseCode;
      },
      // 重新请求数据
      resetCondition() {
        this.page = 1;
        this.hasNext = true;
        this.listData = [];
      },
      // 选择物料
      selThis(sItem, sIndex) {
        this.storeStorePop = false;
        this.selItems = sItem;
        this.$emit('sel-store', this.selItems);
      },
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 获取仓库列表
      getObjWarehouseRel() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'warehouseName',
            },
          ];
        }
        return getObjWarehouseRel({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.storeParams,
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 搜索仓库
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getObjWarehouseRel()
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getObjWarehouseRel()
      },
      // 点击仓库
      warehouseClick() {
        this.storeStorePop = !this.storeStorePop;
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
@import '~@/scss/color.scss';
  .vux-1px-t:before{
    border-color: #e8e8e8;
  }
  .pop-warehouse-container {
    color: #333;
    font-size: .14rem;
    padding: .18rem 0;
    background: #fff;
    position: relative;
    line-height: .14rem;
    box-sizing: border-box;
    .title {
      color: #696969;
    }
    .mode {
      font-weight: 500;
      &.required{
        color: #3296FA;
        font-weight: bold;
      }
    }
    /* 右箭头 */
    .icon-right {
      top: 50%;
      right: 0;
      width: .08rem;
      height: .14rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    // 用户信息
    .user_info {
      line-height: .14rem;
      // 用户姓名
      .user_name {
        color: #3296FA
      }
    }
    // 地址
    .cp_info {
      color: #111;
      display: flex;
      margin-top: .1rem;
      align-items: center;
      .icon-dealer-address {
        width: .12rem;
        height: .14rem;
        margin-right: .06rem;
      }
      .cp_ads {
        flex: 1;
        font-size: .12rem;
        color: #999;
      }
    }
    .no-warehouse {
      display: flex;
      align-items: center;
      width: calc( 100% - .18rem);
      justify-content: space-between;
      .required {
        color: #3296FA;
        font-weight: bold;
      }
    }
  }
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .popup-top {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 .15rem;
      height: .4rem;
      background-color: #fff;
      .icon-close {
        display: inline-block;
        width: .14rem;
        height: .14rem;
      }
    }
    .trade_pop {
      height: calc(100% - .4rem);
      overflow: hidden;
      .search {
        padding-top: 0;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: 0 .15rem;
        }
        // 列表项
        .pop-mater-list-item {
          margin: .2rem 0;
          padding: .15rem;
          position: relative;
          border-radius: .04rem;
          box-sizing: border-box;
          &.seleted {
            border: 1px solid #3296FA;
          }
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          // 列表主体
          .pop-list-main {
            display: flex;
            .warehouse_img {
              width: .4rem;
              height: .4rem;
              border-radius: 50%;
            }
            // 物料信息
            .pop-list-info {
              font-size: .14rem;
              margin-left: .12rem;
              // 有颜色包裹的
              .withColor {
                .name {
                  line-height: .18rem;
                  font-size: .16rem;
                  font-weight: bold;
                }
                .type {
                  font-size: .12rem;
                  color: #999;
                }
              }
              .warehouse-address {
                font-size: .12rem;
                line-height: .12rem;
                margin-top: .06rem;
                color: #999;
              }
            }
          }
        }
      }

    }
  }

  // 当没有数据时
  .when_null_conteiner {
    margin-top: 10px;
    .when_null {
      width: 3rem;
      margin: 0 auto;
      color: #757575;
      font-weight: bold;
      // 提醒文字
      .title {
        font-size: .2rem;
      }
      // 新增往来
      .tips {
        li {
          list-style: square;
          margin-top: .1rem;
        }
        font-size: .14rem;
        .addNew {
          color: #fff;
          background: #5077aa;
          display: inline-block;
          padding: 0 .04rem;
          border-radius: .04rem;
        }
      }

    }
  }
</style>
