<template>
  <div class='r-picker '
       :class="{'r-picker-2': mode === '2', 
        'r-picker-3': mode === '3', 
        'r-picker-4': mode === '4', 
        'vux-1px-b' : hasBorder, 
        'vux-1px-t': hasBorderTop }"
       @click='showStatus'>
    <template v-if="mode === '1' || mode === '2'">
      <label :class='{ required : required}'>{{title}}</label>
      <div class='picker'>
        <span class="horizontal-title" :class='{ required : required}'>{{title}}</span>
        <span class='mater_nature'>{{showValue}}</span>
        <x-icon class="r_arrow" type="ios-arrow-forward" size="16" v-if="showArrow"></x-icon>
        <span class='iconfont icon-gengduo' :class="!pickerStatus?'iconfont_fff':''" v-else></span>
      </div>
    </template>
    <!-- 模式3 -->
    <template v-else-if="mode === '3'">
      <div class="title" :class="{required : required}">{{title}}</div>
      <div class="mode">{{showValue || placeholder}}</div>
      <x-icon class="r_arrow" type="ios-arrow-right" size="20" v-show="!disabled"></x-icon>
    </template>
    <template v-else-if="mode === '4'">
      <div class="title" :class="{required : required}">{{title}}</div>
      <div class="mode">{{showValue}}</div>
      <x-icon class="r_arrow" type="ios-arrow-right" size="16" v-show="!disabled"></x-icon>
    </template>
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
      // 标题
      title: {
        type: String,
        default: ''
      },
      // 默认值
      value: {
        type: String,
        default: ''
      },
      // picker列表
      data: {
        type: Array,
        default() {
          return []
        }
      },
      // 是否必填
      required: {
        type: Boolean,
        default: false
      },
      pickerStatus: {
        type: Boolean,
        default: true
      },
      // 界面模式，1为默认，2为水平展示,3为项目任务使用
      mode: {
        type: String,
        default: '1'
      },
      // 是否展示箭头
      showArrow: {
        type: Boolean,
        default: false,
      },
      // 是否禁用
      disabled: {
        type: Boolean,
        default: false
      },
      // 占位文字，有使用的mode: 3
      placeholder: {
        type: String,
        default: '请选择'
      },
      //是否有下边框
      hasBorder: {
        type: Boolean,
        default: true
      },
      // 是否有上边框
      hasBorderTop: {
        type: Boolean,
        default: false

      },
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
        if (!this.pickerStatus || this.disabled) {
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
  .vux-1px-b:after {
    left: .1rem;
  }
  .r-picker {
    padding: 0.05rem 0.08rem;
    font-size: 0.16rem;
    &.r-picker-2 {
      > label {
        display: none;
      }
      .picker {
        padding-right: .1rem;
      }
      .horizontal-title {
        display: block;
      }
      .r_arrow {
        position: absolute;
        right: -.04rem;
      }
    }
    /* 模式3样式 */
    &.r-picker-3 {
      width: 95%;
      margin: 10px auto;
      position: relative;
      background: #fff;
      box-sizing: border-box;
      padding: .06rem .1rem;
      .title {
        color: #757575;

        font-size: .12rem;
      }
      .mode {
        color: #111;
        font-weight: 500;
      }
      .required {
        color: #5077aa;
        font-weight: bold;
      }
      .r_arrow {
        top: 50%;
        right: .04rem;
        position: absolute;
        transform: translate(0, -50%);
      }
    }
    /* 模式4 */
    &.r-picker-4 {
      position: relative;
      display: flex;
      justify-content: space-between;
      padding: .1rem .2rem .1rem .1rem;
      width: 100%;
      box-sizing: border-box;
      &.vux-1px-t:before {
        left: .1rem;
      }
      .title {
        font-size: .16rem;
      }
      .mode {
        color: #999;
      }
      .r_arrow {
        top: 50%;
        right: .04rem;
        position: absolute;
        transform: translate(0, -50%);
        fill : #999;
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
      color: #5077aa;
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

  .iconfont_fff {
    color: #fff;
  }
</style>
