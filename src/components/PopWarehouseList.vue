<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <div class="search_part">
            <input class="srh_inp" type="text" v-model="srhInpTx" @input="searchList">
            <div class="pop_cancel" @click="showPop = !showPop">返回</div>
            <x-icon class="serach_icon" type="ios-search" size="20"></x-icon>
            <icon class="clear_icon" type="clear" v-if="srhInpTx" @click.native="clearList"></icon>
          </div>
        </div>
        <!-- 仓库列表 -->
        <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp"
                  @on-pulling-down="onPullingDown" ref="bScroll">
          <div class="pop-list-item box_sd" v-for="(item, index) in listData" :key='index'
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
                    <span class='creator'>{{item.creatorName}}</span>
                  </div>
                </div>
                <!-- 地址 -->
                <div class="withoutColor">
                  <!--<span>{{item.warehouseProvince}}{{item.warehouseCity}}{{item.warehouseDistrict}}{{item.warehouseAddress}}</span>-->
                  <span>{{item.warehouseRelType}}</span>
                </div>
              </div>
            </div>
            <!-- icon -->
            <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_num"> {{tmpItems.length ? `已选 ${tmpItems.length} 个` : '请选择'}} </span>
        <span class="count_btn" @click="selConfirm">确定</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup, TransferDom} from 'vux'
  import {getList} from 'service/commonService'
  import RScroll from 'components/RScroll'

  export default {
    name: "PopWarehouseList",
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll,
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [],
        listData: [],
        limit: 10,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        }
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
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
        this.tmpItems = {...this.selItems};
        this.$emit('input', false);
      },
      clearList() {
        this.srhInpTx = '';
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getList();
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.tmpItems.transCode === sItem.transCode;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        this.tmpItems = sItem;
      },
      // TODO 确定选择仓库
      selConfirm() {
        let sels = [];
        // 返回上层
        this.showPop = false;
        this.selItems = {...this.tmpItems};
        this.$emit('sel-item', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/mater01.jpg');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 获取仓库列表
      getList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'warehouseName',
              // attendedOperation: 'or'
            }];
        }
        return getList(2129, {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // TODO 搜索仓库
      searchList() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getList();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // TODO 下拉刷新
      onPullingDown() {
        this.page = 1;
        this.getList(true).then(() => {
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullDown().then(() => {
              this.$refs.bScroll.finishPullUp();
            });
          })
        });
      },
    },
    created() {
      this.showPop = this.show;
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding-top: 0.08rem;
        // 搜索
        .search_part {
          width: 100%;
          display: flex;
          height: .3rem;
          line-height: .3rem;
          position: relative;
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
            background: #fc3c3c;
            border-top-right-radius: .3rem;
            border-bottom-right-radius: .3rem;
          }
          // 搜索icon
          .serach_icon {
            top: 50%;
            left: 10px;
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
        // 关闭icon
        .close_icon {
          top: 50%;
          right: -2%;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .52rem);
        /deep/ .scroll-wrapper {
          padding: .14rem .04rem 0 .3rem;
        }
        // 列表项
        .pop-list-item {
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
    // 底部栏
    .count_mode {
      left: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      height: .44rem;
      position: fixed;
      line-height: .44rem;
      background: #fff;
      .count_num {
        flex: 2.5;
        color: #5077aa;
        font-size: .24rem;
        padding-left: .1rem;
      }
      .count_btn {
        flex: 1.5;
        color: #fff;
        text-align: center;
        background: #5077aa;
      }
    }
  }
</style>
