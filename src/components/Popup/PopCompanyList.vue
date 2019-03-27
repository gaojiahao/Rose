<template>
  <div class="pop-company-container vux-1px-b" @click="itemClick">
    <!-- 仓库信息 -->
    <div v-if="selItems.groupName">
      <div class="title">公司</div>
      <div class="user_info">
        <span class="user_name">{{selItems.groupName}}</span>
      </div>
    </div>
    <div v-else>
      <div class="title required">公司</div>
      <div class="mode">请选择公司</div>
    </div>
    <i class="iconfont icon-youjiantou r-arrow" v-show="!disabled"></i>

    <!-- 公司popup -->
    <div v-transfer-dom v-if="!disabled">
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" :isFill="true"></d-search>
          <!-- 仓库列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-mater-list-item box_sd" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="pop-list-main ">
                <div class="pop-list-info">
                  <!--联系人电话 -->
                  <div class="withColor">
                    <div class="ForInline name" style="display:inline-block">
                      <span>{{item.groupName}}</span>
                    </div>
                  </div>
                  <div class="withColor" v-if="item.companyType">
                    <div class="ForInline " style="display:inline-block">
                      <span class='creator'>{{item.companyType}}</span>
                    </div>
                  </div>
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
  import {Icon, Popup, TransferDom, LoadMore} from 'vux'
  import {getList} from 'service/common/commonService'
  import {getCompanyList} from 'service/Directorys/userService'
  import RScroll from 'plugins/scroll/RScroll'
  import DSearch from 'components/search/search'

  export default {
    name: "PopCompanyList",
    props: {
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
      params: {
        type: Object,
        default() {
          return {}
        }
      },
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
      }
    },
    watch: {
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
        return this.selItems.groupCode === sItem.groupCode;
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
        return getCompanyList({
          pageSize: this.limit,
          currentPage: this.page,
          search: this.srhInpTx,
          ...this.params,
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          //获取缓存
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
      // 点击仓库
      itemClick() {
        if (this.disabled) {
          return
        }
        this.showPop = !this.showPop;
      },
    },
    created() {
      this.setDefaultValue();
      if (this.disabled) {
        return
      }
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  .pop-company-container {
    position: relative;
    padding: .06rem .1rem;
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    .title {
      color: #757575;
      font-size: .12rem;
      &.required {
        color: #5077aa;
        font-weight: bold;
      }
    }
    .mode {
      color: #111;
      font-weight: 500;
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
