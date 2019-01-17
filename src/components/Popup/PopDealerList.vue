<template>
  <div class="pop-dealer-list">
    <div class='dealer-info' @click="showDealerPop = !showDealerPop">
      <div class='user-content' v-if="dealerInfo.dealerCode">
        <div class="user-info">
          <div class="user-name">
            <span>{{dealerInfo.dealerName}}</span>
          </div>
          <div class="cp-info">
            <span class="icon-dealer-address"></span>
            <span class="cp-ads" v-if="noAddress">暂无联系地址</span>
            <span class="cp-ads" v-else>
              {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}
            </span>
          </div>
        </div>
        <span class='icon-right'></span>  
      </div>
      <div class='no-content' v-else>
        <span class="title">{{dealerTitle}}列表</span>
        <div class="picker">
          <span>请选择</span>
          <span class="icon-right"></span>
        </div> 
      </div>
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
            <div class="dealer-list-wrapper">
              <div class="each_dealer" :class="{selected: showSelIcon(item)}" v-for="(item, index) in dealerList"
                   :key="index" @click.stop="selDealer(item,index)">
                <img class="dealer_img" :src="require('assets/default/company2.png')" alt="dealer_img">
                <div class="dealer_main">
                  <div class="dealer_name">{{item.dealerName}}</div>
                  <div class="dealer_address">{{item.dealerAddress}}</div>
                  <div class="dealer_detail">
                    <div class="dealer_phone_wrapper">
                      <i class="icon icon-mobile"></i>
                      <span :class="{mobile: item.dealerMobilePhone}">{{item.dealerMobilePhone || '暂无'}}</span>
                    </div>
                    <div class="dealer_phone_wrapper">
                      <i class="icon icon-phone"></i>
                      <span class="phone">{{item.dealerPhone || '暂无'}}</span>
                    </div>
                  </div>
                </div>
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
  import {requestData} from 'service/commonService'
  import BScroll from 'better-scroll'
  import PopContactList from 'components/Popup/dealer/PopContactList'

  export default {
    name: "PopDealerList",
    props: {
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
      dealerParams: {
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
      dealerParams: {
        handler() {
          this.getDealer()
        }
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
        let data = {
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          ...this.dealerParams.data,
        }
        return requestData({
          url: this.dealerParams.url,
          data
        }).then(({dataCount = 0, tableContent = []}) => {
          let DEALERLIST_SELITEMS = JSON.parse(sessionStorage.getItem('DEALERLIST_SELITEMS')) || '';
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          tableContent.forEach(item => {
            let {province = '', city = '', county = '', address = ''} = item;
            item.dealerAddress = !province && !city && !county && !address ? '暂无联系地址' : `${province}${city}${county}${address}`;
          });
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
        let pickVal = this.dealerTitle;
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
      },
    },
    created() {
      this.initScroll();
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
  .pop-dealer-list {
    background: #fff;
    padding: 0 .15rem;
    margin-bottom: 0.1rem;
    font-size: .14rem;
    color: #333;
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
      padding: .18rem 0;
      position: relative;
      .no-content{
        display: flex;
        justify-content: space-between;
        line-height: .14rem;
        .title{
          color: #696969
        }
        .picker{
          display: flex;
          align-items: center;
          .icon-right{
            width: .08rem;
            height: .14rem;
            margin-left: .1rem;
          }
        }
        
      }
      .user-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .user-info {
          font-size: 0;
          color: #111;
          font-weight: 500;
          // 客户名称
          .user-name {
            max-width: 95%;
            overflow: hidden;
            font-size: .14rem;
            line-height: .14rem;
            white-space: nowrap;
            display: inline-block;
            vertical-align: middle;
            text-overflow: ellipsis;
          }
          // 地址
          .cp-info {
            color: #111;
            display: flex;
            align-items: center;
            margin-top: .06rem;
            .icon-dealer-address {
              width: .12rem;
              height: .14rem;
              margin-right: .07rem;
            }
            .cp-ads {
              font-size: .12rem;
              color: #999;
            }
          }
        }
        .icon-right{
          width: .08rem;
          height: .14rem;
        }
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
        height: calc(100% - .5rem);
        .dealer-list-wrapper {
          position: relative;
          width: 100%;
          padding: .05rem .15rem 0;
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
        .each_dealer {
          display: flex;
          padding: .15rem;
          position: relative;
          margin-bottom: .1rem;
          border-radius: .04rem;
          color: #333;
          box-sizing: border-box;
          box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
          &.selected {
            border: 1px solid $main_color;
          }
          .dealer_img {
            width: .4rem;
            height: .4rem;
          }
          .dealer_main {
            margin-left: .12rem;
            .dealer_name {
              line-height: .18rem;
              font-size: .16rem;
              font-weight: bold;
            }
            .dealer_address {
              margin-top: .08rem;
              line-height: .16rem;
              color: #999;
              font-size: .12rem;
            }
            .dealer_detail {
              display: flex;
              margin-top: .16rem;
            }
            .dealer_phone_wrapper {
              display: flex;
              align-items: center;
              line-height: .12rem;
              color: #696969;
              font-size: .12rem;
              & + .dealer_phone_wrapper {
                margin-left: .16rem;
              }
            }
            .icon {
              display: inline-block;
              margin-right: .08rem;
              width: .16rem;
              height: .16rem;
            }
            .mobile {
              color: $main_color;
            }
          }
        }
      }
    }
  }
</style>
