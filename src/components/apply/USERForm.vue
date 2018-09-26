<template>
  <div class='childPage'>
    <div class='content' ref="fill">
      <div class="wrapper">
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
          <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
        </div>
        <r-picker title="性别:" :data="genderList" :value="userData.gender" v-model="userData.gender"
                  @on-change="genderChange"></r-picker>
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
          <input type='text' v-model.trim="userData.email" class='property_val'/>
        </div>
        <r-picker title="类型:" :data="userTypeList" :value="userData.userType" v-model="userData.userType"
                  @on-change="userTypeChange"></r-picker>
        <div class='each_property vux-1px-b' @click="getDate" v-show="showDate">
          <label class="required">账户有效期:</label>
          <div class='property_val'>{{userData.termOfValidity}}</div>
        </div>
        <r-picker title="状态:" :data="statusList" :value="userData.status"
                  v-model="userData.status"></r-picker>
        <pop-company-list @sel-item="selCompany"></pop-company-list>
      </div>
    </div>
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import {Picker, Popup, Group} from 'vux';
  import RPicker from 'components/RPicker';
  import common from 'mixins/common';
  import ApplyCommon from './../mixins/applyCommon';
  import {validateCode, addUser} from 'service/userService';
  import UploadImage from 'components/UploadImage'
  import PopCompanyList from 'components/Popup/PopCompanyList'

  export default {
    name: 'ApplyUserForm',
    data() {
      return {
        MatPic: '', // 图片地址
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
        picShow: false, // 是否展示图片
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
        PhoneWarn: false,
        MobileWarn: false,
        userCodeWarn: false,
      }
    },
    mixins: [ApplyCommon, common],
    components: {
      Picker,
      Popup,
      Group,
      RPicker,
      UploadImage,
      PopCompanyList,
    },
    methods: {
      // TODO 上传图片成功触发
      onUpload(val) {
        this.userData.photo = val.src;
      },
      // TODO 性别切换
      genderChange(val) {

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
        for (let key in this.inventory) {
          if (typeof(this.userData[key]) === 'string' && this.userData[key].indexOf(' ') >= 0) {
            this.userData[key] = this.userData[key].replace(/\s/g, '');
          }
        }
        let submitData = {...this.userData};
        let operation = addUser;
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
          warn = '座机格式不正确'
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
            let genederMatched = this.genderList.find(item => item.value === submitData.gender);
            let userTypeMatched = this.userTypeList.find(item => item.value === submitData.userType);
            let statusMatched = this.statusList.find(item => item.value === submitData.status);

            submitData.gender = genederMatched.key;
            submitData.userType = userTypeMatched.key;
            submitData.status = statusMatched.key;
            console.log(submitData)
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
        this.MatPic = require('assets/wl_default02.png');
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
        let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
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
        })
      },
    },
    created() {
      this.$loading.show();
      let {transCode = ''} = this.$route.query;
      let requestPromise = [];
      Promise.all(requestPromise).then(() => {
        this.$loading.hide();
      })
    },
  }
</script>

<style lang="scss" scoped>
  .pages {
    background: #fff;
    z-index: 10;
  }

  .childPage {
    height: 100%;
  }

  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }

  .content {
    height: 90%;
    overflow: hidden;
    input {
      border: none;
      outline: none;
    }
    .mater_baseinfo {
      display: flex;
      align-items: flex-end;
      .mater_property {
        flex: 1;
      }
    }
    .each_property {
      padding: 0.05rem 0.08rem;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        line-height: 0.2rem;
      }
      .required {
        color: #5077aa;
        font-weight: bold;
      }
      .property_val {
        display: block;
        width: 100%;
        font-size: 0.16rem;
        line-height: 0.24rem;
        min-height: .24rem;
      }
      .readonly {
        color: #999;
      }
    }
  }

  //确认框
  .popup_header {
    display: flex;
    justify-content: space-between;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    background-color: #fbf9fe;
    padding: 0 15px;
    .cancel {
      color: #828282;
    }
    .confirm {
      color: #FF9900;

    }
  }

  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: fixed;
    background: #fff;
    .cfm_btn {
      top: 50%;
      left: 50%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 5px #5077aa;
    }
  }
</style>
