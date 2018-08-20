<template>
  <!-- 往来popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="trade_pop_title">
          <div class="title">
             <span v-if="this.dealerLabelName == '员工'">销售人员</span> 
             <span v-if="this.dealerLabelName == '渠道商'">销售渠道</span>
              <x-icon class="close_icon" type="ios-close-empty" size="30" @click="showPop = !showPop"></x-icon>
          </div>
        </div>
        <!-- 往来列表 -->
        <div class="mater_list" ref="dealer">
          <div class="mater_list_wrapper">
            <div class="each_mater box_sd" v-for="(item, index) in dealerList" :key='index'
                 @click.stop="selThis(item,index)">
              <div class="mater_main ">
                <div class="mater_info">
                  <!--联系人电话 -->
                  <div class="withColor ">
                    <div class="ForInline name" style="display:inline-block">
                        <span>{{item.dealerCode}}</span>
                    </div>
                  </div>
                  <div class="withColor">
                    <div class="ForInline " style="display:inline-block">
                        <span class='dealer'>{{item.dealerName}}</span>
                    </div>
                  </div>
                  <!-- 地址 -->
                  <div class="withoutColor">
                    <span>{{item.province}}{{item.city}}{{item.county}}{{item.address}}</span>
                  </div>
                </div>
              </div>
              <!-- icon -->
              <x-icon class="selIcon" type="ios-circle-outline" size="20"></x-icon>
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
            </div>
            <load-more tip="加载中" v-show="hasNext"></load-more>
            <!-- 当没有数据的时候 显示提醒文字 -->
            <div class="when_null" v-show="!dealerList.length && !hasNext">
              <div class="title">抱歉，没有找到您搜索的内容</div>
            </div>
          </div>
        </div>
      </div>
    </popup>
  </div>
</template>

<script>
  import { Icon, Popup, LoadMore, AlertModule, TransferDom } from 'vux'
  import listService from 'service/listService.js'
  import BScroll from 'better-scroll'

  export default {
    name: "dealerList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      dealerLabelName:{
        type: String,
        default:''
      },
    },
    directives: {TransferDom},
    components: {
      Icon, Popup, LoadMore
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
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        let flag = false;
        this.selItems && this.selItems.every(item => {
          if (sItem.dealerCode === item.dealerCode) {
            flag = true;
            return false;
          }
          return true;
        });
        return flag;
      },
      // TODO 选择商机
      selThis(sItem, sIndex) {
        this.showPop = false;
        this.selItems = [sItem];
        this.$emit('sel-dealer', JSON.stringify(this.selItems));
      },
      // TODO 获取往来列表
      getDealer() {
        listService.getSalesmanList({
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          dealerLabelName: this.dealerLabelName,
          //filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
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
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
      // 顶部
      .title {
        position: relative;
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
      // 往来列表
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
            // 新增往来
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
        // 每个往来
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
          // 往来图片
          .mater_img {
            display: inline-block;
            width: .75rem;
            height: .75rem;
            img {
              width: 100%;
              max-height: 100%;
            }
          }
          // 往来主体
          .mater_main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 往来名称
            .mater_name {
              color: #111;
              overflow: hidden;
              font-size: .12rem;
              font-weight: bold;
              max-height: .46rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              // 每个往来的索引
              .whiNum {
                color: #fff;
                font-weight: 200;
                padding: 0 .04rem;
                font-size: .1rem;
                display: inline-block;
                background: #ea5455;
                vertical-align: middle;
                margin: -.02rem .04rem 0 0;
              }
            }
            // 往来信息
            .mater_info {
              color: #757575;
              font-size: .14rem;
              // 有颜色包裹的
              .withColor {
                margin-top: .04rem;
                .name{
                  color:#5077aa;
                  font-size: .14rem;
                  font-weight: bold;
                }
                .dealer{
                  color:#111;
                  font-weight: bold;
                }
                // 往来编码
                .mater_code {
                  display: flex;
                  .title,
                  .num {
                    font-size: .1rem;
                    display: inline-block;
                    padding: .01rem .04rem;
                  }
                  .title {
                    color: #fff;
                    background: #3f72af;
                  }
                  .num {
                    color: #111;
                    max-width: .85rem;
                    overflow: hidden;
                    white-space: nowrap;
                    background: #dbe2ef;
                    box-sizing: border-box;
                    text-overflow: ellipsis;
                  }
                }
                // 规格
                .mater_spec {
                  @extend .mater_code;
                  margin-left: .1rem;
                  .title {
                    color: #fff;
                    background: #537791;
                  }
                  .num {
                    color: #fff;
                    max-width: .6rem;
                    background: #ff7f50;
                  }
                }
              }
              // 没颜色包裹的
              .withoutColor {
                // 往来分类
                .mater_classify {
                  font-size: .1rem;
                  margin-top: .02rem;
                  .type,
                  .father {
                    margin-right: .04rem;
                  }
                }
                // 往来颜色 材质
                .mater_material {
                  font-size: .1rem;
                  .unit,
                  .color {
                    margin-right: .06rem;
                  }
                }
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
  .trade_pop_title {
      padding: 0 .08rem;
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: 0.08rem 0 .14rem;
        // 关闭icon
        .close_icon {
          top: 45%;
          right: -2%;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
    }
</style>
