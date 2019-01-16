<template>
  <div class="pop_dealer_list" :class="{'dealer-list-2': mode === '2'}">
    <div class='dealer-info' @click="showDealerPop = !showDealerPop">
      <template v-if="mode === '2'">
        <div class="title" :class="{required : required}">{{dealerLabel}}名称</div>
        <div class="mode">{{dealerInfo.dealerName || placeholder}}</div>
        <span class="iconfont icon-youjiantou r-arrow"></span>
      </template>
      <template v-else>
        <div class='user-content' v-if="dealerInfo.dealerCode">
          <div class="user-info">
            <div class="user-name">
              <span class="user-tips" v-if="dealerInfo.dealerLabelName">{{dealerInfo.dealerLabelName}}</span>
              <span>{{dealerInfo.dealerName}}</span>
            </div>
            <!-- <span class="user-tel" v-if="dealerInfo.dealerMobilePhone">{{dealerInfo.dealerMobilePhone}}</span> -->
          </div>
          <div class="cp-info">
            <span class="iconfont icon-icon-test"></span>
            <span class="cp-ads" v-if="noAddress">暂无联系地址</span>
            <span class="cp-ads" v-else>
            {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}
          </span>
          </div>
        </div>
        <div class='user-content' v-else>
          <div class="title">{{dealerTitle}}列表</div>
          <div class="required">请选择{{dealerTitle}}</div>
        </div>
        <span class="iconfont icon-youjiantou r-arrow"></span>
      </template>
    </div>
    <pop-contact-list :dealer-info="dealerInfo" :default-value="contactInfo"
                      @sel-contact="selContact" v-if="!noContact"></pop-contact-list>
    <!-- 往来 Popup -->
    <div v-transfer-dom>
      <popup v-model="showDealerPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" :isFill="true"></d-search>
          <!-- 往来列表 -->
          <div class="mater_list" ref="dealer">
            <div class="mater_list_wrapper">
              <div class="each_mater box_sd" v-for="(item, index) in dealerList" :key="index"
                   @click.stop="selDealer(item, index)">
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
  import dealerService from 'service/dealerService'
  import BScroll from 'better-scroll'
  import PopContactList from 'components/Popup/dealer/PopContactList'

  export default {
    name: "PopDealerList",
    props: {
      // 用做请求接口的参数
      dealerLabelName: {
        type: String,
        default: "客户"
      },
      // 往来名称，dealerLabelName会有多个参数，所以需要单独传值
      dealerTitle: {
        type: String,
        default: '客户'
      },
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      // 联系人
      defaultContact: {
        type: Object,
        default() {
          return {}
        }
      },
      // 展示模式
      mode: {
        type: String,
        default: '1'
      },
      required: {
        type: Boolean,
        default: false
      },
      // 是否不展示联系人
      noContact: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      // 不记录选中的往来项
      noRecord: {
        type: Boolean,
        default: false
      },
      // 请求参数
      params: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    computed: {
      noAddress() {
        let {province = '', city = '', county = '', address = ''} = this.defaultValue;
        return !province && !city && !county && !address;
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, DSearch, LoadMore, PopContactList
    },
    data() {
      return {
        page: 1,
        limit: 10,
        hasNext: true,
        showDealerPop: false,
        srhInpTx: '',           // 搜索框内容
        bScroll: null,
        dealerInfo: {},         // 往来信息
        contactInfo: {},        // 联系人信息
        selItems: [],           // 哪些被选中了
        dealerList: [],
      }
    },
    watch: {
      defaultValue: {
        handler() {
          let defaultValue = this.defaultValue;
          this.dealerInfo = Object.freeze({...defaultValue});
          this.selItems = [{...defaultValue}]
        },
        immediate: true
      },
      defaultContact: {
        handler() {
          this.contactInfo = Object.freeze({...this.defaultContact});
        },
        immediate: true
      },
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
        this.showDealerPop = false;
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.dealerCode === sItem.dealerCode) !== -1;
      },
      // TODO 选择往来
      selDealer(sItem, sIndex) {
        this.showDealerPop = false;
        this.selItems = [sItem];
        this.dealerInfo = Object.freeze({...sItem});
        this.contactInfo = {};
        if (!this.noRecord) {
          sessionStorage.setItem('DEALERLIST_SELITEMS', JSON.stringify(this.selItems));
        }
        if (this.mode === '2') {
          this.$emit('sel-dealer', {...this.dealerInfo});
          return
        }
        this.$emit('sel-dealer', JSON.stringify(this.selItems));
      },
      // 选择联系人
      selContact(item) {
        this.$emit('sel-contact', item);
      },
      // TODO 获取往来列表
      getDealer() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName',
            },
          ];
        }
        return dealerService.getAppdealer({
          dealerLabelName: this.dealerLabelName,
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.params,
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
        this.$router.push({
          path: '/adress/edit_ads', 
          query: { 
            add: 1, 
            pickVal: pickVal 
          }
        })
      },
      itemClick() {
        this.showDealerPop = true;
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

  .vux-1px-t:before {
    border-color: #e8e8e8;
  }

  .required {
    color: $required;
    font-weight: bold;
  }

  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  .pop_dealer_list {
    width: 95%;
    position: relative;
    margin: .1rem auto;
    background: #fff;
    padding: .06rem .1rem;
    margin-bottom: 0.1rem;
    box-sizing: border-box;
    &.dealer-list-2 {
      margin: 0;
      padding: 0;
      width: 100%;
      .dealer-info {
        position: relative;
        display: flex;
        justify-content: space-between;
        padding: .1rem .2rem .1rem .1rem;
        width: 100%;
        box-sizing: border-box;
      }
      .title {
        font-size: .16rem;
      }
      .mode {
        color: #999;
      }
      .r_arrow {
        top: 50%;
        right: 7px;
        position: absolute;
        transform: translate(0, -50%);
        fill: #999;
      }
    }
    .title {
      color: #757575;
      font-size: .12rem;
      &.required {
        color: $required;
        font-weight: bold;
      }
    }
    .mode {
      font-weight: 500;
    }
    .r-arrow {
      top: 50%;
      right: -3px;
      font-weight: bold;
      position: absolute;
      transform: translate(0, -50%);
    }
    .dealer-info {
      width: 100%;
      position: relative;
      .user-content {
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
            vertical-align: middle;
          }
          .user-name {
            max-width: 95%;
            overflow: hidden;
            font-size: .16rem;
            white-space: nowrap;
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
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        height: 100%;
        font-size: .2rem;
        position: relative;
        padding-top: 0.08rem;
      }
      // 往来列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        padding: 0 .04rem 0 0;
        height: calc(100% - .45rem);
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
          display: flex;
          padding: 0.08rem;
          position: relative;
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
        .each-people {
          @extend .each_mater;
          margin: .2rem 0;
        }
      }
    }
  }
</style>
