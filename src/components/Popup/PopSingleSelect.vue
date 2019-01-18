<template>
  <div class="pop-single-container" @click="showPop = !showPop">
    <div class='pop_info'>
      <div class="title" :class="{required : isRequired}">{{title}}</div>
      <div class="mode">
        <span class="mode-content">{{selected || '请选择'}}</span>
        <span class="icon-right"></span>
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
    padding: .18rem 0;
    background: #fff;
    font-size: .14rem;
    color: #333;
    .pop_info {
      display: flex;
      line-height: .14rem;
      align-items: center;
      justify-content: space-between;
      .title {
        color: #696969;
        &.required {
          color: #3296FA;
          font-weight: bold;
        }
      }
      .mode {
        display: flex;
        align-items: center;
        .icon-right {
          width: .08rem;
          height: .14rem;
          margin-left: .1rem;
        }
      }
    }
  }

  /* 弹出框 */
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      overflow: hidden;
      padding: 0 .15rem;
      position: relative;
      // 顶部
      .title {
        font-size: .16rem;
        position: relative;
        padding: 0.08rem 0 .14rem;
        text-align: center;
        margin-top: .3rem;
        color: #17181D;
        // 关闭icon
        .close_icon {
          top: -.2rem;
          right: 0;
          position: absolute;
        }
      }
      .each_mode {
        font-size: .14rem;
        line-height: .14rem;
        border-radius: .22rem;
        background: #F7F7F7;
        color: #696969;
        margin: 0 .1rem .1rem 0;
        display: inline-block;
        padding: .08rem .25rem;
        border: 1px solid #F7F7F7;
        border-radius: 40px;
      }
      .choiced {
        border: 1px solid #30A7FF;
        background: #fff;
        color: #30A7FF;
      }
      // .vux-1px:before {
      //   border-radius: 40px;
      // }
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
