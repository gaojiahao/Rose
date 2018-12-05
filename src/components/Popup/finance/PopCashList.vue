<template>
  <div class="pop_dealer_list">
    <div class='dealer-info' @click="showDealerPop = !showDealerPop">
      <div class='user-content' v-if="selInfo.fundCode">
        <div class="user-info">
          <div class="user-name">
            <span class="user-tips">{{selInfo.fundType}}</span>
            <span>{{selInfo.fundName}}</span>
          </div>
        </div>
        <div class="cp-info">
          <span>编码: {{selInfo.fundCode}}</span>
          <span>余额: {{selInfo.thenAmntBal || selInfo.amntBal | numberComma}}</span>
        </div>
      </div>
      <div class='user-content' v-else>
        <div class="title">资金信息</div>
        <div class="required">请选择资金</div>
        <!-- <div>请选择资金信息</div> -->
      </div>
      <span class="iconfont icon-youjiantou r-arrow"></span>
    </div>
    <slot name="other" v-if="selInfo.fundCode"></slot>

    <!-- 资金列表pop -->
    <r-popup :show="showDealerPop" :data="listData" :options="scrollOptions" :has-next="hasNext" :default-value="defaultValue"
             :judge-keys="['fundCode']" @on-pulling-up="onPullingUp" @on-select="selItem" @on-search="searchList"
             v-model="showDealerPop">
      <template slot-scope="{item}" slot="pop-item">
        <div class="top">
          <span class="name">{{item.fundName}}</span>
          <span class="label">{{item.fundType}}</span>
        </div>
        <div class="amt">
          <span>编码: {{item.fundCode}}</span>
          <span>账户余额: {{item.thenAmntBal || item.amntBal | numberComma}}</span>
        </div>
      </template>
    </r-popup>
  </div>
</template>

<script>
  import { AlertModule, numberComma} from 'vux'
  import {getEmployeeReserveFunds, getSupplierToPayDeposit, getFundCashDiscount, getObjFundBalByType} from 'service/costService'
  import RPopup from 'components/Popup/commonPart/RPopup'

  export default {
    name: "PopCashList",
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      required: {
        type: Boolean,
        default: false
      },
      // 请求接口
      request: {
        type: String,
        default: '0'
      }
    },
    components: {
      RPopup,
    },
    data() {
      return {
        page: 1,
        limit: 10,
        hasNext: true,
        showDealerPop: false,
        srhInpTx: '',           // 搜索框内容
        selInfo: {},         // 往来信息
        selItems: [],           // 哪些被选中了
        listData: [],
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
        },
        requestMethods: null,
      }
    },
    watch: {
      defaultValue: {
        handler() {
          this.selInfo = Object.freeze({...this.defaultValue});
        },
        immediate: true
      },
    },
    methods: {
      // TODO 选择往来
      selItem(sItem) {
        this.selInfo = {...sItem};
        this.$emit('sel-item', {...sItem});
      },
      // TODO 获取往来列表
      getList() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'fundName',
            },
          ];
        }
        return this.requestMethods({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 搜索往来
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.getList();
      },
      onPullingUp() {
        this.page++;
        this.getList();
      }
    },
    filters: {
      numberComma,
    },
    created() {
      let serviceList = [getEmployeeReserveFunds, getSupplierToPayDeposit, getFundCashDiscount, getObjFundBalByType];
      this.requestMethods = serviceList[this.request];
      this.getList();
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

  .pop_dealer_list {
    width: 95%;
    margin: .1rem auto;
    background: #fff;
    margin-bottom: 0.1rem;
    box-sizing: border-box;
    padding: .06rem .1rem;
    .weui-cell{
      padding: .05rem 0;
      font-size: .14rem;
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
      position: absolute;
      top: 50%;
      right: -1%;
      font-weight: bold;
      transform: translate(0, -50%);
    }
    .dealer-info {
      position: relative;
      width: 100%;
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
            max-width: 90%;
            overflow: hidden;
            font-size: .16rem;
            white-space: nowrap;
            margin-right: .04rem;
            display: inline-block;
            vertical-align: middle;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .cp-info {
      font-size: .12rem;
      color: #757575;
    }
  }

  // 弹出层
  .r-popup-top {
    .top {
      display: flex;
      align-items: baseline;
      .name {
        margin-right: .05rem;
        font-size: .14rem;
        font-weight: bold;
      }
      .label {
        color: #757575;
        font-size: .12rem;
      }
    }
    .amt {
      margin-top: .05rem;
      color: #757575;
      font-size: .12rem;
    }
  }

</style>
