<template>
  <div class="pop-single-container" @click="showPop = !showPop">
    <div class='pop_info'>
      <div class="title" :class="{required : isRequired}">{{title}}</div>
      <div class="mode">
        <span class="mode-content">{{selected || '请选择'}}</span>
        <span class="iconfont icon-shenglve"></span>
        </div>
    </div>   
    <!-- 结算popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="70%" class="trade_pop_part">
        <div class="trade_pop">
          <div class="title">{{title}}
            <x-icon class="close_icon" type="ios-close-empty" size="30" @click="showPop = !showPop"></x-icon>
          </div>
          <span class="each_mode"
                :class="{choiced : item.name === tmp}"
                v-for="(item, index) in data"
                :key="index"
                @click="selItem(item.name, index)">{{item.name}}</span>
        </div>
        <div class="cfm_btn" @click="confirm">确定</div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Popup, Icon} from 'vux'

  export default {
    name: "PopSingleSelect",
    props: {
      title: {
        type: String,
        default: ''
      },
      value: {
        type: String,
        default: ''
      },
      data: {
        type: Array,
        default() {
          return []
        }
      },
      isRequired: {
        type: Boolean,
        default: false
      }
    },
    components: {
      Popup, Icon,
    },
    data() {
      return {
        showPop: false,
        tmp: '',
        selected: '',
      }
    },
    watch: {
      value:{
        handler(val){
          this.tmp = val;
          this.selected = val;
        }
      }
    },
    methods: {
      selItem(item) {
        this.tmp = item;
      },
      confirm() {
        this.selected = this.tmp;
        this.showPop = false;
        this.$emit('input', this.selected);
      },
    },
    created() {
      this.tmp = this.value;
      this.selected = this.value;
    }
  }
</script>

<style scoped lang="scss">
  // 结算方式
  .pop-single-container {
    width: 95%;
    margin: 0 auto;
    position: relative;
    background: #fff;
    box-sizing: border-box;
    padding: .02rem .1rem;
    .pop_info{
      display: flex;
      font-size: .14rem;
      align-items: center;
      justify-content: space-between;
      .title {
        color: #757575;
        &.required{
          color: #5077aa;
          font-weight: bold;
        }
      }
    }
    .icon-shenglve,
    .icon-gengduo {
      font-size: .2rem;
      color: #707070;
    }
    .mode {
      color: #111;
      font-weight: 500;
      display: flex;
      align-items: center;
      .mode-content {
        margin-right: .06rem;
      }
    }
  }

  /* 弹出框 */
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      
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
      .each_mode {
        margin: 0 .1rem .1rem 0;
        display: inline-block;
        padding: .04rem .2rem;
        border: 1px solid #C7C7C7;
        border-radius: 40px;
      }
      .choiced {
        background: #5077aa;
        color: #fff;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
    }
    // 确定
    .cfm_btn {
      left: 50%;
      bottom: 5%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, 0);
      box-shadow: 0 2px 12px #5077aa;
    }
  }
</style>
