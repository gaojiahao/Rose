<template>
  <div class="emotion-container vux-1px-t" v-show="show" ref="emotionContainer">
    <div class="emotion-wrapper">
      <emotion class="emotion-item" v-for="(item, index) in emotionList" :key="index"
               @click.native="emotionClick(item, index)">{{item}}</emotion>
    </div>
  </div>
</template>

<script>
  import emotions from '@/home/pages/maps/emotion'
  import {WechatEmotion as Emotion} from 'vux'

  export default {
    name: "REmotion",
    props: {
      show: {
        type: Boolean,
        default: true
      }
    },
    components: {
      Emotion,
    },
    data() {
      return {
        emotionList: [...emotions],
      }
    },
    methods: {
      // TODO 点击表情
      emotionClick(item, index) {
        this.$emit('on-select', `[${item}]`);
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .emotion-container {
    padding: .1rem;
    width: 100%;
    height: 2rem;
    background-color: #fff;
    box-sizing: border-box;
    .emotion-wrapper {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    .emotion-item {
      margin: .05rem;
      width: .24rem;
      height: .24rem;
      /*flex: 1 0 .3rem;*/
      /*min-height: .3rem;*/
    }
  }
</style>
