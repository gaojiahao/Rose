<template>
  <!-- 合规财务报表 -->
  <div class="pages hgcw-list-container">
    <div class="tips-word">请选择</div>
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
    .tips-word {
      top: 10%;
      width: 100%;
      color: #c8c8c8;
      font-size: .4rem;
      font-weight: 200;
      text-align: center;
      position: absolute;
    }
    .btns {
      left: 0;
      top: 50%;
      width: 100%;
      padding: 0 .2rem;
      position: absolute;      
      box-sizing: border-box;
      transform: translateY(-50%);
    }
    .btn-item {
      color: #fff;
      font-size: .16rem;
      font-weight: bold;
      padding: .1rem 0;
      margin-top: .2rem;
      text-align: center;
      position: relative;
      border-radius: .08rem;
      background: #5077aa;
      box-shadow: 0 2px 5px #5077aa;
    }
    .vux-x-icon-ios-arrow-right {
      top: 50%;
      right: 1%;
      fill: #fff;
      position: absolute;
      transform: translate(0, -50%);
    }
  }
</style>
