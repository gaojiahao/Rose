<template>
  <div class='pages'>
    <r-scroll class='content' :options="scrollOptions">
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class='required'>仓库编码:</label>
            <input type='text' v-model="warehouse.warehouseCode" class='property_val'
                  :class='{readonly :transCode!==""}' :readonly='transCode!==""'/>
          </div>
          <div class='each_property required' :class="transCode != ''?'edit_bor_btm':''">
            <label class='required'>仓库名称:</label>
            <input type='text' v-model="warehouse.warehouseName" class='property_val'/>
          </div>
        </div>
        <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
      </div>
      <div v-for="(item, index) in warehouseConfig" :key="index" class="each-info" v-if="!item.hiddenInRun">
        <div v-if="item.fieldCode !== 'warehouseProvince'" >
          <r-picker :title="`${item.fieldLabel}:`" :data="item.remoteData" :value="item.fieldCode === 'warehouseStatus'? warehouseStatus : warehouse[item.fieldCode]"
                 v-model="item.fieldCode === 'warehouseStatus'? warehouseStatus : warehouse[item.fieldCode]" :required='!item.allowBlank' 
                v-if="item.xtype === 'r2Combo'" class="r-picker">
          </r-picker>
          <div class='each_property vux-1px-b' v-if="item.xtype === 'r2Textfield'">
            <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}:</label>
            <input type='text' v-model="warehouse[item.fieldCode]" class='property_val'/>
          </div>
        </div>
        <template v-else-if="item.fieldCode === 'warehouseProvince'">
          <div class='each_property vux-1px-b' @click="showAddress = true">
            <label>省市区:</label>
            <div class='picker'>
                <span class='mater_nature'>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}</span>
                <span class='iconfont icon-gengduo'></span>
            </div>
            <x-address title="省市区:"  :list="addressData" @on-hide='getAddress($event)' @on-shadow-change='changeAddress' :value="AccountAddress"
                      :show.sync="showAddress" v-show="false"></x-address>
          </div>
        </template>
        <!-- <template v-else>
          <div class='each_property vux-1px-b' @click="showPop = true" v-show="typeSub !== 'noMatched'">
            <label>{{item.fieldLabel}}</label>
            <div class='picker'>
                <span class='mater_nature'>{{warehouse[item.fieldCode]}}</span>
                <span class='iconfont icon-gengduo'></span>
            </div>
          </div>
        </template> -->
      </div>
      <!-- 重复项 -->
      <div v-for="(item, index) in warehouseDuplicateConfig" :key="`${item.name}+${index}`">
        <div class="duplicate-item-no-select" v-if="warehouseDuplicateData[item.name] && !warehouseDuplicateData[item.name].length">
          <span class="title">{{item.title}}</span>
          <span class="add" @click="addMoreUnit(item)">新增</span>
        </div>
        <group class="duplicate-item" :title="item.title" v-else-if="warehouseDuplicateData[item.name] && warehouseDuplicateData[item.name].length">
          <div v-for="(sItem, sIndex) in warehouseDuplicateData[item.name]" :key="sIndex" :class="{'has_border': sIndex < warehouseDuplicateData[item.name].length-1}">
            <div v-for="(dItem,dIndex) in item.items"  :key="dIndex" v-if="sItem[dItem.fieldCode] != null">
              <template v-if="!dItem.readOnly">
                <r-picker class="duplicate-picker vux-1px-t" :title="dItem.text" :data="dItem.remoteData" :value="sItem[dItem.fieldCode]"
                        mode="4" :has-border="false" v-model="sItem[dItem.fieldCode]" :required="!dItem.allowBlank"
                        v-if="dItem.editorType === 'r2Combo' || dItem.editorType === 'r2Selector'"></r-picker>
                  <x-input :title="dItem.text" type="number" text-align='right' placeholder='请填写' v-model='sItem[dItem.fieldCode]'
                          @on-blur="checkAmt(sItem)" v-if="dItem.editorType === 'r2Numberfield'">
                    <span class="required" slot="label" v-show="!dItem.allowBlank">{{dItem.text}}</span>
                  </x-input>
                  <x-input :title="dItem.text" text-align='right' placeholder='请填写' v-model='sItem[dItem.fieldCode]' 
                          v-if="dItem.editorType === 'r2Textfield'"></x-input>
              </template>
              <template v-else>
                <cell class="vux-1px-t" :title="dItem.text" :value="sItem[dItem.fieldCode]"></cell>
              </template>
            </div>

          </div>
        </group>
        <div class="add_more" v-show="warehouseDuplicateData[item.name] && warehouseDuplicateData[item.name].length">
          您还需要添加新的{{item.title}}?请点击
          <span class='add' @click="addMoreUnit(item)">新增</span>
          <em v-show="warehouseDuplicateData[item.name] && warehouseDuplicateData[item.name].length > 1">或</em>
          <span class='delete' @click="deleteMoreUnit(item)" v-show="warehouseDuplicateData[item.name] && warehouseDuplicateData[item.name].length > 1">删除</span>
        </div> 
      </div>
    </r-scroll>
    <!--员工，组织，客户等的pop-->
    <!-- <pop-warelabe-list :show="showPop" :data="typeSubMap[typeSub].list" v-model="showPop"
                        :defaultValue="typeSubMap[typeSub].value" @sel-group="selGroup" @list-search="getTypeSubList">
    </pop-warelabe-list> -->
    <div class='vux-1px-t btn '>
      <div class="cfm_btn" @click="save">{{this.transCode ? '保存' : '提交'}}</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, XAddress, ChinaAddressV4Data, Icon, Cell} from 'vux';
  import {getBaseInfoDataBase, getFormConfig, requestData, getFormViews} from 'service/commonService.js';
  import {save, update, getwarehouseInfo, getDepartMentWage} from 'service/warehouseService.js'
  import {getDictByType, getObjDealerByLabelName} from 'service/commonService.js'
  import RPicker from 'components/RPicker';
  import RScroll from 'components/RScroll'
  import common from 'mixins/common.js'
  import UploadImage from 'components/UploadImage'
  import PopWarelabeList from 'components/Popup/PopWarelabelList'
import { resolve } from 'path';
  export default {
    data() {
      return {
        addressData : ChinaAddressV4Data,
        transCode: '',
        picShow: false,
        showPop : false,
        imgFileObj: {}, // 上传的图片对象
        biReferenceId: '',
        MatPic: '', // 图片地址
        AccountAddress: [],
        baseinfo: {},
        warehouse: {
          warehouseCode: '', // 仓库编码
          warehouseName: '', // 仓库名称
          warehouseType: '', // 仓库类型
          warehousePic: '', // 图片
          staffDealerCode: null, // 员工
          groupCode: null, // 组织
          customerDealerCode: null, //客户
          processorsDealerCode: '', // 加工商
          channelDealerCode: null, // 渠道商
          warehouseCondtions: '', // 仓储条件
          warehouseProvince: '', // 省
          warehouseCity: '', // 市
          warehouseDistrict: '', // 区
          warehouseAddress: '', // 地址
          warehouseStatus: '', //仓库状态
        },
        submitSuccess: false, // 是否提交成功
        typeSubMap: { // 仓库类型相关二级列表
          staff: {
            title: '员工',
            dealerLabelName: '员工',
            key: 'staffDealerCode',
            value: '',
            code: '',
            list: [], // 员工列表
          },
          group: {
            title: '组织',
            dealerLabelName: '',
            key: 'groupCode',
            value: '',
            code: '',
            list: [], // 组织列表
          },
          customer: {
            title: '客户',
            dealerLabelName: '客户',
            key: 'customerDealerCode',
            value: '',
            code: '',
            list: [], // 客户列表
          },
          processors: {
            title: '加工商',
            dealerLabelName: '加工商',
            key: 'processorsDealerCode',
            value: '',
            code: '',
            list: [], // 加工商列表
          },
          channel: {
            title: '渠道商',
            dealerLabelName: '渠道商',
            key: 'channelDealerCode',
            value: '',
            code: '',
            list: [], // 渠道商列表
          },
          noMatched: {
            title: '',
            dealerLabelName: '',
            key: '',
            value: '',
            code: '',
            list: [],
          },
        },
        // typeSub: 'group',
        typeSub: 'groupCode',
        typeSubValue: '',
        typeToSubMap: {
          // '配送中心仓': 'group',
          // '加工商仓': 'processors',
          // '加工车间仓': 'group',
          // '客户仓': 'customer',
          // '渠道商仓': 'channel',
          // '个人仓': 'staff',
          // '一般部门仓': 'group',
          '配送中心仓': 'groupCode',
          '加工商仓': 'processorsDealerCode',
          '加工车间仓': 'groupCode',
          '客户仓': 'customerDealerCode',
          '渠道商仓': 'channelDealerCode',
          '个人仓': 'staffDealerCode',
          '一般部门仓': 'groupCode',
        },
        warehouseConfig: [], // 仓库基本信息的配置
        warehouseDuplicateConfig: [], // 物料重复项的配置
        warehouseDuplicateData: {}, // 物料重复项数据,
        currentGroup:'',
        statusType:[],//仓库状态列表
        warehouseStatus : '使用中',
        showAddress: false,
        scrollOptions: {
          click: true,
        },
        viewId: '',
        hasDefault: false, // 判断是否为回写
      }
    },
    computed:{
      warehouseType(){
        return this.warehouse.warehouseType
      },
      warehouseRel() {
        return this.warehouseDuplicateData.warehouseRel
      }
    },
    directives: {
      TransferDom
    },
    mixins: [common],
    components: {
      Picker, Popup, Group, RPicker, XAddress, Icon,
      UploadImage, PopWarelabeList, RScroll, Cell
    },
    watch: {
      warehouseType(val){
        if (this.hasDefault) {
          return
        }
        // 清空之前的选中值
        // this.typeSubMap[this.typeSub].value = '';
        // this.typeSubMap[this.typeSub].list = [];
        this.typeSub = this.typeToSubMap[val] || 'noMatched';
        for(let item of this.warehouseConfig){
          if(item.fieldCode === this.typeSub){
            item.hiddenInRun = false;
          }
          else{
            if(item.fieldCode === 'staffDealerCode' || item.fieldCode === 'groupCode' || item.fieldCode === 'customerDealerCode' || item.fieldCode === 'customerDealerCode' 
              || item.fieldCode === 'processorsDealerCode' || item.fieldCode === 'channelDealerCode'){
                item.hiddenInRun = true
              }
            
          }
        }
        if(this.typeSub === 'noMatched') {
          if(this.warehouseType === '库位')
          delete this.warehouseDuplicateData.warehouseRel
          return
        }
        this.$set(this.warehouseDuplicateData, 'warehouseRel', [])
        // this.getTypeSubList();
      },
      // 监听库位数组变化，选择库位名称后，自动带出库位编码
      warehouseRel: {
        handler(val) {
          if (this.hasDefault) {
            return
          }
          val && val.length && val.forEach(item => {
            if(item.childWarehouseName){
              for(let cItem of this.warehouseDuplicateConfig){
                if(cItem.name === 'warehouseRel') {
                  for(let sItem of cItem.items){
                    if(sItem.fieldCode === 'childWarehouseName'){
                      for(let dItem of sItem.remoteData){
                        if(dItem.warehosueName === item.childWarehouseName){
                          item.childWarehouseCode = dItem.warehouseCode;
                          break
                        }
                      }
                      break;
                    }
                  }
                  break;
                }
                break
              }
            }
            
          })
        },
        deep: true
      }
    },
    methods: {
      // TODO 上传图片成功触发
      onUpload(val){
        this.warehouse.warehousePic = val.src;
      },
      //查询仓库信息
      findData() {
        return getwarehouseInfo(this.transCode).then(({formData = {}, attachment = []}) => {
          this.warehouseDuplicateConfig.forEach(key => {
            if(formData[key.name].length){
              this.warehouseDuplicateData[key.name] = formData[key.name];
            }
          })
          let {baseinfo = {}, warehouse = {}} = formData;
          this.hasDefault = true;
          switch (warehouse.warehouseStatus) {
            case 1:
              this.warehouseStatus = '使用中';
              break;
            case 2:
              this.warehouseStatus = '未使用';
              break;
            case 0:
              this.warehouseStatus = '草稿';
              break;
            case -1:
              this.warehouseStatus = '停用';
              break;
          }
          this.baseinfo = baseinfo;
          this.warehouse = warehouse;
          this.biReferenceId = this.warehouse.referenceId;
          if (this.warehouse.warehousePic) {
            this.picShow = true;
            this.MatPic = `/H_roleplay-si/ds/download?url=${this.warehouse.warehousePic}&width=400&height=400`;
          } else {
            this.picShow = true;
            this.getDefaultImg()
          }
          this.AccountAddress = [this.warehouse.warehouseProvince, this.warehouse.warehouseCity, this.warehouse.warehouseDistrict]
          for (let item of Object.values(this.typeSubMap)) {
            let code = this.warehouse[item.key];
            if (code) {
              item.code = code;
              // this.warehouse[item.key] = null;
              break;
            }
          }
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
        this.MatPic = require('assets/ck_default.png');
      },
      //选择地址
      changeAddress(ids, names) {
        this.AccountAddress = names;
      },
      getAddress() {
        if(this.AccountAddress.length>0){
          this.warehouse.warehouseProvince = this.AccountAddress[0];
          this.warehouse.warehouseDistrict = this.AccountAddress[2]
          if(this.AccountAddress[1] === '市辖区'){
            this.warehouse.warehouseCity = '';
            return
          };
          this.warehouse.warehouseCity = this.AccountAddress[1];
        }
      },
      // TODO 新增重复项
      addMoreUnit(item) {
        let obj = {};
        item.items.forEach(item => {
            obj[item.fieldCode] = ''
        })
        this.warehouseDuplicateData[item.name].push(obj);
      },
      // TODO 删除重复项
      deleteMoreUnit(item) {
        this.warehouseDuplicateData[item.name].pop()
      },
      //提交
      submit() {
        for (let key in this.warehouse) {
          if (typeof(this.warehouse[key]) === 'string' && this.warehouse[key].indexOf(' ') >= 0) {
            this.warehouse[key] = this.warehouse[key].replace(/\s/g, '');
          }
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            switch (this.warehouseStatus) {
              case '使用中':
                this.warehouse.warehouseStatus = 1;
                break;
              case '未使用':
                this.warehouse.warehouseStatus = 2;
                break;
              case '草稿':
                this.warehouse.warehouseStatus = 0;
                break;
              case '停用':
                this.warehouse.warehouseStatus = -1;
                break;
            }
            if(this.warehouse.status){
              delete this.warehouse.status;
            }
            let operation = save;
            let submitData = {
              listId: '64a41c48-4e8d-4709-bd01-5d60ad6bc625',
              formData: {
                baseinfo: this.baseinfo,
                warehouse: this.warehouse
              }
            };
            if (this.transCode) {
              operation = update;
            }
            for (let item of Object.values(this.typeSubMap)) {
              if (item.value) {
                let [sel = {}] = item.list.filter(lItem => {
                  return item.value === lItem.value
                });
                this.warehouse[item.key] = sel.code;
                break;
              }
            }
            this.warehouseDuplicateConfig.length && this.warehouseDuplicateConfig.forEach(item => {
              if(this.warehouseDuplicateData[item.name].length){
                submitData.formData[item.name] = this.warehouseDuplicateData[item.name]
              }
            })
            operation(submitData).then((data = {}) => {
              let {success = false, message = '提交失败'} = data;
              if (success) {
                message = operation === update
                            ? '修改成功'
                            : '提交成功';
                this.submitSuccess = true;
                if (!this.transCode && `${this.$route.query.add}` === '1') {
                  sessionStorage.setItem('EDIT_WAREHOUSE_TRANSCODE', JSON.stringify({transCode: data.transCode}));
                }
              }
              this.$vux.alert.show({
                content: message,
                onHide: () => {
                  if (success) {
                    this.$router.go(-1);
                  }
                }
              });
            });
          }
        })
      },
      save() {
        let warn = '';
        let validateMap = [
          {
            key: 'warehouseCode',
            message: '【仓库编码】',
          }, {
            key: 'warehouseName',
            message: '【仓库名称】',
          }, {
            key: 'warehouseType',
            message: '【仓库类型】',
          },
        ];
        validateMap.every(item => {
          if (this.warehouse[item.key] === '') {
            warn = `${item.message}不能为空`;
            return false
          }
          return true
        });
        // 校验重复项
        if(!warn && Object.keys(this.warehouseDuplicateData).length){
          Object.keys(this.warehouseDuplicateData).forEach(item => {
            if(this.warehouseDuplicateData[item].length <= 0){
              return false
            }
            this.warehouseDuplicateConfig.forEach(dItem => {
              if(dItem.name === item){
                dItem.items.forEach(cItem => {               
                  this.warehouseDuplicateData[item].forEach(sItem => {
                    if(!cItem.allowBlank && !sItem[cItem.fieldCode]){
                      warn  = `${cItem.text}不能为空`;
                      return false
                    }
                  })
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
        this.submit()
      },
      selGroup(val){
        this.warehouse[this.typeSub] = val;
        this.typeSubMap[this.typeSub].value = val;
      },
      // TODO 获取仓库类型关联子项下拉列表
      getTypeSubList(val) {
        let filter = [];
        if(val){
          filter = [
            {
              operator: 'like',
              value: val,
              property: 'GROUP_NAME'
            }
          ];
        }
        let currentTypeSub = this.typeSubMap[this.typeSub]; // 当前仓库类型关联子项对象
        switch (this.typeSub) {
          // 请求组织列表
          case 'group':
            return getDepartMentWage({filter: JSON.stringify(filter)}).then(({tableContent = []}) => {
              tableContent.forEach(item => {
                item.name = item.GROUP_NAME;
                item.value = item.GROUP_NAME;
                item.code = item.GROUP_CODE;
                if (item.code === currentTypeSub.code) {
                  this.typeSubMap[this.typeSub].value = item.value;
                }
              });
              this.typeSubMap[this.typeSub].list = tableContent;
              this.typeSubMap[this.typeSub].code = '';
            });
          // 请求员工、客户、加工商、渠道商列表
          case 'staff':
          case 'customer':
          case 'processors':
          case 'channel':
            if(val){
              filter[0].property = 'dealerName';
            }
            return getObjDealerByLabelName({
              dealerLabelName: currentTypeSub.dealerLabelName,
              filter: JSON.stringify(filter)
            }).then(({tableContent = []}) => {
              tableContent.forEach(item => {
                item.name = item.dealerName;
                item.value = item.dealerName;
                item.code = item.dealerCode;
                if (item.code === currentTypeSub.code) {
                  this.typeSubMap[this.typeSub].value = item.value;
                }
              });
              this.typeSubMap[this.typeSub].code = '';
              this.typeSubMap[this.typeSub].list = tableContent;
            });
          default:
            break;
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
        if(keys.length){
          let data = {};
          keys.forEach(key => {
            data[key] = params[key].type === 'text' ? params[key].value : '';
          })
          requestParams.data = data;
        }
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
      // 请求应用的viewId
      getFormViews() {
        return getFormViews('64a41c48-4e8d-4709-bd01-5d60ad6bc625').then(data => {
          for(let item of data){
            if(this.transCode && item.viewType === 'revise'){
              this.viewId = item.uniqueId;
              return
            }
            if(item.viewType === 'submit'){
              this.viewId = item.uniqueId;
            }
          }
        })
      },
      // 获取表单配置
      getFormConfig(){
        return getFormConfig(this.viewId).then(({config = []}) => {
          console.log(config);
          let warehouseConfig = [], warehouseMultipleConfig = [];
          config.forEach(item => {
            if(!item.isMultiple) {
              warehouseConfig = JSON.parse(JSON.stringify(item.items));
            }
            else{             
              if(!item.hiddenInRun && item.xtype !== 'r2Fileupload'){
                warehouseMultipleConfig.push(JSON.parse(JSON.stringify(item)))
              }
            }
          })
          // 仓库基本信息配置的处理
          warehouseConfig.forEach(item =>{
            if(!item.hiddenInRun){
              //下拉框的数据请求
              if(item.fieldCode !== 'warehouseProvince' && item.fieldCode !== 'warehouseCity' && item.fieldCode !== 'warehouseDistrict'){
                if(item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'remoteData') {
                   this.handlerParams(item)
                }
                else if(item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData'){
                  this.$set(item, 'remoteData', item.dataSource.data)
                }
              }
              // 在渲染的配置中添加字段
              if(item.fieldCode !== 'warehouseCode' && item.fieldCode !== 'warehouseName' && item.fieldCode !== 'warehousePic'
                && item.fieldCode !== 'warehouseCity' && item.fieldCode !== 'warehouseDistrict'){
                this.warehouseConfig.push(item);
              }
            }
            // 默认显示员工，（渠道商，组织等隐藏）
            if(item.fieldCode === 'groupCode' || item.fieldCode === 'customerDealerCode' || item.fieldCode === 'customerDealerCode' 
              || item.fieldCode === 'processorsDealerCode' || item.fieldCode === 'channelDealerCode'){
              item.hiddenInRun = true
            }
          })
          // 仓库重复项
          warehouseMultipleConfig.forEach(item => {
            switch(item.name){
              case 'warehouseRel':
                item.title = '库位';
                break;
            }
            let arr = []
            item.items.forEach((sItem, sIndex) => {
              if(!sItem.hidden){
                if((sItem.editorType === 'r2Combo' || sItem.editorType === 'r2Selector') && sItem.dataSource && sItem.dataSource.type === 'remoteData') {
                  this.handlerParams(sItem)
                }
                arr.push(sItem)
              }
            })
            item.items = arr;
            this.$set(this.warehouseDuplicateData, item.name, [])
          })
          this.warehouseDuplicateConfig = warehouseMultipleConfig;
          this.$loading.hide()
        })
      },
    },
    beforeRouteLeave(to, from, next) {
      let {path} = to;
      // 新建物料，修改列表页的meta值
      if (this.submitSuccess && path === '/warehouse') {
        to.meta.reload = true;
      }
      next();
    },
    created() {
      this.$loading.show();
      let query = this.$route.query;
      if (query.transCode) {
        this.transCode = query.transCode;
        this.isClearData = false;
        (async () => {
          await this.getFormViews()
          await this.getFormConfig()
          await this.findData()
          this.hasDefault = false;
        })();
        return
      }
      (async() => {
        getBaseInfoDataBase().then(data => {
          this.baseinfo = {
            ...this.baseinfo,
            ...data
          }
        });
        await this.getFormViews();
        await this.getFormConfig();
      })()
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          this.$refs.bScroll.refresh();
        }
      })
    },
    beforeRouteEnter (to, from, next) {
      // 修改title
      to.meta.title = '新增仓库';
      if(to.query.transCode){
        to.meta.title = '编辑仓库';
      }
      next();
    }
  }
</script>
<style lang="scss" scoped>
  .vux-1px-l:before,
  .vux-1px-b:after,
  .vux-1px-t:before  {
    border-color: #e8e8e8;
    left: 0;
  }

  .content {
    height: 90%;
    background-color: #f8f8f8;
    overflow: hidden;
    position: relative;
    /deep/ .weui-cells {
      font-size: .12rem;
      margin-top: .1rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 0.1rem;
        &:before {
          // left: 0;
          border-color: #e8e8e8;
          left: 0.1rem;
        }
      }
    }
    // .vux-1px-b:after {
    //   transform: scaleY(1);
    // }
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
    .each-info{
      background-color: #fff;
    }
    .each_property {
      min-height: .5rem;
      padding: 0.05rem 0.08rem;
      position: relative;
       background-color: #fff;
      label {
        color: #6d6d6d;
        font-size: 0.12rem;
        display: block;
        height: 0.2rem;
        line-height: 0.2rem;
      }
      .required {
        color: #5077aa;
        font-weight: bold;
      }
      //校验错误提示按钮
      .warn {
        position: absolute;
        right: 0.08rem;
        top: 0.27rem;
      }
      .weui-icon-warn {
        font-size: 0.18rem;
      }
      .property_val {
        display: block;
        font-size: 0.16rem;
        line-height: 0.24rem;
        width: 100%;
      }
      .readonly {
        color: #999;
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
        .title{
          font-size: .12rem;
        }
      }
      .vux-cell-box {
        position: absolute;
        left: 0;
        top: 0;
        padding: 0.05rem 0.08rem;
        width: 100%;
        box-sizing: border-box;
        color: #6d6d6d;
        font-size: 0.12rem;
        label {
          height: 0.58rem;
        }
        .vux-cell-primary {
          display: none;
        }
        &:not(:first-child):before {
          border: none;
        }

      }
    }
    .upload-image-container {
      width: 1.2rem;
      height: 1.2rem;
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
   /* 重复项 */
    .duplicate-item {
      margin-top: .1rem;
      background-color: #fff;
      overflow: hidden;
      .has_border {
        border-bottom: .03rem solid #e8e8e8;
      }
      /deep/ .weui-cells__title {
        /*padding-left: 0;*/
        font-size: .12rem;
      }
      /deep/ .weui-cells {
        font-size: .16rem;
      }
      /deep/ .weui-cell:first-child:before {
        display: block;
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
  // 确定
  .btn {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 10%;
    position: absolute;
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

  .edit_bor_btm:after {
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    border-top: 1px solid #C7C7C7;
    transform-origin: 0 100%;
    transform: scaleY(0.5);
  }
</style>


