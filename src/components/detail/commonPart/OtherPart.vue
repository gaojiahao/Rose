<template>
  <div class="other-part-container">
    <price-total :amt="amt" :tax-amt="taxAmt" :count="count" v-if="count"></price-total>
    <div class="comment-container">
      <span class="comment_title">备注：</span>
      <span class="comment_value">{{otherInfo.biComment || '无'}}</span>
    </div>
    <!-- 附件 -->
    <upload-file :default-value="attachment" no-upload></upload-file>
  </div>
</template>

<script>
  import PriceTotal from 'components/detail/commonPart/PriceTotal'
  import UploadFile from 'components/upload/UploadFile'

  export default {
    name: "OtherPart",
    props: {
      // 金额
      amt: {
        type: Number,
        default: 0
      },
      // 税金
      taxAmt: {
        type: Number,
        default: 0
      },
      // 合计
      count: {
        type: Number,
        default: 0
      },
      otherInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      // 附件
      attachment: {
        type: Array,
        default() {
          return []
        }
      },
    },
    components: {
      PriceTotal, UploadFile,
    },
    data() {
      return {}
    }
  }
</script>

<style scoped lang="scss">
  .other-part-container {
    color: #333;
    overflow: hidden;
    margin: .1rem .1rem;
    box-sizing: border-box;
    background-color: #fff;
    width: calc(100% - .2rem);
    .comment-container {
      color: #999;
      display: flex;
      font-size: .12rem;
      padding: 0 .15rem;
      line-height: .16rem;
      margin: .12rem 0 .15rem;
    }
    .comment_title {
      color: #999;
    }
    .comment_value {
      flex: 1;
      color: #696969;
    }
  }
</style>
