<template>
  <div class="pop_dealer_list" @click="itemClick">
    <div v-if="dealerInfo.dealerCode" class='dealer-info'>
      <div class='user-content'>
        <div class="user-info">
          <div class="user-name">
            <span class="user-tips" v-if="dealerInfo.dealerLabelName">{{dealerInfo.dealerLabelName}}</span>
            <span>{{dealerInfo.dealerName}}</span>
          </div>
          <span class="user-tel" v-if="dealerInfo.dealerMobilePhone">{{dealerInfo.dealerMobilePhone}}</span>
        </div>
        <div class="cp-info">
          <span class="iconfont icon-icon-test"></span>
          <span class="cp-ads" v-if="noAddress">暂无</span>
          <span class="cp-ads" v-else>
            {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}
          </span>
        </div>
      </div>  
    </div>
    <div v-else>
      <div class="title">{{dealerLabelName}}列表</div>
      <div class="mode required">请选择{{dealerLabelName}}</div>
    </div>
    <span class="iconfont icon-youjiantou r-arrow"></span>          
    <!-- 往来popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <div class="title">
            <!-- 搜索栏 -->
            <d-search @search="searchList" @turn-off="onHide" :isFill="true"></d-search>
          </div>
          <!-- 往来列表 -->
          <div class="mater_list" ref="dealer">
            <div class="mater_list_wrapper">
              <div class="each_mater box_sd" v-for="(item, index) in dealerList" :key="index"
                   @click.stop="selThis(item,index)">
                <div class="mater_main ">
                  <div class="mater_info">
                    <!--联系人电话 -->
                    <div class="withColor">
                      <div class="ForInline " style="display:inline-block">
                        <span class='dealer'>{{item.dealerName}}</span>
                      </div>
                    </div>
                    <div class="withColor" v-if="item.dealerMobilePhone || item.dealerPhone">
                      <div class="ForInline name" style="display:inline-block">
                        <span style="marginRight:.04rem;"
                              v-if="item.dealerMobilePhone">{{item.dealerMobilePhone}}</span>
                        <span v-if="item.dealerPhone">{{item.dealerPhone}}</span>
                      </div>
                    </div>
                    <!-- 地址 -->
                    <div class="withoutColor">
                      <span>{{item.province}}{{item.city}}{{item.county}}{{item.address}}</span>
                    </div>
                  </div>
                </div>
                <!-- icon -->
                <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
              </div>
              <load-more tip="加载中" v-show="hasNext" slot="loadmore"></load-more>
              <!-- 当没有数据的时候 显示提醒文字 -->
              <div class="when-null" v-show="!dealerList.length && !hasNext" slot="loadmore">
                <div class="title">抱歉，没有找到您搜索的内容</div>
                <ul class="tips">
                  <li>
                    不用担心，您马上可以进行 <span class="addNew" @click="add">新增往来</span>
                  </li>
                  <li>
                    或者检查“输入内容”是否正确
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup, LoadMore, AlertModule, TransferDom} from 'vux'
  import DSearch from 'components/search'
  import dealerService from 'service/dealerService.js'
  import BScroll from 'better-scroll'

  export default {
    name: "PopDeakerList",
    props: {
      dealerLabelName: {
        type: String,
        default: "客户"
      },
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    computed: {
      noAddress() {
        let {province = '', city = '', county = '', address = ''} = this.defaultValue;
        return !province && !city && !county && !address;
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, DSearch, LoadMore
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        dealerList: [],
        bScroll: null,
        limit: 10,
        page: 1.,
        hasNext: true,
        dealerInfo: {},
      }
    },
    watch: {
      defaultValue: {
        handler() {
          this.dealerInfo = Object.freeze({...this.defaultValue});
          this.selItems = [{...this.defaultValue}]
        },
        immediate: true
      }
    },
    methods: {
      // TODO 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.bScroll) {
            this.bScroll.refresh();
          }
        })
      },
      // TODO 弹窗隐藏时调用
      onHide() {
        this.showPop = false;
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.dealerCode === sItem.dealerCode) !== -1;
      },
      // TODO 选择往来
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = [sItem];
        this.dealerInfo = Object.freeze({...sItem});
        sessionStorage.setItem('DEALERLIST_SELITEMS', JSON.stringify(this.selItems));
        this.$emit('sel-dealer', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 获取往来列表
      getDealer() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            // 搜索 往来名称 或  编码
            // {
            //   operator: 'like',
            //   value: this.srhInpTx,
            //   property: 'dealerCode',
            //   attendedOperation: 'or'
            // },
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName',
            },
          ];
        }
        dealerService.getAppdealer({
          dealerLabelName: this.dealerLabelName,
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          let DEALERLIST_SELITEMS = JSON.parse(sessionStorage.getItem('DEALERLIST_SELITEMS')) || '';
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.dealerList = this.page === 1 ? tableContent : [...this.dealerList, ...tableContent];
          //获取缓存
          if (DEALERLIST_SELITEMS) {
            this.selItems = [...DEALERLIST_SELITEMS];
            [this.dealerInfo = {}] = this.selItems;
            this.$emit('sel-dealer', JSON.stringify(this.selItems));
            sessionStorage.removeItem('DEALERLIST_SELITEMS');
          }
          this.$nextTick(() => {
            this.bScroll.refresh();
            if (!this.hasNext) {
              return
            }
            this.bScroll.finishPullUp();
          })
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })

      },
      // TODO 搜索往来
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.dealerList = [];
        this.page = 1;
        this.hasNext = true;
        this.getDealer();
      },
      // TODO 初始化滚动
      initScroll() {
        this.$nextTick(() => {
          this.bScroll = new BScroll(this.$refs.dealer, {
            click: true,
            pullUpLoad: {
              threshold: 20
            },
          });
          // 绑定滚动加载事件
          this.bScroll.on('pullingUp', () => {
            if (!this.hasNext) {
              return
            }
            this.page++;
            this.getDealer();
          });
        })
      },
      //新增往来
      add() {
        let pickVal = this.dealerLabelName;
        this.$router.push({path: '/adress/edit_ads', query: {add: 1, pickVal: pickVal}})
      },
      itemClick() {
        this.showPop = true;
      }
    },
    created() {
      this.initScroll();
      this.getDealer();
    }
  }
</script>

<style scoped lang="scss">
  @import '~@/scss/color.scss';
  .required {
    color: $required;
  }
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .pop_dealer_list {
    width: 95%;
    margin: .1rem auto;
    position: relative;
    background: #fff;
    margin-bottom:0.1rem;
    box-sizing: border-box;
    padding: .06rem  .1rem;
    .title {
      color: #757575;
      font-size: .12rem;
    }
    .mode {
      // color: #111;
      font-weight: 500;
    }
    .r-arrow {
      top: 50%;
      right: 1%;
      font-weight: bold;
      position: absolute;
      transform: translate(0, -50%);
    }
    .user-content {
      padding-right: .1rem;
      .user-info {
        font-size: 0;
        color: #111;
        font-weight: 500;
        .user-tips {
          color: #FFF;
          font-size: .1rem;
          padding: 0 .06rem;
          border-radius: .3rem;
          background: #5077aa;
          vertical-align: text-bottom;
        }  
        .user-name {
          max-width: 2.2rem;
          overflow: hidden;
          font-size: .16rem;
          white-space: nowrap;
          margin-right: .04rem;
          display: inline-block;
          vertical-align: middle;
          text-overflow: ellipsis;
        }        
        .user-tel {
          font-size: .16rem;
          font-weight: bold;
          display: inline-block;
          font-family: Helvetica;
          vertical-align: middle;
          margin-bottom: -.02rem;
        }    
      }    
    }

    .cp-info {
      color: #111;
      .icon-icon-test {
        font-size: .1rem;
      }
      .cp-ads {
        font-size: .14rem;
        color: #757575;
      }
    }
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
        margin: 0.08rem 0;
        font-size: .2rem;
      }
      // 往来列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: 100%;
        padding: 0 .04rem 0 0;
        .mater_list_wrapper {
          position: relative;
          width: 100%;
          padding: .04rem .04rem 0 .3rem;
          overflow: hidden;
          box-sizing: border-box;
          // 当没有数据时
          .when-null {
            left: 50%;
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
        // 每个往来
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
          // 往来主体
          .mater_main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 往来信息
            .mater_info {
              color: #757575;
              font-size: .14rem;
              // 有颜色包裹的
              .withColor {
                .name {
                  color: #5077aa;
                  font-size: .14rem;
                  font-weight: bold;
                }
                .dealer {
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
</style>
