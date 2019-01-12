<template>
  <div class='childPage'>
    <r-scroll :options="scrollOptions" class="content" ref="bScroll">
      <div>
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
        <div v-for="(item, index) in dealerConfig" :key="index">
          <template v-if="item.fieldCode !== 'dealerLabelName' && item.fieldCode !== 'province' && item.fieldCode !== 'dealerStatus'" >
            <div class='each_property vux-1px-b' v-if="item.xtype === 'r2Textfield'">
              <label>{{item.fieldLabel}}</label>
              <input type='text' v-model="dealer[item.fieldCode]" class='property_val' @blur="check(item)"/>
              <icon type="warn" class='warn' v-if='item.warn'></icon>
            </div>
            <div class='each_property vux-1px-b' v-if="item.xtype === 'r2Numberfield'">
              <label>{{item.fieldLabel}}</label>
              <input type='number' v-model="dealer[item.fieldCode]" class='property_val' @blur="check(item)"/>
              <icon type="warn" class='warn' v-if='item.warn'></icon>
            </div>
            <r-picker :title="`${item.fieldLabel}:`" :data="item.remoteData" :value="dealer[item.fieldCode]" 
                  v-model="dealer[item.fieldCode]" :required="!item.allowBlank" v-if="item.xtype === 'r2Combo'"></r-picker>
          </template>
          <!--往来状态 -->
          <template v-else-if="item.fieldCode === 'dealerStatus'">
            <r-picker :title="`${item.fieldLabel}:`" :data="item.remoteData" :value="dealerStatus" 
                  v-model="dealerStatus" :required="!item.allowBlank"></r-picker>
          </template>
          <!-- 省市区 -->
          <template v-else-if="item.fieldCode === 'province'">
            <div class='each_property vux-1px-b' @click="showAddress = true">
              <label>省市区:</label>
              <div class='picker'>
                  <span class='mater_nature'>{{dealer.province}}{{dealer.city}}{{dealer.county}}</span>
                  <span class='iconfont icon-gengduo'></span>
              </div>
              <x-address title="省市区:"  :list="addressData" @on-hide='getAddress()' @on-shadow-change='changeAddress' :value="cAccountAddress"
                        :show.sync="showAddress" v-show="false"></x-address>
            </div>
          </template>
          <!-- 往来类型 -->
          <template v-else>
            <div class='each_property vux-1px-b' @click="DealerPop">
              <label class="required">{{item.fieldLabel}}</label>
              <div class='picker'>
                  <span class='mater_nature'>{{dealer[item.fieldCode]}}</span>
                  <span class='iconfont icon-gengduo'></span>
              </div>
            </div>
          </template>
        </div>
        <!-- 重复项 -->
        <div v-for="(item, index) in dealerDuplicateConfig" :key="`${item.name}+${index}`">
          <template v-if="!item.isHidden">
            <div class="duplicate-item-no-select" v-if="!dealerDuplicateData[item.name].length">
              <span class="title">{{item.title}}</span>
              <span class="add" @click="addMoreUnit(item)">新增</span>
            </div>
            <group class="duplicate-item" :title="item.title" v-else>
              <div v-for="(sItem, sIndex) in dealerDuplicateData[item.name]" :key="sIndex" :class="{'has_border': sIndex < dealerDuplicateData[item.name].length-1}">
                <div v-for="(dItem,dIndex) in item.items"  :key="dIndex" >
                  <!-- 下拉框 -->
                  <r-picker class="vux-1px-t" :title="dItem.text" :data="dItem.remoteData" :value="sItem[dItem.fieldCode]"
                          mode="4" :has-border="false" v-model="sItem[dItem.fieldCode]" :required="!dItem.allowBlank" 
                          @on-change="onChange($event, index, dItem, sItem)"
                          v-if="dItem.editorType === 'r2Combo'">
                  
                  </r-picker>
                  <!-- 输入框（数字） -->
                  <x-input type="number" text-align='right' placeholder='请填写' v-model.numer='sItem[dItem.fieldCode]'
                          v-if="dItem.editorType === 'r2Numberfield'">
                    <template slot="label">
                      <span :class="{'required' : !dItem.allowBlank}">{{dItem.text}}</span>
                    </template>
                  </x-input>
                  <!-- 输入框（文字） -->
                  <x-input text-align='right' placeholder='请填写' v-model='sItem[dItem.fieldCode]' 
                          v-if="dItem.editorType === 'r2Textfield'">
                    <template slot="label">
                      <span :class="{'required' : !dItem.allowBlank}">{{dItem.text}}</span>
                    </template>
                  </x-input>
                  <!-- 日期 -->
                  <datetime  v-model='sItem[dItem.fieldCode]' v-if="dItem.editorType === 'r2Datefield'">
                    <template slot="title">
                      <span :class="{'required' : !dItem.allowBlank}">{{dItem.text}}</span>
                    </template>
                  </datetime>
                </div>
              </div>
            </group>
            <div class="add_more" v-show="dealerDuplicateData[item.name].length">
              您还需要添加新的{{item.title}}?请点击
              <span class='add' @click="addMoreUnit(item)">新增</span>
              <em v-show="dealerDuplicateData[item.name].length > 1">或</em>
              <span class='delete' @click="deleteMoreUnit(item)" v-show="dealerDuplicateData[item.name].length > 1">删除</span>
            </div> 
          </template>
        </div>
      </div>
    </r-scroll>
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
import RPicker from 'components/RPicker';
import common from 'mixins/common.js'
import RScroll from 'components/RScroll'
import UploadImage from 'components/UploadImage'

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
        dealerStatus: '', //往来状态
        comment: '',  //往来说明
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
    }
  },
  computed: {
    // 提交按钮是否可点击
    disabledSubmit(){
      return this.PhoneWarn || this.MobileWarn || this.EmailWarn || this.codeWarn;
    },
    dealerLabelName() {
      return this.dealer.dealerLabelName
    }
    
  },
  watch: {
    dealerLabelName(val){
      // 根据往来类型绝的哪个重复项显示
      let dealerLabelName = this.dealer.dealerLabelName;
      this.dealerDuplicateConfig.forEach(item => {
        if(item.name === 'deliveryAddresses'){
          item.isHidden = false;
          if(!dealerLabelName || (!dealerLabelName.includes('客户') && !dealerLabelName.includes('供应商') && !dealerLabelName.includes('加工商') 
            && !dealerLabelName.includes('渠道商') && !dealerLabelName.includes('服务商'))) {
            item.isHidden = true
          }
        }
        if(item.name === 'dealerCertificateRel'){
          item.isHidden = false;
          if(!dealerLabelName || (!dealerLabelName.includes('生产商') && !dealerLabelName.includes('经销供应商'))) {
            item.isHidden = true
          }
        } 
      })
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
    Datetime
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
    // 选择省市区
    onChange(val, index, dItem, sItem){
      // 选择省，更新市，区数据
      if(dItem.fieldCode === 'deliveryProvince'){
        let cParentId = '', dParentId = '';
        for(let item of this.dealerDuplicateConfig[index].items) {
          if(item.fieldCode === 'deliveryProvince'){
            for(let rItem of item.remoteData){
              if(rItem.name === val){
                cParentId = rItem.id;
                break
              }
            }
          }
          if(item.fieldCode === 'deliveryCity') {
            item.requestParams.data.parentId = cParentId;
            requestData(item.requestParams).then(data => {
              if(data.tableContent){
                if(data.tableContent.length){
                  data.tableContent.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.value = dItem.name
                  })
                  sItem.deliveryCity = data.tableContent[0].name;
                  dParentId = data.tableContent[0].originValue
                }
                else{
                  sItem.deliveryCity = ''
                }
                item.remoteData = data.tableContent  
              }
            })
            break
          }
        }
      }
      else if(dItem.fieldCode === 'deliveryCity'){
        let dParentId = '';
        for(let item of this.dealerDuplicateConfig[index].items) {
          if(item.fieldCode === 'deliveryCity'){
            for(let rItem of item.remoteData){
              if(rItem.name === val){
                dParentId = rItem.originValue;
                break
              }
            }
          }
          if(item.fieldCode === 'deliveryCounty') {
            item.requestParams.data.parentId = dParentId;
            requestData(item.requestParams).then(data => {
              if(data.tableContent){
                if(data.tableContent.length){
                  data.tableContent.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.value = dItem.name
                  })
                  sItem.deliveryCounty = data.tableContent[0].name;
                }
                else{
                  sItem.deliveryCounty = ''
                }
                item.remoteData = data.tableContent  
              }
            })
            break
          }
          
        }

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
    // TODO 新增重复项
    addMoreUnit(item) {
      let obj = {};
      item.items.forEach(item => {
        if(!item.hidden){
          obj[item.fieldCode] = ''
        }
      })
      this.dealerDuplicateData[item.name].push(obj);
    },
    // TODO 删除重复项
    deleteMoreUnit(item) {
      this.dealerDuplicateData[item.name].pop()
    },
    // 处理配置中的接口请求
    handlerParams(sItem) {
      let url = sItem.dataSource.data.url;
      let params = sItem.dataSource.data.params;
      let keys = Object.keys(params);
      let requestParams = {
        url,
      }
      if(keys.length){
        let data = {};
        keys.forEach(key => {
          data[key] = params[key].type === 'text' ? params[key].value : '';
        })
        requestParams.data = data;
      }
      sItem.requestParams = requestParams;
      requestData(requestParams).then((data) => {
        if(data.tableContent){
          data.tableContent.forEach(item => {
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
        console.log(config);
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
            if(item.fieldCode !== 'province' && item.fieldCode !== 'city' && item.fieldCode !== 'county' &&  item.fieldCode !=='dealerLabelName'){
              if((item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector') && item.dataSource && item.dataSource.type === 'remoteData' ) {
                this.handlerParams(item)
              }
              else if(item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData'){
                this.$set(item, 'remoteData', item.dataSource.data)
              }
            }
            // 在渲染的配置中添加字段
            if(item.fieldCode !== 'dealerCode' && item.fieldCode !== 'dealerName' && item.fieldCode !== 'dealerPic'
              && item.fieldCode !== 'city' && item.fieldCode !== 'county'){
              this.dealerConfig.push(item);
            }
          }
        })
        // 处理重复项配置
        dealerDuplicateConfig.forEach(item => {
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
  .vux-1px-l:before,
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }
  .vux-x-icon {
    fill: #5077aa;
    vertical-align: middle;
  }
  .r-picker{
    background: #fff;
  }
  .required{
    color:#5077aa;
    font-weight: bold;
  }
  .content {
    height: 90%;
    // overflow-y: auto;
    // overflow-x: hidden;
    overflow: hidden;
    background: #f8f8f8;
    // -webkit-overflow-scrolling: auto;
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
      background: #fff;
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
    .upload-image-container {
      width: 1.2rem;
      height: 1.2rem;
    }
  }
  /* 重复项 */
    .duplicate-item {
      margin-top: 0.1rem;
      background-color: #fff;
      overflow: hidden;
      .has_border {
        border-bottom: .03rem solid #e8e8e8;
      }
      /deep/ .weui-cells__title {
        /*padding-left: 0;*/
        font-size: .12rem;
      }
      // /deep/ .weui-cell__hd {
      //   font-size: .16rem;
      // }
      // /deep/ .weui-cells {
      //   &:before, &:after {
      //     display: none;
      //   }
      // }
      /deep/ .weui-cell {
        padding: .1rem;
        &:before {
          display: block;
          left: .1rem;
        }
      }
    }
    .duplicate-item-no-select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .1rem;
      padding: .1rem .2rem .1rem .1rem;
      background-color: #fff;
      font-size: .16rem;
      .add {
        padding: .01rem .06rem;
        border-radius: .12rem;
        background: #5077aa;
        color: #fff;
        font-size: .12rem;
      }
    }
    .add_more {
      width: 100%;
      text-align: center;
      font-size: 0.12rem;
      padding: 0.1rem 0;
      color: #757575;
      span {
        margin: 0 5px;
        color: #fff;
        padding: .01rem .06rem;
        border-radius: .12rem;
      }
      .add {
        background: #5077aa;
      }
      .delete {
        background: red;
      }
      em {
        font-style: normal;
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


