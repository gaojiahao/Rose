<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class='required'>公司名称:</label>
            <input type='text' @blur='checkGroupName'
            v-model="newCompanyInfo.groupName" class='property_val'/>
          </div>
          <div class='each_property required' >
            <label class='required'>公司简称:</label>
            <input type='text' @blur='checkShortName'
            v-model="newCompanyInfo.groupShortName" class='property_val'/>
          </div>
        </div>
        <upload-image :src="newCompanyInfo.groupPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
      </div>
      <r-picker title="公司类型:" :data="CompanyType" 
                :value="newCompanyInfo.companyType"
                v-model="newCompanyInfo.companyType" 
                :required='true'>
      </r-picker>
      <r-picker title="公司状态" :data="CompanyStatus"
                :value="newCompanyInfo.status"
                v-model="newCompanyInfo.status">
      </r-picker>
    </div>
    <div class='vux-1px-t btn' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save">{{groupId? '保存':'提交'}}</div>
    </div>
  </div>
</template>

<script>
// 组件引入
import RPicker from 'components/RPicker'
import UploadImage from 'components/UploadImage'
import common from 'mixins/common';
// 请求引入
import { save, update, checkValue, CompanyInfo } from 'service/Directorys/companyService' 
export default {
  components: { RPicker, UploadImage },
  data(){
    return{
      MatPic: '',
      groupId: '',
      isNameExist: false,
      isShortNameExist: false,
      CompanyType: [
        '有限责任公司', '股份有限公司', '集团公司', 
        '有限合伙', '普通合伙', '个人独资', 
        '子公司', '其他' 
      ],
      CompanyStatus: [
        '草稿', '未使用', '使用中', '停用'
      ],
      newCompanyInfo: {
        companyType: "有限责任公司",                      // 公司类型
        groupName: "",                                  // 公司名称
        groupPic: "",                                   // 公司照片
        groupShortName: "",                             // 公司简称
        groupType: "C",
        parentId: "1",
        status: "使用中"                                 // 公司状态
      }
    }
  },
  mixins: [common],
  methods: {
    // 上传图片
    onUpload(val){
      this.newCompanyInfo.groupPic = `/H_roleplay-si/ds/download?width=128&height=128&specify=true&url=${val.src}`;
    },    
    // 获取默认图片
    getDefaultImg(){
      this.newCompanyInfo.groupPic = require('assets/contact_default02.png');
    },
    // 监测公司名称是否存在
    checkGroupName(){
      if(!this.newCompanyInfo.groupName){
        return 
      }
      checkValue('groupName', this.newCompanyInfo.groupName).then(({ result }) => {
        this.isNameExist = false;
        if(result){
          this.isNameExist = true;
          this.$vux.alert.show({
            content: '【公司名称】已存在，请替换别的名称'
          })
        }
      })
    },
    // 监测公司简称是否存在
    checkShortName(){
      if(!this.newCompanyInfo.groupShortName){
        return 
      }
      checkValue('groupShortName', this.newCompanyInfo.groupShortName).then(({ result }) => {
        this.isShortNameExist = false;
        if(result){
          this.isShortNameExist = true;
          this.$vux.alert.show({
            content: '【公司简称】已存在，请替换别的简称'
          })
        }
      })    
    },
    // 保存提交 或 编辑提交
    submit(){
      // 保存接口 或 编辑接口
      let RequestMethod = !this.groupId ? save : update;
      let newCompanyInfo = [];
      if(RequestMethod === save){
        newCompanyInfo = [{...this.newCompanyInfo}];
      }
      else {
        newCompanyInfo = [{
          status: this.newCompanyInfo.status,
          groupId: this.newCompanyInfo.groupId,
          groupPic: this.newCompanyInfo.groupPic,
          groupName: this.newCompanyInfo.groupName,
          companyType: this.newCompanyInfo.companyType,
          groupShortName: this.newCompanyInfo.groupShortName
        }]
      }
      this.$vux.confirm.show({
        content: '确定提交？',
        onConfirm: ()=> {
          switch(newCompanyInfo[0].status){
            case '停用':
              newCompanyInfo[0].status = -1;
              break;
            case '使用中':
              newCompanyInfo[0].status = 1;
              break;
            case '未使用':
              newCompanyInfo[0].status = 2;
              break;
            case '草稿':
              newCompanyInfo[0].status = 3;
              break;
          }
          RequestMethod(newCompanyInfo).then(data => {
            if(data[0] && data[0].groupId || data.success){
              this.$emit('change', true);
              this.$vux.alert.show({
                content: data.success ? '修改成功': '提交成功',
                onHide: ()=> {
                  this.$router.go(-1);
                }
              })
            }else{
              this.$vux.alert.show({
                content:data.message
              })
            }          
          })
        }
      })
    },    
    save(){
      // 校验数据是否为空
      let warn = '';
      let validateMap = [
        {
          key: 'groupName',
          message: '【公司名称】',
        }, {
          key: 'groupShortName',
          message: '【公司简称】',
        }, {
          key: 'companyType',
          message: '【公司类型】',
        },
      ];
      if(this.isNameExist){
        warn = '【公司名称】已存在，请替换别的名称'
      }
      else if(this.isShortNameExist){
        warn = '【公司简称】已存在，请替换别的简称'
      }
      !warn && validateMap.every(item => {
        if (!this.newCompanyInfo[item.key]) {
          warn = `${item.message}不能为空`;
          return false
        }
        return true
      });
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      // 提交数据
      this.submit();
    },
    // 编辑时 获取表单数据
    CompanyInfo(){
      return CompanyInfo(this.groupId).then( data => {
        for(let item of data){
          switch (item.status){
            case 1:
              item.status = '使用中';
              break;
            case 2:
              item.status = '未使用';
              break;
            case 3:
              item.status = '草稿';
              break;
            case -1: 
              item.status = '停用';
              break;
          }
          this.newCompanyInfo = item;
        }
      })
    }
  },
  created(){
    this.$loading.show();
    let {groupId = ''} = this.$route.query;
    this.groupId = groupId;
    if(groupId){
      this.CompanyInfo();
    }
    this.$loading.hide();
  }
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizApply';
.mater_baseinfo{
  .upload-image-container {
    width: 1.2rem;
    height: 1.2rem;
  }
}


</style>
