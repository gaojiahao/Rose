<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b '>
            <label class='required'>往来编码:</label>
            <input type='text' v-model="dealer.dealerCode" class='property_val'/>
          </div>
          <div class='each_property required'>
            <label class='required'>往来名称:</label>
            <input type='text' v-model="dealer.dealerName" class='property_val'/>
          </div>
        </div>
        <div class='mater_pic vux-1px-l'>
          <input type="file" name="file" id='file' @change="uploadFile($event)" accept="image/*" style="display:none;"/>
          <div class='add_icon' v-if='!picShow'>
            <label for="file"></label>
            <div class='upload'>
              <span class='iconfont icon-icon'></span>
              <span class='add_text'>增加图片</span>
            </div>
          </div>
          <div class='add_icon' v-else>
            <label for="file"></label>
            <img :src='MatPic' class='upload'/>
          </div>
        </div>
      </div>
      <r-picker title="往来关系标签:" :data="AccountRelType" value="dealer.dealerLabelName"  v-model="dealer.dealerLabelName" :required='true'
                @on-change="dealerLabel"></r-picker>
      <r-picker title="往来大类:" :data="AccountBigType" value="dealer.dealerType"  v-model="dealer.dealerType"
                @on-change="bigChange"></r-picker>
      <r-picker title="往来子类:" :data="AccountSmlType" value="dealer.dealerSubclass" 
                v-model="dealer.dealerSubclass"></r-picker>
      <!-- <x-address title="省市区" v-model="AccountAddress" :list="addressData"></x-address> -->
      <div class='each_property vux-1px-b'>
        <label></label>
        <div class='picker'>
            <span class='mater_nature'>{{dealer.province}}{{dealer.city}}{{dealer.county}}</span>
            <span class='iconfont icon-gengduo'></span>
        </div>
        <x-address title="省市区:"  :list="addressData" @on-hide='getAddress($event)' @on-shadow-change='changeAddress'></x-address>
      </div>
      <div class='each_property vux-1px-b'>
        <label>详细地址:</label>
        <input type='text' v-model="dealer.address" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>固定电话:</label>
        <input type='text' v-model="dealer.dealerPhone" class='property_val' @blur="checkPhone"/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>手机:</label>
        <input type='text' v-model="dealer.dealerMobilePhone" class='property_val' @blur="checkMobile"/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>电子邮件:</label>
        <input type='text' v-model="dealer.dealerMail" class='property_val' @blur='checkEmail'/>
      </div>
    </div>
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save" :class='{disabled : btnStatus}'>提交</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, AlertModule,XAddress, ChinaAddressV4Data} from 'vux';
  import RPicker from './../components/RPicker';
  import common from '../mixins/common.js'
  import dealerService from '../../service/dealerService.js'
  import {upload} from '../../service/materService.js';
  import {getBaseInfoData} from '../../service/commonService.js';
  export default {
    data() {
      return {
        hasDefault : false,
        btnStatus : false, //按钮不可点击
        transCode  : '',
        picShow: false,
        imgFileObj: {}, // 上传的图片对象
        biReferenceId : '',
        MatPic: '', // 图片地址
        AccountRelType : [],
        AccountBigType : [],
        AccountSmlType : [],
        AccountAddress : [],
        addressData : ChinaAddressV4Data,
        baseinfo: {
          handler: '', // 经办人ID
          handlerName: '', // 经办人
          handlerArea: '', // 所属区域ID
          handlerAreaName: '', // 所属区域
          handlerUnit: '', // 经办组织ID
          handlerUnitName: '', // 经办部门
          handlerRole: '', // 经办角色ID
          handlerRoleName: '', // 经办角色
          activeTime: '', // 业务发生时间
          comment: '' // 注释
        },
        dealer: {
          dealerCode: '', // 往来编码
          dealerName: '', // 往来名称
          dealerLabelName : '',//往来关系标签
          dealerType: '', // 往来大类
          dealerSubclass: '', // 往来子类
          province  : '',  //省
          city: '',  //市
          county: '',  //区
          address: '',  //地址
          dealerPhone: '', //联系电话
          dealerMobilePhone: '',  //手机
          dealerMail: '',  //电子邮件
          paymentTerm: '',  //结算方式
          dealerLogisticsTerms: '', //物流条款
          pamentDays: '',  //账期天数
          dealerStatus: '1', //往来状态
          comment: '',  //往来说明
          dealerPic : ''
        },

        
      }
    },
    directives: {
      TransferDom
    },
    mixins: [common],
    components: {
      Picker,
      Popup,
      Group,
      RPicker,
      XAddress
    },
    methods: {
      preloadFile(file) {
        let reader = new FileReader();
        reader.onload = (evt) => {
          this.MatPic = evt.target.result;
        };
        reader.readAsDataURL(file);
      },
      uploadFile(e) {
        let file = e.target.files[0];
        upload({file}).then(res => {
          let {success = false, message = '上传失败', data} = res;
          let [detail = {}] = data;
          this.picShow = true;
          this.preloadFile(file);
          this.dealer.dealerPic = `/H_roleplay-si/ds/download?url=${detail.attacthment}`;
          // this.biReferenceId = detail.biReferenceId
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        });
      },
      // TODO 往来关系标签
      dealerLabel(val) {
        if (this.hasDefault) {
          console.log('进入');
          return 
        }
        this.getBig().then(data => {
          let [defaultSelect = {}] = data;
          this.dealer.dealerType = defaultSelect.name || '';
        });
      },
      // TODO 往来大类切换
      bigChange(val) {
        if (this.hasDefault) {
          return 
        }
        this.getSml(val).then(data => {
          let [defaultSelect = {}] = data;
          this.dealer.dealerSubclass = defaultSelect.name || '';
        });
      },
      //获取往来关系标签
      getDealer(){
        //获取往来关系标签
        return dealerService.getDictByType().then(data=>{
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.AccountRelType = tableContent;
          return tableContent
        }).catch(e=>{
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 获取往来大类
      getBig() {
        let [selected = {}] = this.AccountRelType.filter(item => {
          return item.name === this.dealer.dealerLabelName
        });
        return dealerService.getDictByValue(selected.originValue).then(data => {
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.AccountBigType = tableContent;
          return tableContent
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 获取往来子类
      getSml() {
        let [selected = {}] = this.AccountBigType.filter(item => {
          return item.name === this.dealer.dealerType
        });
        return dealerService.getDictByValue(selected.originValue).then(data => {
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          let [defaultSelect = {}] = tableContent;
          this.AccountSmlType = tableContent;
          return tableContent
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        })
      },
      //校验固定电话号
      checkPhone(){
        let reg = /^0\d{2,3}-?\d{7,8}$/;
        if(!reg.test(this.dealer.dealerPhone)){
          this.btnStatus = true;
          AlertModule.show({
            content:'固定电话格式不正确'
          })
        }
        else{
          this.btnStatus = false;
        }
        
        
      },
      //校验手机号
      checkMobile(){
        let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if(!reg.test(this.dealer.dealerMobilePhone)){
          this.btnStatus = true;
          AlertModule.show({
            content:'手机号格式不正确'
          })
        }
        else{
          this.btnStatus = false;
        }
        

      },
      //校验邮箱
      checkEmail(){
        let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
        if(!reg.test(this.dealer.dealerMail)){
          this.btnStatus = true;
          AlertModule.show({
            content:'邮箱格式不正确'
          })
        }
        else{
          this.btnStatus = false;
        }
        
      },
      //往来信息
      findData() {
        return dealerService.getDealerInfo(this.transCode).then(({formData = {}, attachment = []}) => {
          let {baseinfo = {}, dealer = {}} = formData;
          this.hasDefault = true;
          this.baseinfo = {...this.baseinfo, ...baseinfo,};
          this.dealer = {...this.dealer, ...dealer,};
          this.biReferenceId = this.dealer.referenceId;
          if (this.dealer.dealerPic) {
            this.picShow = true;
            this.MatPic = this.dealer.dealerPic;
          }
          let [imgFileObj = {}] = attachment.filter(item => {
            return item.attacthment === this.dealer.dealerPic
          });
          this.imgFileObj = imgFileObj;
        });
      },
      //选择地址
      changeAddress(ids,names){
        this.AccountAddress = names;
      },
      getAddress(){
        if(this.AccountAddress.length>0){
          this.dealer.province = this.AccountAddress[0];
          this.dealer.city = this.AccountAddress[1];
          this.dealer.county = this.AccountAddress[2]
        }
      },
      //提交
      submit(){
        console.log(this.dealer);
        for(let key in this.dealer){
          console.log(typeof(this.dealer[key]));
          if(typeof(this.dealer[key]) === 'string' && this.dealer[key].indexOf(' ')>=0){
            this.dealer[key] = this.dealer[key].replace(/\s/g,'');
          }
        }
        let submitData = {
          listId: 'c0375170-d537-4f23-8ed0-a79cf75f5b04',
          formData: {
            baseinfo: this.baseinfo,
            dealer: this.dealer
          }
        };
        console.log(this.hasDefault);
        if(this.transCode.length>0){
          dealerService.update(submitData).then(data=>{
            let that = this;
            if(data.success){
              AlertModule.show({
                content: data.message,
                onHide(){
                  that.$router.push('/adress');
                }
              })  
            }
            else{
              AlertModule.show({
                content: data.message
              })  
            }
                               
          }).catch(e=>{
            AlertModule.show({
              content: e.message,
            })
          })
        }
        else{
          dealerService.save(submitData).then(data=>{
            let that = this;  
            if(data.success){
              AlertModule.show({
                content:data.message,
                onHide(){
                  that.$router.push('/adress');
                }
              })
            }   
            else{
              AlertModule.show({
                content:data.message
              })
            }                                  
          }).catch(e=>{
            AlertModule.show({
              content: e.message,
            })
          })
        }
        

      },
      save(){
        if(!this.btnStatus){
          if(this.dealer.dealerCode === ''){
              AlertModule.show({
                content: '【往来编码】不能为空',
              })
            }
            else if(this.dealer.dealerName === ''){
              AlertModule.show({
                content: '【往来名称】不能为空',
              })
            }
            else if(this.dealer.dealerLabelName === ''){
              AlertModule.show({
                content: '【往来关系标签】不能为空',
              })
            }
            else{
              this.submit()
            }

          }
        }
        
      
    },
    created() {
      let query = this.$route.query;
      if(query.transCode){
        this.transCode = query.transCode;
         (async () => {
          await this.findData();
          await this.getDealer();
          await this.getBig();
          this.getSml();
          this.hasDefault = false;
        })();
      }
      else{
        this.getDealer().then(data => {
          let [defaultSelect = {}] = data;
          this.dealer.dealerLabelName = defaultSelect.name
        });
        //获取当前用户信息
        getBaseInfoData().then(data => {
          this.baseinfo = {
            ...this.baseinfo,
            ...data,
            activeTime: this.changeDate(new Date(), true),
          }
        });
      }
    }
  }
</script>
<style lang="scss">
  .content {
    height: 90%;
    overflow-y: auto;
    overflow-x: hidden;
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
      .mater_pic {
        .add_icon {
          position: relative;
          label {
            display: block;
            width: 1.2rem;
            height: 1.2rem;
          }
          .upload {
            width: 1.2rem;
            height: 1.2rem;
            position: absolute;
            left: 0;
            top: 0;
            z-index: -999;
            span {
              display: block;
              text-align: center;
            }
            .iconfont {
              font-size: 0.24rem;
              margin-top: 0.24rem;
            }
          }

        }

        .pic {
          width: 1.2rem;
          height: 1.2rem;
          border: 0;
        }
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
        color:red;
        font-weight: bold;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width:100%;
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
    .disabled{
      background:#c7c7c7;
      box-shadow: 0 2px 5px #c7c7c7;
    }
  }

</style>


