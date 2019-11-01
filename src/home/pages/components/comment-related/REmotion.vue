<template>
  <div class="emotion-container vux-1px-t" v-show="show" ref="emotionContainer">
    <div class="emotion-wrapper">
        <div v-for="(item, index) in emotionList" :key="index" class="vux-center-h">
        <emotion   @click.native="emotionClick(item, index)">{{item}}</emotion>
        <emotion is-gif>{{item}}</emotion>
    </div>
    </div>
    
  </div>
</template>

<script>
  import emotions from 'plugins/emoji/emotion'
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
      // 点击表情
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
    width: 100%;
    height: 2rem;
    padding: .1rem;
    box-sizing: border-box;
    background-color: #F6F6F6;
    .emotion-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      overflow: auto;
      flex-wrap: wrap;
    }
    .emotion-item {
      width: .24rem;
      height: .24rem;
      margin: .05rem;
    }
  }
</style>
