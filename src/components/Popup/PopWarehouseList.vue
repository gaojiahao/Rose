<template>
  <div class="pop-warehouse-container" @click="warehouseClick">
    <!-- 仓库信息 -->
    <div v-if="selItems.warehouseName">
      <div class="title">{{title}}</div>
      <div class="user_info">
        <span class="user_name">{{selItems.warehouseName}}</span>
        <span class="user_tel">{{selItems.warehouseType}}</span>
      </div>
      <div class="cp_info" v-if="!noAddress">
        <i class="iconfont icon-icon-test"></i>
        <span class="cp_ads">
          {{selItems.warehouseProvince}}{{selItems.warehouseCity}}{{selItems.warehouseDistrict}}{{selItems.warehouseAddress}}
        </span>
      </div>
    </div>
    <div v-else>
      <div class="title">{{title}}</div>
      <div class="mode" :class='{required : isRequired}'>请选择仓库</div>
    </div>
    <i class="iconfont icon-youjiantou r-arrow" v-show="!disabled"></i>

    <!-- 仓库popup -->
    <div v-transfer-dom v-if="!disabled">
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <div class="title">
            <!-- 搜索栏 -->
            <d-search @search='searchList' @turn-off="onHide" :isFill='true'></d-search>
          </div>
          <!-- 仓库列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-mater-list-item box_sd" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item,index)">
              <div class="pop-list-main ">
                <div class="pop-list-info">
                  <!--联系人电话 -->
                  <div class="withColor">
                    <div class="ForInline name" style="display:inline-block">
                      <span>{{item.warehouseName}}</span>
                    </div>
                    <div class="ForInline name" style="display:inline-block">
                      <span></span>
                    </div>
                  </div>
                  <div class="withColor">
                    <div class="ForInline " style="display:inline-block">
                      <span class='creator'>{{item.warehouseType}}</span>
                    </div>
                  </div>
                  <!-- 地址 -->
                  <div class="withoutColor">
                    <span>{{item.warehouseProvince}}{{item.warehouseCity}}{{item.warehouseDistrict}}{{item.warehouseAddress}}</span>
                  </div>
                </div>
              </div>
              <!-- icon -->
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
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
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll, DSearch, LoadMore,
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
      }
    },
    watch: {
      defaultValue(val) {
        this.setDefaultValue();
      }
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
        this.$emit('sel-item', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
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
        // .then(({dataCount = 0, tableContent = []}) => {
        //   this.showAddWarehouse = this.srhInpTx && tableContent.length === 0;
        //   this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        //   tableContent.forEach(item => {
        //     item.warehouseCity = item.warehouseCity || item.wareHouseCity;
        //   });
        //   this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
        //   //获取缓存
        //   if (sessionStorage.getItem('EDIT_WAREHOUSE_TRANSCODE')) {
        //     let EDIT_WAREHOUSE_TRANSCODE = JSON.parse(sessionStorage.getItem('EDIT_WAREHOUSE_TRANSCODE')).transCode;
        //     for (let i = 0; i < this.listData.length; i++) {
        //       if (this.listData[i].transCode == EDIT_WAREHOUSE_TRANSCODE) {
        //         this.selItems = this.listData[i];
        //         this.$emit('sel-item', JSON.stringify(this.listData[i]));
        //         sessionStorage.removeItem('EDIT_WAREHOUSE_TRANSCODE')
        //       }
        //     }
        //   }
        //   this.$nextTick(() => {
        //     this.$refs.bScroll.finishPullUp();
        //   })
        // });
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
      // this.getWarehouse();
    }
  }
</script>

<style scoped lang="scss">
@import '~@/scss/color.scss';
  .pop-warehouse-container {
    position: relative;
    margin: .1rem auto;
    padding: .06rem .1rem;
    width: 95%;
    box-sizing: border-box;
    background: #fff;
    .title {
      color: #757575;
      font-size: .12rem;
    }
    .mode {
      font-weight: 500;
      &.required{
        font-weight: bold;
      }
    }
    /* 右箭头 */
    .r-arrow {
      top: 50%;
      right: 1%;
      font-weight: bold;
      position: absolute;
      transform: translate(0, -50%);
    }
    // 用户信息
    .user_info {
      color: #111;
      font-size: 0;
      font-weight: 500;
      // 用户姓名
      .user_name {
        margin-right: .08rem;
        font-size: .16rem;
      }
      // 用户电话
      .user_tel {
        font-family: sans-serif, -apple-system-font;
        font-size: .16rem;
      }
    }
    // 仓库信息
    .cp_info {
      .icon-icon-test {
        font-size: .1rem;
      }
      .cp_ads {
        color: #757575;
        font-size: .14rem;
      }
    }
  }
  .required {
    color: $required;
    font-weight: bold;
  }
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: .08rem 0;
        font-size: .2rem;
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
          padding: .04rem .04rem 0 .3rem;
        }
        // 列表项
        .pop-mater-list-item {
          position: relative;
          display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          // 列表主体
          .pop-list-main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料信息
            .pop-list-info {
              color: #757575;
              font-size: .14rem;
              // 有颜色包裹的
              .withColor {
                margin-top: .04rem;
                .name {
                  color: #5077aa;
                  font-size: .14rem;
                  font-weight: bold;
                }
                .creator {
                  color: #111;
                  font-weight: bold;
                }
              }
            }
          }
          // 选择icon
          .selIcon,
          .isSelIcon {
            top: 50%;
            left: -.3rem;
            position: absolute;
            transform: translate(0, -50%);
          }
          .isSelIcon {
            fill: #5077aa;
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
