<template>
  <div id="app" class="pages">
    <h1 class="op_title">信息确认</h1>
    <div class="select_part">
      <group class="each_group">
        <popup-picker class="each_picker" title="所在地区" placeholder="请选择地区" :data="list1" v-model="value1"
                      @on-change="getPickerValue">
        </popup-picker>
        <popup-picker title="所在银行" placeholder="请选择银行" :data="list2" v-model="value2" v-if="showMore">
        </popup-picker>
        <popup-picker title="所在部门" placeholder="请选择部门" :data="list3" v-model="value3" @on-change='Sel_Dp'
                      v-if="showMore">
        </popup-picker>
      </group>
    </div>
    <x-button id="each_select" :gradients="['#B99763', '#E7D0A2']" @click.native="goHome" v-if="showButton">确定
    </x-button>
    <router-view></router-view>
  </div>
</template>

<script>
  import {Group, XButton, PopupPicker} from 'vux'

  export default {
    components: {
      Group,
      XButton,
      PopupPicker
    },
    data() {
      return {
        value1: [],
        value2: [],
        value3: [],
        list1: [['', '海南', '广东', '广西', '山西', '福建', '北京', '加州旅馆']],
        list2: [['', '中国银行', '中国工商银行', '招商银行', '中国民生银行']],
        list3: [['', '事业部1', '事业部2', '事业部3']],
        showMore: false,
        showButton: false
      }
    },
    methods: {
      getPickerValue(val) {
        if (val[0]) {
          this.showMore = true
        }
      },
      Sel_Dp(val) {
        console.log(val[0]);
        if (val[0]) {
          this.showButton = !this.showButton
        }
      },
      goHome() {
        this.$router.replace({path: '/Rose'})
      }
    }
  }
</script>

<style>
  .pages {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: #F5F5F5;
  }

  .select_part {
    width: 80%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .op_title {
    width: 100%;
    height: 150px;
    line-height: 150px;
    text-align: center;
    font-size: 50px;
    font-weight: 200;
    color: #CFCFCF;
  }

  .each_group .weui-cells {
    background: -webkit-linear-gradient(left top, rgba(176, 140, 88, 1), rgba(228, 201, 152, 1));
  }

  .each_group .weui-cells .weui-label {
    color: #fff;
    font-weight: 300;
  }

  .each_group .weui-cells .vux-popup-picker-placeholder {
    color: #fff;
    font-weight: 300;
  }

  .each_group .weui-cells .vux-cell-value {
    color: #fff;
  }

  #each_select {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    border-radius: 0;
  }
</style>
