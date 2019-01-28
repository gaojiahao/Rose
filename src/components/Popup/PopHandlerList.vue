<template>
  <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="popup-top">
          <i class="icon-close" @click="onHide"></i>
        </div>
        <div class="trade_pop">
          <d-search @search="searchList" @turn-off="onHide" ></d-search>
          <!-- 经理列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-mater-list-item" :class="{selected: showSelIcon(item)}"
                 v-for="(item, index) in listData" :key='index' @click.stop="selThis(item, index)">
              <div class="pop-list-main ">
                <!-- 头像 -->
                <div class="user-photo">
                  <img src="~assets/ava01.png" alt="mater_img">
                </div>
                <div class="pop-list-info">
                  <!-- 名字 -->
                  <div class="user_name">{{item.nickname}}</div>
                  <!-- 用户id -->
                  <div class="user_code" v-if="item.userId">{{item.userId}}</div>
                </div>
              </div>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
</template>

<script>
// vux 引入
import {Popup, TransferDom, LoadMore} from 'vux'
// 请求 引入
import {listUsers, requestData} from 'service/commonService'
// 组件 引入
import RScroll from 'components/RScroll'
import DSearch from 'components/search'
export default {
  name: 'handlerPop',
  props: {
    defaultValue: {
      type: Object,
      default() {
        return {}
      }
    },
    show: {
      type: Boolean,
      default: false
    },
    requestParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components:{
    Popup, LoadMore, RScroll, DSearch
  },
  watch:{
    show(val){
      this.showPop = val;
    },
    defaultValue:{
      handler(val){
        this.selItems  = {...val}
      },
      deep: true
    },
    requestParams:{
      handler(val){
        this.getlistUsers()
      },
      immediate: true
    }
  },
  data(){
    return{
      page: 1,
      limit: 50,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
      },
      srhInpTx: '', // 搜索框内容
      showPop: false,
      listData: [],
      selItems: {}
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
    // 弹窗隐藏时调用
    onHide() {
      this.showPop = false;
      this.$emit('input', false)
    },
    // 上拉加载
    onPullingUp() {
      this.page++;
      this.getlistUsers();
    },
    // 判断是否展示选中图标
    showSelIcon(sItem) {
      return `${this.selItems.nickname}` === `${sItem.nickname}`;
    },
    // 获取 默认图片
    getDefaultImg(item) {
      let url = item.gender === '男'
        ? require('assets/ava01.png')
        : require('assets/ava02.png');

      if (item) {
        item.photo = url;
      }
      return url;
    },
    // 搜索 经办人
    searchList({val = ''}) {
      this.srhInpTx = val;
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.getlistUsers();
    },
    // 请求 经办人列表
    getlistUsers() {
      let filter = [];
      if (this.srhInpTx) {
        filter = [
          ...filter,
          {
            operator: 'like',
            value: this.srhInpTx,
            property: 'nickname',
          }
        ];
      }
      let data = {
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter),
        ...this.requestParams.data,
      }
      return requestData({
        url: this.requestParams.url,
        data
      }).then(({dataCount = 0, tableContent = []}) => {
      // return listUsers({
      //   limit: this.limit,
      //   page: this.page,
      //   start: (this.page - 1) * this.limit,
      //   filter: JSON.stringify(filter),
      // }).then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      });
    },
    // 选择 经办人
    selThis(sItem, sIndex) {
      this.showPop = false;
      this.selItems = sItem;
      this.$emit('sel-handler', sItem)
      this.$emit('input', false)
    },

  },
  created(){
    
  }

}
</script>

<style scoped lang="scss">
@import '~@/scss/color';
 // 弹出层
  .trade_pop_part {
    background: #fff;
    .popup-top {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: -.08rem;
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
      height: calc(100% - .82rem);
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: .08rem 0;
        font-size: .2rem;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .05rem .15rem 0;
        }
        // 列表项
        .pop-mater-list-item {
          position: relative;
          display: flex;
          padding: .15rem;
          margin-bottom: .2rem;
          border-radius: .04rem;
          color: #333;
          box-sizing: border-box;
          border-radius: .04rem;
          box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
          &.selected {
            border: 1px solid $main_color;
          }
          // 列表主体
          .pop-list-main {
            flex: 1;
            box-sizing: border-box;
            display: flex;
            //头像
            .user-photo {
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

</style>
