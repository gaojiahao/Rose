<template>
  <div class="pop-single-container" @click="showPop = !showPop">
    <p class="title">{{title}}</p>
    <p class="mode">{{selected}}</p>
    <span class="iconfont icon-gengduo"></span>
    <!-- 结算popup -->
    <div v-transfer-dom>
      <popup v-model="showPop" height="70%" class="trade_pop_part">
        <div class="trade_pop">
          <div class="title">{{title}}
            <x-icon class="close_icon" type="ios-close-empty" size="30" @click="showPop = !showPop"></x-icon>
          </div>
          <span class="each_mode"
                :class="{choiced : item===tmp}"
                v-for="(item, index) in data"
                :key="index"
                @click="selItem(item,index)">{{item}}</span>
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
    position: relative;
    margin: 10px auto;
    padding: .06rem .08rem;
    width: 95%;
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
    .icon-gengduo {
      top: 50%;
      right: .1rem;
      font-size: .24rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    .title {
      color: #757575;
      
      font-size: .12rem;
    }
    .mode {
      color: #111;
      font-weight: 500;
    }
  }

  /* 弹出框 */
  .trade_pop_part {
    background: #fff;
    .trade_pop {
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
      .each_mode {
        margin-right: .1rem;
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
