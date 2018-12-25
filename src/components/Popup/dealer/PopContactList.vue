<template>
  <div class="pop-contact-list" v-show="contactInfo.dealerName || contactList.length">
    <div class="contact-content vux-1px-t" @click="showPop = !showPop">
      <div class="selected-mode" v-if="contactInfo.dealerName">
        <div>
          <span class="contact-tips">联系人</span>
          <span>{{contactInfo.dealerName}}</span>
          <span>{{contactInfo.dealerMobilePhone}}</span>
        </div>
        <span class="iconfont icon-Face-ID"></span>
      </div>
      <div class="default-mode" v-else>
        <div class="mode-title">
          <span>请选择联系人</span>
          <span class="iconfont icon-FaceID"></span>
        </div>
      </div>
    </div>
    <!-- 联系人 Popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow">
        <div class="trade_pop">
          <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !contactList.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="each-people box_sd" v-for="(item, index) in contactList" :key="index"
                 @click.stop="selContact(item, index)">
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
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Popup, TransferDom} from 'vux'
  import DSearch from 'components/search'
  import RScroll from 'components/RScroll'
  import dealerService from 'service/dealerService'

  export default {
    name: "PopContactList",
    props: {
      // 默认值
      dealerInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    directives: {TransferDom},
    components: {
      Popup, DSearch, RScroll
    },
    data() {
      return {
        page: 1,
        limit: 10,
        hasNext: true,
        showDealerPop: false,
        showPop: false,
        srhInpTx: '',           // 搜索框内容
        bScroll: null,
        contactInfo: {},        // 联系人信息
        dealerList: [],
        contactList: [],        // 联系人列表
        scrollOptions: {
          pullUpLoad: true,
        },
      }
    },
    watch: {
      dealerInfo: {
        handler() {
          this.resetCondition();
          this.getContact();
        },
        immediate: true,
      },
      defaultValue: {
        handler() {
          this.contactInfo = Object.freeze({...this.defaultValue})
        },
        immediate: true,
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
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.contactInfo.dealerName === sItem.dealerName;
      },
      // 选择联系人
      selContact(item, index) {
        this.showPop = false;
        this.contactInfo = Object.freeze({...item});
        this.$emit('sel-contact', this.contactInfo);
      },
      // 获取联系人列表
      getContact() {
        return dealerService.getContactList({
          dealerCode: this.dealerInfo.dealerCode,
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.contactList = this.page === 1 ? tableContent : [...this.contactList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        })
      },
      // TODO 搜索往来
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.contactList = [];
        this.page = 1;
        this.hasNext = true;
        this.getContact();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getContact();
      },
      // TODO 重新请求联系人列表
      resetCondition() {
        this.page = 1;
        this.hasNext = true;
        this.contactList = [];
      },
    },
    created() {
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

  .pop-contact-list {
    background: #fff;
    box-sizing: border-box;
    .contact-content {
      margin-top: .06rem;
      padding-top: .06rem;
      .default-mode {
        .mode-title {
          display: flex;
          color: #757575;
          font-size: .14rem;
          align-items: center;
          justify-content: space-between;
        }
      }
      .selected-mode {
        display: flex;
        font-size: .16rem;
        align-items: center;
        justify-content: space-between;
        .contact-tips {
          color: #FFF;
          font-size: .1rem;
          padding: 0 .06rem;
          border-radius: .3rem;
          background: #5077aa;
          vertical-align: middle;
        }
      }
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    /deep/ .scroll-wrapper {
      padding: .04rem .04rem 0 .3rem;
      width: 100%;
      box-sizing: border-box;
    }
    .trade_pop {
      
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
