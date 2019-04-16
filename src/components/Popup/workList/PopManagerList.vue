<template>
    <!-- 项目经理pop -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide"></d-search>
          <!-- 经理列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-mater-list-item box_sd" :class="{selected: showSelIcon(item)}" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="pop-list-main ">
                <div class="pop-list-info">
                  <!--联系人电话 -->
                  <div class="withColor">
                    <div class="ForInline name" style="display:inline-block">
                      <span>{{item.dealerName}}</span>
                    </div>
                    <div class="ForInline name" style="display:inline-block">
                      <span></span>
                    </div>
                  </div>
                  <div class="withColor" v-if="item.dealerMobilePhone">
                    <div class="ForInline " style="display:inline-block">
                      <span class='creator'>{{item.dealerMobilePhone}}</span>
                    </div>
                  </div>
                  <!-- 地址 -->
                  <div class="withoutColor">
                    <span>{{item.province}}{{item.city}}{{item.county}}{{item.address}}</span>
                  </div>
                </div>
              </div>
              <!-- icon -->
              <!-- <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon> -->
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
</template>

<script>
  import {Icon, Popup, TransferDom, LoadMore} from 'vux'
  import {getObjDealerByLabelName} from 'service/common/commonService'
  import RScroll from 'plugins/scroll/RScroll'
  import DSearch from 'components/search/search'

  export default {
    name: "PopManagerList",
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, RScroll, DSearch,LoadMore,
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
      }
    },
    computed: {
      tip() {
        let tip = '加载中';
        if (!this.hasNext) {
          tip = '暂无数据'
        }
        return tip;
      }
    },
    watch: {
      show(val) {
       this.showPop = val
      },
      defaultValue(val) {
        this.setDefaultValue();
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
        this.$emit('input', false)
      },
      clearList() {
        this.srhInpTx = '';
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getList();
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.dealerName === sItem.dealerName;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = sItem;
        this.$emit('sel-item', this.selItems);
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
      getList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName',
            }];
        }
        return getObjDealerByLabelName({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          dealerLabelName: '员工',
          filter: JSON.stringify(filter),
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
        this.getList();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // 设置默认值
      setDefaultValue() {
        this.selItems = this.defaultValue ? {...this.defaultValue} : {};
      },
    },
    created() {
      this.setDefaultValue();
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
@import '~@/scss/color.scss';
  // 居中
  .mg_auto {
    width: 95%;
    margin: 10px auto;
  }

  // 阴影
  .box_sd {
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
  }

  // 地址栏
  .or_ads {
    position: relative;
    box-sizing: border-box;
    padding: .06rem .4rem .06rem .08rem;
    background: #fff;
    .icon-gengduo {
      top: 50%;
      right: .1rem;
      font-size: .24rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    .title {
      color: #757575;

      font-size: .12rem;
    }
    .mode {
      color: #111;
      font-weight: 500;
    }
    .required{
      color: #5077aa;
      font-weight: bold;
    }
    .r_arrow {
      top: 50%;
      right: 7px;
      position: absolute;
      transform: translate(0, -50%);
    }
    // 用户信息
    .user_info {
      color: #111;
      font-size: .16rem;
      font-weight: 500;
      // 用户姓名
      .user_name {
        margin-right: .02rem;
      }
      // 用户电话
      .user_tel {
        font-size: .14rem;
        font-family: sans-serif, -apple-system-font;
      }
    }
    // 公司信息
    .cp_info {
      .cp_name {
        color: #111;
        font-weight: 500;
      }
      .cp_ads {

        color: #757575;
      }
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
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
          padding: .05rem .15rem 0;
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
            box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
          }
          &.selected {
            border: 1px solid $main_color;
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
