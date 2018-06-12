<template>
  <div class="dynamic-form-container" ref="dynamicFormContainer">
    <div v-for="(item, index) in configList" :key="index" v-show="!item.hiddenInRun">
      <!-- 普通输入框 -->
      <x-input :title="item.fieldLabel" :required="!item.allowBlank" v-model="item.inputValue" text-align="right"
               @on-change="inputChange(item)" :readonly="item.readOnly" v-if="item.xtype === 'r2Textfield'"></x-input>
      <!-- 数字输入框 -->
      <x-input type="number" :title="item.fieldLabel" :required="!item.allowBlank" v-model="item.inputValue"
               text-align="right" @on-change="inputChange(item)" :readonly="item.readOnly"
               v-if="item.xtype === 'r2Numberfield'"></x-input>
      <!-- 下拉框 -->
      <popup-picker :title="item.fieldLabel" :data="item.pickerList" :value="item.inputValue"
                    @on-change="popChange(item, index)" v-model="item.inputValue" :columns="1"
                    v-else-if="item.xtype === 'r2Combo'"></popup-picker>
      <!-- 文本框 -->
      <x-textarea :title="item.fieldLabel" v-model="item.inputValue" :readonly="item.readOnly"
                  v-else-if="item.xtype === 'r2HtmlEditor' || item.xtype === 'r2TextArea'"></x-textarea>
      <x-selector :title="item.fieldLabel" :data="item.selectorList" v-model="item.inputValue"
                  @on-change="selectorChange(item)" :sel-value="item.inputValue"
                  v-else-if="item.xtype === 'r2Selector'"></x-selector>
      <!-- 表格类型 -->
      <!--<x-grid :title="item.fieldLabel" :data="item.gridList" v-model="item.inputValue" ref="xGrid"
              v-else-if="item.xtype === 'r2Grid'"></x-grid>-->
      <!-- 日期类型 -->
      <datetime :title="item.fieldLabel" v-model="item.inputValue" format="YYYY-MM-DD"
                v-else-if="item.xtype === 'r2Datefield'"></datetime>
    </div>
    <!-- 提示 -->
    <toast v-model="showToast" type="text" :text='toastText' is-show-mask position="middle" width='auto'></toast>
  </div>
</template>

<script>
  import createService from './../../service/createService'
  import {
    Group,
    PopupPicker,
    XInput,
    XTextarea,
    Confirm,
    TransferDom,
    Toast,
    Cell,
    Popup,
    Datetime,
  } from 'vux'
  import XSelector from './XSelector'
  // import XGrid from './XGrid'
  import UserEvent from './../../plugins/userEvent'
  import contextData from './../map/contextData'

  export default {
    name: "DynamicForm",
    props: {
      config: {
        type: Array,
        default() {
          return []
        }
      },
      // 用户数据
      /* userInfo: {
         type: Object,
         default() {
           return {}
         }
       },*/
      currentUser: {
        type: Object,
        default() {
          return {}
        }
      },
    },
    directives: {TransferDom},
    components: {Group, PopupPicker, XInput, XTextarea, Confirm, Toast, Cell, Popup, XSelector, Datetime},
    data() {
      return {
        uniqueId: '',
        listid: '',
        configList: [], // 配置列表
        showToast: false, // 是否展示toast
        toastText: '', // 警告提示
        transCode: '', // 表单编码
        submitTransCode: '', // 用于提交的transCode
        needListeners: [],
      }
    },
    methods: {
      // TODO 处理配置数据
      handleConfig() {
        // this.configList = JSON.parse(JSON.stringify(this.config));
        this.configList = this.config;
        this.configList && this.configList.forEach((item, index) => {
          item.inputValue = '';
          switch (item.xtype) {
            // 下拉框类型
            case 'r2Combo':
              this.handleCombo(item, index);
              break;
            case 'r2Selector':
              this.handleSelector(item, index);
              break;
            case 'r2Grid':
              this.handleGrid(item, index);
              break;
            case 'r2Numberfield':
              this.handleMumber(item, index);
              break;
            default:
              this.handleDefault(item, index);
              break;
          }
          // console.log(`${item.fieldLabel}---${item.name}---${item.xtype}---${item.defaultValue}`);
        });
        // 设置监听事件
        this.needListeners.forEach(listner => {
          this.$parent.$parent.config.forEach((lItem, lIndex) => {
            lItem.items && lItem.items.forEach((cItem, index) => {
              // 下拉框级联
              if (cItem.id === listner.contrl) {
                this.$nextTick(() => {
                  let type = `userevent-${cItem.id}`;
                  let userEvent = new UserEvent(this.$refs.dynamicFormContainer, type);
                  userEvent.on((e) => {
                    listner.handler(e);
                  });
                  this.$emit('addlistener', {type, lIndex, index, userEvent});
                  // userEvent.emit(cItem.inputValue);
                })
              }
              // 输入框计算
              if (listner.computeParams && (cItem.reference in listner.computeParams)) {
                this.$nextTick(() => {
                  let type = `userevent-${cItem.reference}`;
                  let userEvent = new UserEvent(this.$refs.dynamicFormContainer, type);
                  userEvent.on((e) => {
                    listner.handler(e);
                  });
                  this.$emit('addlistener', {type, lIndex, index, userEvent});
                })
              }
            });
          });
        })
      },
      // TODO 处理下拉框
      handleCombo(item, index) {
        item.pickerList = [];
        item.inputValue = [];
        let dataSource = JSON.parse(item.dataSource || "{}");
        let unitNameArr = ['baseinfoExt.varchar1', 'baseinfoExt.varchar9', 'baseinfoExt.varchar3', 'baseinfoExt.varchar4', 'baseinfoExt.varchar5', 'baseinfoExt.varchar6'];
        let userGroupNameArr = ['baseinfo.handlerAreaName', 'baseinfo.handlerUnitName', 'baseinfo.handlerRoleName'];
        let nameKey = '';
        // 判断展示名称的key
        if (unitNameArr.indexOf(item.name) !== -1) {
          nameKey = 'unitName';
        } else if (userGroupNameArr.indexOf(item.name) !== -1) {
          nameKey = 'userGroupName';
        }
        switch (dataSource.type) {
          // 静态数据
          case 'staticData':
            dataSource.data.forEach((sel, index) => {
              item.pickerList.push({
                name: sel,
                value: sel,
              });
            });
            break;
          case 'remoteData':
            let params = {};
            let requestRemote = () => {
              let pickerList = [];
              createService.getRemoteData(dataSource.data.url, params).then(data => {
                data.tableContent && data.tableContent.forEach(picker => {
                  let name = picker[nameKey];
                  pickerList.push(Object.assign(picker, {
                    name: name,
                    value: name
                  }));
                });
                this.setData(index, {
                  pickerList,
                  // inputValue: [pickerList[0] && pickerList[0].name] || []
                });
              });
            };
            Object.entries(dataSource.data.params).forEach(([key, value]) => {
              switch (value.type) {
                case 'contrl':
                  // 增加监听操作
                  this.needListeners.push({
                    contrl: value.value.contrl,
                    handler: (e) => {
                      Object.assign(params, {
                        [key]: e.data.value[value.value.valueField]
                      });
                      // 清空当前值
                      item.inputValue = [];
                      requestRemote();
                    }
                  });
                  break;
                default:
                  params[key] = value.value;
                  break;
              }
            });
            requestRemote();
            break;
          default:
            break;
        }
        if (item.defaultValue) {
          let defaultValue = JSON.parse(item.defaultValue || "{}");
          let inputValue = '';
          switch (defaultValue.type) {
            // 从当前用户信息获取数据
            case 'contextData':
              inputValue = [contextData.getContext(defaultValue.data)];
              break;
            default:
              break;
          }
          this.setData(index, {
            inputValue: inputValue
          });
        }
      },
      // TODO 处理选择器
      handleSelector(item, index) {
        item.selectorList = [];
        item.inputValue = {};
        let params = {};
        let dataSource = JSON.parse(item.dataSource || "{}");
        switch (dataSource.type) {
          case 'remoteData':
            Object.entries(dataSource.data.params).forEach(([key, value]) => {
              params[key] = value.value;
            });
            createService.getRemoteData(dataSource.data.url, params).then(data => {
              let nameKey = '';
              switch (item.name) {
                // 上级需求
                case 'requirementProject.parentId':
                  nameKey = 'requireName';
                  break;
                // 报销人  经办人
                default:
                  nameKey = 'nickname';
                  break;
              }
              data.tableContent && data.tableContent.forEach(sel => {
                item.selectorList.push(Object.assign(sel, {
                  name: sel[nameKey],
                }))
              });
            }).catch(e => {
              // item.hiddenInRun = true;
            });
            break;
          default:
            break;
        }
        // 判断是否有默认值
        if (item.defaultValue) {
          let defaultValue = JSON.parse(item.defaultValue || "{}");
          switch (defaultValue.type) {
            case 'contextData': // 从用户信息中获取
              if (defaultValue.data === 'currentUser.name') {
                this.setData(index, {
                  inputValue: Object.assign({}, this.currentUser, {
                    name: this.currentUser.nickname
                  })
                });
              }
              break;
            default:
              break;
          }
        }
      },
      // TODO 处理表格数据
      handleGrid(item, index) {
        item.gridList = item.columns || [];
        item.inputValue = [];
      },
      // TODO 处理数字输入框
      handleMumber(item, index) {
        if (item.r2Bind) {
          let r2Bind = JSON.parse(item.r2Bind || "{}");
          let value = r2Bind.value.replace(/[{}]/g, '');
          let r2Binds = r2Bind[value].match(/\('[^\)]*'\)/g); // 获取括号中的值(含括号)
          let computeParams = {}; // 存储计算数值
          r2Binds && r2Binds.forEach(item => {
            let key = item.replace(/[\('\)]/g, '').replace(/\.value/g, '');
            computeParams[key] = 0;
          });

          // 增加监听操作
          this.needListeners.push({
            computeParams,
            handler: (e) => {
              let data = e.data;
              let computeStr = r2Bind[value];
              computeParams[data.reference] = data.value;
              Object.entries(computeParams).forEach(([key, value]) => {
                // 将值转换为可计算的字符串
                computeStr = computeStr.replace(`get('${key}.value')`, value);
              });
              // 设置计算后的值
              this.setData(index, {
                inputValue: eval(computeStr)
              })
            }
          });
          // console.log(r2Bind[value])
          // console.log(r2Binds)
        }
      },
      // TODO 处理默认数据
      handleDefault(item, index) {
        if (item.dataSource) {
          let dataSource = JSON.parse(item.dataSource || "{}");
          switch (dataSource.type) {
            case 'formData':
              let dataKey = dataSource.data.valueField;
              // 增加监听操作
              this.needListeners.push({
                contrl: dataSource.data.contrl,
                handler: (e) => {
                  item.inputValue = e.data.value[dataKey] || '';
                }
              });
              item.inputValue = this.currentUser[dataKey];
              break;
            default:
              break;
          }
        }
        // 判断是否有默认值
        if (item.defaultValue) {
          let defaultValue = JSON.parse(item.defaultValue || "{}");
          switch (defaultValue.type) {
            case 'contextData':
              item.inputValue = contextData.getContext(defaultValue.data);
              break;
            case 'staticData':
              item.inputValue = defaultValue.data[0];
              break;
            default:
              break;
          }
        }
      },
      // TODO 文本框修改值
      inputChange(input) {
        // console.log(input)
        input.listeners && Object.values(input.listeners).forEach(item => {
          item.emit({
            reference: input.reference,
            value: input.inputValue
          });
        })
      },
      // TODO picker切换
      popChange(picker, index) {
        console.log('popChange')
        let pickerItem = {};
        let val = picker.inputValue[0];
        picker.pickerList && picker.pickerList.forEach(p => {
          if (p.value === val) {
            pickerItem = Object.assign({}, p);
          }
        });
        picker.listeners && Object.values(picker.listeners).forEach(item => {
          item.emit({
            value: pickerItem
          });
        });
        this.setData(index, {
          inputValue: picker.inputValue
        });
      },
      // TODO 选择器切换
      selectorChange(selector) {
        selector.listeners && Object.values(selector.listeners).forEach(item => {
          item.emit({
            value: selector.inputValue
          });
        })
      },
      // TODO 提交数据
      getSaveData() {
        let submitData = {};
        this.configList && this.configList.forEach(item => {
          if (item.submitValue) {
            // 通过切割名字获取source和key
            let [source, businesskey] = item.name.split('.');
            if (!submitData[source]) {
              submitData[source] = {};
            }
            if (businesskey === 'id') {
              // 生成随机id
              submitData[source][businesskey] = this.guid();
              return
            }
            if (businesskey === 'fgCode' || businesskey === 'entityId') {
              let defaultValue = JSON.parse(item.defaultValue || "{}");
              submitData[source][businesskey] = defaultValue.data[0];
              return
            }
            if (businesskey === 'transCode') {
              this.submitTransCode = item.inputValue || '';
            }
            switch (item.xtype) {
              // 下拉框类型
              case 'r2Combo':
                let comboData = item.inputValue[0] || '';
                submitData[source][businesskey] = {
                  text: comboData,
                  selection: {
                    data: {
                      text: comboData,
                      id: ''
                    }
                  },
                  value: comboData
                };
                break;
              case 'r2Selector':
                let val = item.inputValue.name;
                submitData[source][businesskey] = val ? {
                  text: val,
                  value: val
                } : {};
                break;
              default:
                submitData[source][businesskey] = item.inputValue || '';
                break;
            }
          }
          if (item.xtype === 'r2Grid') {
            Object.assign(submitData, item.inputValue);
          }
        });
        // console.log(submitData)
        return submitData
      },
      // TODO 生成随机串
      guid() {
        let S4 = () => {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
      },
      // TODO 检查数据
      checkData() {
        let warn = '';
        this.configList && this.configList.every(item => {
          if (item.allowBlank !== undefined && !item.allowBlank) {
            switch (item.xtype) {
              // 下拉框类型
              case 'r2Combo':
                warn = !item.inputValue[0] ? `${item.fieldLabel || ''}不能为空` : '';
                break;
              case 'r2Selector':
                warn = !item.inputValue ? `${item.fieldLabel || ''}不能为空` : '';
                break;
              default:
                warn = !item.inputValue ? `${item.fieldLabel || ''}不能为空` : '';
                break;
            }
          }
          if (item.xtype === 'r2Grid') {
            let gridWarn = this.$refs.xGrid[0].checkData();
            warn = gridWarn ? gridWarn : warn;
          }
          return !warn;
        });
        return warn;
      },
      // TODO 显示错误提示
      showToastText(test = '') {
        this.showToast = true;
        this.toastText = test;
      },
      // TODO 设置数据，触发视图更新
      setData(index, data) {
        this.$set(this.configList, index, Object.assign(this.configList[index], data));
      }
    },
    created() {
      // 设置用户信息
      contextData.setInfo(this.currentUser);
      // this.getProcess();
      this.handleConfig();
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .dynamic-form-container {
  }
</style>
