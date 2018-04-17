<template>
  <div class="filter-container">
    <h1 class="cp_title">{{regeionTitle}}</h1>
    <div class="select_part">
      <group class="each_group">
        <popup-picker v-for="( item, index ) in pickerList" class="each_picker" :title=item.title :placeholder=item.ph
                      :data=item.list :key="index" v-model=item.value @on-change="getPickerValue( index , item.value)">
        </popup-picker>
      </group>
      <p class="caution_part" v-show='showMore'>
        您还需要添加新的筛选条件？请点击 <span class="plus_tx" @click="createNew">新增</span>
      </p>
    </div>
    <x-button class="count_button" :gradients="['#B99763', '#E7D0A2']" @click.native="goRp" v-show='region[0]'>确定
    </x-button>
    <router-view></router-view>
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
        region: [],
        whichIndex: '',
        showMore: false,
        pickerList: [],
        bankList: [],
        deptList: []
      }
    },
    computed: {
      regeionTitle() {
        return this.region[0] ? this.region[0].split('-')[1] + '地区' : '报表'
      }
    },
    methods: {
      // TODO 获取地区
      getRegion(params = {}) {
        optionService.getRegion().then(data => {
          let region = data.reduce((arr, item) => {
            arr.push(item.name);
            return arr
          }, ['']);
          this.pickerList.push({
            title: '所在地区',
            ph: '请选择地区',
            value: [],
            list: [region]
          })
        })
      },
      // TODO 获取银行
      getBank(params = {}) {
        return new Promise((resolve, reject) => {
          if (this.bankList.length > 0) {
            resolve(this.bankList)
          } else {
            optionService.getBank().then(data => {
              let bank = data.tableContent.reduce((arr, item) => {
                arr.push(item.groupName);
                return arr
              }, ['']);
              this.bankList = bank
              resolve(bank)
            })
          }
        })
      },
      // TODO 获取部门
      getDept(params = {}) {
        return new Promise((resolve, reject) => {
          if (this.deptList.length > 0) {
            resolve(this.deptList)
          } else {
            optionService.getDept().then(data => {
              let dept = data.tableContent.reduce((arr, item) => {
                arr.push(item.groupName);
                return arr
              }, ['']);
              this.deptList = dept
              resolve(dept)
            })
          }
        })
      },
      getPickerValue(index, value) {
        this.showMore = true;
        this.whichIndex = index;
        if (index === 0) {
          this.region = value;
        } else if (index === 2) {
          this.showMore = false;
        }
      },
      createNew() {
        // 新增
        let index = this.whichIndex;
        if (index === 0) {
          this.getBank().then(bank => {
            this.pickerList.push({
              title: '所在部门',
              ph: '请选择部门',
              value: [],
              list: [bank]
            })
          })
          this.showMore = false;
        } else if (index === 1) {
          this.getDept().then(dept => {
            this.pickerList.push({
              title: '所在银行',
              ph: '请选择地区',
              value: [],
              list: [dept]
            })
          })
          this.showMore = false;
        }
      },
      goRp() {
        let filterParams = {}
        this.pickerList.forEach((item, index) => {
          switch (index) {
            case 0:
              filterParams.regeion = item.value[0]
              break;
            case 1:
              filterParams.dept = item.value[0]
              break;
            case 2:
              filterParams.bank = item.value[0]
              break;
          }
        })
        console.log(filterParams)
        this.$router.push({
          path: '/reportsOp/reports',
          query: filterParams
        })
      },
    },
    created() {
      this.getRegion()
    }
  }
</script>

<style lang="scss">
  .filter-container {
    .cp_title {
      width: 100%;
      height: 150px;
      line-height: 150px;
      text-align: center;
      font-size: 50px;
      font-weight: 200;
      color: #CFCFCF;
    }
    /* 选项框 */
    .select_part {
      width: 90%;
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .each_group {
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
    }
    /* 底部提示文字 */
    .caution_part {
      width: 100%;
      text-align: center;
      color: #ccc;
      font-size: 12px;
      margin-top: 4px;
    }
    .plus_tx {
      color: #2CC4F8;
    }
    /* button样式  */
    .weui-btn.count_button {
      width: 100%;
      position: fixed;
      bottom: 0;
      left: 0;
      border-radius: 0;
    }
  }
</style>
