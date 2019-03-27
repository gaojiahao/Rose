<template>
  <div class="pop-entity-list" @click="itemClick">
    <div class="title">经办主体</div>
    <div v-if='selItems.dealerName'>
      <div class="cp_info">
        <p class="cp_name">{{selItems.dealerName}}</p>
      </div>
    </div>
    <div v-else>
      <div class="mode">请选择经办主体</div>
    </div>
    <i class="iconfont icon-youjiantou r_arrow"></i>

    <!-- 经办主体弹窗 -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <m-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></m-search>
          <!-- 费用列表 -->
          <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp"
                    ref="bScroll">
            <div class="each_mater box_sd" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="mater_main ">
                <!-- 名称 -->
                <div class="dealer_name">
                  {{item.dealerName}}
                </div>
                <!-- 编码 -->
                <div class="dealer_code">
                  {{item.dealerCode}}
                </div>
              </div>
              <!-- icon -->
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup,} from 'vux'
  import {getObjDealerByLabelName} from 'service/common/commonService'
  import RScroll from 'plugins/scroll/RScroll'
  import MSearch from 'components/search/search'

  export default {
    name: "PopEntityList",
    props: {
      // 默认值
      value: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    components: {
      Icon, Popup, RScroll, MSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: {}, // 哪些被选中了
        tmpItems: [],
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
    watch: {
      value: {
        handler(val) {
          this.selItems = {
            ...val
          };
        }
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
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.dealerName === sItem.dealerName;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = {...sItem};
        this.$emit('input', this.selItems);
      },
      // 获取物料列表
      getList() {
        let filter = [];

        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName'
            },
          ];
        }
        return getObjDealerByLabelName({
          dealerLabelName: '内部公司',
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          if (!Object.keys(this.selItems).length) {
            this.selItems = this.listData[0];
          }
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 搜索物料
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getList();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      itemClick() {
        this.showPop = true;
      }
    },
    created() {
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  .pop-entity-list {
    position: relative;
    margin: 10px auto;
    padding: .06rem .4rem .06rem .08rem;
    width: 95%;
    box-shadow: 0 0 8px #e8e8e8;
    box-sizing: border-box;
    .title {
      color: #757575;

      font-size: .12rem;
    }
    .r_arrow {
      top: 50%;
      right: 7px;
      position: absolute;
      transform: translate(0, -50%);
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
      height: 100%;
      // 顶部
      .title {
        height: 100%;
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
      // 主体列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .04rem 0 .3rem;
        }
        // 每个主体
        .each_mater {
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
          // 物料图片
          .mater_img {
            display: inline-block;
            width: .75rem;
            height: .75rem;
            img {
              width: 100%;
              max-height: 100%;
            }
          }
          // 物料主体
          .mater_main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料名称
            .dealer_name {
              overflow: hidden;
              color: #5077aa;
              font-size: .14rem;
              font-weight: bold;
              max-height: .46rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
            }
            // 物料信息
            .dealer_code {
              font-weight: bold;
              color: #757575;
              font-size: .14rem;
            }
          }
          // 下划线
          .vux-1px-b:after {
            border-bottom: 1px solid #e8e8e8;
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
</style>
