<template>
  <div class='childPage'>
    <r-scroll :options="scrollOptions" class='content'>
      <div>
        <div class='mater_baseinfo vux-1px-b'>
          <group class="mater_property" gutter="0">
            <x-input text-align='right' placeholder='请填写' :readonly="codeReadOnly"
                     :class='{readonly : codeReadOnly}' v-model.trim='inventory.inventoryCode'>
              <span class="required" slot="label">物料编码</span>
            </x-input>
            <x-input text-align='right' placeholder='请填写' v-model.trim='inventory.inventoryName'>
              <span class='required' slot="label">物料名称</span>
            </x-input>
          </group>
          <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
        </div>
        <div v-for="(item, index) in matterConfig" :key="index" class="each-info">
          <template v-if="(item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector') && item.fieldCode !== 'technicsCode'">
            <r-picker :title="item.fieldLabel" :data="item.remoteData" :value="item.fieldCode === 'inventoryStatus'? inventoryStatus: inventory[item.fieldCode]" 
                      v-model="item.fieldCode === 'inventoryStatus'? inventoryStatus: inventory[item.fieldCode]"
                      :required="!item.allowBlank" mode="4"></r-picker>
          </template>
          <template v-else-if="item.xtype === 'r2Numberfield'">
            <x-input :title="item.fieldLabel" type="number" text-align='right' placeholder='请填写'
                   v-model.number='inventory[item.fieldCode]' class="vux-1px-b"></x-input>
          </template>
          <template v-else-if="item.xtype === 'r2Textfield'">
            <x-input :title="item.fieldLabel" text-align='right' placeholder='请填写'
                   v-model.number='inventory[item.fieldCode]' class="vux-1px-b"></x-input>
          </template>
          <template v-else-if="item.xtype === 'r2Selector'">
            <pop-procedure-list @sel-item="selProcedure" :default-value="inventory" class="vux-1px-b"></pop-procedure-list>
          </template>
          <template v-else-if="item.fieldCode === 'technicsCode'">
            <pop-technics-list class="vux-1px-b" @sel-item="selTechnics" :default-value="inventory"></pop-technics-list>
          </template>
        </div>
        <!-- 重复项 -->
        <div v-for="(item, index) in matterDuplicateConfig" :key="`${item.name}+${index}`">
          <div class="duplicate-item-no-select" v-if="!matterDuplicateData[item.name].length">
            <span class="title">{{item.title}}</span>
            <span class="add" @click="addMoreUnit(item)">新增</span>
          </div>
          <group class="duplicate-item" :title="item.title" v-else>
            <div v-for="(sItem, sIndex) in matterDuplicateData[item.name]" :key="sIndex" :class="{'has_border': sIndex < matterDuplicateData[item.name].length-1}">
              <div v-for="(dItem,dIndex) in item.items"  :key="dIndex" v-if="sItem[dItem.fieldCode] != null">
                <template v-if="!dItem.hidden">
                  <r-picker class="vux-1px-t" :title="dItem.text" :data="dItem.remoteData" :value="sItem[dItem.fieldCode]"
                          mode="4" :has-border="false" v-model="sItem[dItem.fieldCode]" :required="!dItem.allowBlank"
                          v-if="dItem.editorType === 'r2Combo'"></r-picker>
                    <x-input :title="dItem.text" type="number" text-align='right' placeholder='请填写' v-model='sItem[dItem.fieldCode]'
                            @on-blur="checkAmt(sItem)" v-if="dItem.editorType === 'r2Numberfield'">
                      <span class="required" slot="label" v-show="!dItem.allowBlank">{{dItem.text}}</span>
                    </x-input>
                    <x-input :title="dItem.text" text-align='right' placeholder='请填写' v-model='sItem[dItem.fieldCode]' 
                            v-if="dItem.editorType === 'r2Textfield'"></x-input>
                </template>
              </div>

            </div>
          </group>
          <div class="add_more" v-show="matterDuplicateData[item.name].length">
            您还需要添加新的{{item.title}}?请点击
            <span class='add' @click="addMoreUnit(item)">新增</span>
            <em v-show="matterDuplicateData[item.name].length > 1">或</em>
            <span class='delete' @click="deleteMoreUnit(item)" v-show="matterDuplicateData[item.name].length > 1">删除</span>
          </div> 
        </div>
      </div>
    </r-scroll>
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">{{this.transCode? '保存':'提交'}}</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Popup, Group, XInput, PopupPicker, Cell,} from 'vux';
  import RPicker from 'components/RPicker';
  import UploadImage from 'components/UploadImage'
  import RScroll from 'components/RScroll'
  import PopTechnicsList from 'components/popup/matter/PopTechnicsList'
  import PopProcedureList from 'components/popup/matter/PopProcedureList'
  import PopDealerList from 'components/Popup/PopDealerList'
  import common from 'mixins/common'
  import {save, update,findData,} from 'service/materService';
  import {getBaseInfoDataBase, getDictByType, getDictByValue, getFormConfig, requestData, getFormViews} from 'service/commonService';
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        listId: '78a798f8-0f3a-4646-aa8b-d5bb1fada28c',
        biReferenceId: '',
        MatPic: '', // 图片地址
        picShow: false, // 是否展示图片
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
        inventory: {
          inventoryCode: '', // 物料编码
          inventoryName: '', // 物料名称
          processing: '', // 加工属性
          inventoryType: '', // 物料大类
          inventorySubclass: '', // 物料子类
          measureUnit: '', // 单位
          specification: '', // 型号规格
          material: '', // 主材质
          inventoryColor: '', // 颜色
          keepingDays: 1, // 保质期天数
          safeStock: 0, // 安全库存
          nearKeepingDays: 1, // 临保天数
          inventoryStatus: '', // 物料状态
          inventoryPic: '',
          comment: '', // 物料说明
          technicsCode: '', //工艺路线
          leadTime: '', // 加工/采购提前期
          procedureName: '', // 工序名称
          procedureCode: '', // 工序编码
          moq: '', // 起订量
        },
        transCode: '',
        hasDefault: false, // 判断是否为回写
        imgFileObj: {}, // 上传的图片对象
        imgFile: null,
        codeReadOnly: false, // 物料编码是否只读
        submitSuccess: false, // 是否提交成功
        inventoryStatus: '使用中', // 物料状态
        scrollOptions: {
          click: true
        },
        matterConfig: [], // 物料基本信息配置
        matterDuplicateConfig: [], // 物料重复项的配置
        matterDuplicateData: {}, // 物料重复项数据,
        viewId: ''
      }
    },
    computed: {
      // 临保天数
      nearKeepingDays() {
        let kDay = this.inventory.keepingDays;
        if (!kDay && kDay !== 0) {
          return 0
        }
        if (kDay >= 365) {
          return 45
        } else if (kDay >= 183) {
          return 20;
        } else if (kDay >= 90) {
          return 15;
        } else if (kDay >= 30) {
          return 10;
        } else if (kDay >= 10) {
          return 2;
        } else {
          return 1;
        }
      },
      // 加工/采购提前期标题
      leadTimeTitle() {
        let processing = this.inventory.processing;
        let pur = ['原料', '商品']; // 采购
        let mac = ['半成品', '成品', '模具']; // 加工
        if (pur.includes(processing)) {
          return '采购提前期'
        } else if (mac.includes(processing)) {
          return '加工提前期'
        } else {
          return ''
        }
      },
      inventoryProcessing() {
        return this.inventory.processing
      },
      inventoryType() {
        return this.inventory.inventoryType
      },
      MoreUnit() {
        return this.matterDuplicateData.invMoreUnit
      }
    },
    watch: {
      // 监听物料属性变化，改变获取方式，物料大类的数据
      inventoryProcessing(val) {
        if (this.hasDefault) {
          return
        }
        let TypeParentId = '', value = '';
        for(let item of this.matterConfig) {
          if(item.fieldCode === 'processing'){
            for(let sItem of item.remoteData) {
              if(sItem.name === val){
                TypeParentId = sItem.id;
                value = sItem.type;
                break
              }
            }
          }
          // 获取方式
          if(item.fieldCode === 'multipleAccess') {
            item.requestParams.data.sType = this.inventory.processing;
            console.log("")
            requestData(item.requestParams).then(({tableContent = []}) => {
              if(tableContent.length){
                tableContent.forEach(dItem => {
                  dItem.name = dItem.sName;
                  dItem.value = dItem.sName;
                })
                this.inventory.multipleAccess = tableContent[0].name;
              }
              else{
                this.inventory.multipleAccess = '';
              }
              item.remoteData = tableContent;
            })
          }
          // 物料大类
          if(item.fieldCode === 'inventoryType') {
            Object.keys(item.requestParams.data).forEach(key => {
              if(key === 'parentId') {
                item.requestParams.data[key] = TypeParentId
              }
              else if(key === 'value') {
                item.requestParams.data[key] = value
              }
            })
            requestData(item.requestParams).then(data => {
              if(data.tableContent != null) {
                if(data.tableContent.length){
                  data.tableContent.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.value = dItem.name;
                  })
                  this.inventory.inventoryType = data.tableContent[0].name;
                }
                else {
                  this.inventory.inventoryType = '';
                }
                item.remoteData = data.tableContent;
              }
              else{
                if(data.length){
                  data.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.value = dItem.name;
                  })
                  this.inventory.inventoryType = data[0].name;
                }
                else {
                  this.inventory.inventoryType = '';
                }
                item.remoteData = data;
              }
            })
            break;
          }
        }
      },
      // 监听物料大类变化，改变物料子类的数据
      inventoryType(val) {
        if (this.hasDefault) {
          return
        }
        let subTypeParentId = '', value = '' ;
        for(let item of this.matterConfig) {
          if(item.fieldCode === 'inventoryType'){
            for(let sItem of item.remoteData) {
              if(sItem.name === val){
                subTypeParentId = sItem.id;
                value = sItem.type
                break;
              }
            }
          }
          // 物料子类
          if(item.fieldCode === 'inventorySubclass') {
            Object.keys(item.requestParams.data).forEach(key => {
              if(key === 'parentId') {
                item.requestParams.data[key] = TypeParentId
              }
              else if(key === 'value') {
                item.requestParams.data[key] = value
              }
            })
            requestData(item.requestParams).then(data => {
              if(data.tableContent != null) {
                if(data.tableContent.length){
                  data.tableContent.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.value = dItem.name;
                  })
                  this.inventory.inventorySubclass = data.tableContent[0].name;
                }
                else {
                  this.inventory.inventorySubclass = '';
                }
                item.remoteData = data.tableContent;
              }
              else{
                if(data.length){
                  data.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.value = dItem.name;
                  })
                  this.inventory.inventorySubclass = data[0].name;
                }
                else {
                  this.inventory.inventorySubclass = '';
                }
                item.remoteData = data;
              }
            })
            break
          }
        }
      },
      MoreUnit: {
        handler(val){
          if(val && val.length){
            val.forEach(item => {
              if(this.inventory.measureUnit && item.invSubUnitName && item.invSubUnitMulti){
                item.comment = `${item.invSubUnitMulti}${this.inventory.measureUnit}/${item.invSubUnitName}`;
                return
              }
              
            })
          }
        },
        deep: true
      }
    },
    directives: {
      TransferDom
    },
    mixins: [common],
    components: {
      Popup,
      Group,
      RPicker,
      UploadImage,
      XInput,
      PopupPicker,
      RScroll,
      Cell,
      PopTechnicsList,
      PopProcedureList,
      PopDealerList,
    },
    methods: {
      // TODO 上传图片成功触发
      onUpload(val) {
        console.log(val);
        this.inventory.inventoryPic = val.src;
      },
      checkAmt(item) {
        let {invSubUnitMulti, invCompQty} = item;
        // 金额
        if (invSubUnitMulti) {
          item.invSubUnitMulti = Math.abs(toFixed(invSubUnitMulti));
        }
        else if (invCompQty) {
          item.invCompQty = Math.abs(toFixed(invCompQty));
        }
      },
      // TODO 选择工艺路线名称
      selTechnics(val) {
        this.inventory = {
          ...this.inventory,
          technicsName: val.technicsName,
          technicsCode: val.technicsCode,
        };
      },
      // TODO 提交/修改物料
      save() {
        let requiredMap = {
          inventoryCode: '物料编码',
          inventoryName: '物料名称',
          processing: '物料属性',
          measureUnit: '主计量单位',
        };
        for (let key in this.inventory) {
          if (typeof(this.inventory[key]) === 'string' && this.inventory[key].indexOf(' ') >= 0) {
            this.inventory[key] = this.inventory[key].replace(/\s/g, '');
          }
        }
        switch (this.inventoryStatus) {
          case '使用中':
            this.inventory.inventoryStatus = 1;
            break;
          case '未使用':
            this.inventory.inventoryStatus = 2;
            break;
          case '草稿':
            this.inventory.inventoryStatus = 0;
            break;
          case '停用':
            this.inventory.inventoryStatus = -1;
            break;
        }
        if (this.inventory.status) {
          delete this.inventory.status
        }
        let operation = save;
        let warn = '';
        Object.entries(requiredMap).every(([key, msg]) => {
          if (!this.inventory[key]) {
            warn = `${msg}不能为空`;
            return false;
          }
          return true;
        });
        // 校验重复项
        if(!warn && Object.keys(this.matterDuplicateData).length){
          Object.keys(this.matterDuplicateData).forEach(item => {
            if(this.matterDuplicateData[item].length <= 0){
              return false
            }
            this.matterDuplicateConfig.forEach(dItem => {
              if(dItem.name === item){
                dItem.items.forEach(cItem => {
                  if(!cItem.hidden){
                    this.matterDuplicateData[item].forEach(sItem => {
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
            content: warn,
          });
          return
        }

        let formData = {
          baseinfo: this.baseinfo,
          inventory: {
            ...this.inventory,
            nearKeepingDays: this.nearKeepingDays,
            leadTime: this.leadTimeTitle ? this.inventory.leadTime : '',
          },
        };
        this.matterDuplicateConfig.forEach(item => {
          if(this.matterDuplicateData[item.name].length){
            formData[item.name] = this.matterDuplicateData[item.name]
          }
        })
        let submitData = {
          listId: this.listId,
          // biReferenceId: this.biReferenceId,
          formData: formData,
        };
        // 修改
        if (this.transCode) {
          operation = update;
        }
        console.log(submitData)

        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$loading.show();
            operation(submitData).then(data => {
              this.$loading.hide();
              let {success = false, message = '提交失败'} = data;
              if (success) {
                message = operation === update
                  ? '修改成功'
                  : '提交成功';
                this.submitSuccess = true;
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
              this.$loading.hide();
            });
          }
        });
      },
      // TODO 查询物料详情
      findData() {
        return findData(this.transCode).then(({formData = {}, attachment = []}) => {
          this.matterDuplicateConfig.forEach(key => {
            if(formData[key.name].length){
              this.matterDuplicateData[key.name] = formData[key.name];
            }
          })
          let {baseinfo = {}, inventory = {}} = formData;
          this.hasDefault = true;
          switch (inventory.inventoryStatus) {
            case 1:
              this.inventoryStatus = '使用中';
              break;
            case 2:
              this.inventoryStatus = '未使用';
              break;
            case 0:
              this.inventoryStatus = '草稿';
              break;
            case -1:
              this.inventoryStatus = '停用';
              break;
          }
          this.baseinfo = {...this.baseinfo, ...baseinfo,};
          this.inventory = {...this.inventory, ...inventory,};
          // this.biReferenceId = this.inventory.referenceId;
          if (this.inventory.inventoryPic) {
            this.picShow = true;
            this.MatPic = `/H_roleplay-si/ds/download?url=${this.inventory.inventoryPic}&width=400&height=400`;
          }
          let [imgFileObj = {}] = attachment.filter(item => {
            return item.attacthment === this.inventory.inventoryPic
          });
          this.imgFileObj = imgFileObj;
        });
      },
      // TODO 获取用户基本信息
      getBaseInfoData() {
        return getBaseInfoDataBase().then(data => {
          this.baseinfo = {
            ...this.baseinfo,
            ...data,
            activeTime: this.changeDate(new Date(), true),
          }
        });
      },
      // TODO 获取默认图片
      getDefaultImg() {
        this.MatPic = require('assets/wl_default03.png');
      },
      // TODO 新增重复项
      addMoreUnit(item) {
        let obj = {};
        item.items.forEach(item => {
          if(!item.hidden){
            obj[item.fieldCode] = ''
          }
        })
        this.matterDuplicateData[item.name].push(obj);
      },
      // TODO 删除重复项
      deleteMoreUnit(item) {
        this.matterDuplicateData[item.name].pop()
      },
      // TODO 校验数据
      validateData(arr, validateMap) {
        let warn = '';
        arr.every(item => {
          validateMap.every(vItem => {
            if (!item[vItem.key]) {
              warn = `${vItem.message}不能为空`;
              return false
            }
            return true
          });
          return !!warn
        });
        return warn;
      },
      // TODO 选择工序名称
      selProcedure(val) {
        this.inventory = {
          ...this.inventory,
          procedureName: val.procedureName,
          procedureCode: val.procedureCode,
        };
      },
      handlerParams(item) {
        let url = item.dataSource.data.url;
        let params = item.dataSource.data.params;
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
        return requestParams
      },
      // 请求应用的viewId
      getFormViews() {
        return getFormViews(this.listId).then(data => {
          for(let item of data){
            if(item.viewType === 'submit'){
              this.viewId = item.uniqueId;
              // this.getFormConfig();
              break;
            }
          }
        })
      },
      // 获取表单配置
      getFormConfig(){
        getFormConfig(this.viewId).then(({config = []}) => {
          // console.log(config);
          let matterConfig = [], matterDuplicateConfig = [];
          config.forEach(item => {
            if(!item.isMultiple) {
              matterConfig = JSON.parse(JSON.stringify(item.items));
            }
            else{
              if(!item.hiddenInRun && item.xtype !== 'r2Fileupload' && item.name === 'invMoreUnit'){
                matterDuplicateConfig.push(JSON.parse(JSON.stringify(item)))
              }
            }
          })
          // 物料基本信息配置的处理
          matterConfig.forEach(item =>{
            if(!item.hiddenInRun){
              //下拉框的数据请求
              if((item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector') && item.dataSource && item.dataSource.type === 'remoteData' ) {
                item.requestParams = this.handlerParams(item);
                requestData(this.handlerParams(item)).then(data => {
                  if(data.tableContent){
                    data.tableContent.forEach(item => {
                      if(item.technicsName) {
                        item.value = item.technicsName;
                        item.name = item.technicsName;
                        return
                      }
                      item.value = item.name;
                    })
                    if(item.fieldCode === 'processing'){
                      if(!this.$route.query.transCode){
                        this.inventory.processing  = this.$route.query.matterType ? this.$route.query.matterType : '';
                      }
                    }
                    this.$set(item, 'remoteData', data.tableContent)
                  }
                  else{
                    data.forEach(item => {
                      item.value = item.name;
                    })
                    this.$set(item, 'remoteData', data)
                  }
                  
                })
              }
              // 在渲染的配置中添加字段
              if(item.fieldCode !== 'inventoryCode' && item.fieldCode !== 'inventoryName' && item.fieldCode !== 'inventoryPic'){
                this.matterConfig.push(item);
              }
            }
          })
          matterDuplicateConfig.forEach(item => {
            switch(item.name){
              case 'invMoreUnit':
                item.title = '辅助计量';
                break;
              case 'invNetWeight':
                item.title = '净含量';
                break;
              case 'invDealerRel':
                item.title = '客户';
                break;
              case 'invCustomerRel':
                item.title = '供应商';
                break;
            }
            item.items.forEach((sItem, sIndex) => {
              if(!sItem.hidden){
                if(sItem.editorType === 'r2Combo' && sItem.dataSource && sItem.dataSource.type === 'remoteData') {
                  requestData(this.handlerParams(sItem)).then((data) => {
                    if(data.tableContent){
                      data.tableContent.forEach(item => {
                        item.value = item.name;
                      })
                      this.$set(sItem, 'remoteData', data.tableContent)
                    }
                    else{
                      data.forEach(item => {
                        item.value = item.name;
                      })
                      this.$set(sItem, 'remoteData', data)
                    }
                  })
                }
              }
            })
            this.$set(this.matterDuplicateData, item.name, [])
          })
          this.matterDuplicateConfig = matterDuplicateConfig;
        })
      },
    },
    beforeRouteLeave(to, from, next) {
      let {path} = to;
      // 新建物料，修改列表页的meta值
      if (this.submitSuccess && path === '/materlist') {
        to.meta.reload = true;
      }
      next();
    },
    created() {
      this.$loading.show();
      let {transCode = ''} = this.$route.query;
      let requestPromise = [];
      this.transCode = transCode;
      // 有transCode即回写页面
      if (transCode) {
        (async () => {
          await this.getFormViews()
          await this.getFormConfig();
          await this.findData();
          this.hasDefault = false;
          this.codeReadOnly = true;
          this.$loading.hide();
        })();
        return
      }
      (async() => {
        this.getBaseInfoData();
        await this.getFormViews();
        await this.getFormConfig();
        this.$loading.hide();
      })() 
    },
    beforeRouteEnter(to, from, next) {
      // 修改title
      to.meta.title = '新增物料';
      if (to.query.transCode) {
        to.meta.title = '编辑物料';
      }
      next()
    }
  }
</script>
<style lang="scss" scoped>
  .pages {
    background: #fff;
    z-index: 10;
  }

  .vux-1px-b:after,
  .vux-1px-l:before,
  .vux-1px-t:before, {
    border-color: #e8e8e8;
  }
  .vux-1px-b:after {
    left: .1rem;
  }
  .vux-1px-l:before {
    left: 0;
  }

  .content {
    height: 90%;
    background-color: #f8f8f8;
    overflow: hidden;
    position: relative;
    /deep/ .weui-cell{
      padding: 0.1rem;
    }
    /deep/ .weui-cells {
      font-size: .16rem;
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
      background: #fff;
    }
    /* 上传图片容器 */
    .upload-image-container {
      width: 1rem;
      // height: 100%;
      height: 0.86rem;
    }
    .readonly {
      color: #999;
    }
    .required {
      color: #5077aa;
      font-weight: bold;
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
      }
      .readonly {
        color: #999;
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
        &:before {
          display: block;
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


