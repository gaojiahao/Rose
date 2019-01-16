<template>
  <div class='pages warehouse-page'>
    <r-scroll class='content' :options="scrollOptions">
      <div class='mater_baseinfo'>
        <div class="mater_pic">
          <span class="title">仓库照片</span>
          <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
        </div>
      </div>
      <div v-for="(item, index) in warehouseConfig" :key="index" class="each-info">
        <template  v-if="!item.hiddenInRun">
          <!-- 文本框 -->
          <div class='each_property vux-1px-t' v-if="item.xtype === 'r2Textfield'">
            <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
            <input type='text' v-model="warehouse[item.fieldCode]" placeholder="请填写" class='property_val' />
          </div>
          <!-- 下拉框 -->
          <div v-if="item.xtype === 'r2Combo' && item.fieldCode !== 'warehouseProvince' && item.fieldCode !== 'warehouseStatus'" >
            <r-picker class="vux-1px-t" :title="item.fieldLabel" :data="item.remoteData" :value="warehouse[item.fieldCode]"
                      v-model="warehouse[item.fieldCode]" :required='!item.allowBlank' >
            </r-picker>
          </div>
          <!-- 仓库状态 -->
          <template v-else-if="item.fieldCode === 'warehouseStatus'">
             <r-picker class="vux-1px-t" :title="item.fieldLabel" :data="item.remoteData" :value="warehouseStatus"
                  v-model="warehouseStatus" :required='!item.allowBlank'>
            </r-picker>
          </template>
          <!-- 省市区 -->
          <template v-else-if="item.fieldCode === 'warehouseProvince'">
            <div class='each_property vux-1px-t' @click="showAddress = true">
              <label>省市区</label>
              <div class='picker'>
                <span class='mater_nature' v-if="warehouse.warehouseProvince === '' && warehouse.warehouseCity === '' 
                      && warehouse.warehouseDistrict === ''">请选择</span>
                <span class='mater_nature'v-else>{{warehouse.warehouseProvince}}{{warehouse.warehouseCity}}{{warehouse.warehouseDistrict}}</span>
                <span class='icon-right'></span>
              </div>
              <x-address title="省市区"  :list="addressData" @on-hide='getAddress($event)' @on-shadow-change='changeAddress' :value="AccountAddress"
                        :show.sync="showAddress" v-show="false"></x-address>
            </div>
          </template>
        </template>
      </div>
      <!-- 重复项 -->
      <duplicate-component :config="warehouseDuplicateConfig" :defaultValue="warehouseDuplicateData" 
                          v-model="warehouseDuplicateData"></duplicate-component>
    </r-scroll>
    <!--员工，组织，客户等的pop-->
    <!-- <pop-warelabe-list :show="showPop" :data="typeSubMap[typeSub].list" v-model="showPop"
                        :defaultValue="typeSubMap[typeSub].value" @sel-group="selGroup" @list-search="getTypeSubList">
    </pop-warelabe-list> -->
    <div class='btn '>
      <div class="cfm_btn" @click="save">{{this.transCode ? '保存' : '提交'}}</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, XAddress, ChinaAddressV4Data, Icon, Cell, Datetime} from 'vux';
  import {getBaseInfoDataBase, getFormConfig, requestData, getFormViews} from 'service/commonService.js';
  import {save, update, getwarehouseInfo, getDepartMentWage} from 'service/warehouseService.js'
  import {getDictByType, getObjDealerByLabelName} from 'service/commonService.js'
  import RPicker from 'components/basicPicker';
  import RScroll from 'components/RScroll'
  import common from 'mixins/common.js'
  import UploadImage from 'components/UploadImage'
  import PopWarelabeList from 'components/Popup/PopWarelabelList'
  import duplicateComponent from '../../../components/duplication'
  export default {
    data() {
      return {
        listId: '64a41c48-4e8d-4709-bd01-5d60ad6bc625',
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
        typeSub: 'groupCode',
        typeSubValue: '',
        typeToSubMap: {
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
        uniqueId: '',
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
      UploadImage, PopWarelabeList, RScroll, Cell, Datetime, duplicateComponent
    },
    watch: {
      warehouseType(val){
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
        if(this.warehouseType === '库位'){
          delete this.warehouseDuplicateData.warehouseRel
        }
        else if(this.warehouseType !== '库位' && !this.warehouseDuplicateData.warehouseRel){
          this.$set(this.warehouseDuplicateData, 'warehouseRel', [])
        }
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
              break
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
              listId: this.listId,
              formData: {
                baseinfo: this.baseinfo,
                warehouse: this.warehouse
              }
            };
            if (this.transCode) {
              operation = update;
            }
            // 在提交数组中添加重复项字段
            this.warehouseDuplicateConfig.length && this.warehouseDuplicateConfig.forEach(item => {
              if(this.warehouseDuplicateData[item.name] && this.warehouseDuplicateData[item.name].length){
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
      async getFormViewsInfo(){
        // 根据listId 请求表单的uniqueId
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
              if(item.fieldCode !== 'warehousePic'
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
            let arr = [];
            item.items.forEach((sItem, sIndex) => {
              if(!sItem.hidden){
                if((sItem.editorType === 'r2Combo' || sItem.editorType === 'r2Selector') && sItem.dataSource && sItem.dataSource.type === 'remoteData') {
                  this.handlerParams(sItem)
                }
                arr.push(sItem);
              }
            })
            item.items = arr;
            this.$set(this.warehouseDuplicateData, item.name, [])
          })
          this.warehouseDuplicateConfig = warehouseMultipleConfig;
          if(!this.transCode) this.$loading.hide()
        })
      }
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
          await this.getFormViewsInfo()
          await this.findData().then(() =>{
            this.$loading.hide()
          })
          this.hasDefault = false;
        })();
        return
      }
      this.getFormViewsInfo()
      getBaseInfoDataBase().then(data => {
        this.baseinfo = {
          ...this.baseinfo,
          ...data
        }
      });
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
@import '../../../scss/basicApp.scss';
  .warehouse-page{
    background-color: #F6F6F6;
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

</style>


