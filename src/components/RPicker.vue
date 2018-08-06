<template>
  <div class='r-picker vux-1px-b' :class="{'r-picker-2': mode === '2'}" @click='showStatus'>
    <label :class='{ required : required}'>{{title}}</label>
    <div class='picker'>
      <span class="horizontal-title" :class='{ required : required}'>{{title}}</span>
      <span class='mater_nature'>{{showValue}}</span>
      <x-icon class="r_arrow" type="ios-arrow-right" size="20" v-if="showArrow"></x-icon>
      <span class='iconfont icon-gengduo' :class="!pickerStatus?'iconfont_fff':''" v-else></span>
    </div>
    <div v-transfer-dom>
      <popup id="trade_pop_part" v-model="show">
        <div>
          <div class='popup_header vux-1px-b'>
            <span class='cancel' @click="show = false">取消</span>
            <span class='confirm' @click="confirm">确认</span>
          </div>
          <picker :data="data" :columns="1" :value="currentValue" v-model="currentValue"></picker>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {Icon, TransferDom, Picker, Popup} from 'vux'

  export default {
    name: "RPicker",
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
      required: {
        type: Boolean
      },
      pickerStatus: {
        type: Boolean,
        default: true
      },
      // 界面模式，1为默认，2为水平展示
      mode: {
        type: String,
        default: '1'
      },
      // 是否展示箭头
      showArrow: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        show: false,
        currentValue: '',
        showValue: '',
      }
    },
    watch: {
      value: {
        handler(value) {
          this.showValue = value;
          this.currentValue = value ? [value] : [];
          this.$emit('on-change', value);
        }
      }
    },
    directives: {
      TransferDom
    },
    components: {
      Picker,
      Popup,
      Icon,
    },
    methods: {
      confirm() {
        let [val = ''] = this.currentValue;
        // this.showValue = val.name;
        this.show = false;
        this.$emit('input', val);
      },
      //picker显示
      showStatus() {
        if (!this.pickerStatus) {
          return;
        }
        this.show = !this.show;
      }
    },
    created() {
      this.currentValue = [this.value];
      this.showValue = this.value;
    }
  }
</script>

<style scoped lang="scss">
  .r-picker {
    padding: 0.05rem 0.08rem;
    font-size: 0.16rem;
    &.r-picker-2 {
      > label {
        display: none;
      }
      .picker {
        padding-right: .3rem;
      }
      .horizontal-title {
        display: block;
      }
      .r_arrow {
        position: absolute;
        right: 0;
      }
    }
    label {
      color: #6d6d6d;
      font-size: 0.12rem;
      display: block;
      line-height: 0.2rem;
    }
    .horizontal-title {
      display: none;
    }
    .required {
      color: red;
      font-weight: bold;
    }
    .picker {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: .38rem;
      .mater_nature {
        line-height: 0.2rem;
      }
      .iconfont {
        font-size: 0.24rem;
      }
      .r_arrow {
        display: inline-block;
        height: .38rem;
      }
    }
  }

  //确认框
  .popup_header {
    display: flex;
    justify-content: space-between;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    background-color: #fbf9fe;
    padding: 0 15px;
    .cancel {
      color: #828282;
    }
    .confirm {
      color: #FF9900;
    }
  }
  .iconfont_fff{
    color: #fff;
  }
</style>
