<template>
  <!-- 用户popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="popup-user-list-container" @on-show="onShow" @on-hide="onHide">
      <r-search :filterList="filterList" @search='searchList' @turn-off="onHide" :isFill='true'></r-search>
      <!-- 物料列表 -->
      <r-scroll class="user-list" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
        <div class="mater-list-item" v-for="(item, index) in listData" :key='index'
             @click.stop="selThis(item, index)">
          <div class="info-item vux-1px-b">
            <img class="avatar" :src="item.photo" alt="头像" @error="getDefaultImg(item)">
            <div class="user-info">
              <div class="name">{{item.nickname}}</div>
              <div class="tel">{{item.mobile}}</div>
            </div>
          </div>
          <div class="info-item info-code">
            <div class="code">工号: {{item.userCode}}</div>
            <div class="status" :class="[item.statusClass]">{{item.statusText || ''}}</div>
          </div>
          <!-- icon -->
          <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
        </div>
      </r-scroll>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup} from 'vux'
  import {getUserList} from 'service/commonService'
  import RScroll from 'components/RScroll'
  import RSearch from 'components/search'

  export default {
    name: "PopUserList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
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
            name: '姓名',
            value: 'nickname',
          }, {
            name: '工号',
            value: 'userCode',
          },
        ],
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        },
        immediate: true
      },
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
        this.$emit('input', false);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.userCode === sItem.userCode;
      },
      // TODO 选择物料
      selThis(sItem, sIndex) {
        this.selItems = {...sItem};
        this.$emit('sel-item', {...sItem});
        this.$emit('input', false);
      },
      // TODO 获取默认图片
      getDefaultImg(item = {}) {
        let {gender = ''} = item;
        let url = gender === '男' ? require('assets/ava01.png') : require('assets/ava02.png');
        if (item) {
          item.photo = url;
        }
        return url;
      },
      // TODO 获取用户列表
      getUserList() {
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
        return getUserList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          let statusMap = {
            1: {
              text: '使用中',
              class: 'inUse'
            },
            2: {
              text: '未使用',
              class: 'unUse'
            },
            3: {
              text: '草稿',
              class: 'offUse'
            },
            '-1': {
              text: '停用',
              class: 'offUse'
            },
          };
          tableContent.forEach(item => {
            let status = statusMap[item.status] || {};
            item.photo = item.photo || this.getDefaultImg(item);
            item.statusText = status.text;
            item.statusClass = status.class;
          });
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
        this.getUserList();
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getUserList();
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
      // 请求物料
      this.getUserList();
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .popup-user-list-container {
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
    .user-list {
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      height: calc(100% - .46rem);
      /* 使用深度作用选择器进行样式覆盖 */
      /deep/ .scroll-wrapper {
        padding: .04rem .04rem 0 .3rem;
      }
    }
    // 每个用户
    .mater-list-item {
      position: relative;
      padding: .08rem;
      margin-bottom: .2rem;
      box-sizing: border-box;
      box-shadow: 0 0 8px #e8e8e8;
      .info-item {
        display: flex;
        padding-bottom: .1rem;
        line-height: .2rem;
        align-items: center;
        &.info-code {
          justify-content: space-between;
          padding: .05rem 0 0;
        }
        /*  姓名 */
        .name {
          font-size: .16rem;
          font-weight: bold;
        }
        /* 电话 */
        .tel {
          color: #757575;
          font-size: .12rem;
        }
        /* 工号 */
        .code {
          color: #757575;
          font-size: .14rem;
        }
        /* 用户状态 */
        .status {
          padding: 0 .04rem;
          border-radius: .12rem;
          color: #fff;
          font-size: .14rem;
          /* 使用中 */
          &.inUse {
            background: #53d397;
          }
          /* 未使用 */
          &.unUse {
            background: #c7b198;
          }
          /* 草稿/已停用 */
          &.offUse {
            background: #474a56
          }
        }
      }
      .avatar {
        width: .55rem;
        height: .55rem;
        margin-right: .1rem;
        border-radius: .08rem;
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
</style>
