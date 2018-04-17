<template>
  <div id="app" class="option-container">
    <h1 class="option-title">信息确认</h1>
    <div class="option-wrapper">
      <group class="each_group">
        <popup-picker class="each_picker" title="所在地区" placeholder="请选择地区" :data="regionList" v-model="region"
                      @on-change="regionChange">
        </popup-picker>
        <popup-picker title="所在银行" placeholder="请选择银行" :data="bankList" v-model="bank" v-show="showMore"
                      @on-change="bankChange">
        </popup-picker>
        <popup-picker title="所属区域" placeholder="请选择区域" :data="deptList" v-model="dept" @on-change="deptChange"
                      v-show="showMore">
        </popup-picker>
        <popup-picker title="所属队长" placeholder="请选择队长" :data="captainList" v-model="captain" @on-change="captionChange"
                      v-show="showMore"></popup-picker>
      </group>
    </div>
    <x-button class="each_select" :gradients="['#B99763', '#E7D0A2']" @click.native="goHome" v-if="showButton">确定
    </x-button>
  </div>
</template>

<script>
  import optionService from '../service/optionService'
  import {Group, XButton, PopupPicker} from 'vux'

  export default {
    components: {
      Group,
      XButton,
      PopupPicker
    },
    data() {
      return {
        region: [], // 地区
        bank: [], // 银行
        dept: [], // 部门
        captain: [],
        regionList: [['']],
        bankList: [['']],
        deptList: [['']],
        captainList: [['']],
        showMore: false,
        showButton: false
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
        let prov = this.region[0] || '';
        let bank = this.bank[0] || '';
        let dept = this.dept[0] || '';
        let captain = this.captain[0] || '';
        let tips = !prov ? '请选择地区' :
          (!bank ? '请选择银行' :
            (!dept ? '请选择区域' :
              (!captain ? '请选择队长' : '')));

        if (tips) {
          this.$vux.alert.show({
            content: tips
          });
          return
        }
        console.log(`${prov}----${bank}----${dept}`)
        this.$router.replace({path: '/Rose'})
      },
      saveOption(data) {
        optionService.saveOption()
      },
      // TODO 获取输入参数
      getOption() {
        optionService.getOption()
      },
      // TODO 获取地区
      getRegion(params = {}) {
        return new Promise((resolve, reject) => {
          optionService.getRegion().then(data => {
            let region = data.reduce((arr, item) => {
              arr.push(item.name)
              return arr
            }, [''])
            this.$set(this.regionList, '0', region)
            resolve()
          })
        })
      },
      // TODO 获取银行
      getBank(params = {}) {
        optionService.getBank().then(data => {
          let bank = data.tableContent.reduce((arr, item) => {
            arr.push(item.groupName)
            return arr
          }, [''])
          this.$set(this.bankList, '0', bank)
        })
      },
      // TODO 获取部门
      getDept() {
        optionService.getDept().then(data => {
          let dept = data.tableContent.reduce((arr, item) => {
            arr.push(item.groupName)
            return arr
          }, [''])
          this.$set(this.deptList, '0', dept)
        })
      },
      // TODO 获取队长
      getCaptain() {
        optionService.getCaptain().then(data => {
          let captain = data.tableContent.reduce((arr, item) => {
            arr.push(item.nickname)
            return arr
          }, [''])
          this.$set(this.captainList, '0', captain)
        })
      }
    },
    created() {
      // this.$vux.loading.show()
      // this.$router.replace({path: '/Rose'})
      this.getRegion().then(() => {
        this.getDept()
        this.getBank()
        this.getCaptain()
      })
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
    .weui-cells {
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
