<template>
  <div class='r-picker' @click='showStatus'>
    <div class="picker">
      <label :class="{'required' : required}">{{title}}</label>
      <div class='content'>
        <span class='mater_nature'>{{showValue || "请选择"}}</span>
        <span class="icon-right"></span>
      </div>
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
      // 标题
      title: {
        type: String,
      },
      // 默认值
      value: {
        type: String,
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
      // 是否禁用
      disabled: {
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
    padding: .18rem 0;
    font-size: .14rem;
    background: #fff;
    line-height: .14em;
    color: #333;
    .picker{
      display: flex;
      justify-content: space-between;
      align-items: center;
      label {
        color: #696969;
        &.required{
          color: #3296FA;
          font-weight: bold;
        }
      }
      .content {
        display: flex;
        align-items: center;
        .icon-right{
          width: .08rem;
          height: .14rem;
          margin-left: .1rem;
        }
        
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
