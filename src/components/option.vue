<template>
  <div id="app" class="option-container">
    <h1 class="option-title">信息确认</h1>
    <div class="option-wrapper">
      <group class="each_group">
        <popup-picker class="each_picker" title="所在地区" placeholder="请选择地区" :data="regionList" v-model="region"
                      @on-change="regionChange">
        </popup-picker>
        <popup-picker title="所在银行" placeholder="请选择银行" :data="bankList" v-model="bank" @on-change="bankChange">
        </popup-picker>
        <popup-picker title="所属区域" placeholder="请选择区域" :data="deptList" v-model="dept" @on-change="deptChange">
        </popup-picker>
        <!--<popup-picker title="所属队长" placeholder="请选择队长" :data="captainList" v-model="captain" @on-change="captionChange"-->
        <!--v-show="showMore"></popup-picker>-->
        <x-input title="所属队长" text-align="right" @on-change="searchCaptain" @on-focus="focusCaptain"
                 @on-click-clear-icon="clearCaptain" placeholder="请输入队长" v-model="captain"></x-input>
      </group>
      <group class="captain-search-container">
        <cell :title="item" v-for="(item, index) in captainList" @click.native="selectCaptain(item)"
              :key="index"></cell>
      </group>
    </div>
    <x-button class="each_select" :gradients="['#B99763', '#E7D0A2']" @click.native="goHome">确定</x-button>
  </div>
</template>

<script>
  import optionService from '../service/optionService'
  import {Group, XButton, PopupPicker, XInput, Cell} from 'vux'

  const ROSE_OPTION_KEY = 'ROSE_OPTION'
  export default {
    components: {
      Group,
      XButton,
      PopupPicker,
      XInput,
      Cell
    },
    data() {
      return {
        region: [], // 地区
        bank: [], // 银行
        dept: [], // 部门
        captain: '', // 队长
        regionList: [['']], // 地区列表
        bankList: [['']], // 银行列表
        deptList: [['']], // 部门列表
        captainList: [], // 搜索的队长列表
        showMore: false, // 判断银行、部门、队长是否展示
        showButton: false, // 判断确定按钮是否展示
      }
    },
    methods: {
      // TODO 地区切换
      regionChange(val) {
        this.showButton = !!val[0]
        if (val[0]) {
          this.showMore = true
        }
      },
      // TODO 银行切换
      bankChange(val) {
      },
      // TODO 部门切换
      deptChange(val) {
      },
      // TODO 队长切换
      captionChange() {
      },
      goHome() {
        let region = this.region[0] || '';
        let bank = this.bank[0] || '';
        let dept = this.dept[0] || '';
        let captain = this.captain || '';
        let tips = !region ? '请选择地区' :
          (!bank ? '请选择银行' :
            (!dept ? '请选择区域' :
              (!captain ? '请选择队长' : '')));

        if (tips) {
          this.$vux.alert.show({
            content: tips
          });
          return
        }
        this.$router.replace({path: '/Home'})
        localStorage.setItem(ROSE_OPTION_KEY, JSON.stringify({region, bank, dept, captain}))
      },
      saveOption(data) {
        // optionService.saveOption()
      },
      // TODO 获取输入参数
      getOption() {
        // optionService.getOption()
      },
      // TODO 获取地区
      getRegion(params = {}) {
        return new Promise((resolve, reject) => {
          optionService.getRegion().then(data => {
            let region = data.reduce((arr, item) => {
              arr.push(item.name)
              return arr
            }, [])
            this.$set(this.regionList, '0', region)
            resolve()
          })
        })
      },
      // TODO 获取银行
      getBank(params = {}) {
        optionService.getBank().then(data => {
          let bank = data.tableContent.reduce((arr, item) => {
            arr.push(item.bankName)
            return arr
          }, [])
          this.$set(this.bankList, '0', bank)
        })
      },
      // TODO 获取部门
      getDept() {
        optionService.getDept().then(data => {
          let dept = data.tableContent.reduce((arr, item) => {
            arr.push(item.groupName)
            return arr
          }, [])
          this.$set(this.deptList, '0', dept)
        })
      },
      // TODO 获取队长
      getCaptain(params) {
        optionService.getCaptain(params).then(data => {
          let captain = data.tableContent.reduce((arr, item) => {
            arr.push(item.nickname)
            return arr
          }, [])
          this.captainList = captain
        })
      },
      // TODO
      focusCaptain() {
        this.hasSelected = false
      },
      // TODO 搜索队长
      searchCaptain(val) {
        if (this.hasSelected) {
          return
        }
        if (val) {
          this.getCaptain({
            value: val
          })
        }
      },
      // TODO 选中队长
      selectCaptain(item) {
        this.captain = item
        this.captainList = []
        this.hasSelected = true
      },
      // TODO 清空队长列表
      clearCaptain() {
        this.captainList = []
      },
    },
    created() {
      // this.$vux.loading.show()
      let option = localStorage.getItem(ROSE_OPTION_KEY)
      if (option) {
        this.$router.replace({path: '/Home'})
      } else {
        this.getRegion().then(() => {
          this.getDept()
          this.getBank()
          // this.getCaptain()
        })
      }
    }
  }
</script>

<style lang="scss">
  .option-container {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: #F5F5F5;
    .option-title {
      width: 100%;
      height: 150px;
      line-height: 150px;
      text-align: center;
      font-size: 50px;
      font-weight: 200;
      color: #CFCFCF;
    }
    .option-wrapper {
      width: 80%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .each_group {
      .weui-input {
        color: #fff;
        &::placeholder {
          color: #fff;
        }
        &::-webkit-input-placeholder {
          color: #fff;
        }
      }
      .weui-cells {
        margin-top: 0;
        background: -webkit-linear-gradient(left top, rgba(176, 140, 88, 1), rgba(228, 201, 152, 1));
        .weui-label {
          color: #fff;
          font-weight: 300;
        }
        .vux-popup-picker-placeholder {
          color: #fff;
          font-weight: 300;
        }
        .vux-cell-value {
          color: #fff;
        }
        .weui-cell__bd {
          padding-right: 11px;
        }
      }
    }
    .captain-search-container {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1;
      margin-top: 5px;
      width: 100%;
      max-height: 120px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      .weui-cells {
        margin-top: 0;
      }
    }
    .each_select {
      width: 100%;
      position: fixed;
      bottom: 0;
      left: 0;
      border-radius: 0;
    }
  }
</style>
