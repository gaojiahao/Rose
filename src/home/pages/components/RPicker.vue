<template>
  <div class='r-picker vux-1px-b' @click='show = !show'>
    <label>{{title}}</label>
    <div class='picker'>
      <span class='mater_nature'>{{showValue}}</span>
      <span class='iconfont icon-gengduo'></span>
    </div>
    <div v-transfer-dom>
      <popup id="trade_pop_part" v-model="show">
        <div>
          <div class='popup_header vux-1px-b'>
            <span class='cancel' @click="show = false">取消</span>
            <span class='confirm' @click="confirm">确认</span>
          </div>
          <picker :data="data" :columns="1" v-model="currentValue"></picker>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {TransferDom, Picker, Popup} from 'vux'

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
    },
    methods: {
      confirm() {
        let [val = ''] = this.currentValue;
        // this.showValue = val.name;
        this.show = false;
        this.$emit('input', val);
      },
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
    label {
      color: #6d6d6d;
      font-size: 0.12rem;
      display: block;
      line-height: 0.2rem;
    }
    .picker {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .mater_nature {
        font-size: 0.16rem;
        line-height: 0.2rem;
      }
      .iconfont {
        font-size: 0.24rem;
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
</style>
