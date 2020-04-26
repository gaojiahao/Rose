<template>
  <!-- 物料popup -->
  <div v-transfer-dom>
    <popup v-model="showPop" height="60%" class="popup-project-list" @on-show="onShow" @on-hide="onHide">
      <div class="trade_pop">
        <!-- <div class="title">
          新建收入
        </div> -->
        <!-- 物料列表 -->
        <group title="新建收入">
          <cell class="each_part" title="项目类产品" :value=" setvalue.name? setvalue.name:'请选择产品'" value-align="right" @click.native="clickProject"
                is-link></cell>
          <!-- <popup-picker title="项目类产品" :data="products" v-model="value1" @on-show="onShow" @on-hide="onHide" @on-change="onChange" placeholder="请选择产品"></popup-picker> -->
          <x-input title="数量" v-model="nums" text-align="right" placeholder="请输入"></x-input>
        </group>
      </div>
      <!-- 底部栏 -->
      <div class="count_mode vux-1px-t">
        <span class="count_btn" @click="confirm">确定</span>
      </div>
    </popup>
    <popup-income-calc-list :show1="showProjectPopup" :list="products"
                          @on-sel="selProject" v-model="showProjectPopup" ref="projectPopup"></popup-income-calc-list>
  </div>
</template>

<script>
  import {Icon, Popup,Group,Cell,XInput,PopupPicker} from 'vux'
  import RScroll from 'components/common/RScroll'
  import RSearch from 'components/common/RSearch'
  // 请求 引入
  import saleRepotService from "service/saleRepotService";
  import PopupIncomeCalcList from 'components/popup/PopupIncomeCalcList'

  export default {
    name: "PopupIncomeCalc",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return []
        }
      },
      products: {
        type: Array,
        default() {
          return []
        }
      },
    },
    components: {
      Icon, Popup, RScroll, RSearch,Group,Cell,XInput,PopupPicker,PopupIncomeCalcList
    },
    data() {
      return {
        showPop: false,
        srhInpTx: '', // 搜索框内容
        selItems: [], // 哪些被选中了
        tmpItems: [], // 临时存储
        listData: [], // 物料列表
        limit: 10, // 每页条数
        page: 1., // 当前页码
        hasNext: true, // 是否有下一页
        scrollOptions: { // 滚动配置
          click: true,
          pullUpLoad: true,
        },
        showProjectPopup: false, // 是否展示项目类产品的选项
        arr: [],
        setvalue:[],
        nums:0,
      }
    },
    watch: {
      show: {
        handler(val) {
          this.showPop = val;
        }
      },
      defaultValue: {
        handler(val) {
          // 默认值改变，重新赋值
          this.setDefaultValue();
        }
      },
    },
    methods: {
      // 弹窗展示时调用
      onShow() {
        this.$nextTick(() => {
          if (this.$refs.bScroll) {
            // 弹窗展示时刷新滚动，防止无法拖动问题
            this.$refs.bScroll.refresh();
          }
        })
      },
      // 弹窗隐藏时调用
      onHide() {
        this.tmpItems = [...this.selItems];
        this.$emit('input', false);
      },
      // 确定选择物料
      confirm() {
        this.showPop = false;
        var arr = {
          ...this.setvalue,
          nums:this.nums
        }
        this.$emit('on-sel', arr);
      },
      // 上拉加载
      onPullingUp() {
      },
      // 设置默认值
      setDefaultValue() {
        this.nums = this.defaultValue.nums;
        this.setvalue = this.defaultValue;
      },
      onChange(){

      },
      selProject(index){
        this.setvalue = this.products[index];
        this.showProjectPopup = false;
      },
      clickProject(){
        this.showProjectPopup = true;
      }
    },
    created() {

    }
  }
</script>

<style scoped lang="scss">
  // 弹出层
  .popup-project-list {
    background: #fff;
    margin-left: 10%;
    margin-bottom: 20%;
    width: 80%;
    border-radius: .1rem;
    .trade_pop {
      padding: 0 .08rem;
      height: calc(100% - .44rem);
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: .08rem 0;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
      // 物料列表
      .project-list {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .38rem);
        /* 使用深度作用选择器进行样式覆盖 */
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 每个物料
        .each_mater {
          position: relative;
          padding: .08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          .matter_name {
            font-size: .16rem;
            font-weight: bold;
            padding-bottom: .04rem;
            
            .matter_simple {
              font-size: .1rem;
              color: #EDE4A3;
              background: #D7030F;
              border-radius: .12rem;
              padding: .01rem .06rem;
              vertical-align: middle;
            }
          }
          .matter_unit {
            color: #757575;
            font-size: .14rem;
          }
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 5px #e8e8e8;
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
            fill: #D7030F;
          }
        }
      }

    }
    // 底部栏
    .count_mode {
      width: 100%;
      display: flex;
      height: .44rem;
      line-height: .44rem;
      background: #fff;
      width: 50%;
      margin-left: 25%;
      margin-bottom: 10%;
      bottom: 5%;
      .count_num {
        flex: 2.5;
        color: #5077aa;
        font-size: .24rem;
        padding-left: .1rem;
      }
      .count_btn {
        flex: 1.5;
        color: #fff;
        text-align: center;
        background: #5077aa;
        border-radius: .1rem;
      }
    }
  }
</style>
