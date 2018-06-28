<template>
  <div class="create-confirm">
    <confirm v-model="showConfirm" @on-cancel="cancel" @on-confirm="confirm" :close-on-confirm="false">
      <group>
        <x-textarea title='原因:' v-model='reason'></x-textarea>
      </group>
    </confirm>
  </div>
</template>

<script>
  import {Confirm, Group, XTextarea, TransferDom} from 'vux'

  export default {
    name: "TaskConfirm",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      // 原因能否为空
      canEmpty: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        showConfirm: false,
        reason: '',
      }
    },
    watch: {
      show(val) {
        if (val) {
          this.showConfirm = true;
        }
      },
      showConfirm(val) {
        if (!val) {
          this.$emit('input', val);
        }
      },
    },
    directives: {TransferDom},
    components: {
      Confirm,
      Group,
      XTextarea,
    },
    methods: {
      // TODO 取消
      cancel() {
        this.reason = '';
        this.$emit('on-cancel');
      },
      // TODO 确定
      confirm() {
        this.$emit('on-confirm', this.reason);
        if (!this.canEmpty && !this.reason) {
          return
        }
        this.reason = '';
        this.showConfirm = false;
      },
    },
  }
</script>

<style lang="scss">
  /* 确定弹窗 */
  .create-confirm {
    .weui-dialog__bd {
      &:first-child {
        padding: 0;
      }
    }
    .weui-cells {
      margin-top: 0;
      &:after {
        transform: scaleY(0);
      }
    }
  }
</style>
