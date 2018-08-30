<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b '>
            <label class='required'>往来编码:</label>
            <input type='text' v-model="dealer.dealerCode" class='property_val' :class='{readonly : transCode!==""}' :readonly ='transCode!==""'/>
          </div>
          <div class='each_property required'>
            <label class='required'>往来名称:</label>
            <input type='text' v-model="dealer.dealerName" class='property_val'/>
          </div>
        </div>
        <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
      </div>
      <div class='each_property vux-1px-b' @click="DealerPop">
        <label>往来类型</label>
        <div class='picker'>
            <span class='mater_nature'>{{dealer.dealerLabelName}}</span>
            <span class='iconfont icon-gengduo'></span>
        </div>
      </div>
      <div class='each_property vux-1px-b' @click="showAddress = true">
        <label>省市区:</label>
        <div class='picker'>
            <span class='mater_nature'>{{dealer.province}}{{dealer.city}}{{dealer.county}}</span>
            <span class='iconfont icon-gengduo'></span>
        </div>
        <x-address title="省市区:"  :list="addressData" @on-hide='getAddress($event)' @on-shadow-change='changeAddress'
                   :show.sync="showAddress" v-show="false"></x-address>
      </div>
      <div class='each_property vux-1px-b'>
        <label>详细地址:</label>
        <input type='text' v-model="dealer.address" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>固定电话:</label>
        <input type='text' v-model="dealer.dealerPhone" class='property_val' @blur="checkPhone"/>
        <icon type="warn" class='warn' v-if='PhoneWarn'></icon>
      </div>
      <div class='each_property vux-1px-b'>
        <label>手机:</label>
        <input type='number' v-model="dealer.dealerMobilePhone" class='property_val' @blur="checkMobile"/>
        <icon type="warn" class='warn' v-if='MobileWarn'></icon>
      </div>
      <div class='each_property vux-1px-b'>
        <label>电子邮件:</label>
        <input type='text' v-model="dealer.dealerMail" class='property_val' @blur='checkEmail'/>
        <icon type="warn" class='warn' v-if='EmailWarn'></icon>
      </div>
    </div>
    <!--往来类型的列表-->
    <div v-transfer-dom>
      <popup v-model="pickerStatus" position="bottom" height="50%" class="trade_pop_part"  @on-show="onShow">
        <div class="trade_pop">
          <r-scroll class='dealer_list' :options="scrollOptions" ref="bScroll">
            <div v-for='(item,index) in AccountRelType' :key='index' class='dealer_type vux-1px-b' @click="selectType(item)">
              <div class='dealer_name'>{{item.name}}</div>
              <div class='checked' v-show='showSelIcon(item)'>
                <x-icon type="ios-checkmark-empty" size="30"></x-icon>
              </div>

            </div>
          </r-scroll>
        </div>
        <!-- 底部栏 -->
        <div class="count_mode vux-1px-t">
          <span class="count_num"> {{dealerType.length ? `已选 ${dealerType.length} 个` : '请选择'}} </span>
          <span class="count_btn" @click="cfmMater">确定</span>
        </div>
      </popup>
    </div>
    <!--提交按钮-->
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save" :class='{disabled : disabledSubmit}' v-html="this.$route.query.add?'保存并使用':'提交'"></div>
    </div>
  </div>
</template>
<script>
import { TransferDom, Picker, Popup, Group,XAddress, ChinaAddressV4Data,Icon } from 'vux';
import { getBaseInfoDataBase } from 'service/commonService.js';
import dealerService from 'service/dealerService.js'
import RPicker from 'components/RPicker';
import common from 'mixins/common.js'
import RScroll from 'components/RScroll'
import UploadImage from 'components/UploadImage'

export default {
  data() {
    return {
      addressData : ChinaAddressV4Data,
      transCode  : '',
      picShow: false,
      imgFileObj: {}, // 上传的图片对象
      MatPic: '', // 图片地址
      AccountRelType : [], //往来类型数据
      AccountAddress : [], //省市区数据
      pickerStatus:false, //往来类型pop
      showAddress: false,//地址pop
      dealerType:[], //选好的往来类型列表
      PhoneWarn : false, //固定电话校验提示
      MobileWarn : false, //手机检验提示
      EmailWarn :false, //邮箱校验提示
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
        dealerLabelName : '',//往来类型
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
        dealerPic : '',
      },
      submitSuccess: false, // 是否提交成功
      scrollOptions : {
        click : true
      },
    }
  },
  computed: {
    // 提交按钮是否可点击
    disabledSubmit(){
      return this.PhoneWarn || this.MobileWarn || this.EmailWarn;
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
    XAddress,
    Icon,
    RScroll,
    UploadImage,
  },
  methods: {
    // TODO 上传图片成功触发
    onUpload(val){
      this.dealer.dealerPic = val.src;
    },
    //获取往来类型
    getDealer(){
      //获取往来关系标签
      return dealerService.getDictByType().then(data=>{
        let {tableContent} = data;
        tableContent && tableContent.forEach(item => {
          item.selected = false;
        });
        this.AccountRelType = tableContent;
        this.$nextTick(() => {
          this.$refs.bScroll.refresh();
        })
        return tableContent
      }).catch(e=>{
        this.$vux.alert.show({
          content: e.message,
        })
      })
    },
    //显示往来类型pop
    DealerPop(){
      this.pickerStatus = true;
      this.dealerType = [];
      let arr = this.dealer.dealerLabelName.split(',');
      arr.forEach(item=>{
        let obj = {
          name :item
        }
        this.dealerType.push(obj);
      })
    },
    onShow() {
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          // 弹窗展示时刷新滚动，防止无法拖动问题
          this.$refs.bScroll.refresh();
        }
      })
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
        return this.dealerType.findIndex(item => item.name === sItem.name) !== -1;
      },
    //选择往来类型
    selectType(sItem){
      sItem.selected = ! sItem.selected;
      let arr = this.dealerType;
      let delIndex = arr.findIndex(item => item.name === sItem.name);
      // 若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    //确认选择往来类型
    cfmMater(){
      this.pickerStatus = false;
      this.dealer.dealerLabelName = '';
      this.dealerType.forEach(item=>{
        if(this.dealer.dealerLabelName.length){
          this.dealer.dealerLabelName += ','+item.name;
          return
        }
        this.dealer.dealerLabelName += item.name
      })

    },
    //校验固定电话号
    checkPhone(){
      let reg = /^0\d{2,3}-\d{7,8}$/;
      if(this.dealer.dealerPhone.length>0 && !reg.test(this.dealer.dealerPhone)){
        this.PhoneWarn = true;
        return
      }
      this.PhoneWarn = false;
    },
    //校验手机号
    checkMobile(){
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if(this.dealer.dealerMobilePhone.length>0 && !reg.test(this.dealer.dealerMobilePhone)){
        this.MobileWarn = true;
        return
      }
      this.MobileWarn = false;
    },
    //校验邮箱
    checkEmail(){
      let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if(this.dealer.dealerMail.length>0 && !reg.test(this.dealer.dealerMail)){
        this.EmailWarn = true;
        return
      }
      this.EmailWarn = false;
    },
    //往来信息
    findData() {
      return dealerService.getDealerInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        let {baseinfo = {}, dealer = {}} = formData;
        this.baseinfo = {...this.baseinfo, ...baseinfo,};
        this.dealer = {...this.dealer, ...dealer,};
        if (this.dealer.dealerPic.length>0) {
          this.picShow = true;
          this.MatPic = `/H_roleplay-si/ds/download?url=${this.dealer.dealerPic}&width=400&height=400`;
        }
        else{
          this.picShow = true;
          this.getDefaultImg()
        }
        let [imgFileObj = {}] = attachment.filter(item => {
          return item.attacthment === this.dealer.dealerPic
        });
        this.imgFileObj = imgFileObj;
      });
    },
    // TODO 获取默认图片
    getDefaultImg() {
        this.MatPic = require('assets/dealer.png');
    },
    //选择地址
    changeAddress(ids,names){
      this.AccountAddress = names;
    },
    getAddress(){
      if(this.AccountAddress.length>0){
        this.dealer.province = this.AccountAddress[0];
        this.dealer.county = this.AccountAddress[2]
        if(this.AccountAddress[1] === '市辖区'){
          this.dealer.city = '';
          return
        };
        this.dealer.city = this.AccountAddress[1];
      }
    },
    //提交
    submit(){
      for(let key in this.dealer){
        if(typeof(this.dealer[key]) === 'string' && this.dealer[key].indexOf(' ')>=0){
          this.dealer[key] = this.dealer[key].replace(/\s/g,'');
        }
      }

      this.$vux.confirm.show({
        content: '确认保存?',
        // 确定回调
        onConfirm: () => {
          let submitData = {
            listId: 'c0375170-d537-4f23-8ed0-a79cf75f5b04',
            formData: {
              baseinfo: this.baseinfo,
              dealer: this.dealer
            }
          };
          if(this.transCode.length > 0){
            dealerService.update(submitData).then( data => {
              if(data.success){
                this.submitSuccess = true;
                this.$vux.alert.show({
                  content: data.message,
                  onHide: () => {
                    this.$router.go(-1);
                  }
                })
              }
              else{
                this.$vux.alert.show({
                  content: data.message
                })
              }

            }).catch(e=>{
              this.$vux.alert.show({
                content: e.message,
              })
            })
          }
          else{
            dealerService.save(submitData).then(data=>{
              if(data.success){
                this.submitSuccess  = true;
                this.$vux.alert.show({
                  content:data.message,
                  onHide:()=>{
                    if(this.$route.query.add === 1){
                      sessionStorage.setItem('DEALERLIST_SELITEMS',JSON.stringify(this.dealer));
                    }
                    this.$router.go(-1);
                  }
                })
              }
              else{
                this.$vux.alert.show({
                  content:data.message
                })
              }
            }).catch(e=>{
              this.$vux.alert.show({
                content: e.message,
              })
            })
          }

        }
      })
    },
    save() {
      if (!this.disabledSubmit) {
        let warn = '';
        let validateMap = [
          {
            key: 'dealerCode',
            message: '【往来编码】',
          }, {
            key: 'dealerName',
            message: '【往来名称】',
          }, {
            key: 'dealerLabelName',
            message: '【往来类型】',
          },
        ];
        validateMap.every(item => {
          if (this.dealer[item.key] === '') {
            warn = `${item.message}不能为空`;
            return false
          }
          return true
        });
        if (!warn && this.PhoneWarn) {
          warn = '电话号码格式不正确'
        }
        if (!warn && this.MobileWarn) {
          warn = '手机号码格式不正确'
        }
        if (!warn && this.EmailWarn) {
          warn = '邮件格式不正确'
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.submit();
      }
    }
  },
  created() {
    this.$loading.show();
    let query = this.$route.query;
    if(query.transCode){
      this.transCode = query.transCode;
      this.findData();
      this.getDealer();
      this.$loading.hide();
    }
    else{
        this.getDealer().then(data => {
          this.$loading.hide();
          let [defaultSelect = {}] = data;
          if(this.$route.query.pickVal){
            this.dealer.dealerLabelName = this.$route.query.pickVal;
            this.pickerStatus = false;
          }else{
            this.dealer.dealerLabelName = defaultSelect.name;
          }
        });
      //获取当前用户信息
      getBaseInfoDataBase().then(data => {
        this.baseinfo = {
          ...this.baseinfo,
          ...data,
          activeTime: this.changeDate(new Date(), true),
        }
      });
    }
  },
   beforeRouteLeave(to, from, next) {
    let {path} = to;
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && path === '/adress') {
      to.meta.reload = true;
    }
    next();
  },
}
</script>
<style lang="scss" scoped>
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
  //往来类型弹出层
  .trade_pop_part {
    .trade_pop {
      background: #fff;
      height: calc(100% - .44rem);
      overflow: hidden;
      .dealer_list {
        width: 100%;
        height: 100%;
        .dealer_type {
          display: flex;
          color: #757575;
          padding: 0  0.2rem;
          line-height: 0.4rem;
          justify-content: space-between;
        }
      }
    }
    // 底部栏
    .count_mode {
      left: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      height: .44rem;
      position: fixed;
      line-height: .44rem;
      background: #fff;
      .count_num {
        flex: 2.5;
        color: #5077aa;
        font-size: .24rem;
        padding-left: .1rem;
      }
      .count_btn {
        flex: 1.5;
        color: #fff;
        text-align: center;
        background: #5077aa;
      }
    }
  }

</style>


