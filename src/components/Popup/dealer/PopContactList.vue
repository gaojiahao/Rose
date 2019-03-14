<template>
  <div class="pop-contact-list" v-show="contactInfo.dealerName || contactList.length">
    <div class="contact-content vux-1px-t" @click="showPop = !showPop">
      <div class="contact-info" >
        <template v-if="contactInfo.dealerName">
          <div>
            <span class="dealer-name">{{contactInfo.dealerName}}</span>
            <span>{{contactInfo.dealerMobilePhone}}</span>
          </div>
        </template>
        <template v-else>
          <span>请选择联系人</span>
        </template>
        <span class="icon-right"></span>
      </div>
    </div>
    <!-- 联系人 Popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow">
        <div class="trade_pop">
          <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !contactList.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="each-people box_sd" v-for="(item, index) in contactList" :key="index"
                 @click.stop="selContact(item, index)" :class="{selected: showSelIcon(item)}">
              <div class="mater_main ">
                <div class="mater_info">
                  <div class="user_photo">
                    <img src="~assets/ava01.png" alt="mater_img" >
                  </div>
                  <div class="pop-list-info">
                    <!-- 名字 -->
                    <div class="user_name">{{item.dealerName}}</div>
                    <!-- 用户id -->
                    <div class="user_code">
                      <span v-if="item.dealerMobilePhone">{{item.dealerMobilePhone}}</span>
                      <span v-if="item.dealerPhone">{{item.dealerPhone}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Popup, TransferDom} from 'vux'
  import DSearch from 'components/search/search'
  import RScroll from 'plugins/scroll/RScroll'
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
        handler(oldVal, newVal) {
          let newId;
          let oldId = oldVal.id || '';

          // 匹配当前选择的往来id 如果不一致则重新发起请求
          if (newVal) {
            newId = newVal.id || '';
          } 
          if (JSON.stringify(oldVal) !== '{}' && oldId !== newId) {
            this.resetCondition();
            this.getContact();
          }
        },
        immediate: true
      },
      defaultValue: {
        handler() {
          this.contactInfo = Object.freeze({...this.defaultValue})
        },
        immediate: true,
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
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.contactInfo.dealerName === sItem.dealerName;
      },
      // 获取 默认图片
      getDefaultImg(item) {
        let url = require('assets/ava01.png')
        return url;
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
      // 搜索往来
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.contactList = [];
        this.page = 1;
        this.hasNext = true;
        this.getContact();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getContact();
      },
      // 重新请求联系人列表
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
    font-size: .14rem;
    color: #333;
    .contact-content {
     padding: .18rem 0;
      .contact-info{
        line-height: .14rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .dealer-name{
        color: #3296FA;
        margin-right: .02rem;
      }
      .icon-right{
        width: .08rem;
        height: .14rem;
      }
    }
  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    /deep/ .scroll-wrapper {
      padding: .05rem .15rem 0;
      width: 100%;
      box-sizing: border-box;
    }
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
        height: 100%;
        // 每个往来
        .each-people {
          margin: .2rem 0;
          padding: .15rem;
          // 阴影
          &.box_sd {
            border-radius: .04rem;
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          &.selected {
            border: 1px solid $main_color;
          }
          // 往来主体
          .mater_main {
            box-sizing: border-box;
            // 往来信息
            .mater_info {
              font-size: .14rem;
              display: flex;
              .user_photo {
                width: .4rem;
                height: .4rem;
                margin-right: .12rem;
                img {
                  border-radius: 50%;
                  width: 100%;
                  height: 100%;
                }
              }
              .user_name {
                line-height: .16rem;
                font-size: .16rem;
                font-weight: 600;
                margin-top: .04rem;
              }
              .user_code {
                margin-top: .06rem;
                line-height: .12rem;
                color: #999;
                font-size: .12rem;
              }

            }
          }
        }
      }
    }
  }
</style>
