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
          <template v-if="item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector'">
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

        </div>
        <!-- <group gutter="0">
          <r-picker title="加工属性" :data="matNatureList" :value="inventory.processing" v-model="inventory.processing"
                    :hasBorder='false' :required="true" mode="4" @on-change="natureChange"></r-picker>
        </group> 
        <group>
          <r-picker title="材料大类" :data="matBigList" :value="inventory.inventoryType" v-model="inventory.inventoryType"
                    mode="4" @on-change="bigChange"></r-picker>
          <r-picker title="材料子类" :data="matSmlList" :value="inventory.inventorySubclass" :has-border="false"
                    mode="4" v-model="inventory.inventorySubclass"></r-picker>
          <x-input title="型号规格" text-align='right' placeholder='请填写' v-model.trim='inventory.specification'></x-input>
          <x-input title="颜色" text-align='right' placeholder='请填写' v-model.trim='inventory.inventoryColor'></x-input>
          <x-input title="主材质" text-align='right' placeholder='请填写' v-model.trim='inventory.material'></x-input>
        </group>
        <group gutter="10">
          <x-input title="保质期天数" type="number" text-align='right' placeholder='请填写'
                   v-model.number='inventory.keepingDays'></x-input>
          <cell title="临保天数" :value="nearKeepingDays"></cell>
          <x-input title="安全库存" type="number" text-align='right' placeholder='请填写'
                   v-model.number='inventory.safeStock'></x-input>
        </group> -->
        <!-- <group gutter="10"> -->
          <!-- 工艺路线 -->
          <!-- <pop-technics-list class="vux-1px-b" @sel-item="selTechnics" :default-value="inventory"></pop-technics-list> -->
          
          <!-- 工艺名称 -->
          <!-- <pop-procedure-list @sel-item="selProcedure" :default-value="inventory"></pop-procedure-list>
          <cell title="工序编码" :value="inventory.procedureCode"></cell>
          <r-picker title="单位:" :data="measureList" :value="inventory.measureUnit" :required="true"
                    mode="4" v-model="inventory.measureUnit" has-border-top></r-picker>
          <r-picker title="物料状态:" :required="true" :data="statusList" :value="inventoryStatus"
                    mode="4" :has-border="false" v-model="inventoryStatus"></r-picker>
          <x-input title="起订量" type="number" text-align='right' placeholder='请填写'
                   v-model.number='inventory.moq'></x-input> -->
        <!-- </group> -->
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
        <!-- 辅助计量 -->
        <!-- <div class="duplicate-item-no-select" v-if="!invMoreUnit.length">
          <span class="title">辅计单位</span>
          <span class="add" @click="addMoreUnit">新增</span>
        </div>
        <group class="duplicate-item" title="辅计单位" v-else>
          <div v-for="(item,index) in invMoreUnit" :class="{'has_border': index < invMoreUnit.length-1}" :key="index">
            <r-picker class="vux-1px-t" title="辅计单位" :data="measureList" :value="item.invSubUnitName"
                      mode="4" :has-border="false" v-model="item.invSubUnitName" required></r-picker>
            <x-input title="单位倍数" type="number" text-align='right' placeholder='请填写' v-model='item.invSubUnitMulti'
                     @on-blur="checkAmt(item)">
              <span class="required" slot="label">单位倍数</span>
            </x-input>
            <x-input title="辅计说明" text-align='right' placeholder='请填写' v-model='item.comment'></x-input>
          </div>
        </group>
        <div class="add_more" v-show="invMoreUnit.length">
          您还需要添加新的辅助计量?请点击
          <span class='add' @click="addMoreUnit">新增</span>
          <em v-show="invMoreUnit.length>0">或</em>
          <span class='delete' @click="deleteMoreUnit" v-show="invMoreUnit.length>0">删除</span>
        </div> -->

        <!-- 净含量 -->
        <!-- <div class="duplicate-item-no-select" v-if="!invNetWeight.length">
          <span class="title">净含量</span>
          <span class="add" @click="addNetWeight">新增</span>
        </div>
        <group class="duplicate-item" title="净含量" v-else>
          <div v-for="(item,index) in invNetWeight" :class="{'has_border': index < invNetWeight.length-1}" :key="index">
            <x-input title="净含量名称" text-align='right' placeholder='请填写' v-model='item.invCompName'>
              <span class="required" slot="label">净含量名称</span>
            </x-input>
            <r-picker title="单位" :data="measureList" :value="item.invCompUnit"
                      mode="4" :has-border="false" v-model="item.invCompUnit" has-border-top required></r-picker>
            <x-input title="净含量数量" type="number" text-align='right' placeholder='请填写' v-model='item.invCompQty'
                     @on-blur="checkAmt(item)">
              <span class="required" slot="label">净含量数量</span>
            </x-input>
            <x-input title="净含量说明" text-align='right' placeholder='请填写' v-model='item.comment'></x-input>
          </div>
        </group>
        <div class="add_more" v-show="invNetWeight.length">
          您还需要添加新的净含量?请点击
          <span class='add' @click="addNetWeight">新增</span>
          <em v-show="invNetWeight.length>0">或</em>
          <span class='delete' @click="deleteNetWeight" v-show="invNetWeight.length>0">删除</span>
        </div> -->

        <!-- 客户 -->
        <!-- <div v-show="inventory.processing === '成品'">
          <div class="duplicate-item-no-select" v-if="!invDealerRel.length">
            <span class="title">客户</span>
            <span class="add" @click="addDealerRel">新增</span>
          </div>
          <group class="duplicate-item" title="客户" v-else>
            <div v-for="(item,index) in invDealerRel" :class="{'has_border': index < invDealerRel.length-1}"
                 :key="index">
              <pop-dealer-list @sel-dealer="selDealer" @click.native="dealerClick(index)" :defaultValue="item"
                               dealer-label-name="客户" mode="2" no-contact no-record required></pop-dealer-list>
              <cell title="客户编码" :value="item.productDealerCode"></cell>
              <x-input text-align='right' placeholder='请填写' v-model='item.clientInventoryCode'>
                <span class="required" slot="label">客户成品编码</span>
              </x-input>
              <x-input title="客户成品名称" text-align='right' placeholder='请填写' v-model='item.clientInventoryName'></x-input>
              <x-input title="说明" text-align='right' placeholder='请填写' v-model='item.productComment'></x-input>
            </div>
          </group>
          <div class="add_more" v-show="invDealerRel.length">
            您还需要添加新的净含量?请点击
            <span class='add' @click="addDealerRel">新增</span>
            <em v-show="invDealerRel.length>0">或</em>
            <span class='delete' @click="deleteDealerRel" v-show="invDealerRel.length>0">删除</span>
          </div>
        </div> -->

        <!-- 供应商 -->
        <!-- <div v-show="inventory.processing === '原料'">
          <div class="duplicate-item-no-select" v-if="!invCustomerRel.length">
            <span class="title">供应商</span>
            <span class="add" @click="addCustomerRel">新增</span>
          </div>
          <group class="duplicate-item" title="供应商" v-else>
            <div v-for="(item,index) in invCustomerRel" :class="{'has_border': index < invCustomerRel.length-1}"
                 :key="index">
              <pop-dealer-list @sel-dealer="selCustomer" @click.native="customerClick(index)" :defaultValue="item"
                               dealer-label-name="供应商" mode="2" no-contact no-record required></pop-dealer-list>
              <cell title="供应商编码" :value="item.productDealerCode">
                <span class="required" slot="title">供应商编码</span>
              </cell>
              <x-input title="说明" text-align='right' placeholder='请填写' v-model='item.productComment'></x-input>
            </div>
          </group>
          <div class="add_more" v-show="invCustomerRel.length">
            您还需要添加新的净含量? 请点击
            <span class='add' @click="addCustomerRel">新增</span>
            <em v-show="invCustomerRel.length>0">或</em>
            <span class='delete' @click="deleteCustomerRel" v-show="invCustomerRel.length>0">删除</span>
          </div>
        </div> -->
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
        matNatureList: [], // 加工属性列表
        matBigList: [], // 材料大类列表
        matSmlList: [], // 材料子类列表
        measureList: [], // 单位列表
        statusList: [],//物料状态
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
        invMoreUnit: [], // 辅助计量
        invNetWeight: [], // 净含量
        transCode: '',
        hasDefault: false, // 判断是否为回写
        imgFileObj: {}, // 上传的图片对象
        imgFile: null,
        codeReadOnly: false, // 物料编码是否只读
        submitSuccess: false, // 是否提交成功
        // processing: [], // 加工属性
        // inventoryType: [], // 材料大类
        // inventorySubclass: [], // 材料子类
        measureUnit: [], // 单位
        inventoryStatus: '使用中', // 物料状态
        inventoryTypeDisabled: false,
        inventorySubclassDisabled: false,
        scrollOptions: {
          click: true
        },
        invDealerRel: [], // 客户
        invCustomerRel: [], // 供应商
        currentDealerIndex: 0, // 当前点击的客户项索引
        currentCustomerIndex: 0, // 当前点击的供应商项索引
        matterConfig: [], // 物料基本信息配置
        matterDuplicateConfig: [], // 物料重复项的配置
        matterDuplicateData: {}, // 物料重复项数据
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
        let TypeParentId = '';
        for(let item of this.matterConfig) {
          if(item.fieldCode === 'processing'){
            for(let sItem of item.remoteData) {
              if(sItem.name === val){
                TypeParentId = sItem.id;
                break
              }
            }
          }
          // 获取方式
          if(item.fieldCode === 'multipleAccess') {
            item.requestParams.data.sType = this.inventory.processing;
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
            item.requestParams.data.parentId = TypeParentId;
            requestData(item.requestParams).then(data => {
              if(data.length) {
                data.forEach(dItem => {
                  dItem.originValue = dItem.value;
                  dItem.value = dItem.name;
                })
                this.inventory.inventoryType = data[0].name;
              }
              else{
                this.inventory.inventoryType = '';
              }
              item.remoteData = data;
            })
          }
        }
      },
      // 监听物料大类变化，改变物料子类的数据
      inventoryType(val) {
        if (this.hasDefault) {
          return
        }
        let subTypeParentId = '';
        for(let item of this.matterConfig) {
          if(item.fieldCode === 'inventoryType'){
            for(let sItem of item.remoteData) {
              if(sItem.name === val){
                subTypeParentId = sItem.id;
                break;
              }
            }
          }
          // 物料子类
          if(item.fieldCode === 'inventorySubclass') {
            item.requestParams.data.parentId = subTypeParentId;
            requestData(item.requestParams).then(data => {
              if(data.length){
                data.forEach(dItem => {
                  dItem.originValue = dItem.value;
                  dItem.value = dItem.name;
                })
                this.inventory.inventorySubclass = data[0].name;
              }
              else{
                this.inventory.inventorySubclass = '';
              }
              item.remoteData = data;
            })
            break
          }
        }
      },
      MoreUnit: {
        handler(val){
          if(val && val.length){
            val.forEach(item => {
              if(item.invSubUnitName && item.invSubUnitMulti){
                item.comment = `${item.invSubUnitMulti}/${item.invSubUnitName}`;
                return
              }
              item.comment = item.invSubUnitName || item.invSubUnitMulti;
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
      // TODO 提交/修改物料
      save() {
        let requiredMap = {
          inventoryCode: '物料编码',
          inventoryName: '物料名称',
          processing: '加工属性',
          measureUnit: '单位',
          inventoryStatus: '物料状态'
        };
        let hasDealer = this.invDealerRel.length && this.inventory.processing === '成品';
        let hasCustomer = this.invCustomerRel.length && this.inventory.processing === '原料';
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

        //console.log(submitData);
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
        // 校验辅助计量
        // if (!warn && this.invMoreUnit.length) {
        //   let validateMap = [
        //     {
        //       key: 'invSubUnitName',
        //       message: '辅计单位'
        //     }, {
        //       key: 'invSubUnitMulti',
        //       message: '单位倍数'
        //     },
        //   ];
        //   warn = this.validateData(this.invMoreUnit, validateMap);
        // }
        // 校验净含量
        // if (!warn && this.invNetWeight.length) {
        //   let validateMap = [
        //     {
        //       key: 'invCompName',
        //       message: '净含量名称'
        //     }, {
        //       key: 'invCompUnit',
        //       message: '净含量单位'
        //     }, {
        //       key: 'invCompQty',
        //       message: '净含量数量'
        //     },
        //   ];
        //   warn = this.validateData(this.invNetWeight, validateMap);
        // }
        // 校验客户
        // if (!warn && hasDealer) {
        //   let validateMap = [
        //     {
        //       key: 'productDealerName',
        //       message: '客户名称'
        //     }, {
        //       key: 'clientInventoryCode',
        //       message: '客户成品编码'
        //     },
        //   ];
        //   warn = this.validateData(this.invDealerRel, validateMap);
        // }
        // 校验供应商
        // if (!warn && hasCustomer) {
        //   let validateMap = [
        //     {
        //       key: 'productDealerName',
        //       message: '供应商名称'
        //     }, {
        //       key: 'productDealerCode',
        //       message: '供应商编码'
        //     },
        //   ];
        //   warn = this.validateData(this.invCustomerRel, validateMap);
        // }

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
        // if (this.invMoreUnit.length) {
        //   formData.invMoreUnit = this.invMoreUnit
        // }
        // if (this.invNetWeight.length) {
        //   formData.invNetWeight = this.invNetWeight
        // }
        // if (hasDealer) {
        //   formData.invDealerRel = this.invDealerRel
        // }
        // if (hasCustomer) {
        //   formData.invCustomerRel = this.invCustomerRel
        // }

        let submitData = {
          listId: this.listId,
          // biReferenceId: this.biReferenceId,
          formData: formData,
        };
        console.log(submitData)

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
          let {baseinfo = {}, inventory = {}, invMoreUnit = [], invNetWeight = []} = formData;
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
          let invDealerRel = formData.invDealerRel || [];
          let invCustomerRel = formData.invCustomerRel || [];
          invDealerRel && invDealerRel.forEach(item => {
            item.dealerName = item.productDealerName;
          });
          invCustomerRel && invCustomerRel.forEach(item => {
            item.dealerName = item.productDealerName;
          });
          this.baseinfo = {...this.baseinfo, ...baseinfo,};
          this.inventory = {...this.inventory, ...inventory,};
          this.invMoreUnit = invMoreUnit;
          this.invNetWeight = invNetWeight;
          this.invDealerRel = invDealerRel;
          this.invCustomerRel = invCustomerRel;
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
      // TODO 获取单位列表
      getMeasure() {
        return getDictByType('measureUnit').then(data => {
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.measureList = tableContent;
          return tableContent
        }).catch(e => {
          this.measureList = [];
          this.inventory.measureUnit = '';
        })
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
      // TODO 新增辅助计量
      addMoreUnit(item) {
        // this.invMoreUnit.push({
        //   invSubUnitName: '', // 辅计单位
        //   invSubUnitMulti: '', // 单位倍数
        //   comment: '', // 辅计说明
        // })
        
        let obj = {};
        item.items.forEach(item => {
          if(!item.hidden){
            obj[item.fieldCode] = ''
          }
        })
        this.matterDuplicateData[item.name].push(obj);
        console.log(this.matterDuplicateData[item.name]);

      },
      // TODO 删除辅助计量
      deleteMoreUnit(item) {
        // this.invMoreUnit.pop();
        this.matterDuplicateData[item.name].pop()
      },
      // TODO 新增净含量
      addNetWeight() {
        this.invNetWeight.push({
          invCompName: '', // 净含量名称
          invCompUnit: '', // 单位
          invCompQty: '', // 净含量数量
          comment: '', // 净含量说明
        })
      },
      // TODO 删除净含量
      deleteNetWeight() {
        this.invNetWeight.pop();
      },
      // TODO 新增客户
      addDealerRel() {
        this.invDealerRel.push({
          // productId: '',
          productDealerName: '',
          productDealerCode: '',
          productDealerType: '',
          clientInventoryCode: '',
          clientInventoryName: '',
          productComment: '',
        });
      },
      // TODO 删除客户
      deleteDealerRel() {
        this.invDealerRel.pop();
      },
      // TODO 新增供应商
      addCustomerRel() {
        this.invCustomerRel.push({
          productDealerName: '',
          productDealerCode: '',
          productDealerType: '',
          productComment: ''
        });
      },
      // TODO 删除供应商
      deleteCustomerRel() {
        this.invCustomerRel.pop();
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
      // TODO 选中客户
      selDealer(val) {
        let idx = this.currentDealerIndex;
        this.$set(this.invDealerRel, idx, {
          ...this.invDealerRel[idx],
          dealerName: val.dealerName,
          productDealerName: val.dealerName,
          productDealerCode: val.dealerCode,
          productDealerType: val.dealerLabelName,
        });
      },
      // TODO 选中供应商
      selCustomer(val) {
        let idx = this.currentCustomerIndex;
        console.log(this.invCustomerRel[idx])
        this.$set(this.invCustomerRel, idx, {
          ...this.invCustomerRel[idx],
          dealerName: val.dealerName,
          productDealerName: val.dealerName,
          productDealerCode: val.dealerCode,
          productDealerType: val.dealerLabelName,
        });
      },
      // TODO 点击客户名称
      dealerClick(index) {
        this.currentDealerIndex = index;
      },
      // TODO 点击供应商名称
      customerClick(index) {
        this.currentCustomerIndex = index;
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
              this.getFormConfig();
              break;
            }
          }
        })
      },
      // 获取表单配置
      getFormConfig(){
        getFormConfig(this.viewId).then(({config = []}) => {
          console.log(config);
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
                item.requestParams = requestParams;
                requestData(requestParams).then(data => {
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
          this.$loading.hide()
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
          await this.findData();
          this.hasDefault = false;
          this.codeReadOnly = true;
          this.$loading.hide();
        })();
        return
      }
      this.getFormViews();
      this.getBaseInfoData();
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


