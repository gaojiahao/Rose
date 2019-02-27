<template>
  <div class='childPage dealer-page'>
    <r-scroll :options="scrollOptions" class="content" ref="bScroll">
      <div class='mater_baseinfo'>
        <div class="mater_pic">
          <span class="title">往来照片</span>
          <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
        </div>
      </div>
      <div class="each-info" v-for="(item, index) in dealerConfig" :key="index">
        <template v-if="!item.hiddenInRun">
          <template v-if="item.fieldCode !== 'dealerLabelName' && item.fieldCode !== 'dealerStatus'" >
            <!-- 输入框（文字字） -->
            <div class='each_property vux-1px-t' v-if="item.xtype === 'r2Textfield'">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <div class='property_val' >
                <input type='text' placeholder="请输入" v-model="dealer[item.fieldCode]"  @blur="check(item)" @focus="getFocus($event)"/>
                <icon type="warn" class='warn' v-if='item.warn'></icon>
              </div> 
            </div>
            <!-- 输入框（数字） -->
            <div class='each_property vux-1px-t' v-if="item.xtype === 'r2Numberfield'">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <div class='property_val' >
                <input type='number' placeholder="请输入" v-model.number="dealer[item.fieldCode]" @blur="check(item)" @focus="getFocus($event)"/>
                <icon type="warn" class='warn' v-if='item.warn'></icon>
              </div>
            </div>
            <!-- 下拉框 -->
            <r-picker class="vux-1px-t" :title="item.fieldLabel" :data="item.remoteData" :value="dealer[item.fieldCode]" 
                  v-model="dealer[item.fieldCode]" :required="!item.allowBlank" v-if="item.xtype === 'r2Combo'"></r-picker>
          </template>
          <!--往来状态 -->
          <template v-else-if="item.fieldCode === 'dealerStatus'">
            <r-picker class="vux-1px-t" :title="item.fieldLabel" :data="item.remoteData" :value="dealerStatus" 
                  v-model="dealerStatus" :required="!item.allowBlank"></r-picker>
          </template>
          <!-- 往来类型 -->
          <template v-else>
            <div class='each_property vux-1px-t' @click="DealerPop">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <div class='picker'>
                  <span class='mater_nature'>{{dealer[item.fieldCode] || "请选择"}}</span>
                  <span class='icon-right'></span>
              </div>
            </div>
          </template>
        </template>
      </div>
      <!-- 重复项 -->
      <duplicate-component :config="dealerDuplicateConfig" :defaultValue="dealerDuplicateData" v-model="dealerDuplicateData"></duplicate-component>
    </r-scroll>
    <!--往来类型的列表-->
    <div v-transfer-dom>
      <popup v-model="pickerStatus" position="bottom" height="50%" class="trade_pop_part"  @on-show="onShow">
        <div class="trade_pop">
          <r-scroll class='dealer_list' :options="scrollOptions" ref="bScroll">
            <div v-for='(item, index) in AccountRelType' :key='index' class='dealer_type vux-1px-b' @click="selectType(item)">
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
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save" :class='{disabled : disabledSubmit}'>
        {{this.transCode ? '保存':'提交'}}
      </div>
    </div>
  </div>
</template>
<script>
import { TransferDom, Picker, Popup, Group,XAddress, ChinaAddressV4Data, Icon, XInput, Datetime } from 'vux';
import { getBaseInfoDataBase,getDictByType, getFormConfig, requestData, getFormViews } from 'service/commonService.js';
import dealerService from 'service/dealerService.js'
import RPicker from 'components/basicPicker';
import common from 'mixins/common.js'
import RScroll from 'components/RScroll'
import UploadImage from 'components/UploadImage'
import duplicateComponent from '../../../components/duplication'

export default {
  data() {
    return {
      listId: 'c0375170-d537-4f23-8ed0-a79cf75f5b04',
      addressData: ChinaAddressV4Data,
      transCode: '',
      picShow: false,
      imgFileObj: {}, // 上传的图片对象
      MatPic: '', // 图片地址
      AccountRelType: [], // 往来类型数据
      cAccountAddress: [], // 往来基本信息的省市区数据
      dAccountAddress: [], // 往来重复项的省市区数据
      pickerStatus:false, // 往来类型pop
      showAddress: false, // 地址pop
      dealerType: [], // 选好的往来类型列表
      PhoneWarn: false, // 固定电话校验提示
      MobileWarn: false, // 手机检验提示
      EmailWarn: false, // 邮箱校验提示
      codeWarn: false, // 邮政编码提示
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
        dealerPic : '',
      },
      statusList: [],
      dealerStatus: '使用中',
      submitSuccess: false, // 是否提交成功
      scrollOptions : {
        click : true
      },
      dealerConfig: [],
      dealerDuplicateConfig: [], // 往来重复项的配置
      dealerDuplicateData: {}, // 往来重复项数据,
      uniqueId: '',
      hasDefault: false
    }
  },
  computed: {
    // 提交按钮是否可点击
    disabledSubmit() {
      return this.PhoneWarn || this.MobileWarn || this.EmailWarn || this.codeWarn;
    },
    dealerLabelName() {
      return this.dealer.dealerLabelName
    },
    mianTypes() {
      return this.dealer.mianTypes
    },
    country() {
      return this.dealer.country
    },
    province() {
      return this.dealer.province
    },
    city() {
      return this.dealer.city
    },
    paymentTerm() {
      return this.dealer.paymentTerm
    }
  },
  watch: {
    dealerLabelName(val) {
      // 根据往来类型绝的哪个重复项显示
      let dealerLabelName = this.dealer.dealerLabelName;
      this.dealerDuplicateConfig.forEach(item => {
        // 当关系标签包含客户，供应商，加工商，渠道商，服务商时，省市区显示
        if(item.name === 'deliveryAddresses') {
          item.hiddenInRun = false;
          if(!dealerLabelName || (!dealerLabelName.includes('客户') && !dealerLabelName.includes('供应商') && !dealerLabelName.includes('加工商') 
            && !dealerLabelName.includes('渠道商') && !dealerLabelName.includes('服务商'))) {
            item.hiddenInRun = true
          }
        }
        // 当关系标签包含生产商,经销供应商 证件显示
        if(item.name === 'dealerCertificateRel') {
          item.hiddenInRun = false;
          if(!dealerLabelName || (!dealerLabelName.includes('生产商') && !dealerLabelName.includes('经销供应商'))) {
            item.hiddenInRun = true
          }
        } 
      })
    },
    mianTypes(val) {
      if(val){
        for(let item of this.dealerConfig) {
          // 主题类型为机构时，税号显示
          if(item.fieldCode === 'taxNo') {
            item.hiddenInRun = val === '机构' ? false : true;
            break
          }
        }
      } 
    },
    country(val) {
      if(val) {
        let hasDefault = this.hasDefault;
        for(let item of this.dealerConfig) {
          // 当前字段为【省】，将【国家或地区】的值赋值给请求【省】的参数中, 并设置【市】的默认值
          if(item.fieldCode === 'province') {
            item.requestParams.data.countryName = val;
            requestData(item.requestParams).then(({tableContent = []}) => {
              tableContent.length && tableContent.forEach(dItem => {
                dItem.name = dItem[item.displayField];
                dItem.value = dItem[item.displayField];
              })
              if(!hasDefault) {
                let province = tableContent.length ? tableContent[0].name : '';
                this.$set(this.dealer, 'province', province)
              } 
              this.$set(item, 'remoteData', tableContent)
            })
            break
          }
        }
      }
    },
    province(val) {
      if(val) {
        let hasDefault = this.hasDefault;
        for(let item of this.dealerConfig) {
          // 当前字段为【市】，将【省】的值赋值给请求【市】的参数中, 并设置【市】的默认值
          if(item.fieldCode === 'city') {
            item.requestParams.data.countryName = this.dealer.country;
            item.requestParams.data.provinceName = this.dealer.province;
            requestData(item.requestParams).then(({tableContent = []}) => {
              tableContent.length && tableContent.forEach(dItem => {
                dItem.name = dItem[item.displayField];
                dItem.value = dItem[item.displayField];
              })
              if(!hasDefault) {
                let city = tableContent.length ? tableContent[0].name : '';
                this.$set(this.dealer, 'city', city)
              } 
              this.$set(item, 'remoteData', tableContent)
            })
            break
          }  
        }
      }
    },
    city(val) {
      if(val) {
        let hasDefault = this.hasDefault;
        for(let item of this.dealerConfig) { 
          // 当前字段为【区】，将【市区】的值赋值给请求【区】的参数中, 并设置【区】的默认值
          if(item.fieldCode === 'county') {
            item.requestParams.data.countryName = this.dealer.country;
            item.requestParams.data.provinceName = this.dealer.province;
            item.requestParams.data.cityName = this.dealer.city;
            requestData(item.requestParams).then(({tableContent = []}) => {
              tableContent.length && tableContent.forEach(dItem => {
                dItem.name = dItem[item.displayField];
                dItem.value = dItem[item.displayField];
              })
              if(!hasDefault) {
                let county = tableContent.length ? tableContent[0].name : '';
                this.$set(this.dealer, 'county', county)
              }
              this.$set(item, 'remoteData', tableContent)
            })
            break
          }         
        }
      }
    },
    paymentTerm(val) {
      if(val) {
        let paramsValue = '',
            config = this.dealerConfig,
            { paymentTerm } = this.dealer,
            hasDefault = this.hasDefault;
        for(let item of config) {
          setTimeout(() => {
            if(item.fieldCode === 'paymentTerm') {
              // 循环结算方式的数据, 匹配到当前结算方式的value, 该值作为请求账期方式的参数
              if(item.remoteData && item.remoteData.length) {
                for(let dItem of item.remoteData) {
                  if(dItem.name === paymentTerm) {
                    paramsValue = dItem.OriginValue;
                    break;
                  }
                }
              }
            }
            if(item.fieldCode === 'wayOfPayment') {
              item.hiddenInRun = paymentTerm === '后支付' ? false : true;
              // 账期方式显示, 重新请求数据
              if(!item.hiddenInRun) {
                item.requestParams.data.value = paramsValue;
                requestData(item.requestParams).then(({tableContent = []}) =>{
                  tableContent.length && tableContent.forEach(sItem => {
                    sItem.OriginValue = sItem.value;
                    sItem.name = sItem[item.displayField];
                    sItem.value = sItem[item.displayField];
                  })
                  // 页面为提交时, 赋初始值
                  if(!hasDefault) {
                    let wayOfPayment = tableContent.length ? tableContent[0].name : '';
                    this.$set(this.dealer, 'wayOfPayment', wayOfPayment)
                  }
                  this.$set(item, 'remoteData', tableContent)
                })
              }
            }
          }, 0) 
        }
      }
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
    XInput,
    Datetime,
    duplicateComponent
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
      if(this.dealer.dealerLabelName.length){
        arr.forEach(item=>{
          let obj = {
            name :item
          }
          this.dealerType.push(obj);
        })
        
      }
     
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
    // 校验字段
    check(item, sItem){
      if(item.fieldCode === 'dealerPhone') {
        item.warn = this.checkPhone()
      }
      else if(item.fieldCode === 'dealerMobilePhone') {
        item.warn = this.checkMobile()
      }
      else if(item.fieldCode === 'dealerMail') {
        item.warn = this.checkEmail()
      }
    },
    //校验固定电话号
    checkPhone(){
      let reg = /^0\d{2,3}-\d{7,8}$/;
      if(this.dealer.dealerPhone.length>0 && !reg.test(this.dealer.dealerPhone)){
        this.PhoneWarn = true;
      }
      else{
        this.PhoneWarn = false;
      }
      return this.PhoneWarn;
    },
    //校验手机号
    checkMobile(){
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if(this.dealer.dealerMobilePhone.length>0 && !reg.test(this.dealer.dealerMobilePhone)){
        this.MobileWarn = true;
      }
      else{
        this.MobileWarn = false;
      }
      return this.MobileWarn
    },
    //校验邮箱
    checkEmail(){
      let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if(this.dealer.dealerMail.length>0 && !reg.test(this.dealer.dealerMail)){
        this.EmailWarn = true;
      }
      else{
        this.EmailWarn = false;
      }
      return this.EmailWarn
    },
    // 校验邮政编码
    checkCode(item){
      let reg =  /^[1-9][0-9]{5}$/;
      if(item.postalCode.length>0 && !reg.test(item.postalCode)){
        this.codeWarn = true;
      }
      else{
        this.codeWarn = false;
      }
      return this.codeWarn

    },
    //往来信息
    findData() {
      return dealerService.getDealerInfo(this.transCode).then(({formData = {}, attachment = []}) => {
        this.dealerDuplicateConfig.forEach(item => {
          if(formData[item.name].length){
            this.dealerDuplicateData[item.name] = formData[item.name];
          }
        })
        let {baseinfo = {}, dealer = {}} = formData;
        this.hasDefault = true;
        switch (dealer.dealerStatus) {
            case '1':
              this.dealerStatus = '使用中';
              break;
            case '2':
              this.dealerStatus = '未使用';
              break;
            case '0':
              this.dealerStatus = '草稿';
              break;
            case '-1':
              this.dealerStatus = '停用';
              break;
          }
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
        this.cAccountAddress = [this.dealer.province,this.dealer.city,this.dealer.county];
        this.imgFileObj = imgFileObj;
      });
    },
    // TODO 获取默认图片
    getDefaultImg() {
        this.MatPic = require('assets/contact_default02.png');
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
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          switch (this.dealerStatus) {
            case '使用中':
              this.dealer.dealerStatus = '1';
              break;
            case '未使用':
              this.dealer.dealerStatus = '2';
              break;
            case '草稿':
              this.dealer.dealerStatus = '0';
              break;
            case '停用':
              this.dealer.dealerStatus = '-1';
              break;
          }
          if(this.dealer.status){
            delete this.dealer.status
          }
          let submitData = {
            listId: 'c0375170-d537-4f23-8ed0-a79cf75f5b04',
            formData: {
              baseinfo: this.baseinfo,
              dealer: this.dealer
            }
          };
          this.dealerDuplicateConfig.forEach(item => {
            if(this.dealerDuplicateData[item.name].length){
              submitData.formData[item.name] = this.dealerDuplicateData[item.name]
            }
          })
          if(this.transCode){
            dealerService.update(submitData).then( data => {
              if(data.success){
                this.submitSuccess = true;
                this.$vux.alert.show({
                  content: '修改成功',
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

            })
          }
          else{
            dealerService.save(submitData).then(data=>{
              if(data.success){
                this.submitSuccess  = true;
                this.$vux.alert.show({
                  content:'提交成功',
                  onHide:()=>{
                    if(this.$route.query.add === 1){
                      let dealer = [this.dealer];
                      sessionStorage.setItem('DEALERLIST_SELITEMS',JSON.stringify(dealer));
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
            })
          }

        }
      })
    },
    save() {
      if (!this.disabledSubmit) {
        let warn = '';
        for(let item of this.dealerConfig){
          if(!item.allowBlank && !this.dealer[item.fieldCode]){
            warn = `${item.fieldLabel}不能为空`
            break
          }
          if(item.submitValue){
            this.dealer[item.fieldCode] = this.dealer[item.fieldCode] || ''
          }
        }
        // 校验重复项
        if(!warn && Object.keys(this.dealerDuplicateData).length){
          Object.keys(this.dealerDuplicateData).forEach(item => {
            if(this.dealerDuplicateData[item].length <= 0){
              return false
            }
            this.dealerDuplicateConfig.forEach(dItem => {
              if(dItem.name === item){
                dItem.items.forEach(cItem => {
                  if(!cItem.hidden){
                    this.dealerDuplicateData[item].forEach(sItem => {
                      if(!cItem.allowBlank && !sItem[cItem.fieldCode]){
                        warn  = `${cItem.text}不能为空`;
                        return false
                      }
                    })
                  }
                })  
              }
            })
          })
        }
        if (warn) {
          this.$vux.alert.show({
            content: warn
          });
          return
        }
        this.submit();
      }
    },
    // 处理配置中的接口请求
    handlerParams(sItem) {
      let url = sItem.dataSource.data.url;
      let params = sItem.dataSource.data.params;
      let keys = Object.keys(params);
      let requestParams = {
        url,
      }
      let paramsIsOk = true;
      if(keys.length){
        let data = {};
        keys.forEach(key => {
          data[key] = params[key].type === 'text' ? params[key].value : '';
          if(!data[key]){
            paramsIsOk = false;
          }
        })
        requestParams.data = data;
      }
      sItem.requestParams = requestParams;
      
      // 判断当请求参数都有值,才发起请求
      if(paramsIsOk){
        requestData(requestParams).then((data) => {
          if(data.tableContent){
            data.tableContent.forEach(item => {
              item.OriginValue = item.value;
              item.name = item[sItem.displayField];
              item.value = item[sItem.displayField];
            })
            this.$set(sItem, 'remoteData', data.tableContent)
          }
          else{
            data.forEach(item => {
              item.name = item[sItem.displayField];
              item.value = item[sItem.displayField];
            })
            this.$set(sItem, 'remoteData', data)
          }
        })
      }
      
    },
    // 请求表单配置的基本信息
    async getFormViewsInfo(){
      // 根据listId 请求表单的 uniqueId
      await getFormViews(this.listId).then(data => {
        for(let item of data){
          if(this.transCode && item.viewType === 'revise'){
            this.uniqueId = item.uniqueId;
          }
          else if(!this.transCode && item.viewType === 'submit'){
            this.uniqueId = item.uniqueId;
          }
        }
      })
      // 根据uniqueId 请求表单的配置
      await getFormConfig(this.uniqueId).then(({config = []}) => {
        // console.log(config);
        let dealerConfig = [], dealerDuplicateConfig = [];
        config.forEach(item => {
          if(!item.isMultiple) {
            dealerConfig = JSON.parse(JSON.stringify(item.items));
          }
          else{
            if(item.xtype !== 'r2Fileupload'){
              dealerDuplicateConfig.push(JSON.parse(JSON.stringify(item)))
            }
          }
        })
        // 仓库基本信息配置的处理
        dealerConfig.forEach(item =>{
          if(!item.hiddenInRun){
            //下拉框的数据请求
            if(item.fieldCode !=='dealerLabelName'){
              if((item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector') && item.dataSource && item.dataSource.type === 'remoteData' ) {
                this.handlerParams(item)
                // 有默认值，在dealer中添加默认值
                if(item.defaultValue && item.defaultValue.type === 'staticData' && item.defaultValue.data && item.defaultValue.data.length){
                  this.$set(this.dealer, item.fieldCode, item.defaultValue.data[0])
                  // this.dealer[item.fieldCode] = item.defaultValue.data[0]
                }
              }
              else if(item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData'){
                this.$set(item, 'remoteData', item.dataSource.data)
              }
            }
          }
          // 在渲染的配置中添加字段
          if(item.fieldCode !== 'dealerPic'){
            this.dealerConfig.push(item);
          }
          // 默认将税号隐藏
          if(item.fieldCode === 'taxNo' || item.fieldCode === 'wayOfPayment'){
            item.hiddenInRun = true
          }
        })
        // 处理重复项配置
        dealerDuplicateConfig.forEach(item => {
          item.hiddenInRun = false;
          // 给每个重复项添加标题
          switch(item.name){
            case 'deliveryAddresses':
              item.title = '地址';
              break;
            case 'dealerCertificateRel':
              item.title = '证件';
              break;
          }
          let arr = []
          item.items.forEach((sItem, sIndex) => {
            if(!sItem.hidden){
              // 数据请求
              if(sItem.editorType === 'r2Combo' && sItem.dataSource && sItem.dataSource.type === 'remoteData') {
                this.handlerParams(sItem)
              }
              arr.push(sItem)
            }
          })
          item.items = arr;
          this.$set(this.dealerDuplicateData, item.name, [])
        })
        this.dealerDuplicateConfig = dealerDuplicateConfig;
        if(!this.transCode) this.$loading.hide()
      })
    }
  },
  created() {
    this.$loading.show();
    let query = this.$route.query;
    if(query.transCode){
      this.transCode = query.transCode;
      (async () => {
        await this.getFormViewsInfo()
        await this.findData().then(() =>{
          this.$loading.hide()
        });
        this.getDealer()
        this.hasDefault = false;
      })();
      return 
    }
    this.getFormViewsInfo();
    this.getDealer().then(data => {
      let [defaultSelect = {}] = data;
      if(this.$route.query.pickVal){
        this.dealer.dealerLabelName = this.$route.query.pickVal;
        this.pickerStatus = false;
      }
      else{//新增往来，默认选中地址栏中的往来类型
        this.dealer.dealerLabelName = this.$route.query.dealerType ? this.$route.query.dealerType : '';           
      }
    });
    //获取当前用户信息
    getBaseInfoDataBase().then(data => {
      this.baseinfo = {
        ...this.baseinfo,
        ...data,
        activeTime: this.changeDate(new Date(), true),
      }
    })    
  },
  mounted() {
    this.$nextTick(() =>{
      if(this.$refs.bScroll){
        this.$refs.bScroll.refresh()
      }
    })

  },
  beforeRouteEnter (to, from, next) {
    // 修改title
    to.meta.title = '新增往来'
    if(to.query.transCode){
      to.meta.title = '编辑往来';
    }
    next()
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
  @import '../../../scss/basicApp.scss';
  .dealer-page{
    background: #f6f6f6;
  }
  .each_property{
    .property_val{
      display: flex;
      input{
        text-align: right;
      }
      .warn{
        margin-left: .02rem;
      }
      .weui-icon-warn {
        font-size: 0.14rem;
      }
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


