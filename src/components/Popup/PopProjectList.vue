<template>
  <div class="pop-sodl-project-list" @click="itemClick">
    <div class="project-info" v-if='selItems.PROJECT_NAME'>
      <span class="project-name">{{selItems.PROJECT_NAME}}</span>
      <span class="project-type">{{selItems.PROJECT_TYPE}}</span>
    </div>
    <div class="title" v-else>项目名称 <span>请选择</span></div>
    <i class="icon-right r-arrow"></i>
    <!-- 物料popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="popup-top">
          <i class="icon-close" @click="onHide"></i>
        </div>
        <div class="trade_pop">
          <m-search @search='searchList' ></m-search>
          <!-- 费用列表 -->
          <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !projectList.length" @on-pulling-up="onPullingUp"
                    ref="bScroll">
            <div class="each_mater box_sd" :class="{seleted : showSelIcon(item)}" v-for="(item, index) in projectList" :key='index'
                 @click.stop="selThis(item, index)">
              <div class="mater_main ">
                <!-- 物料名称 -->
                <div class="project_name">{{item.PROJECT_NAME}}</div>
                <!-- 物料基本信息 -->
                <div class="project_type">{{item.PROJECT_TYPE}}</div>
              </div>
              <!-- icon -->
              <!-- <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon> -->
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, Popup, LoadMore} from 'vux'
  import {getProjectList} from 'service/projectService'
  import RScroll from 'components/RScroll'
  import MSearch from 'components/search'
  export default {
    name: "PopProjectList",
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    components: {
      Icon, Popup, LoadMore, RScroll,MSearch
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: {}, // 哪些被选中了
        projectList: [],
        limit: 10,
        page: 1.,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullUpLoad: true,
        },
      }
    },
    watch: {
      defaultValue(){
        this.selItems = {...this.defaultValue};
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
      },
      // 判断是否展示选中图标
      showSelIcon(sItem) {
        let flag = false;
        return sItem.PROJECT_NAME === this.selItems.PROJECT_NAME;
      },
      // 选择物料
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = {...sItem};
        this.$emit('sel-project',this.selItems);
      },
      // 获取物料列表
      getProjectLsit() {
        let filter = [];

        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'PROJECT_NAME'
            },
          ];
        }
        return getProjectList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.projectList = this.page === 1 ? tableContent : [...this.projectList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // 搜索物料
      searchList({val = ''}) {
        this.srhInpTx = val;
        this.projectList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getProjectLsit();
      },
      // 上拉加载
      onPullingUp() {
        this.page++;
        this.getProjectLsit();
      },
      itemClick() {
        this.showPop = true;
      },
    },
    created() {
      this.selItems = {...this.defaultValue};
      this.getProjectLsit();
    }
  }
</script>

<style scoped lang="scss" >
  .pop-sodl-project-list {
    position: relative;
    margin-bottom: .1rem;
    padding: .18rem .15rem;
    box-sizing: border-box;
    background: #fff;
    color: #333;
    font-size: .14rem;
    line-height: .14rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      flex: 1;
      color: #696969;
      display: flex;
      justify-content: space-between;
    }
    .icon-right{
      width: .08rem;
      height: .14rem;
      margin-left: .1rem;
    }
  }

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
      height: 100%;
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 物料列表
      .mater_list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .5rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .14rem .15rem 0 ;
        }
        // 每个物料
        .each_mater {
          position: relative;
          display: flex;
          padding: .1rem;
          border-radius: .04rem;
          margin-bottom: .1rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          &.seleted{
           border: 1px solid #3296FA;
          }
          // 物料主体
          .mater_main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料名称
            .project_name {
              overflow: hidden;
              color: #333;
              font-size: .16rem;
              font-weight: bold;
              max-height: .46rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
            }
            // 物料信息
            .project_type {
              color: #999;
              font-size: .12rem;
              line-height: .16rem;
              margin-top: .08rem;
            }
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

    }
  }
</style>
