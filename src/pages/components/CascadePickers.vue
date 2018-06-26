<template>
  <group title="费用归属">
    <popup-picker title="费用所属事业部" :data="buDeptList" :value="buSelected" :columns="1"
                  @on-change="buDeptChange" v-model="buSelected"></popup-picker>
    <popup-picker title="费用所属部门" :data="deptList" :value="deptSelected" :columns="1"
                  @on-change="deptChange" v-model="deptSelected"></popup-picker>
    <popup-picker title="核算归属省份" :data="provList" :value="provSelected" :columns="1"
                  @on-change="provChange" v-model="provSelected"></popup-picker>
    <popup-picker title="费用所属银行" :data="bankList" :value="bankSelected" :columns="1"
                  @on-change="bankChange" v-model="bankSelected"></popup-picker>
  </group>
</template>

<script>
  import createService from './../../service/createService'
  import {Group, PopupPicker} from 'vux'

  const PARENT_ID = '60d2cb55-8066-4c85-b8ea-60bde9be641b';
  export default {
    name: "CascadePickers",
    props: {
      value: {
        type: Object,
        default() {
          return {}
        }
      },
      hasDefault: {
        type: Boolean,
        default: false
      }
    },
    components: {Group, PopupPicker},
    data() {
      return {
        buDeptList: [],
        buSelected: [],
        deptList: [],
        deptSelected: [],
        provList: [],
        provSelected: [],
        bankList: [],
        bankSelected: [],
        formData: {
          costBU: '',// 费用所属事业部
          costDepartment: '',// 费用所属部门
          checkProvince: '',// 核算归属省份
          costBank: ''// 费用所属银行
        },
      }
    },
    watch: {
      value(val) {
        this.buSelected = [val.costBU];
        this.deptSelected = [val.costDepartment];
        this.provSelected = [val.checkProvince];
        this.bankSelected = [val.costBank];
      }
    },
    methods: {
      // TODO 返回下拉列表项
      assembleList(list) {
        let tmp = [];
        tmp = list && list.map(item => {
          let {unitName} = item;
          return {
            name: unitName,
            value: unitName,
          }
        });
        return tmp
      },
      // TODO 获取费用所属事业部列表
      getBuDept() {
        return createService.getAccountingUnitByid({
          parentId: PARENT_ID,
        }).then(data => {
          let {tableContent = []} = data;
          this.buDeptList = this.assembleList(tableContent);
        })
      },
      // TODO 获取费用所属部门列表
      getDept() {
        this.deptList = [];
        if (!this.hasDefault) {
          this.deptSelected = [];
        }
        let [name1] = this.buSelected;
        if (!name1) {
          return
        }
        createService.getAccountingUnitByid({
          key: 'N2',
          parentId: PARENT_ID,
          name1,
        }).then(data => {
          let {tableContent = []} = data;
          this.deptList = this.assembleList(tableContent);
        })
      },
      // TODO 获取核算归属省份列表
      getProv() {
        this.provList = [];
        if (!this.hasDefault) {
          this.provSelected = [];
        }
        let [name1] = this.buSelected;
        let [name2] = this.deptSelected;
        if (!name1 || !name2) {
          return
        }
        createService.getAccountingUnitByid({
          key: 'N3',
          parentId: PARENT_ID,
          name1,
          name2,
        }).then(data => {
          let {tableContent = []} = data;
          this.provList = this.assembleList(tableContent);
        })
      },
      // TODO 获取费用所属银行列表
      getBank() {
        this.bankList = [];
        if (!this.hasDefault) {
          this.bankSelected = [];
        }
        let [name1] = this.buSelected;
        let [name2] = this.deptSelected;
        let [name3] = this.provSelected;
        if (!name1 || !name2 || !name3) {
          return
        }
        createService.getAccountingUnitByid({
          key: 'N4',
          parentId: PARENT_ID,
          name1,
          name2,
          name3,
        }).then(data => {
          let {tableContent = []} = data;
          this.bankList = this.assembleList(tableContent);
        })
      },
      // TODO 费用所属事业部切换
      buDeptChange(val) {
        this.formData.costBU = val[0] || '';
        this.getDept();
        this.getProv();
        this.getBank();
      },
      // TODO 费用所属部门切换
      deptChange(val) {
        this.formData.costDepartment = val[0] || '';
        this.getProv();
        this.getBank();
      },
      // TODO 核算归属省份切换
      provChange(val) {
        this.formData.checkProvince = val[0] || '';
        this.getBank();
      },
      // TODO 费用所属银行切换
      bankChange(val) {
        this.formData.costBank = val[0] || '';
      },
      getFormData() {
        return this.formData
      }
    },
    created() {
      this.getBuDept();
    }
  }
</script>

<style scoped lang="scss" rel="stylesheet/scss">

</style>
