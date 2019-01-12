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
    margin: .1rem .1rem 0;
    width: calc(100% - .2rem);
    background-color: #fff;
    color: #333;
    overflow: hidden;
    box-sizing: border-box;
    .comment-container {
      display: flex;
      margin: .12rem 0 .15rem;
      padding: 0 .15rem;
      line-height: .16rem;
      color: #999;
      font-size: .12rem;
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
