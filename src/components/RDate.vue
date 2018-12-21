<template>
  <div class="r-date-container" @click="clickDateSelect">
    <div class="title" :class="{'required' : required}">{{title}}</div>
    <div class="mode">
      <span class="mode_content">{{time || placeholder || `请选择${title}`}}</span>
      <span class="iconfont icon-shenglve"></span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "RDate",
    props: {
      title: {
        type: String,
        default: ''
      },
      value: {
        type: String,
        default: ''
      },
      required: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: ''
      },
      // 起始日期
      startDate: {
        type: String,
        default: '',
      },
      // 结束日期
      endDate: {
        type: String,
        default: '',
      }
    },
    data() {
      return {
        time: '',
      }
    },
    watch: {
      value: {
        handler(val) {
          this.time = val;
        },
        immediate: true,
      }
    },
    methods: {
      // TODO 展示时间选择器
      clickDateSelect() {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.time,
          startDate: this.startDate,
          endDate: this.endDate,
          onConfirm: (value) => {
            this.time = value;
            this.$emit('input', value);
          }
        })
      },
    },
  }
</script>

<style scoped lang="scss">
  .r-date-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto 0;
    padding: .02rem .1rem;
    width: 95%;
    background: #fff;
    font-size: .14rem;
    box-sizing: border-box;
    .title {
      color: #757575;
      &.required{
        color: #5077aa;
        font-weight: bold;
      }
    }
    .mode {
      color: #111;
      font-weight: 500;
      display: flex;
      align-items: center;
      .mode_content {
        margin-right: .06rem;
      }
      .icon-shenglve {
        font-size: .2rem;
        color: #707070;
      }
    }
  }
</style>
