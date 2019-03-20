<template>
  <div class='childPage matter-page'>
    <r-scroll :options="scrollOptions" class='content'>
      <div class='mater_baseinfo'>
        <div class="mater_pic">
          <span class="title">物料照片</span>
          <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
        </div>
      </div>
      <div v-for="(item, index) in matterConfig" :key="index" class="each-info">
        <template v-if="!item.readOnly">
          <!-- 下拉框 -->
          <template v-if="(item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector') && item.fieldCode !== 'technicsCode' && item.fieldCode !== 'inventoryStatus'">
            <r-picker class="vux-1px-t" :title="item.fieldLabel" :data="item.remoteData" :value="inventory[item.fieldCode]" 
                      v-model="inventory[item.fieldCode]" :required="!item.allowBlank" ></r-picker>
          </template>
          <!-- 输入框（数字） -->
          <template v-else-if="item.xtype === 'r2Numberfield'">
            <div class='each_property vux-1px-t'>
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <input type='number' class='property_val' placeholder="请输入" v-model.number="inventory[item.fieldCode]" @focus="getFocus($event)"/>
            </div>
          </template>
          <!-- 输入框（文字） -->
          <template v-else-if="item.xtype === 'r2Textfield'">
            <div class='each_property vux-1px-t'>
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <input type='text' class='property_val' placeholder="请输入" v-model="inventory[item.fieldCode]" @focus="getFocus($event)"/>
            </div>
          </template>
          <!-- 日期 -->
          <template v-else-if="item.xtype === 'r2Datefield'">
            <div class='each_property' @click="getDate(inventory,item)">
              <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
              <span class='property_val'>{{inventory[item.fieldCode] || "请选择"}}</span>
            </div>
          </template>
          <!-- pop组件 -->
          <template v-else-if="item.xtype === 'r2Selector'">
            <pop-procedure-list @sel-item="selProcedure" :default-value="inventory" class="vux-1px-t"></pop-procedure-list>
          </template>
          <template v-else-if="item.fieldCode === 'technicsCode'">
            <pop-technics-list class="vux-1px-t" @sel-item="selTechnics" :default-value="inventory"></pop-technics-list>
          </template>
          <template v-else-if="item.fieldCode === 'inventoryStatus'">
            <r-picker class="vux-1px-t" :title="item.fieldLabel" :data="item.remoteData" :value="inventoryStatus" 
                      v-model="inventoryStatus" :required="!item.allowBlank" ></r-picker>
          </template>
        </template>
        <template v-else-if="item.xtype !== 'r2Spacer'">
          <div class='each_property readonly vux-1px-t'>
            <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
            <input type='text' disabled class='property_val' v-model="inventory[item.fieldCode]"/>
          </div>
        </template>
      </div>
      <!-- 重复项 -->
      <duplicate-component :config="matterDuplicateConfig" :defaultValue="matterDuplicateData" v-model="matterDuplicateData"></duplicate-component>
    </r-scroll>
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">{{this.transCode? '保存':'提交'}}</div>
    </div>
  </div>
</template>
<script>
// 请求引入
import { save, update, findData } from 'service/materService'
import { requestData, getFormViews, getFormConfig, getBaseInfoDataBase } from 'service/common/commonService'
// 组件引入
import RScroll from 'plugins/scroll/RScroll'
import RPicker from 'components/public/basicPicker';
import UploadImage from 'components/upload/UploadImage'
import PopTechnicsList from 'components/popup/matter/PopTechnicsList'
import PopProcedureList from 'components/popup/matter/PopProcedureList'
import duplicateComponent from 'homePage/components/basis-object/duplication'
// mixins引入
import common from 'mixins/common'
// 插件引入
import { toFixed } from '@/plugins/calc'
import { setTimeout } from 'timers';

export default {
  data() {
    return {
      inventoryStatus: '使用中',         // 物料状态
      listId: '78a798f8-0f3a-4646-aa8b-d5bb1fada28c',
      scrollOptions: { 
        click: true 
      },
      inventory: {
        safeStock: 0,                   // 安全库存
        keepingDays: 1,                 // 保质期天数
        nearKeepingDays: 1,             // 临保天数
        moq: '',                        // 起订量
        comment: '',                    // 物料说明
        leadTime: '',                   // 加工/采购提前期
        material: '',                   // 主材质
        processing: '',                 // 加工属性
        measureUnit: '',                // 单位
        inventoryPic: '',               // 物料图片
        technicsCode: '',               // 工艺路线
        procedureName: '',              // 工序名称
        procedureCode: '',              // 工序编码
        specification: '',              // 型号规格
        inventoryCode: '',              // 物料编码
        inventoryName: '',              // 物料名称
        inventoryType: '',              // 物料大类
        multipleAccess: '',             // 获取方式
        inventoryColor: '',             // 颜色
        inventoryStatus: '',            // 物料状态
        inventorySubclass: '',          // 物料子类
      },
      MatPic: '',                       // 图片地址
      typeId: '',                       // 大类转换id
      uniqueId: '',
      transCode: '',
      processId: '',                    // 属性转换id
      subclassId: '',                   // 子类转换id
      biReferenceId: '',
      baseinfo: {},
      imgFileObj: {},                   // 上传的图片对象
      matterDuplicateData: {},          // 物料重复项数据,
      matterConfig: [],                 // 物料基本信息配置
      matterDuplicateConfig: [],        // 物料重复项的配置
      picShow: false,                   // 是否展示图片
      codeReadOnly: false,              // 物料编码是否只读
      submitSuccess: false,             // 是否提交成功
    }
  },
  mixins: [common],
  components: {
    RPicker, UploadImage, RScroll,  
    PopTechnicsList, PopProcedureList, duplicateComponent
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
      } 
      else if (kDay >= 183) {
        return 20;
      } 
      else if (kDay >= 90) {
        return 15;
      } 
      else if (kDay >= 30) {
        return 10;
      } 
      else if (kDay >= 10) {
        return 2;
      } 
      else {
        return 1;
      }
    },
    // 加工/采购提前期标题
    leadTimeTitle() {
      let processing = this.inventory.processing;
      let pur = ['原料', '商品'];                     // 采购
      let mac = ['半成品', '成品', '模具'];            // 加工
      if (pur.includes(processing)) {
        return '采购提前期'
      } 
      else if (mac.includes(processing)) {
        return '加工提前期'
      } 
      else {
        return ''
      }
    },
    // 拼接 物料编码
    inventoryCode() {
      return `M${this.processId}${this.typeId}${this.subclassId}`
    },
  },
  watch: {
    // 临保天数
    nearKeepingDays(val) {
      this.inventory.nearKeepingDays = val;
    },
    // 监听 物料属性
    'inventory.processing'(val) {
      let [ value, config, inventory, typeParentId ] = [ '', this.matterConfig, this.inventory, '' ];
      let aa = false;
      setTimeout(() => {
        for (let item of config) {
          // 物料属性 
          if (item.fieldCode === 'processing') {
            console.log('remoteData:', item.remoteData);
            if (item.remoteData) {
              for (let each of item.remoteData) {
                if (each.name === val) {
                  aa = true;
                  console.log('aa-01:', aa);
                  // 根据 dictCode 拼接成 物料编码
                  this.processId = each.dictCode;
                  // *获取方式* 请求参数
                  value = each.value;
                  // *物料大类* 请求参数
                  typeParentId = each.id;
                  
                  break;
                }
              }
            }
          }
          // 获取 获取方式
          if (item.fieldCode === 'multipleAccess') {
            item.requestParams.data.sType = val;
            requestData(item.requestParams).then(({ tableContent }) => {
              const requestArr = ['multipleAccess', 'sName', item, tableContent];
              // 处理数据
              this.handleRequest(requestArr);
            });
          }
          if (aa) {
            // 获取 物料大类
            if (item.fieldCode === 'inventoryType') {
              Object.keys(item.requestParams.data).forEach(key => {
                console.log('typeParentId:', typeParentId);
                if (key === 'parentId') {
                  item.requestParams.data[key] = typeParentId
                }
                else if (key === 'value') {
                  item.requestParams.data[key] = value
                }
              })
              requestData(item.requestParams).then(({ tableContent }) => {
                const requestArr = ['inventoryType', 'name', item, tableContent];
                // 处理数据
                this.handleRequest(requestArr);
              })
            }
          }
          // 获取 物料大类
          if (item.fieldCode === 'inventoryType') {
            Object.keys(item.requestParams.data).forEach(key => {
              console.log('typeParentId:', typeParentId);
              if (key === 'parentId') {
                item.requestParams.data[key] = typeParentId
              }
              else if (key === 'value') {
                item.requestParams.data[key] = value
              }
            })
            requestData(item.requestParams).then(({ tableContent }) => {
              const requestArr = ['inventoryType', 'name', item, tableContent];
              // 处理数据
              this.handleRequest(requestArr);
            })
          }
        }
      }, 0)
    },
    // 监听 物料大类
    'inventory.inventoryType'(val) {
      if (!val) {
        // typeId为物料编码的组成之一 若物料大类不存在 则需要清空
        this.typeId = '';
        return;
      }
      let [ value, config, inventory, subTypeParentId ] = [ '', this.matterConfig, this.inventory, '' ];
      setTimeout(() => {
        for (let item of config) {
          // 物料大类 
          if (item.fieldCode === 'inventoryType') {
            if (item.remoteData) {
              for (let each of item.remoteData) {
                if (each.name === val) {
                  // 根据 dictCode 拼接成 物料编码
                  this.typeId = each.dictCode;
                  // *物料子类* 请求参数 (value / subTypeParentId 二者选其一)
                  value = each.value;
                  subTypeParentId = each.id;
                  
                  break;
                }
              }
            }
          }
          // 请求 物料子类
          if (item.fieldCode === 'inventorySubclass') {
            Object.keys(item.requestParams.data).forEach(key => {
              console.log('subTypeParentId:', subTypeParentId);
              if (subTypeParentId || value) {
                if (key === 'parentId') {
                  item.requestParams.data[key] = subTypeParentId
                }
                else if (key === 'value') {
                  item.requestParams.data[key] = value
                }
              }
            })
            requestData(item.requestParams).then(({ tableContent }) => {
              const requestArr = ['inventorySubclass', 'name', item, tableContent];
              // 处理数据
              this.handleRequest(requestArr);
            })
          }
        }
      }, 0)
    },
    // 监听 物料子类
    'inventory.inventorySubclass'(val) {
      if (!val) {
        this.subclassId = '';
        return;
      }
      setTimeout(() => {
        for (let item of this.matterConfig) {
          if (item.fieldCode === 'inventorySubclass') {
            for (let sItem of item.remoteData) {
              if (sItem.name === val) {
                this.subclassId = sItem.dictCode;
                break;
              }
            }
          }
        }
      }, 0)
    },    
    // 监听 物料编码
    inventoryCode(val) {
      this.inventory.inventoryCode = val;
    },
    // 监听辅助计量，重新计算包装规格
    'matterDuplicateData.invMoreUnit': {
      handler(val) {
        if (val && val.length) {
          val.forEach(item => {
            if (this.inventory.measureUnit && item.invSubUnitName && item.invSubUnitMulti) {
              item.comment = `${item.invSubUnitMulti}${this.inventory.measureUnit}/${item.invSubUnitName}`;
              return
            }
          })
        }
      },
      deep: true
    },  
  },
  methods: {
    // 处理 级联关系 数据
    handleRequest(args) {
      const [ [ key, ckey, item, tableContent ] , inventory ] = [ args, this.inventory];
      
      if (!tableContent.length) {
        inventory[key] = '';
        this.$set(item, 'remoteData', []);
        return;
      }

      const remoteData = tableContent.reduce((arr, cItem) => {
        arr.push({
          ...cItem,
          name: cItem[ckey],
          value: cItem[ckey],
        }) 
        return arr;
      }, []);

      // 设置 默认值
      inventory[key] = remoteData[0].name;
      // 赋值
      this.$set(item, 'remoteData', remoteData);
    },
    // 上传图片成功触发
    onUpload(val) {
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
    // 选择工艺路线名称
    selTechnics(val) {
      this.inventory = {
        ...this.inventory,
        technicsName: val.technicsName,
        technicsCode: val.technicsCode,
      };
    },
    // 提交/修改物料
    save() {
      let requiredMap = {
        inventoryName: '物料名称',
        processing: '物料属性',
        measureUnit: '主计量单位',
      };
      for (let key in this.inventory) {
        // 此处去除输入框内的空格
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
      if (!warn && Object.keys(this.matterDuplicateData).length) {
        Object.keys(this.matterDuplicateData).forEach(item => {
          if (this.matterDuplicateData[item].length <= 0) {
            return false
          }
          this.matterDuplicateConfig.forEach(dItem => {
            if (dItem.name === item) {
              dItem.items.forEach(cItem => {
                if (!cItem.hidden) {
                  this.matterDuplicateData[item].forEach(sItem => {
                    if (!cItem.allowBlank && !sItem[cItem.fieldCode]) {
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
        if (this.matterDuplicateData[item.name].length) {
          formData[item.name] = this.matterDuplicateData[item.name]
        }
      })
      let submitData = {
        listId: this.listId,
        formData: formData,
      };
      // 修改
      if (this.transCode) {
        operation = update;
      }

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
    // 查询物料详情
    findData() {
      return findData(this.transCode).then(({formData = {}, attachment = []}) => {
        let { baseinfo = {}, inventory = {} } = formData;
        // 物料重复项 数据赋值
        this.matterDuplicateConfig.forEach(key => {
          if (formData[key.name].length) {
            this.matterDuplicateData[key.name] = formData[key.name];
          }
        })
        this.baseinfo = {...this.baseinfo, ...baseinfo,};
        this.inventory = {...this.inventory, ...inventory,};
        // 图片处理
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
    // 获取用户基本信息
    getBaseInfoData() {
      return getBaseInfoDataBase().then(data => {
        this.baseinfo = {
          ...this.baseinfo,
          ...data,
          activeTime: this.changeDate(new Date(), true),
        }
      });
    },
    // 获取默认图片
    getDefaultImg() {
      this.MatPic = require('assets/wl_default03.png');
    },
    // 校验数据
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
    // 选择工序名称
    selProcedure(val) {
      this.inventory = {
        ...this.inventory,
        procedureName: val.procedureName,
        procedureCode: val.procedureCode,
      };
    },
    // 处理配置中的接口请求
    handlerParams(item) {
      // 判断 <请求参数> 是否全部都已就位
      let paramsIsOk = true;
      // 数据源等基本信息
      let url = item.dataSource.data.url,
          params = item.dataSource.data.params;
      let keys = Object.keys(params),
          requestParams = {
            url,
          };
      if (keys.length) {
        let data = {};
        for (let key of keys) {
          data[key] = params[key].type === 'text' ? params[key].value : '';
          if (data.hasOwnProperty(key) && !data[key]) {
            paramsIsOk = false;
            break;
          }
        }
        requestParams.data = data;
        item.requestParams = requestParams;
        // 默认状态下 请求参数就位 才会发起相应请求
        if (paramsIsOk) {
          requestData(requestParams).then(data => {
            if (data.tableContent) {
              data.tableContent.forEach(dItem => {
                dItem.value = dItem[item.displayField];
                dItem.name = dItem[item.displayField];
              })
              this.$set(item, 'remoteData', data.tableContent)
            }
            else {
              data.forEach(dItem => {
                dItem.value = dItem[item.displayField];
                dItem.name = dItem[item.displayField];
              })
              this.$set(item, 'remoteData', data)
            }
          })
        }
      }
    },
    async getFormViewsInfo() {
      // 根据 listId 请求表单的 uniqueId
      await getFormViews(this.listId).then(data => {
        for (let item of data) {
          if (this.transCode && item.viewType === 'revise') {
            this.uniqueId = item.uniqueId;
          }
          else if (!this.transCode && item.viewType === 'submit') {
            this.uniqueId = item.uniqueId;
          }
        }
      })
      // 根据 uniqueId 请求表单的配置
      await getFormConfig(this.uniqueId).then(({config = []}) => {
        let matterConfig = [], matterDuplicateConfig = [];
        // 配置拆分成 基本信息 / 重复项
        config.forEach(item => {
          if (!item.isMultiple) {
            matterConfig = JSON.parse(JSON.stringify(item.items));
          }
          else {
            if (!item.hiddenInRun && item.xtype !== 'r2Fileupload' && item.name === 'invMoreUnit') {
              matterDuplicateConfig.push(JSON.parse(JSON.stringify(item)))
            }
          }
        })
        // 处理 物料 *基本信息* 配置 
        matterConfig.forEach(item => {
          if (!item.hiddenInRun) {
            //下拉框的数据请求
            if ((item.xtype === 'r2Combo' || item.xtype === 'r2MultiSelector') && item.dataSource && item.dataSource.type === 'remoteData' ) {
              this.handlerParams(item)
            }
            else if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData') {
              this.$set(item, 'remoteData', item.dataSource.data)
            }
            // 在渲染的配置中添加字段
            if (item.fieldCode !== 'inventoryPic') {
              this.matterConfig.push(item);
            }
            // 如果用户是从某个tab状态点进来 则属性默认为选中的tab状态栏
            if (item.fieldCode === 'processing') {
              if (this.$route.query.matterType) {
                this.inventory.processing  = this.$route.query.matterType;
              }
            }
          }
        })
        // 处理 物料 *重复项* 配置
        matterDuplicateConfig.forEach(item => {
          switch(item.name) {
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

          let arr = []
          item.items.forEach((sItem, sIndex) => {
            if (!sItem.hidden) {
              arr.push(sItem)
            }
          })
          item.items = arr;
          this.$set(this.matterDuplicateData, item.name, [])
        })
        this.matterDuplicateConfig = matterDuplicateConfig;
        if (!this.transCode) this.$loading.hide();
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
        await this.getFormViewsInfo()
        await this.findData().then(() => {
          this.$loading.hide()
        });
        this.codeReadOnly = true;
      })();
      return
    }
    this.getFormViewsInfo()
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
@import '~homePage/scss/basicApp.scss';
  .matter-page {
    background: #f6f6f6;
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


