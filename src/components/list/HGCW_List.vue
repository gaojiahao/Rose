<template>
  <!-- 合规财务报表 -->
  <div class="pages hgcw-list-container">
    <div class="btns">
      <div class="btn-item" v-for="(item, index) in listData" @click="goDetail(item)" :key="index">
        <span>{{item.title}}</span>
        <x-icon type="ios-arrow-right" size="20"></x-icon>
      </div>
    </div>
  </div>
</template>

<script>
  import {Group, Cell} from 'vux'

  export default {
    name: "HGCW_List",
    data() {
      return {
        listData: [
          {
            title: '利润表',
            code: 'LR',
          }, {
            title: '资产负债表',
            code: 'ZCFZ',
          },
        ]
      }
    },
    components: {
      Group,
      Cell,
    },
    methods: {
      goDetail(item) {
        let {code} = this.$route.params;
        this.$router.push({
          path: `/detail/${code}`,
          query: {
            code: item.code
          }
        })
      }
    },
    created() {
      this.$loading.hide();
    }
  }
</script>

<style scoped lang="scss">
  .hgcw-list-container {
    .btns {
      position: absolute;
      left: 0;
      top: 50%;
      padding: 0 .2rem;
      width: 100%;
      transform: translateY(-50%);
      box-sizing: border-box;
    }
    .btn-item {
      display: flex;
      justify-content: space-between;
      margin-top: .15rem;
      padding: .1rem;
      background-color: #4b8bf4;
      border-radius: .12rem;
      color: #fff;
    }
    .vux-x-icon-ios-arrow-right {
      fill: #fff;
    }
  }
</style>
