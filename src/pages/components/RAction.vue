<template>
  <div class="m_btm vux-1px-t" v-if="!!actions.length">
    <span class="m_button reject" @click="showConfirmPop(2)" v-if="actions.includes('revoke')">撤回</span>
    <span class="m_button reject" @click="showConfirmPop(0)" v-if="actions.includes('disagree')">拒绝</span>
    <span class="m_button" @click="showConfirmPop(1)" v-if="actions.includes('agreement')">同意</span>
  </div>
</template>

<script>
  export default {
    name: "RAction",
    props: {
      actions: {
        type: Array,
        default() {
          return []
        }
      }
    },
    methods: {
      // 展示弹窗
      showConfirmPop(result = 1) {
        this.$emit('on-action', result);
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .m_btm {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 101;
    margin-top: 20px;
    box-sizing: border-box;
    display: flex;
    .count_part {
      flex: 2.5;
      background: #fff;
      color: #000;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    .m_button {
      flex: 1;
      color: #fff;
      background: #5077AA;
      display: inline-block;
      text-align: center;
      &.reject {
        background-color: #ccc;
      }
    }
  }
</style>
