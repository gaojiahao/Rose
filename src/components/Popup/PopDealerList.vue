<template>
  <div class="pop-dealer-list">
    <div class='dealer-info' @click="showDealerPop = !showDealerPop">
      <div class='user-content' v-if="dealerInfo.dealerCode">
        <div class="user-info">
          <!-- <div class="user-name">
            <span>{{dealerInfo.dealerName || dealerInfo.nickname}}</span>
          </div> -->
          <div class="cp-info">
            <span class="cp-ads-box">往来名称</span>
            <span class="cp-ads">{{dealerInfo.dealerName || dealerInfo.nickname}}</span>
          </div>
          <div class="cp-info">
            <span class="cp-ads-box">联系地址</span>
            <span class="cp-ads" >{{dealerInfo.address}}</span>
          </div>
          <div class="cp-info">
            <span class="cp-ads-box">往来关系</span>
            <span class="cp-ads">{{dealerInfo.dealerLabelName}}</span>
          </div>
          <div class="cp-info" style=" display:none;">
            <span class="cp-ads-box">往来余额</span>
            <span class="cp-ads">{{dealerInfo.amntBal}}</span>
          </div>
        </div>
        <span class='icon-right'></span>
      </div>
      <div class='no-content' v-else>
        <span class="title required">{{dealerTitle}}列表</span>
        <div class="picker">
          <span>请选择</span>
          <span class="icon-right"></span>
        </div>
      </div>
    </div>
    <pop-contact-list :dealer-info="dealerInfo" :default-value="contactInfo" @sel-contact="selContact" v-if="!noContact">
    </pop-contact-list>
    <!-- 往来 Popup -->
    <div v-transfer-dom>
      <popup v-model="showDealerPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="popup-top">
          <i class="icon-close" @click="onHide"></i>
        </div>
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide"></d-search>
          <!-- 往来列表 -->
          <div class="mater_list" ref="dealer">
            <div class="dealer-list-wrapper">
              <div class="each_dealer" :class="{selected: showSelIcon(item, index)}" v-for="(item, index) in dealerList"
                   :key="index" @click.stop="selDealer(item, index)">
                <img class="dealer_img" :src="require('assets/default/company2.png')" alt="dealer_img">
                <div class="dealer_main">
                  <div class="dealer_name">{{item.dealerName || item.nickname}}</div>
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
              <div class="when-null" v-if="srhInpTx && !dealerList.length && !hasNext" slot="loadmore">
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
    <div class="materiel_list" v-for="(item, index) in jineData" :key='index'>
      <group class='costGroup'>
        <cell title='item.fieldLabel' :value="dealerInfo.amntBal" v-if= 'item.fieldCode == "thenTotalAmntBal"'>
          <template slot="title">
            <span class='norequired'>{{item.fieldLabel}}</span>
          </template>
        </cell>
        <x-input title='item.fieldLabel' text-align='right' placeholder='请填写' @on-focus="getFocus($event)"
                  @on-blur="checkAmt(item,item.fieldCode,item.applicationAmount)" type='number' v-model.number='item.applicationAmount' v-if= 'item.fieldCode == "applicationAmount"'>
          <template slot="label">
            <span class='required'>{{item.fieldLabel}}
            </span>
          </template>
        </x-input>
      </group>
    </div>
  </div>
</template>

<script>
import {Icon, Popup, LoadMore, AlertModule, TransferDom, XInput, Group, Cell} from 'vux'
import DSearch from 'components/search/search'
import dealerService from 'service/dealerService'
import {requestData} from 'service/commonService'
import BScroll from 'better-scroll'
import PopContactList from 'components/Popup/dealer/PopContactList'
import { constants } from 'crypto';
// mixins 引入
import ApplyCommon from 'mixins/applyCommon'
import {toFixed} from '@/plugins/calc'
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
    },
    jineData: {
      type: Array,
      default() {
        return []
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
    Icon, Popup, DSearch, LoadMore, PopContactList, XInput, Group , Cell
  },
  data() {
    return {
      page: 1,
      limit: 10,
      srhInpTx: '',           // 搜索框内容
      selItems: [],           // 哪些被选中了
      dealerList: [],
      dealerInfo: {},         // 往来信息
      contactInfo: {},        // 联系人信息
      bScroll: null,
      hasNext: true,
      showDealerPop: false,
    }
  },
  watch: {
    // 默认往来（缓存等）
    defaultValue: {
      handler() {
        if (JSON.stringify(this.defaultValue) === '{}') return;

        let defaultValue = this.defaultValue;
        this.dealerInfo = Object.freeze({...defaultValue});
        this.selItems = [{...defaultValue}]
      },
      immediate: true
    },
    // 默认联系人（缓存等）
    defaultContact: {
      handler() {
        this.contactInfo = Object.freeze({...this.defaultContact});
      },
      immediate: true
    },
    dealerParams: {
      handler() {
        this.getDealer();
      },
      deep: true
    }
  },
  methods: {
    // 弹窗展示时调用
    onShow() {
      this.$nextTick(() => {
        if (this.bScroll) {
          this.bScroll.refresh();
        }
      })
    },
    // 弹窗隐藏时调用
    onHide() {
      this.showDealerPop = false;
    },
    // 判断是否展示选中图标
    showSelIcon(sItem) {
      return this.selItems.findIndex(item => item.colId === sItem.colId) !== -1;
    },
    // 输入框获取焦点，内容选中
    getFocus(e) {
      event.currentTarget.select();
    },
    checkAmt(item, key, val) {
      let { tdQty, taxRate, qtyBal, qtyStock, qtyBalance, 
        assistQty, qtyStockBal, qtyOnline, qtyDownline} = item;

      item[key] = Math.abs(toFixed(val));

      // 数量
      if (key === 'tdQty' && tdQty) {
        // qtyStockBal为销售出库的库存，数量不允许大于余额
        if (!qtyStockBal && !qtyStock && qtyBal && tdQty > qtyBal) {
          item.tdQty = qtyBal;
        }
        else if (qtyStockBal && tdQty > qtyStockBal) { // 数量不允许大于库存
          item.tdQty = qtyStockBal;
        }
        //qtyStock为物料领料，数量不允许大于库存
        else if (qtyStock && tdQty > qtyStock) {
          item.tdQty = qtyStock;
        }
        else if (qtyBalance && tdQty > qtyBalance) {
          item.tdQty = qtyBalance;
        }
        else if (qtyOnline && qtyDownline) {
          /** 
           *  @assistQty  辅助计量 数量
           *  @qtyDownline  数量下限
           *  @qtyOnline  数量上限
           *  只有当符合下列条件时 数据才会相应的动态赋值
           */ 
          if (assistQty >= qtyDownline && assistQty <= qtyOnline) {
            this.defineObjVal(item, item.otherField, item.otherField)
          }
          else {
            this.defineObjVal(item, item.otherField, '')
          }
        }
      }
      //税率
      if (taxRate) {
        item.taxRate = Math.abs(toFixed(taxRate));
      }
    },
    // 选择往来
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
    // 获取往来列表
    getDealer() {
      // 存在搜索字段
      let filter = [];
      if (this.srhInpTx) {
        //暂时性处理不同数据源，过滤字段问题
        if(this.dealerParams.url = '/H_roleplay-si/ds/getPaymentContacts') {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'nickname',
            },
          ];  
        } else {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'dealerName',
            },
          ];
        }
      }

      // 请求参数
      let data = {
        page: this.page,
        limit: this.limit,
        filter: JSON.stringify(filter),          
        start: (this.page - 1) * this.limit,
        ...this.dealerParams.data,
      }

      // 发起请求
      return requestData({ 
          data, 
          url: this.dealerParams.url 
      })
      .then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        
        tableContent.forEach(item => {
          let {province = '', city = '', county = '', address = ''} = item;
          item.dealerAddress = !province && !city && !county && !address ? '暂无联系地址' : `${address}`;
        });
        this.dealerList = this.page === 1 ? tableContent : [...this.dealerList, ...tableContent];
        this.$nextTick(() => {
          this.bScroll.refresh();
          if (!this.hasNext) {
            return
          }
          this.bScroll.finishPullUp();
        })
      })

    },
    // 搜索往来
    searchList({val = ''}) {
      this.srhInpTx = val;
      this.dealerList = [];
      this.page = 1;
      this.hasNext = true;
      this.getDealer();
    },
    // 初始化滚动
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
          color: #696969;
        }
        .required {
          color: #3296FA;
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
          font-weight: 500;
          flex: 1;
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
            margin-top: .06rem;
            line-height: .1rem;
            .icon-dealer-address {
              margin-top: .03rem;
              width: .12rem;
              height: .14rem;
              margin-right: .07rem;
            }
            .cp-ads {
              flex: 1;
              font-size: .12rem;
              color: #999;
            }
          }
        }
        .icon-right{
          width: .08rem;
          height: .14rem;
          margin-left: .15rem;
        }
      }
    }

  }

  // 弹出层
  .trade_pop_part {
    background: #fff;
    .popup-top {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 .15rem;
      height: .4rem;
      background-color: #fff;
      .icon-close {
        display: inline-block;
        width: .14rem;
        height: .14rem;
      }
    }
    .trade_pop {
      height: calc(100% - .4rem);
      overflow: hidden;
      .search {
        padding-top: 0;
      }
      // 往来列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .42rem);
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
  .cp-ads-box {
    margin-right: .17rem;
    height: .14rem;
    font-size: .12rem;
    width: .5rem;
  }
  .costGroup {
    .required {
      color: #3296FA;
      font-weight: bold;
    }
    .norequired {
      color: #696969;
      //font-weight: bold;
      font-size: .14rem;
    }
    .vux-no-group-title {
      margin-top: 0.08rem;
      .weui-cell {
      padding: 10px 0px;  
    }
    }
    .weui-cells:after {
      border-bottom: none;
    }
    .vux-cell-box {
      .weui-cell {
        padding: 10px 0;
      }
      &:before {
        left: 0;
      }
    }
    // .weui-cell {
    //   padding: 10px 0;
    //   &:before {
    //     left: 0;
    //   }
    // }
    .required {
      font-size: .14rem;
    }
    .fontSize {
      font-size: .14rem;
    }
  }

  .weui-cells__title {
    padding-left: 0;
    font-size: 0.12rem;
  }

  .add_more {
    width: 100%;
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      margin: 0 5px;
      color: #fff;
      padding: .01rem .06rem;
      border-radius: .12rem;
    }
    .add {
      background: #5077aa;
    }
    .delete {
      background: red;
    }
    em {
      font-style: normal;
    }
  }
</style>
