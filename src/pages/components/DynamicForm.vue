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
      <!-- 选择器 -->
      <x-selector :title="item.fieldLabel" :data="item.selectorList" v-model="item.inputValue"
                  @on-change="selectorChange(item, index)" :sel-value="item.inputValue"
                  v-else-if="item.xtype === 'r2Selector'"></x-selector>
      <!-- 表格类型 -->
      <x-grid :title="item.fieldLabel" :data="item.gridList" v-model="item.inputValue" ref="xGrid"
              v-else-if="item.xtype === 'r2Grid'"></x-grid>
      <!-- 日期类型 -->
      <datetime :title="item.fieldLabel" v-model="item.inputValue" format="YYYY-MM-DD"
                v-else-if="item.xtype === 'r2Datefield'"></datetime>
    </div>
  </div>
</template>

<script>
  import createService from './../../service/createService'
  import {
    Group,
    PopupPicker,
    XInput,
    XTextarea,
    TransferDom,
    Cell,
    Datetime,
  } from 'vux'
  import XSelector from './XSelector'
  import XGrid from './XGrid'
  import UserEvent from './../../plugins/userEvent'
  import contextData from './../map/contextData'

  export default {
    name: "DynamicForm",
    props: {
      // 配置数据
      config: {
        type: Array,
        default() {
          return []
        }
      },
      // 用户数据
      currentUser: {
        type: Object,
        default() {
          return {}
        }
      },
      // 判断是否为最后一个表单
      lastIndex: {
        type: Boolean,
        default: false
      }
    },
    directives: {TransferDom},
    components: {Group, PopupPicker, XInput, XTextarea, Cell, XSelector, XGrid, Datetime},
    data() {
      return {
        configList: [], // 配置列表
        needListeners: [], // 监听列表
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
            // 选择器类型
            case 'r2Selector':
              this.handleSelector(item, index);
              break;
            // 表格
            case 'r2Grid':
              this.handleGrid(item, index);
              break;
            // 数字输入框
            case 'r2Numberfield':
              this.handleNumber(item, index);
              break;
            //  默认处理文本输入框
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
                  let type = `userevent-${cItem.id}`; // 监听类型
                  let userEvent = new UserEvent(this.$refs.dynamicFormContainer, type);
                  userEvent.on((e) => {
                    listner.handler(e);
                  });
                  // 触发父级方法，添加事件监听
                  this.$emit('addlistener', {type, lIndex, index, userEvent});
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
        let {displayField, valueField} = item; // 展示的key和value的key
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
          // 需要请求数据
          case 'remoteData':
            let hasContrl = false; // 判断是否依赖其他组件
            let params = {};
            // 处理请求
            let requestRemote = () => {
              let pickerList = [];
              createService.getRemoteData(dataSource.data.url, params).then(data => {
                let firstVal = [];
                // 处理picker的展示列表
                data.tableContent && data.tableContent.forEach(picker => {
                  pickerList.push(Object.assign(picker, {
                    name: picker[displayField],
                    value: picker[valueField]
                  }));
                });
                // 判断是否有数据，有数据则取第一个值作为默认值
                firstVal = pickerList[0] && pickerList[0].name;
                this.setData(index, {
                  pickerList,
                  inputValue: firstVal ? [firstVal] : []
                });
              }).catch(e => {
              });
            };
            // 判断传值中是否需要依赖其他组件
            Object.entries(dataSource.data.params).forEach(([key, value]) => {
              switch (value.type) {
                case 'contrl':
                  hasContrl = true; // 有依赖组件
                  let {contrl, valueField} = value.value;
                  // 增加监听操作
                  this.needListeners.push({
                    contrl: contrl,
                    handler: (e) => {
                      Object.assign(params, {
                        [key]: e.data.value[valueField] // valueField与外层valueField不同
                      });
                      requestRemote();
                    }
                  });
                  break;
                default:
                  params[key] = value.value;
                  break;
              }
            });
            // 判断是否依赖其他组件，如果依赖，则不请求
            !hasContrl ? requestRemote() : '';
            break;
          default:
            break;
        }
        // 下拉框的默认值与选中值相同时不触发on-change事件，先注释掉，不做默认值处理
        /*if (item.defaultValue) {
          let defaultValue = JSON.parse(item.defaultValue || "{}");
          let inputValue = [];
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
        }*/
      },
      // TODO 处理选择器
      handleSelector(item, index) {
        item.selectorList = [];
        item.inputValue = {};
        let params = {};
        let dataSource = JSON.parse(item.dataSource || "{}");
        let {displayField, valueField} = item;
        switch (dataSource.type) {
          case 'remoteData':
            Object.entries(dataSource.data.params).forEach(([key, value]) => {
              params[key] = value.value;
            });
            createService.getRemoteData(dataSource.data.url, params).then(data => {
              let selectorList = [];
              data.tableContent && data.tableContent.forEach(sel => {
                selectorList.push(Object.assign(sel, {
                  name: sel[displayField],
                  value: sel[valueField],
                }))
              });
              this.setData(index, {
                selectorList,
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
          let name = '';
          switch (defaultValue.type) {
            case 'contextData': // 从用户信息中获取
              name = contextData.getContext(defaultValue.data);
              break;
            default:
              break;
          }
          this.setData(index, {
            inputValue: Object.assign({}, this.currentUser, {
              name: name,
              value: this.currentUser[valueField],
            })
          });
        }
      },
      // TODO 处理表格数据
      handleGrid(item, index) {
        item.gridList = item.columns || [];
        item.inputValue = {};
      },
      // TODO 处理数字输入框
      handleNumber(item, index) {
        if (item.r2Bind) {
          let r2Bind = JSON.parse(item.r2Bind || "{}");
          let valueKey = r2Bind.value.replace(/[{}]/g, ''); // 获取计算规则的key，如{ZSHJValue}
          let r2Binds = r2Bind[valueKey].match(/\('[^\)]*'\)/g); // 获取括号中的值(含括号)，如["('FJSL.value')", "('FJJJ.value')"]
          let computeParams = {}; // 存储计算数值
          // 组装计算对象，如{FJSL: 0, FJJJ: 0}
          r2Binds && r2Binds.forEach(item => {
            // 匹配每个计算项
            let key = item.replace(/[\('\)\.value]/g, '');
            computeParams[key] = 0;
          });

          // 增加监听操作
          this.needListeners.push({
            computeParams,
            handler: (e) => {
              try {
                let {reference, value} = e.data;
                let computeStr = r2Bind[valueKey];
                computeParams[reference] = value;
                Object.entries(computeParams).forEach(([cKey, cValue]) => {
                  // 将值转换为可计算的字符串
                  computeStr = computeStr.replace(`get('${cKey}.value')`, cValue);
                });
                // 设置计算后的值
                this.setData(index, {
                  inputValue: eval(computeStr)
                })
              } catch (e) {
                this.setData(index, {
                  inputValue: 0
                })
              }
            }
          });
        }
      },
      // TODO 处理默认数据
      handleDefault(item, index) {
        if (item.dataSource) {
          let dataSource = JSON.parse(item.dataSource || "{}");
          switch (dataSource.type) {
            case 'formData':
              let {valueField} = dataSource.data;
              // 增加监听操作
              this.needListeners.push({
                contrl: dataSource.data.contrl,
                handler: (e) => {
                  item.inputValue = e.data.value[valueField] || '';
                }
              });
              item.inputValue = this.currentUser[valueField];
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
        input.listeners && Object.values(input.listeners).forEach(item => {
          item.emit({
            reference: input.reference,
            value: input.inputValue
          });
        })
      },
      // TODO picker切换
      popChange(picker, index) {
        let pickerItem = {};
        let val = picker.inputValue[0];
        // 通过选中值获取选中项
        picker.pickerList && picker.pickerList.every(p => {
          if (p.value === val) {
            pickerItem = Object.assign({}, p);
            return false;
          }
          return true;
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
      selectorChange(selector, index) {
        selector.listeners && Object.values(selector.listeners).forEach(item => {
          item.emit({
            value: selector.inputValue
          });
        });
        this.setData(index, {
          inputValue: selector.inputValue
        });
      },
      // TODO 生成随机串
      guid() {
        let S4 = () => {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
      },
      // TODO 判断对象是否为空
      isEmptyObject(obj) {
        if (typeof obj !== 'object') {
          return false;
        }
        return Object.keys(obj).length === 0;
      },
      // TODO 检查数据
      checkData() {
        let warn = '';
        this.configList && this.configList.every(item => {
          if ((item.allowBlank !== undefined && !item.allowBlank) || item.columns) {
            switch (item.xtype) {
              // 下拉框类型
              case 'r2Combo':
                warn = !item.inputValue[0] ? `${item.fieldLabel || ''}不能为空` : '';
                break;
              case 'r2Selector':
                warn = this.isEmptyObject(item.inputValue) ? `${item.fieldLabel || ''}不能为空` : '';
                break;
              case 'r2Grid':
                let xGrid = this.$refs.xGrid;
                xGrid && xGrid.every(item => {
                  warn = item.checkData();
                  return !warn;
                });
                break;
              default:
                warn = !item.inputValue ? `${item.fieldLabel || ''}不能为空` : '';
                break;
            }
          }
          return !warn;
        });
        return warn;
      },
      // TODO 提交数据
      getSaveData() {
        let submitData = {};
        let wfData = {};
        this.configList && this.configList.forEach(item => {
          if (item.submitValue) {
            // 通过切割名字获取source和key
            let [source, businesskey] = item.name.split('.');
            let {inputValue, valueField} = item;
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
            switch (item.xtype) {
              // 下拉框类型
              case 'r2Combo':
                let comboData = inputValue[0] || '';
                submitData[source][businesskey] = {
                  text: comboData,
                  selection: {
                    data: {
                      [valueField]: comboData,
                      id: ''
                    }
                  },
                  value: comboData
                };
                break;
              case 'r2Selector':
                let val = inputValue.name;
                submitData[source][businesskey] = val ? {
                  text: val,
                  value: val,
                  selection: {
                    data: inputValue
                  }
                } : {};
                // 处理wfParam要传的参数
                if (item.wfParam) {
                  wfData[item.wfParam] = inputValue.value || '';
                }
                break;
              default:
                submitData[source][businesskey] = inputValue || '';
                // 处理wfParam要传的参数
                if (item.wfParam) {
                  wfData[item.wfParam] = inputValue
                }
                break;
            }
          }
          if (item.xtype === 'r2Grid') {
            console.log(item.inputValue)
            Object.assign(submitData, item.inputValue);
          }
        });
        // console.log(submitData)
        // console.log(wfData)
        return {
          submitData,
          wfData
        }
      },
      // TODO 设置数据，触发视图更新
      setData(index, data) {
        this.$set(this.configList, index, Object.assign({}, this.configList[index], data));
      }
    },
    created() {
      // 设置用户信息
      contextData.setInfo(this.currentUser);
      this.handleConfig();
      if (this.lastIndex) {
        let autoEmit = []; // 需要自动触发的列表
        this.$nextTick(() => {
          // 获取最外层配置数据进行遍历
          this.$parent.$parent.config.forEach((lItem, lIndex) => {
            lItem.items && lItem.items.forEach((cItem, index) => {
              // 判断是否有监听器和默认值，有则添加到自动触发列表
              if (cItem.listeners) {
                switch (cItem.xtype) {
                  case 'r2Combo':
                    cItem.inputValue.length > 0 ? autoEmit.push(cItem) : '';
                    break;
                  case 'r2Selector':
                    !this.isEmptyObject(cItem.inputValue) ? autoEmit.push(cItem) : '';
                    break;
                  default:
                    !cItem.inputValue ? autoEmit.push(cItem) : '';
                    break;
                }
              }
            });
          });
          // 自动触发监听
          autoEmit.forEach(lItem => {
            this.$nextTick(() => {
              lItem.listeners && Object.values(lItem.listeners).forEach(item => {
                item.emit({
                  value: lItem.inputValue
                });
              });
            })
          })
        })
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .dynamic-form-container {
  }
</style>
