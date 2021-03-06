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
  </div>
</template>

<script>
  import {Icon, Popup, TransferDom, LoadMore} from 'vux'
  import {getObjWorkshopWarehouse, getWareHouseType} from 'service/listService'
  import RScroll from 'plugins/scroll/RScroll'
  import DSearch from 'components/search/search'
  import PopWarehouseStoreList from 'components/Popup/PopWarehouseStoreList'
import { constants } from 'crypto';

  export default {
    name: "PopPgList",
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
        default: 'getObjWorkshopWarehouse'
      },
      // 请求参数
      params: {
        type: Object,
        default() {
          return {}
        }
      },
      // 请求参数
      glParams: {
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
      glParams(val) {
        this.getObjWorkshopWarehouse();
      }
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
        this.showPop = false;
      },
      clearList() {
        this.srhInpTx = '';
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this[this.getListMethod]();
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.warehouseCode === sItem.warehouseCode;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = sItem;
        this.warehouseStore = {}
        this.$emit('sel-item', JSON.stringify(this.selItems));
      },
      // 获取默认图片
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
      // 获取仓库列表
      getObjWorkshopWarehouse() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'warehouseName',
              // attendedOperation: 'or'
            },
          ];
        }
        return getObjWorkshopWarehouse({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.glParams,
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
      // 共用的数据处理方法
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
      // 搜索仓库
      searchList({val = ''}) {
        console.log('val',val)
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this[this.getListMethod]();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this[this.getListMethod]();
      },
      // 设置默认值
      setDefaultValue() {
        this.selItems = this.defaultValue ? {...this.defaultValue} : {};
      },
      // 点击仓库
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
      //this[this.getListMethod]();
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
          padding: .05rem .15rem 0;
        }
        // 列表项
        .pop-mater-list-item {
          padding: .15rem;
          position: relative;
          margin-bottom: .15rem;
          border-radius: .04rem;
          box-sizing: border-box;
          &.seleted {
            border: 1px solid #3296FA;
          }
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
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
