<template>
  <!-- 项目计划popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <d-search @search='searchMat' @turnOff="onHide" :isFill='true'></d-search>
        </div>
        <!-- 项目计划列表 -->
        <div class="mater_list" ref="dealer">
          <div class="mater_list_wrapper">
            <div class="each_mater box_sd" v-for="(item, index) in dealerList" :key='index'
                 @click.stop="selThis(item,index)">
              <div class="mater_main ">
                <div class="mater_info">

                    <!-- 项目名称 -->
                    <div class="mater_name">
                      {{item.PROJECT_NAME}}<span class="symbol"> [项目名称]</span>
                    </div>
                    <div class="mater_detail">
                      <!-- 项目经理 -->
                      <div class="mater_manager">
                        {{item.PROJECT_MANAGER}}<span class="symbol"> [项目经理]</span>
                      </div>
                      <!-- 项目备注 -->
                      <div class='mater_comment' v-if="item.COMMENT">
                        {{item.COMMENT}}<span class="symbol"> [备注]</span>
                      </div>
                      <div class="mater_time">
                        <div>预期开始日期：{{item.EXPECT_START_DATE}}</div>
                        <div>预期截止日期：{{item.EXPECT_END_DATE}}</div>
                      </div>
                    </div>
                </div>
              </div>
              <!-- icon -->
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
            </div>
            <load-more tip="加载中" v-show="hasNext"></load-more>
            <!-- 当没有数据的时候 显示提醒文字 -->
            <div class="when_null" v-show="!dealerList.length && !hasNext">
              <div class="title">抱歉，没有找到您搜索的内容</div>
              <!-- <ul class="tips">
                <li>
                  不用担心，您马上可以进行 <span class="addNew" @click="add">新增项目计划</span>
                </li>
                <li>
                  或者检查“输入内容”是否正确
                </li>
              </ul> -->
            </div>
          </div>
        </div>
      </div>
    </popup>
  </div>
</template>

<script>
  import { Icon, Popup, LoadMore, AlertModule, TransferDom } from 'vux'
  import DSearch from 'components/search'
  import dealerService from 'service/dealerService.js'
  import BScroll from 'better-scroll'
  import {getProjectApproval} from 'service/projectService'

  export default {
    name: "dealerList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      dealerLabelName : {
        type: String,
        default: "2167"
      }
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, DSearch, LoadMore
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        dealerList: [],
        bScroll: null,
        limit: 10,
        page: 1.,
        hasNext: true,
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
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
        this.$emit('input', false);
      },
      // 关闭popup
      closePop(val){
        // 点击搜索框的返回 则退出 Popup
        this.$emit('closePop', val);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        let flag = false;
        this.selItems && this.selItems.every(item => {
          if (sItem.colId === item.colId) {
            flag = true;
            return false;
          }
          return true;
        });
        return flag;
      },
      // TODO 选择项目计划
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = [sItem];
        this.$emit('sel-dealer', JSON.stringify(this.selItems));
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 获取项目计划列表
      getDealer() {
        let filter = [];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            // 搜索 项目计划名称 或  编码
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'PROJECT_NAME',
              attendedOperation: 'or'
            },
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'PROJECT_MANAGER',
            },
          ];
        }
       getProjectApproval({
          projectName:this.srhInpTx,
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          for(let i = 0 ; i<tableContent.length ; i++){
            tableContent[i].EXPECT_START_DATE = tableContent[i].EXPECT_START_DATE.split(' ')[0];
            tableContent[i].EXPECT_END_DATE = tableContent[i].EXPECT_END_DATE.split(' ')[0];
          }
          this.dealerList = this.page === 1 ? tableContent : [...this.dealerList, ...tableContent];
          this.$nextTick(() => {
            this.bScroll.refresh();
            if (!this.hasNext) {
              return
            }
            this.bScroll.finishPullUp();
          })
        }).catch(e=>{
          AlertModule.show({
            content: e.message,
          })
        })

      },
      // TODO 搜索项目计划
      searchMat(val) {
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
      //新增项目计划
      add(){
        let pickVal = '';
        if(this.dealerLabelName == 2167){
          pickVal = '客户';
        }else if(this.dealerLabelName == 2168){
          pickVal = '供应商';
        }
        this.$router.push({ path:'/adress/edit_ads', query:{ add:1,pickVal:pickVal} })
      }
    },
    created() {
      this.initScroll();
      this.getDealer();
    },
    mounted(){

    }
  }
</script>

<style scoped lang="scss">
.symbol {
  color: #757575;
  font-size: .1rem;
}
// 弹出层
.trade_pop_part {
  background: #fff;
  .trade_pop {
    padding: 0 .08rem;
    height: calc(100% - .44rem);
    // 顶部
    .title {
      position: relative;
      margin: 0.08rem 0;
      font-size: .2rem;
      // 搜索
      .search_part {
        width: 100%;
        display: flex;
        height: .3rem;
        line-height: .3rem;
        position: relative;
        // 搜索输入框
        .srh_inp {
          flex: 5;
          outline: none;
          border: none;
          color: #2D2D2D;
          font-size: .16rem;
          padding: 0 .3rem 0 .4rem;
          background: #F3F1F2;
          border-top-left-radius: .3rem;
          border-bottom-left-radius: .3rem;
        }
        // 取消 按钮
        .pop_cancel {
          flex: 1;
          color: #fff;
          font-size: .14rem;
          text-align: center;
          background: #fc3c3c;
          border-top-right-radius: .3rem;
          border-bottom-right-radius: .3rem;
        }
        // 搜索icon
        .serach_icon {
          top: 50%;
          left: 10px;
          fill: #2D2D2D;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      // 关闭icon
      .close_icon {
        top: 50%;
        right: -2%;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    .each_mode {
      margin-right: .1rem;
      display: inline-block;
      padding: .04rem .2rem;
    }
    .vux-1px:before {
      border-radius: 40px;
    }
    // 项目计划列表
    .mater_list {
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      height: 100%;
      padding: 0 .04rem 0 .3rem;
      .mater_list_wrapper {
        width: 100%;
        padding-top: .04rem;
        position: relative;
        // 当没有数据时
        .when_null {
          left: 50%;
          width: 3rem;
          position: absolute;
          color: #757575;
          font-weight: bold;
          transform: translate(-50%, 0);
          // 提醒文字
          .title {
            font-size: .2rem;
          }
          // 新增项目计划
          .tips {
            li { list-style : square; margin-top: .1rem;}
            font-weight: 200;
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
      // 每个项目计划
      .each_mater {
        position: relative;
        display: flex;
        padding: 0.08rem;
        margin-bottom: .2rem;
        box-sizing: border-box;
        // 阴影
        &.box_sd {
          box-sizing: border-box;
          box-shadow: 0 0 8px #e8e8e8;
        }
        // 项目计划图片
        .mater_img {
          display: inline-block;
          width: .75rem;
          height: .75rem;
          img {
            width: 100%;
            max-height: 100%;
          }
        }
        // 项目计划主体
        .mater_main {
          flex: 1;
          box-sizing: border-box;
          display: inline-block;
          // 项目计划信息
          .mater_info {
            color: #757575;
            font-size: .16rem;
            // 项目名称
            .mater_name {
              color: #111;
              font-size: .18rem;
              font-weight: bold;
              .symbol {
                font-weight: normal;
              }
            }       
            // 项目经理
            .mater_manager {
              color: #111;
              font-size: .16rem;
            }
            // 项目备注
            .mater_comment {
              font-size: .12rem;
              color: #111;
            }
            // 项目时间
            .mater_time {
              margin-top: .1rem;
              font-size: .12rem;
            }
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
.editAds{
  width: 100%;
  height: 100%;
  background: #fff;
}
</style>
