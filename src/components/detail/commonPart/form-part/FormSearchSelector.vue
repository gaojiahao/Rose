<template>
  <!--搜索选择器-->
  <div class="search_selector" :style="{borderBottom:borderBottom}">
    <div class="each_info vux-1px-b" @click="showPop = true">
      <div v-if="!isRequired" class="title">{{ title }}</div>
      <div v-else style="color:#e4393c" class="title">{{ title }}</div>
      <div class="mode">
        <span
          class="mode_content"
          v-for="(item, index) of confirmItems"
          :key="index">
          {{ item[listName] }}
          <b :style="{fontSize:'.2rem'}" @click.stop="deleteSelectItems(item,index)">×</icon></b>
        </span>
        <span class="select-title" v-if="confirmItems.length===0">请选择</span>
        <span class="icon-right"></span>
      </div>
    </div>
    <div v-transfer-dom>
      <popup
        v-model="showPop"
        height="80%"
        class="trade_pop_part"
        @on-show="onShow"
        @on-hide="onHide">
        <div class="trade_pop">
          <div class="pop-header">
            <span class="cancel" @click="onHide">取消</span>
            <span class="confirm" @click="confirmSelect">确定</span>
          </div>
          <d-search @search="searchList" @turn-off="onHide"></d-search>
          <!-- 列表 -->
          <r-scroll
            class="pop-list-container"
            :options="scrollOptions"
            :has-next="hasNext"
            :no-data="!hasNext && !listData.length"
            @on-pulling-up="onPullingUp"
            ref="bScroll">
            <div
              class="pop-mater-list-item"
              v-for="(item, index) in listData"
              :key='index'
              @click="selectThis(item, index)">
              <div class="pop-list-main ">
                  <div :style="{display: 'flex'}">
                    <!-- 头像 -->
                    <div class="user-photo">
                    <img
                        :src="item.photo"
                        alt="mater_img"
                        @error="getDefaultImg(item)">
                    </div>
                    <div class="pop-list-info">
                    <!-- 名字 -->
                    <div class="user_name">{{ item[listName] }}</div>
                    <!-- ID -->
                    <div class="user_code">{{ item.groupName}}</div>
                    </div>
                  </div>
                  <!-- 选择icon -->
                  <div class="selected-icon">
                      <check-icon :value="item.selected"></check-icon>
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
// vux 引入
import { Popup, TransferDom, LoadMore, CheckIcon, XButton, Icon } from "vux";

import DSearch from "components/search/search";
import RScroll from "plugins/scroll/RScroll";
// 请求 引入
import { listSearchSelectorData } from 'service/commonService'
export default {
  props: {
    title: {
      type: [String, Number],
      default: "搜索选择器"
    },
    listName: {
      type: [String, Number, Boolean],
      default: "nickname"
    },
    listID: {
      type: [String, Number],
      default: "userId"
    },
    API: {
        type: String,
        default: 'ds/getAllUsers'
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchContent: "",
      showPop: false,
      hasNext: true,
      page: 1,
      limit: 50,
      confirmItems: [],
      selectItems: [],
      listData: [],
      scrollOptions: {
        click: true,
        pullUpLoad: true
      }
    };
  },
  components: { 
    DSearch, 
    Popup, 
    TransferDom, 
    LoadMore, 
    RScroll, 
    CheckIcon, 
    XButton,
    Icon 
  },
  computed: {
    borderBottom() {
      if(this.isRequired){
        return `1px solid #e4393c`;
      }else{
        return `1px solid #e8e8e8`;
      }
      
    }
  },
  watch: {},
  methods: {
    // 弹窗展示时调用
    onShow() {
      this.page = 1;
      this.getlistDatas();
      this.confirmItems.length === 0 && (this.selectItems = []);
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          this.$refs.bScroll.refresh();
        }
      });
    },
    // 弹窗隐藏时调用
    onHide() {
      this.showPop = false;
    },
    // 搜索
    searchList({ val = "" }) {
      this.searchContent = val;
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.getlistDatas();
    },
    // 上拉加载
    onPullingUp() {
      this.page++;
      this.getlistDatas();
    },
    // 获取 默认图片
    getDefaultImg(item) {
      let url =
        item.gender === 1
          ? require("assets/ava01.png")
          : require("assets/ava02.png");
      if (item) {
        item.photo = url;
      }
      return url;
    },
    //删除选择的目标
    deleteSelectItems(item, index) {
      this.confirmItems.splice(index,1);
      this.$emit('getSelectData', this.confirmItems);
    },
    // 选择目标
    selectThis(sItem, sIndex) {
        let obj = {};
        this.listData[sIndex].selected = !sItem.selected
        this.listData[sIndex].selected && this.selectItems.push(sItem);
        this.selectItems = this.selectItems.filter(item => { return item.selected; })
        //数组去重
        this.selectItems = this.selectItems.reduce((cur, next) => {
            obj[next[this.listName]] ? "" : (obj[next[this.listName]] = true && cur.push(next));
            return cur;
        }, []);
    },
    confirmSelect() {
      this.confirmItems = this.selectItems;
      this.$emit('getSelectData', this.confirmItems);
      this.onHide();
    },
    // 请求列表数据
    getlistDatas() {
        let filter = [];

        if (this.searchContent) {
            filter = [{ operator: 'like',value: this.searchContent,property: this.listName}];
        }

        return listSearchSelectorData(this.API, {
            limit: this.limit,
            page: this.page,
            filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
            this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
            tableContent.forEach(val => {
              val.selected = false; 
              this.confirmItems.forEach(item => {
                if(val[this.listName] === item[this.listName]){
                  val.selected = true;
                }
              })
            })

            this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
            this.$nextTick(() => {
                this.$refs.bScroll.finishPullUp();
            })
        });
    }
  },
  created() {
      this.getlistDatas();
  }
};
</script>

<style lang='scss' scoped>
@import "~@/scss/color";
* {
    touch-action: pan-y;
}
.search_selector {
  // border-bottom: 1px solid #e8e8e8;
  .each_info {
    min-height: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      color: #4e9cec;
      font-weight: bold;
      font-size: 0.14rem;
      margin-right: 0.1rem;
      width: .7rem;
      &.required {
        font-weight: bold;
        color: $main_color;
      }
    }
    .mode {
      .icon-right {
        width: 0.08rem;
        height: 0.14rem;
        margin-left: 0.1rem;
      }
      .mode_content{
        overflow: hidden;
        background-color: #ddd;
        padding: .05rem;
        margin-right: .02rem;
      }
      .select-title{
        font-size: .15rem;
        margin-right: .04rem;
      }
      .select-title:after{
        content: " ";
        display: inline-block;
        height: 6px;
        width: 6px;
        border-width: 2px 2px 0 0;
        border-color: #C8C8CD;
        border-style: solid;
        -webkit-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
        -ms-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
        transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
        position: relative;
        top: -2px;
        position: absolute;
        top: 50%;
        margin-top: -4px;
        right: 2px;
      }
    }
  }
}
.vux-1px-b:after {
  border-color: #e8e8e8;
  left: 0;
}
// 弹出层
.trade_pop_part {
  background: #fff;
  .trade_pop {
    height: 100%;
    overflow: hidden;
    .pop-header{
      padding: .1rem .1rem;
      border-bottom: 1px solid #ddd;
      .cancel{
          font-size: .16rem;
          color: #6b6767;
      }
      .confirm{
        font-size: .16rem;
        color: #04BE02;
        float: right;
      }
    }
    .pop_btn{
      position: fixed;
      bottom: 0;
      width: 100%;
    }
    // 顶部
    .title {
      position: relative;
      margin: 0.08rem 0;
      font-size: 0.2rem;
    }
    .each_mode {
      margin-right: 0.1rem;
      display: inline-block;
      padding: 0.04rem 0.2rem;
    }
    // 列表容器
    .pop-list-container {
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      height: calc(100% - 0.46rem);
      /deep/ .scroll-wrapper {
        padding: 0.05rem 0.15rem 0;
      }
      // 列表项
      .pop-mater-list-item {
        position: relative;
        display: flex;
        padding: 0.15rem;
        margin-bottom: 0.2rem;
        border-radius: 0.04rem;
        color: #333;
        box-sizing: border-box;
        border-radius: 0.04rem;
        box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
        // 列表主体
        .pop-list-main {
          flex: 1;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          //头像
          .user-photo {
            width: 0.4rem;
            height: 0.4rem;
            margin-right: 0.12rem;
            display: inline-block;
            img {
              border-radius: 50%;
              width: 100%;
              height: 100%;
            }
          }
          .pop-list-info{
              display: inline-block;
              width: 2.3rem;
              overflow: hidden;
          }
          .user_name {
            line-height: 0.16rem;
            font-size: 0.16rem;
            font-weight: 600;
            margin-top: 0.04rem;
          }
          .user_code {
            margin-top: 0.06rem;
            line-height: 0.12rem;
            color: #999;
            font-size: 0.12rem;
          }
        }
      }
    }
  }
}
</style>
