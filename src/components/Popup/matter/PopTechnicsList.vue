<template>
  <div class="techics-list-container" @click="showPop = !showPop">
    <div class="picker">
      <label :class='{ required : required}'>工艺路线名称</label>
      <div class='content'>
        <span class='mater_nature'>{{selItems.technicsName || "请选择"}}</span>
        <span class="icon-right"></span>
      </div>
    </div>
    <!-- <div class="title" :class="{required : required}">工艺路线名称</div>
    <div class="mode">{{selItems.technicsName || placeholder}}</div>
    <x-icon class="r_arrow" type="ios-arrow-right" size="16"></x-icon> -->

    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="popup-technics-list-container" @on-show="onShow" @on-hide="onHide">
        <r-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></r-search>
        <!-- 物料列表 -->
        <r-scroll class="list-container" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="mater-list-item" v-for="(item, index) in listData" :key='index'
               @click.stop="selThis(item, index)">
            <div class="info-item">
              <div class="name">{{item.technicsName}}</div>
            </div>
            <!-- icon -->
            <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
          </div>
        </r-scroll>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup} from 'vux'
  import {getObjTechnics} from 'service/materService'
  import RScroll from 'components/RScroll'
  import RSearch from 'components/search'

  export default {
    name: "PopTechnicsList",
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否必填
      required: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
    },
    components: {
      Icon, Popup, RScroll, RSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: {}, // 哪些被选中了
        listData: [], // 物料列表
        limit: 100, // 每页条数
        page: 1., // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
          pullUpLoad: true,
        },
        filterProperty: '', // 过滤的key
        filterList: [ // 过滤列表
          {
            name: '名称',
            value: 'technicsName',
          }, {
            name: '编码',
            value: 'technicsCode',
          },
        ],
      }
    },
    watch: {
      defaultValue: {
        handler(val) {
          // 默认值改变，重新赋值
          this.selItems = {...this.defaultValue};
        },
        immediate: true,
      },
    },
    methods: {
      // TODO 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
        })
      },
      // TODO 弹窗隐藏时调用
      onHide() {
        this.showPop = false;
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.technicsCode === sItem.technicsCode;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        this.selItems = {...sItem};
        this.showPop = false;
        this.$emit('sel-item', {...sItem});
      },
      // TODO 获取用户列表
      getList() {
        let filter = [];
        //成品,商品,服务
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: this.filterProperty,
            },
          ];
        }
        return getObjTechnics({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // TODO 搜索物料
      searchList({val = '', property = ''}) {
        this.srhInpTx = val;
        this.filterProperty = property;
        this.resetCondition();
        this.getList();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList();
      },
      // TODO 初始化条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
      },
    },
    created() {
      this.getList();
    }
  }
</script>

<style scoped lang="scss">
  .techics-list-container {
    position: relative;
    padding: .18rem 0;
    .picker{
      display: flex;
      justify-content: space-between;
      align-items: center;
      label {
        color: #696969;
        &.required{
          color: #3296FA;
          font-weight: bold;
        }
      }
      .content {
        display: flex;
        align-items: center;
        .icon-right{
          width: .08rem;
          height: .14rem;
          margin-left: .1rem;
        }
        
      }
    }
  }
  // 弹出层
  .popup-technics-list-container {
    padding: 0 .08rem;
    background: #fff;
    box-sizing: border-box;
    // 顶部
    .title {
      font-size: .2rem;
      position: relative;
      padding: .08rem 0;
    }
    .vux-1px:before {
      border-radius: 40px;
    }
    // 用户列表
    .list-container {
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      height: calc(100% - .46rem);
      /* 使用深度作用选择器进行样式覆盖 */
      /deep/ .scroll-wrapper {
        padding: .04rem .04rem 0 .3rem;
      }
    }
    // 每条数据
    .mater-list-item {
      position: relative;
      padding: .08rem;
      margin-bottom: .2rem;
      box-sizing: border-box;
      box-shadow: 0 0 8px #e8e8e8;
      .info-item {
        line-height: .2rem;
        /*  名称 */
        .name {
          font-size: .16rem;
          font-weight: bold;
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
</style>
