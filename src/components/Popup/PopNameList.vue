<template>
  <div class="pop-name-list-container" @click="itemClick">
    <template v-if="!selItems.PROJECT_NAME">
      <div class="title required">项目名称</div>
      <div class="mode">请选择项目</div>
      <i class="iconfont icon-youjiantou r_arrow"></i>
    </template>
    <template v-else>
      <div class="user_info">
        <div class="user_name">
          {{selItems.PROJECT_NAME}}<span class="symbol"> [项目名称]</span>
        </div>
      </div>
      <div class="cp_info">
        <div class="cp_manager">
          {{selItems.PROJECT_MANAGER}}<span class="symbol"> [项目经理]</span>
        </div>
        <div class="cp_name">
          <template v-if="selItems.PROJECT_TYPE">
            {{selItems.PROJECT_TYPE}}<span class="symbol"> [项目大类]</span>
          </template>
          <template v-if="selItems.PROJECT_SUBCLASS">
            {{selItems.PROJECT_SUBCLASS}}<span class="symbol"> [项目子类]</span>
          </template>
        </div>
        <p class="cp_name" v-if="selItems.COMMENT">
          {{selItems.COMMENT}}<span class="symbol"> [项目说明]</span>
        </p>
        <p class="cp_ads">预期开始日期: {{selItems.EXPECT_START_DATE | handlerDate}}</p>
        <p class="cp_ads">预期截止日期: {{selItems.EXPECT_END_DATE | handlerDate}}</p>
      </div>
      <x-icon class="r_arrow" type="ios-arrow-right" size="30" v-show="isChoice"></x-icon>
    </template>
    <!-- 项目计划popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" :isFill="true"></d-search>
          <!-- 项目计划列表 -->
          <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !dealerList.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="each_mater box_sd" v-for="(item, index) in dealerList" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="mater_main ">
                <div class="mater_info">
                  <!-- 项目名称 -->
                  <div class="mater_name">
                    {{item.PROJECT_NAME}}<span class="symbol"> [项目名称]</span>
                  </div>
                  <div class="mater_detail">
                    <!-- 项目经理 -->
                    <div class="mater_manager">
                      {{item.PROJECT_MANAGER}}<span class="symbol"> [项目经理]</span>
                    </div>
                    <!-- 项目说明 -->
                    <div class='mater_comment' v-if="item.COMMENT">
                      {{item.COMMENT}}<span class="symbol"> [项目说明]</span>
                    </div>
                    <div class="mater_time">
                      <div>预期开始日期: {{item.EXPECT_START_DATE | handlerDate}}</div>
                      <div>预期截止日期: {{item.EXPECT_END_DATE | handlerDate}}</div>
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
  import {Icon, Popup, LoadMore, AlertModule, TransferDom} from 'vux'
  import DSearch from 'components/search/search'
  import BScroll from 'better-scroll'
  import {getProjectApproval} from 'service/projectService'
  import RScroll from 'plugins/scroll/RScroll'

  export default {
    name: "PopNameList",
    props: {
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, DSearch, LoadMore, RScroll,
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: {}, // 哪些被选中了
        dealerList: [],
        bScroll: null,
        limit: 10,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
        isChoice: true,//是否显示右箭头
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      defaultValue(val) {
        this.selItems = JSON.parse(JSON.stringify(this.defaultValue));
      },
    },
    filters:{
      handlerDate(val){
        return val.split(' ')[0]
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
        return this.selItems.PROJECT_NAME === sItem.PROJECT_NAME;
      },
      // 选择项目计划
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = sItem;
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
      // 获取项目计划列表
      getDealer() {
        let filter = [];
        let params = {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
        };
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'PROJECT_NAME',
            },
          ];
          params.filter = JSON.stringify(filter);
        }
        getProjectApproval(params).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          // for (let i = 0; i < tableContent.length; i++) {
          //   tableContent[i].EXPECT_START_DATE = tableContent[i].EXPECT_START_DATE.split(' ')[0];
          //   tableContent[i].EXPECT_END_DATE = tableContent[i].EXPECT_END_DATE.split(' ')[0];
          // }
          this.dealerList = this.page === 1 ? tableContent : [...this.dealerList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })

      },
      // 搜索项目计划
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.dealerList = [];
        this.page = 1;
        this.hasNext = true;
        this.getDealer();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getDealer();
      },
      // 点击展示弹窗
      itemClick() {
        this.showPop = true;
      }
    },
    created() {
      this.selItems = JSON.parse(JSON.stringify(this.defaultValue));
      if (this.$route.query.relationKey){
        this.isChoice = false;
      }
      this.getDealer();
    },
  }
</script>

<style scoped lang="scss">
  .pop-name-list-container {
    width: 95%;
    position: relative;
    margin: 10px auto;
    background: #fff;
    padding: .06rem .08rem;
    box-sizing: border-box;
    .title {
      color: #757575;

      font-size: .12rem;
    }
    .mode {
      color: #111;
      font-weight: 500;
    }
    .required{
      color:#5077aa;
      font-weight: bold;
    }
    .r_arrow {
      top: 50%;
      right: 7px;
      position: absolute;
      transform: translate(0, -50%);
    }
    .user_info {
      font-size: .18rem;
    }
    .cp_info {
      p {
        margin-right: 30px;
      }
      .cp_manager {
        color: #111;
        font-size: .18rem;
      }
      .cp_name {
        font-size: .14rem;
        font-weight: normal;
      }
      .cp_ads {
        font-size: .14rem;
      }
    }
  }

  .symbol {
    color: #757575;
    font-size: .1rem;
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
      // 顶部
      .title {
        height: 100%;
        font-size: .2rem;
        position: relative;
        padding-top: 0.08rem;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 项目计划列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 每个项目计划
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
          // 项目计划图片
          .mater_img {
            display: inline-block;
            width: .75rem;
            height: .75rem;
            img {
              width: 100%;
              max-height: 100%;
            }
          }
          // 项目计划主体
          .mater_main {
            flex: 1;
            box-sizing: border-box;
            display: inline-block;
            // 项目计划信息
            .mater_info {
              color: #757575;
              font-size: .16rem;
              // 项目名称
              .mater_name {
                color: #111;
                font-size: .18rem;
                font-weight: bold;
                .symbol {
                  font-weight: normal;
                }
              }
              // 项目经理
              .mater_manager {
                color: #111;
                font-size: .16rem;
              }
              // 项目说明
              .mater_comment {
                font-size: .12rem;
                color: #111;
              }
              // 项目时间
              .mater_time {
                margin-top: .1rem;
                font-size: .12rem;
              }
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

  .editAds {
    width: 100%;
    height: 100%;
    background: #fff;
  }
</style>
