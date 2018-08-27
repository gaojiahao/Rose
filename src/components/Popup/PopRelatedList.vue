<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <div class="title">
          <!-- 搜索栏 -->
          <m-search @search='searchMat' @turnOff="onHide" :isFill='true'></m-search>
        </div>
        <!-- 物料列表 -->
        <r-scroll class="mater_list" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !relatedAppList.length" @on-pulling-up="onPullingUp" ref="bScroll">
          <div class="each_flow" v-for="(item, index) in relatedAppList" :key='index' @click="goDetail(item)">
            <div class="duty_top">
              <!-- 实例编码 -->
              <div class='transCode'>
                <span class="order_title">编码</span>
                <span class="order_num">{{item.transCode.replace(/_/g,'')}}</span>
              </div>
              <!-- 时间 -->
              <div class="time">
                {{item.crtTime | dateFormat}}
              </div>
            </div>
            <!-- 数量，金额 -->
            <div class='show_list'>
              <!-- 应用名称 -->
              <div class="app_name">
                {{item.transTypeName}}<span class="symbol">[应用]</span>
              </div>
              <div class="num_info">
                <!-- 创建人 -->
                <div class="count">
                  <div class="num_part">
                    <span class="symbol">创建人: </span>
                    <span class="number_incre">{{item.creatorName}}</span>
                  </div>
                </div>
                <!-- 生效时间 -->
                <div class="amount_money">
                  <div class="num_part">
                    <span class="symbol">生效时间: </span>
                    <span class="number_incre">{{item.effectiveTime | dateFormat}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="btn" v-if='relatedAppList.length >3'>
            <span class="cfm_btn" @click="flowShow = false">关闭</span>
          </div>
        </r-scroll>
      </div>
      <!-- 底部栏 -->
      <div class="btn when_less" v-if='relatedAppList.length <= 3'>
        <span class="cfm_btn" @click="showPop = false">关闭</span>
      </div>
    </popup>
  </div>
</template>

<script>
  import {Icon, Popup,dateFormat} from 'vux'
  import {getList} from 'service/commonService'
  import {getListView} from 'service/detailService'
  import RScroll from 'components/RScroll'
  import MSearch from 'components/search'
  import businessMap from '@/home/pages/maps/detail'
  export default {
    name: "MatterList",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      listId:{
        type : String,
        default : ''
      },
      filter : {
        type: Array,
        default : ['transcode']
      }
    },
    components: {
      Icon, Popup, RScroll, MSearch
    },
    filters:{
      dateFormat
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [], // 临时存储
        relatedAppList: [], // 物料列表
        limit: 10, // 每页条数
        page: 1., // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
          click: true,
          pullUpLoad: true,
        },
        viewId :'',
      }
    },
    watch: {
      show: {
        handler(val) {
          console.log(val);
          this.showPop = val;
        }
      },
      filter:{
        handler(val){
          console.log(val);
            (async()=>{
              await this.getListView();
              await this.getList();
            })()
        }
      }
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
      //获取相关实例应用的视图
      getListView(){
        return getListView({listId : this.listId}).then(data=>{
          this.viewId = data[0].id
        })
      },
      // TODO 获取相关实例列表
      getList() {
        let value = '';
        this.filter.forEach((item,index)=>{
          if(index === this.filter.length-1){
            value += item;
            return
          }
          value += item+','
        })
        let filter = [{property:"transCode",operator:"in",value:value}];
        if (this.srhInpTx) {
          filter = [
            ...filter,
            {
              operator: 'like',
              value: this.srhInpTx,
              property: 'inventoryName',
            },
          ];
        }
        return getList(this.viewId,{
          limit: this.limit,
          page: this.page,
          start: (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.relatedAppList = this.page === 1 ? tableContent : [...this.relatedAppList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        });
      },
      // TODO 搜索物料
      searchMat(val) {
        this.srhInpTx = val;
        this.relatedAppList = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll.scrollTo(0, 0);
        this.getList()
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getList()
      },
      //跳转详情
      goDetail(item){
        this.showPop = false;
        this.$emit('reload-page',true)
        let code = businessMap[item.transCode.split('_')[0]];
        this.$router.replace({
          path: `/list/${code}/detail`,
          query: {
            transCode: item.transCode
          }
        })
      }
    },
    created() {
     
    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: .08rem 0;
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
          // 清除icon
          .clear_icon {
            top: 50%;
            right: 14%;
            width: .3rem;
            height: .3rem;
            z-index: 100;
            display: block;
            font-size: .12rem;
            line-height: .3rem;
            text-align: center;
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
     .each_flow {
        width: 95%;
        position: relative;
        border-radius: .08rem;
        box-sizing: border-box;
        margin: .1rem auto .2rem;
        padding: .06rem .08rem .04rem;
        box-shadow: 0 2px 10px #e8e8e8;
        .duty_top {
          display: flex;
          // align-items: baseline;
          justify-content: space-between;
          //实例编码
          .transCode {
            display: flex;
            color: #fff;
            font-size: .12rem;
            font-weight: bold;
            span {
              display: inline-block;
              padding: 0 .04rem;
            }
            .order_title {
              background: #1160aa;
            }
            // 订单号
            .order_num {
              background: #9bb4da;
              border-top-right-radius: .08rem;
            }
          }
          // 时间
          .time {
            font-size: .12rem;
          }
        }
        // 明细
        .show_list {
          // padding-left: .06rem;
          box-sizing: border-box;
          // 应用名称
          .app_name {
            font-weight: 300;
            font-size: .2rem;
            margin-top: .02rem;
          }
          // 金额数量等状态
          .num_info {
            font-size: .14rem;
            padding-left: .04rem;
            // 数量
            .count {
              .num_part {
                display: flex;
                align-items: baseline;
                .number_incre,
                .number_redu {
                  margin-left: .04rem;
                }
                // 增加
                .number_incre {
                  color: #c93d1b;
                }
                // 减少
                .number_redu {
                  color: #53d397;
                }
              }
            }
            // 金额
            .amount_money {
              @extend .count;
            }
          }
          //数量
          .num {
            display: flex;
            justify-content: space-between;
            line-height: 0.3rem;
          }
        }
        // 汇总
        .summary_part {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          // text-align: right;
          padding: .04rem 0 .02rem;
          // 增加
          .increase {
            color: #c93d1b;
          }
          // 减少
          .reduce {
            color: #53d397;
          }
        }
        //向下箭头
        .r-arrow {
          text-align: center;
        }
        //收起流水列表
        .hidden_list {
          .each_property {
            line-height: 0.35rem;
            display: flex;
            justify-content: space-between;
          }

        }

      }

    }
     // 确定
    .btn {
      width: 100%;
      background: #fff;
      text-align: center;
      margin-bottom: .1rem;
      .cfm_btn {
        width: 2.8rem;
        color: #fff;
        height: .44rem;
        line-height: .44rem;
        text-align: center;
        background: #5077aa;
        display: inline-block;
        border-radius: .4rem;
        box-shadow: 0 2px 5px #5077aa;
      }
    }
     // 数据少的时候 按钮固定在底部
      .when_less {
        left: 0;
        bottom: 0;
        position: fixed;
      }
  }
</style>
