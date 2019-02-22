<template>
  <div class="pop-warehouse-container" >
    <!-- 仓库信息 -->
    <div class="warehouse-part" @click="warehouseClick">
      <div class="warehouse-info">
        <template v-if="selItems.warehouseName">
          <div class="user_info">
            <span class="user_name">{{selItems.warehouseName}}</span>
            <span class="user_tel">{{selItems.warehouseType}}</span>
          </div>
          <span class='icon-right'></span>
        </template>
        <template v-else>
            <div class="title" :class='{required : isRequired}'>{{title}}</div>
            <div class="picker">
              <span class="mode">请选择</span>
              <span class="icon-right"></span>
            </div>
        </template>
      </div>
    </div>
    <pop-warehouse-store-list :store-params="warehouseStoreParams" v-if="isShowStore && selItems.warehouseCode"
          :defaultValue="warehouseStore"  @sel-store="selStore">
    </pop-warehouse-store-list>
    <!-- 仓库popup -->
    <div v-transfer-dom v-if="!disabled">
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
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
              <!-- icon -->
            </div>
            <!-- 加载中、没有更多的提示 -->
            <load-more :show-loading="hasNext" :tip="tip" v-show="!showAddWarehouse && (hasNext || !listData.length)"
                       slot="loadmore"></load-more>
            <!-- 当没有数据的时候 显示提醒文字 -->
            <div class="when_null_conteiner" slot="loadmore" v-show="showAddWarehouse">
              <div class="when_null">
                <div class="title">抱歉，没有找到您搜索的内容</div>
                <ul class="tips">
                  <li>
                    不用担心，您马上可以进行 <span class="addNew" @click="addWarehouse">新增仓库</span>
                  </li>
                  <li>
                    或者检查“输入内容”是否正确
                  </li>
                </ul>
              </div>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup, TransferDom, LoadMore} from 'vux'
  import {getWarehouse, getWareHouseType} from 'service/listService'
  import RScroll from 'components/RScroll'
  import DSearch from 'components/search'
  import PopWarehouseStoreList from 'components/Popup/PopWarehouseStoreList'

  export default {
    name: "PopWarehouseList",
    props: {
      // 标题
      title: {
        type: String,
        default: '仓库列表'
      },
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      // 默认库位信息
      defaultStore: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否禁用选择
      disabled: {
        type: Boolean,
        default: false
      },
      //是否必选
      isRequired : {
        type : Boolean,
        default : false,
      },
      // 列表请求过滤参数
      filterParams: {
        type: Array,
        default() {
          return []
        }
      },
      getListMethod: {
        type: String,
        default: 'getWarehouse'
      },
      // 请求参数
      params: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否展示库位
      isShowStore: {
        type: Boolean,
        default: false,
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll, DSearch, LoadMore, PopWarehouseStoreList
    },
    data() {
      return {
        showPop: false,
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
        showAddWarehouse: false, // 展示新增仓库按钮
        warehouseStore: {} , // 库位信息
      }
    },
    computed: {
      tip() {
        let tip = '加载中';
        if (!this.hasNext) {
          tip = '暂无数据'
        }
        return tip;
      },
      noAddress() {
        let {warehouseProvince = '', warehouseCity = '', warehouseDistrict = '', warehouseAddress = ''} = this.selItems;
        return !warehouseProvince && !warehouseCity && !warehouseDistrict && !warehouseAddress
      },
      warehouseStoreParams() {
        return {
          warehouseCode: this.selItems.warehouseCode || ''
        }
      }
    },
    watch: {
      defaultValue(val) {
        this.setDefaultValue();
      },
      defaultStore: {
        handler() {
          this.warehouseStore = Object.freeze({...this.defaultStore});
        },
        immediate: true
      },
    },
    methods: {
      // TODO 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            this.$refs.bScroll.refresh();
          }
        })
      },
      // TODO 弹窗隐藏时调用
      onHide() {
        this.showPop = false;
      },
      clearList() {
        this.srhInpTx = '';
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this[this.getListMethod]();
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.warehouseCode === sItem.warehouseCode;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = sItem;
        this.warehouseStore = {}
        this.$emit('sel-item', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 选择的库位
      selStore(val){
        this.warehouseStore = val;
        this.$emit('get-store', val);
      },
      // TODO 获取仓库列表
      getWarehouse() {
        let filter = this.filterParams;
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'warehouseName',
              // attendedOperation: 'or'
            },
          ];
        }
        return getWarehouse({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(this.dataHandler)
      },
      getWareHouseType(){
        let filter = this.filterParams;
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
        getWareHouseType({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
        }).then(this.dataHandler)
      },
      // TODO 共用的数据处理方法
      dataHandler({dataCount = 0, tableContent = []}){
        this.showAddWarehouse = this.srhInpTx && tableContent.length === 0;
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        tableContent.forEach(item => {
          item.warehouseCity = item.warehouseCity || item.wareHouseCity;
        });
        this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
        //获取缓存
        if (sessionStorage.getItem('EDIT_WAREHOUSE_TRANSCODE')) {
          let EDIT_WAREHOUSE_TRANSCODE = JSON.parse(sessionStorage.getItem('EDIT_WAREHOUSE_TRANSCODE')).transCode;
          for (let i = 0; i < this.listData.length; i++) {
            if (this.listData[i].transCode == EDIT_WAREHOUSE_TRANSCODE) {
              this.selItems = this.listData[i];
              this.$emit('sel-item', JSON.stringify(this.listData[i]));
              sessionStorage.removeItem('EDIT_WAREHOUSE_TRANSCODE')
            }
          }
        }
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      },
      // TODO 搜索仓库
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this[this.getListMethod]();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this[this.getListMethod]();
      },
      // TODO 设置默认值
      setDefaultValue() {
        this.selItems = this.defaultValue ? {...this.defaultValue} : {};
      },
      // TODO 点击仓库
      warehouseClick() {
        if (this.disabled) {
          return
        }
        this.showPop = !this.showPop;
      },
      //新增仓库
      addWarehouse() {
        this.$router.push({
          path: '/warehouse/edit_warehouse',
          query: {
            add: 1
          }
        })
      }
    },
    created() {
      this.setDefaultValue();
      if (this.disabled) {
        return
      }
      this[this.getListMethod]();
    }
  }
</script>

<style scoped lang="scss">
@import '~@/scss/color.scss';
  .pop-warehouse-container {
    padding:  0 .15rem;
    box-sizing: border-box;
    background: #fff;
    margin-bottom: .1rem;
    font-size: .14rem;
    color: #333;
    .warehouse-part{
      position: relative;
    }
    .warehouse-info {
      display: flex;
      padding: .18rem 0;
      justify-content: space-between;
    }
    .title {
      color: #696969;
      &.required {
        color: #3296FA;
        font-weight: bold;
      }
    }
    .mode {
      font-weight: 500;
      &.required{
        font-weight: bold;
      }
    }
    .picker {
      display: flex;
      align-items: center;
    }
    // 右箭头
    .icon-right {
      width: .08rem;
      height: .14rem;
      margin-left: .1rem;
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
      margin-top: .06rem;
      .icon-dealer-address {
        width: .12rem;
        height: .14rem;
        margin: .03rem .07rem 0 0;
      }
      .cp_ads {
        flex: 1;
        font-size: .12rem;
        color: #999;
      }
    }
    .no-warehouse {
      display: flex;
      line-height: .14rem;
      align-items: center;
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
          position: relative;
          padding: .15rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          border-radius: .04rem;
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
