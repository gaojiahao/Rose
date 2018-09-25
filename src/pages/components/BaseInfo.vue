<template>
  <group class="baseinfo-container" title="基本信息">
    <popup-picker title="所属区域" :data="areaList" :value="area" :columns="1"
                  @on-change="areaChange" v-model="area"></popup-picker>
    <popup-picker title="经办部门" :data="unitList" :value="unit" :columns="1"
                  @on-change="unitChange" v-model="unit"></popup-picker>
    <popup-picker title="经办角色" :data="roleList" :value="role" :columns="1"
                  v-model="role"></popup-picker>
  </group>
</template>

<script>
  import createService from '@/service/createService'
  import {Group, PopupRadio, PopupPicker} from 'vux'

  export default {
    name: "BaseInfo",
    props: {
      // 默认值
      defaultValue: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    components: {
      Group,
      PopupRadio,
      PopupPicker,
    },
    data() {
      return {
        areaList: [], // 用于选择的所属区域列表
        area: [],
        areaId: 0,
        unitList: [], // 用于选择的经办部门列表
        unit: [],
        unitId: 0,
        roleList: [], // 用于选择的经办角色列表
        role: [],
        roleId: 0,
        userId: '',
        baseinfo: {},
        handlerData: {},
      }
    },
    watch: {
      defaultValue: {
        handler() {
          this.baseinfo = JSON.parse(JSON.stringify(this.defaultValue));
          this.area = [this.baseinfo.handlerAreaName.value];
          this.areaId = this.baseinfo.handlerArea;
          this.unit = [this.baseinfo.handlerUnitName.value];
          this.unitId = this.baseinfo.handlerUnit;
          this.role = [this.baseinfo.handlerRoleName.value];
          this.roleId = this.baseinfo.handlerRole;
          this.init();
        }
      }
    },
    methods: {
      // TODO 显示错误提示
      showToast(test = '') {
        this.$vux.toast.show({
          text: test,
          type: 'text',
          position: 'middle',
          width: 'auto',
          isShowMask: true,
          time: 1000
        });
      },
      // TODO 初始化数据
      async init() {
        let nickname = '';
        if (this.defaultValue.handlerName) {
          nickname = this.defaultValue.handlerName.value;
        } else {
          let handlerData = await this.getBaseInfo();
          nickname = handlerData.nickname
        }
        this.getCurrentUser(nickname);
        await this.getAreas().then(area => {
          if (this.defaultValue.handlerArea) {
            return
          }
          this.areaId = area.key;
          this.$set(this.area, 0, area.value);
        });
        /*await this.getUnits().then(unit => {
          if (this.baseinfo.handlerUnit) {
            this.baseinfo.handlerUnit = '';
            return
          }
          this.unit = [unit];
        });
        this.getRoles().then(role => {
          if (this.baseinfo.handlerRole) {
            this.baseinfo.handlerRole = '';
            return
          }
          this.role = [role];
        });*/
      },
      // TODO 获取当前用户信息
      getBaseInfo() {
        return createService.getBaseInfoData().then(data => {
          this.userId = data.userId;
          return data
        })
      },
      // TODO 获取经办人信息
      getCurrentUser(nickname) {
        return createService.getCurrentUser(nickname).then(({tableContent = []}) => {
          let [handlerData = {}] = tableContent;
          this.handlerData = handlerData;
          this.baseinfo = {
            creator: this.userId,
            creatorName: nickname,
            handler: handlerData.userId,
            handlerName: {
              text: nickname,
              value: nickname,
              selection: {
                data: {
                  id: '',
                  ...handlerData
                }
              }
            },
            ...this.baseinfo,
            modifer: this.userId,
          };
          return {}
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 获取所属区域
      async getAreas() {
        await this.getBaseInfo();
        return createService.getAreas({
          userId: this.userId
        }).then(({tableContent = []}) => {
          let tmp = [];
          tableContent.forEach(item => {
            tmp.push({
              key: item.userGroupId,
              name: item.userGroupName,
              value: item.userGroupName,
            });
          });
          this.areaList = tmp;
          return tmp[0];
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 获取经办部门
      async getUnits() {
        await this.getBaseInfo();
        this.unitList = [];
        return createService.getUnits({
          userId: this.userId,
          parentId: this.areaId
        }).then(({tableContent = []}) => {
          let tmp = [];
          tableContent.forEach(item => {
            tmp.push({
              key: item.userGroupId,
              name: item.userGroupName,
              value: item.userGroupName,
            });
          });
          this.unitList = tmp;
          return tmp[0];
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 获取经办角色
      async getRoles() {
        await this.getBaseInfo();
        this.roleList = [];
        return createService.getRoles({
          userId: this.userId,
          parentId: this.unitId
        }).then(({tableContent = []}) => {
          let tmp = [];
          tableContent.forEach(item => {
            tmp.push({
              key: item.userGroupId,
              name: item.userGroupName,
              value: item.userGroupName,
            });
          });
          this.roleList = tmp;
          return tmp[0];
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 切换所属区域
      areaChange() {
        let matched = this.areaList.find(item => {
          return item.value === this.area[0]
        });
        if (matched) {
          this.areaId = matched.key;
        }
        this.getUnits().then(unit => {
          if (this.baseinfo.handlerUnit) {
            this.baseinfo.handlerUnit = '';
            return
          }
          this.unitId = unit.key;
          this.$set(this.unit, 0, unit.value);
        });
      },
      // TODO 切换经办部门
      unitChange(val) {
        let matched = this.unitList.find(item => {
          return item.value === this.unit[0]
        });
        if (matched) {
          this.unitId = matched.key;
        }
        this.getRoles().then(role => {
          if (this.baseinfo.handlerRole) {
            this.baseinfo.handlerRole = '';
            return
          }
          this.roleId = role.key;
          this.$set(this.role, 0, role.value);
        })
      },
      // TODO 组装下拉框数据
      assembleData(id, arr) {
        let [value = ''] = arr;
        return {
          text: value,
          selection: {
            data: {
              id: '',
              userGroupId: Number(id),
              userGroupName: value,
            }
          },
          value
        }
      },
      // TODO 组装提交参数
      getFormData() {
        let baseinfo = this.baseinfo;
        let role = this.roleList.find(item => {
          return item.value === this.role[0]
        });
        return {
          creatorName: baseinfo.creatorName,
          creator: baseinfo.creator,
          modifer: this.userId,
          handler: baseinfo.handler,
          handlerArea: this.areaId,
          handlerUnit: this.unitId,
          handlerRole: role.key,
          handlerName: baseinfo.handlerName,
          handlerAreaName: this.assembleData(this.areaId, this.area),
          handlerUnitName: this.assembleData(this.unitId, this.unit),
          handlerRoleName: this.assembleData(role.key, this.role),
        }
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  .baseinfo-container {
    background: #fff;
    margin-top: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px #e8e8e8;
  }
</style>
