<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class='required'>公司名称:</label>
            <input type='text' v-model="newCompanyInfo.groupName" class='property_val'/>
          </div>
          <div class='each_property required' >
            <label class='required'>公司简称:</label>
            <input type='text' v-model="newCompanyInfo.groupShortName" class='property_val'/>
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
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save" v-html="this.$route.query.groupId?'保存并使用':'提交'"></div>
    </div>
  </div>
</template>

<script>
// 组件引入
import RPicker from 'components/RPicker'
import UploadImage from 'components/UploadImage'
// 请求引入
import { save, update, CompanyInfo } from 'service/Directorys/companyService' 
export default {
  components: { RPicker, UploadImage },
  data(){
    return{
      MatPic: '',
      groupId:'',
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
  methods: {
    // 上传图片
    onUpload(val){
      this.newCompanyInfo.groupPic = `/H_roleplay-si/ds/download?width=128&height=128&specify=true&url=${val.src}`;
    },    
    // 获取默认图片
    getDefaultImg(){
      this.newCompanyInfo.groupPic = require('assets/contact_default02.png');
    },
    // 保存提交 或 编辑提交
    submit(){
      let newCompanyInfo = [{...this.newCompanyInfo}];
      this.$vux.confirm.show({
        content: '确定提交吗？',
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
          save(newCompanyInfo).then(data => {
            let {groupId} = data[0];
            if(groupId){
              this.$emit('change', true);
              this.$vux.alert.show({
                content: '提交成功',
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
      validateMap.every(item => {
        if (this.newCompanyInfo[item.key] === '') {
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
  .vux-1px-l:before,
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .vux-x-icon {
    fill: #5077aa;
    vertical-align: middle;
  }
  .content {
    height: 90%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: auto;
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
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        height:0.2rem;
        line-height: 0.2rem;
      }
      .required{
        color:#5077aa;
        font-weight: bold;
      }
      //校验错误提示按钮
      .warn{
        position: absolute;
        right: 0.08rem;
        top: 0.27rem;
      }
      .weui-icon-warn{
        font-size:0.18rem;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width:100%;
      }
      //只读
      .readonly{
        color:#999;
      }
      .picker {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .mater_nature {
          font-size: 0.16rem;
          line-height: 0.2rem;
        }
        .iconfont {
          font-size: 0.24rem;
        }
      }
      .vux-cell-box{
        position: absolute;
        left:0;
        top:0;
        padding: 0.05rem 0.08rem;
        width:100%;
        box-sizing: border-box;
        color: #6d6d6d;
        font-size: 0.12rem;
        label{
          height:0.58rem;
        }
        .vux-cell-primary{
          display: none;
        }
        &:not(:first-child):before{
          border:none;
        }

      }
    }
  }

  // 提交
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
    .disabled{
      background:#c7c7c7;
      box-shadow: 0 2px 5px #c7c7c7;
    }
  }


</style>
