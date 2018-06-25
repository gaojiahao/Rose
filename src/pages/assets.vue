<template>
  <div class="pages">
    <h1 class="a_title">
      固定资产
      <span class="a_user" @click="goMylist">我的提交<x-icon class="right_arrow" type="ios-arrow-forward"
                                                         size="16"></x-icon></span>
    </h1>
    <div class="a_main">
      <div class="a_main_part">
        <group title="请填写相应部门的信息">
          <popup-picker
            title="申请部门"
            :data="a_dplist"
            v-model="a_dpsq"
            @on-change="changeType"
          ></popup-picker>
          <popup-picker
            title="使用部门"
            :data="a_dplist"
            v-model="a_dpsy"
            @on-change="changeType"
          ></popup-picker>
        </group>
        <group title="请填写类型">
          <x-input
            :title='item'
            :key="index"
            text-align='right'
            v-for="(item, index) in xp_list"
          ></x-input>
        </group>
      </div>
    </div>
    <div class="a_btm vux-1px-t">
      <span class="count_part">合计:￥1,000</span>
      <span class="a_button" @click="goflow">确定</span>
    </div>
  </div>

</template>

<script>
  import {Cell, Group, XInput, PopupPicker} from 'vux'

  export default {
    components: {
      Cell,
      Group,
      XInput,
      PopupPicker
    },
    data() {
      return {
        a_dplist: [['部门A', '部门B', '部门C', '部门D', '部门E',]],
        a_dpsq: [],  //申请部门
        a_dpsy: [],  //使用部门
        xp_list: ['电脑', '桌子'],  // 宣品 填写内容
      }
    },
    methods: {
      goMylist() { //我的提交
        this.$router.push({
          path: '/myList',
          query: {
            listId: this.$route.query.list
          }
        })
      },
      goflow() {
        this.$router.push({path: '/flow'})
      },
      changeType() {

      }
    }
  }
</script>

<style lang='scss' scoped>
  .a_title { //标题
    width: 100%;
    height: 120px;
    line-height: 80px;
    font-size: 34px;
    text-align: center;
    color: #fff;
    font-weight: 200;
    background: #5077AA;
    position: relative;
    .a_user {
      line-height: initial;
      font-size: 16px;
      font-weight: normal;
      position: absolute;
      left: 50%;
      bottom: 20%;
      transform: translate(-50%);
      display: flex;
      align-items: center;
      .right_arrow {
        fill: #fff;
      }
    }
  }

  .a_main {
    width: 90%;
    max-width: 600px;
    position: absolute;
    top: 90px;
    left: 50%;
    transform: translate(-50%, 0);
    border-radius: 4px;
    z-index: 100;
    padding-bottom: 56px;
    .a_main_part {
      background: #fff;
      margin-top: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px #e8e8e8;
    }
  }

  .a_btm {
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
    .a_button {
      flex: 1;
      color: #fff;
      background: #5077AA;
      display: inline-block;
      text-align: center;
    }
  }

</style>
