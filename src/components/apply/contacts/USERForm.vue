<template>
  <div class='childPage'>
    <r-scroll class="content">
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">工号:</label>
            <input type='text' :readonly="codeReadOnly" v-model.trim="userData.userCode" class='property_val'
                   :class='{readonly : codeReadOnly}' @blur="checkUserCode"/>
          </div>
          <div class='each_property'>
            <label class="required">姓名:</label>
            <input type='text' v-model.trim="userData.nickname" class='property_val'/>
          </div>
        </div>
        <upload-image :src="userData.photo" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
      </div>
      <r-picker title="性别:" :data="genderList" :value="userData.gender" v-model="userData.gender"></r-picker>
      <div class='each_property vux-1px-b'>
        <label class="required">手机:</label>
        <input type='number' v-model.trim="userData.mobile" class='property_val' @blur="checkMobile"/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>座机:</label>
        <input type='text' v-model.trim="userData.officePhone" class='property_val' @blur="checkPhone"/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>邮箱:</label>
        <input type='text' v-model.trim="userData.email" class='property_val' @blur="checkEmail"/>
      </div>
      <r-picker title="类型:" :data="userTypeList" :value="userData.userType" v-model="userData.userType"
                @on-change="userTypeChange"></r-picker>
      <div class='each_property vux-1px-b' @click="getDate" v-show="showDate">
        <label class="required">账户有效期:</label>
        <div class='property_val'>{{userData.termOfValidity}}</div>
      </div>
      <r-picker title="状态:" :data="statusList" :value="userData.status"
                v-model="userData.status"></r-picker>
      <pop-company-list :default-value="company" :params="companyParams" @sel-item="selCompany"></pop-company-list>
    </r-scroll>
    <div class='btn vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save">{{ this.colId ? '保存':'提交'}}</div>
    </div>
  </div>
</template>

<script>
  import {Picker, Popup, Group} from 'vux';
  import RPicker from 'components/RPicker';
  import common from 'mixins/common';
  import {validateCode, addUser, updateUser, getUserDetail} from 'service/Directorys/userService';
  import UploadImage from 'components/UploadImage'
  import PopCompanyList from 'components/Popup/PopCompanyList'
  import RScroll from 'components/RScroll'

  export default {
    name: 'ApplyUserForm',
    data() {
      return {
        genderList: [
          {
            name: '男',
            value: '男',
            key: 1,
          }, {
            name: '女',
            value: '女',
            key: 0,
          },
        ], // 性别列表
        userTypeList: [
          {
            name: '长期有效',
            value: '长期有效',
            key: 1,
          }, {
            name: '临时账户',
            value: '临时账户',
            key: 0,
          },
        ], // 类型列表
        statusList: [
          {
            name: '使用中',
            value: '使用中',
            key: 1,
          }, {
            name: '草稿',
            value: '草稿',
            key: 3,
          }, {
            name: '停用',
            value: '停用',
            key: -1,
          }, {
            name: '未使用',
            value: '未使用',
            key: 2,
          },
        ], // 状态列表
        codeReadOnly: false, // 物料编码是否只读
        userData: {
          email: '',
          entityId: '',
          entityName: '',
          gender: '男',
          mobile: '',
          nickname: '',
          officePhone: '',
          photo: '',
          status: '使用中',
          termOfValidity: '',
          userCode: '',
          userType: '长期有效',
        },
        showDate: false, // 是否展示账户有效期
        PhoneWarn: false, // 座机是否校验成功
        MobileWarn: false, // 手机是否校验成功
        EmailWarn: false, // 邮箱是否检验成功
        userCodeWarn: false, // 工号是否校验成功
        colId: '',
        company: {}, // 默认的公司
        companyParams: {
          target: 4,
        },
      }
    },
    mixins: [common],
    components: {
      Picker,
      Popup,
      Group,
      RPicker,
      UploadImage,
      PopCompanyList,
      RScroll,
    },
    methods: {
      // TODO 上传图片成功触发
      onUpload(val) {
        this.userData.photo = `/H_roleplay-si/ds/download?width=128&height=128&url=${val.src}`;
      },
      // TODO 类型切换
      userTypeChange(val) {
        if (val === '临时账户') {
          this.showDate = true;
        }
      },
      // TODO 提交/修改物料
      save() {
        let requiredMap = {
          userCode: '工号',
          nickname: '姓名',
          mobile: '手机',
        };
        if (this.userData.userType === '临时账户') {
          requiredMap.termOfValidity = '账户有效期';
        }
        requiredMap.entityName = '公司';
        for (let key in this.userData) {
          if (typeof(this.userData[key]) === 'string' && this.userData[key].indexOf(' ') >= 0) {
            this.userData[key] = this.userData[key].replace(/\s/g, '');
          }
        }
        let submitData = {...this.userData};
        let operation = !this.colId ? addUser : updateUser;
        let warn = '';
        if (this.userCodeWarn) {
          warn = '工号已存在';
        }
        !warn && Object.entries(requiredMap).every(([key, msg]) => {
          if (!this.userData[key]) {
            warn = `${msg}不能为空`;
            return false;
          }
          return true;
        });
        if (!warn && this.PhoneWarn) {
          warn = '座机格式不正确';
        }
        if (!warn && this.EmailWarn) {
          warn = '邮箱格式不正确';
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }

        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let genederMatched = this.genderList.find(item => item.value === submitData.gender);
            let userTypeMatched = this.userTypeList.find(item => item.value === submitData.userType);
            let statusMatched = this.statusList.find(item => item.value === submitData.status);

            submitData.gender = genederMatched.key;
            submitData.userType = userTypeMatched.key;
            submitData.status = statusMatched.key;
            console.log(submitData)
            operation(submitData).then(data => {
              this.$HandleLoad.hide();
              let {success = true, message = '提交失败'} = data;
              if (success) {
                message = operation === addUser ? '提交成功' : '修改成功';
                this.$emit('change', true);
              }
              this.$vux.alert.show({
                content: message,
                onHide: () => {
                  if (success) {
                    this.$router.go(-1);
                  }
                }
              });
            }).catch(e => {
              this.$HandleLoad.hide();
            })
          }
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
        this.userData.photo = require('assets/wl_default03.png');
      },
      // TODO 选中公司
      selCompany(sel) {
        this.userData.entityName = sel.groupName;
        this.userData.entityId = sel.groupCode;
      },
      // TODO 设置账户有效期
      getDate() {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.userData.termOfValidity,
          onConfirm: (value) => {
            this.userData.termOfValidity = value;
          }
        })
      },
      // TODO 校验固定电话号
      checkPhone() {
        let reg = /^0\d{2,3}-\d{7,8}$/;
        if (this.userData.officePhone.length > 0 && !reg.test(this.userData.officePhone)) {
          this.PhoneWarn = true;
          return
        }
        this.PhoneWarn = false;
      },
      // TODO 校验手机号
      checkMobile() {
        let reg = /^[1][34578][0-9]{9}$/;
        if (this.userData.mobile.length > 0 && !reg.test(this.userData.mobile)) {
          this.MobileWarn = true;
          return
        }
        this.MobileWarn = false;
      },// TODO 校验工号
      checkUserCode() {
        validateCode(this.userData.userCode).then(({result = 0}) => {
          this.userCodeWarn = false;
          if (result) {
            this.userCodeWarn = true;
            this.$vux.alert.show({
              content: '工号已存在',
            });
          }
        }).catch(e => {
          this.userCodeWarn = true;
        })
      },
      // TODO 校验邮箱
      checkEmail() {
        let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        if (this.userData.email.length > 0 && !reg.test(this.userData.email)) {
          this.EmailWarn = true;
          return
        }
        this.EmailWarn = false;
      },
      // TODO 获取用户数据
      getFormData() {
        return getUserDetail(this.colId).then(({tableContent = []}) => {
          let [data = {}] = tableContent;
          let genders = ['女', '男'];
          let status = ['', '使用中', '未使用', '草稿'];
          let userTypes = ['临时账户', '长期有效'];
          data.gender = genders[data.gender] || '未知';
          data.status = status[data.status] || '停用';
          data.userType = userTypes[data.userType];
          if (data.userType === '临时账户') {
            this.showDate = true;
          }
          this.company = {
            groupCode: data.entityId,
            groupName: data.entityName,
          };
          this.userData = {
            ...this.userData,
            ...data
          };
          this.$loading.hide();
        })
      },
    },
    created() {
      this.$loading.show();
      let {colId = ''} = this.$route.query;
      let requestPromise = [];
      if (colId) {
        this.colId = colId;
        this.codeReadOnly = true;
        requestPromise.push(this.getFormData());
      }
      Promise.all(requestPromise).then(() => {
        this.$loading.hide();
      });
    },
  }
</script>

<style lang="scss" scoped>
@import './../../scss/bizApply';
.childPage{
  width: 100%;
  height: 100%;
  .upload-image-container {
    width: 1.2rem;
    height: 1.2rem;
  }
}
</style>
