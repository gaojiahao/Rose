<template>
  <r-popup :show="showPop" :data="listData" :options="scrollOptions" :has-next="hasNext"
           :default-value="defaultValue"
           :judge-keys="['draftNumber']" @on-pulling-up="onPullingUp" @on-select="selItem" @on-search="searchList"
           v-model="showPop" multipart>
    <template slot-scope="{item}" slot="pop-item">
      <div class="top">
        <span class="name">{{item.accepter}}</span>
        <span class="label">{{item.draftType}}</span>
      </div>
      <div class="amt">
        <span>汇票号: {{item.draftNumber}}</span>
        <span>金额: {{item.tdAmount | numberComma}}</span>
      </div>
      <div class="amt">
        <span>出票日: {{item.draftDate | dateFormat('YYYY-MM-DD')}}</span>
        <span>到期日: {{item.draftDueDate | dateFormat('YYYY-MM-DD')}}</span>
      </div>
    </template>
  </r-popup>
</template>

<script>
  import {numberComma, dateFormat} from 'vux'
  import {getInputDraft} from 'service/costService'
  import RPopup from 'components/Popup/commonPart/RPopup'

  export default {
    name: "PopMoneyOrderList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      // 默认值
      defaultValue: {
        type: Array,
        default() {
          return []
        }
      },
      required: {
        type: Boolean,
        default: false
      },
    },
    components: {
      RPopup,
    },
    data() {
      return {
        page: 1,
        limit: 10,
        hasNext: true,
        showPop: false,
        srhInpTx: '',           // 搜索框内容
        listData: [],
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
        },
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      showPop: {
        handler(val) {
          this.$emit('input', val);
        }
      },
    },
    methods: {
      // TODO 选择往来
      selItem(sItem) {
        this.$emit('sel-item', sItem);
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
              property: 'accepter',
            },
          ];
        }
        return getInputDraft({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
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
      dateFormat,
    },
    created() {
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
