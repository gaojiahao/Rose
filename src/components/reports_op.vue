<template>
  <div class="filter-container">
    <h1 class="cp_title">{{regionTitle}}</h1>
    <div class="select_part">
      <group class="each_group">
        <popup-picker v-for="( item, index ) in pickerList" class="each_picker" :title=item.title :placeholder=item.ph
                      :data=item.list :key="index" v-model=item.value @on-change="getPickerValue( index , item.value)">
        </popup-picker>
      </group>

      <!--<p class="caution_part" v-show='showMore'>-->
      <!--您还需要添加新的筛选条件？请点击 <span class="plus_tx" @click="createNew">新增</span>-->
      <!--</p>-->
    </div>
    <x-button class="count_button" :gradients="['#B99763', '#E7D0A2']" @click.native="goRp">确定
    </x-button>
    <router-view></router-view>
  </div>
</template>

<script>
  import optionService from '../service/optionService'
  import saleReportService from '../service/saleRepotService'
  import {Group, XButton, PopupPicker} from 'vux'

  const FILTER_OPTION = 'ROSE_FILER_OPTION'; // 存储筛选配置的key
  const PROJ_LIST = 'ROSE_PROJ_LIST'; // 存储项目列表的key
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
        regionList: [],
        bankList: [],
        deptList: [],
        projList: []
      }
    },
    computed: {
      regionTitle() {
        return this.region[0] ? this.region[0].split('-')[1] + '地区' : '报表'
      }
    },
    methods: {
      // TODO 获取地区
      getRegion(params = {}) {
        return new Promise((resolve, reject) => {
          if (this.regionList.length > 0) {
            resolve(this.regionList)
          } else {
            optionService.getRegion().then(data => {
              let region = data.reduce((arr, item) => {
                arr.push(item.name);
                return arr
              }, ['']);
              this.regionList = region
              resolve(region)
            })
          }
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
                arr.push(item.bankName);
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
      // TODO 获取项目列表
      getProj() {
        return new Promise((resolve, reject) => {
          if (this.projList.length > 0) {
            resolve(this.projList)
          } else {
            saleReportService.saleRepotList().then(data => {
              let proj = data.tableContent.reduce((arr, item) => {
                arr.push(item['trans_detail_uncalc.transObjCode']);
                return arr
              }, ['']);
              this.projList = proj
              sessionStorage.setItem(PROJ_LIST, JSON.stringify(proj))
              resolve(proj)
            })
          }
        })
      },
      getPickerValue(index, value) {
        if (!value) {
          this.$set(this.pickerList[index], 'value', [])
        }
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
              title: '所在银行',
              ph: '请选择银行',
              value: [],
              list: [bank]
            })
          })
          this.showMore = false;
        } else if (index === 1) {
          this.getDept().then(dept => {
            this.pickerList.push({
              title: '所在部门',
              ph: '请选择部门',
              value: [],
              list: [dept]
            })
          })
          this.showMore = false;
        }
      },
      // TODO 跳转到过滤页
      goRp() {
        let filterParams = {}
        this.pickerList.forEach((item, index) => {
          switch (index) {
            case 0:
              filterParams.region = encodeURI(item.value[0])
              break;
            case 1:
              filterParams.dept = encodeURI(item.value[0])
              break;
            case 2:
              filterParams.bank = encodeURI(item.value[0])
              break;
            case 3:
              filterParams.proj = encodeURI(item.value[0])
              break;
          }
        })
        if (!filterParams.region && !filterParams.dept && !filterParams.bank && !filterParams.proj) {
          this.$vux.alert.show({
            content: '请至少选择一个条件'
          });
          return
        }
        console.log(filterParams)
        sessionStorage.setItem(FILTER_OPTION, JSON.stringify(this.pickerList))
        this.$router.push({
          path: '/reportsOp/reports',
          query: filterParams
        })
      },
    },
    created() {
      (async () => {
        this.pickerList = [
          {
            title: '所在地区',
            ph: '请选择地区',
            value: [],
            list: []
          },
          {
            title: '所在银行',
            ph: '请选择银行',
            value: [],
            list: []
          },
          {
            title: '所属区域',
            ph: '请选择区域',
            value: [],
            list: []
          },
          {
            title: '项目产品',
            ph: '请选择项目',
            value: [],
            list: []
          }
        ]
        let filter = JSON.parse(sessionStorage.getItem(FILTER_OPTION))
        if (!filter) {
          let tmpPickerList = []
          await this.getRegion().then(region => {
            tmpPickerList.push({
              title: '所在地区',
              ph: '请选择地区',
              value: [],
              list: [region]
            })
          })
          await this.getBank().then(bank => {
            tmpPickerList.push({
              title: '所在银行',
              ph: '请选择银行',
              value: [],
              list: [bank]
            })
          })
          await this.getDept().then(dept => {
            tmpPickerList.push({
              title: '所属区域',
              ph: '请选择区域',
              value: [],
              list: [dept]
            })
          })
          await this.getProj().then(proj => {
            tmpPickerList.push({
              title: '项目产品',
              ph: '请选择项目',
              value: [],
              list: [proj]
            })
          })
          this.pickerList = tmpPickerList
        } else {
          await this.getRegion()
          await this.getDept()
          await this.getBank()
          await this.getProj()
          this.pickerList = filter
        }
      })()
    },
    destroyed() {
      sessionStorage.removeItem(FILTER_OPTION)
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
