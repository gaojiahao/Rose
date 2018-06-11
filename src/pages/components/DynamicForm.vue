<template>
  <div class="dynamic-form-container" ref="dynamicFormContainer">
    <div v-for="(item, index) in configList" :key="index" v-show="!item.hiddenInRun">
      <!-- 普通输入框 -->
      <x-input :title="item.fieldLabel" :required="!item.allowBlank" v-model="item.inputValue" text-align="right"
               :readonly="item.readOnly" v-if="item.xtype === 'r2Textfield'"></x-input>
      <!-- 下拉框 -->
      <popup-picker :title="item.fieldLabel" :data="item.pickerList" :value="item.inputValue"
                    @on-change="popChange(item)" v-model="item.inputValue" :columns="1"
                    v-else-if="item.xtype === 'r2Combo'"></popup-picker>
      <!-- 文本框 -->
      <x-textarea :title="item.fieldLabel" v-model="item.inputValue"
                  v-else-if="item.xtype === 'r2HtmlEditor' || item.xtype === 'r2TextArea'"></x-textarea>
      <x-selector :title="item.fieldLabel" :data="item.selectorList" v-model="item.inputValue"
                  @on-change="selecterChange(item)" :sel-value="item.inputValue"
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
  import {Group, PopupPicker, XInput, XTextarea, Confirm, TransferDom, Toast, Cell, Popup, Datetime} from 'vux'
  import XSelector from './XSelector'
  // import XGrid from './XGrid'
  import UserEvent from './../../plugins/userEvent'

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
      userInfo: {
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
        showLoading: true, // loading框
        uniqueId: '',
        listid: '',
        procCode: '', // 编码
        configList: [], // 配置列表
        showToast: false, // 是否展示toast
        toastText: '', // 警告提示
        configScroll: null, // 滚动容器
        comment: '', // 原因
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
            default:
              this.handleDefault(item, index);
              break;
          }
          // console.log(`${item.fieldLabel}---${item.name}---${item.xtype}---${item.defaultValue}`);
        });
        this.needListeners.forEach(listner => {
          console.log(listner.value.contrl)
          this.$parent.$parent.config.forEach((lItem, lIndex) => {
            lItem.items && lItem.items.forEach((citem, index) => {
              if (citem.id === listner.value.contrl) {
                this.$nextTick(() => {
                  let type = `userevent-${citem.id}`;
                  let userEvent = new UserEvent(this.$refs.dynamicFormContainer, type);
                  userEvent.on((e) => {
                    listner.handler(e);
                  });
                  this.$emit('addlistener', {
                    type,
                    lIndex,
                    index,
                    userEvent
                  });
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
            Object.entries(dataSource.data.params).forEach(([key, value]) => {
              switch (value.type) {
                case 'contrl':
                  // 获取父级的数据
                  this.needListeners.push({
                    value: value.value,
                    handler: (e) => {
                      createService.getRemoteData(dataSource.data.url, Object.assign(params, {
                        [value.value.valueField]: e.data[value.value.valueField]
                      })).then(data => {
                        let pickerList = [];
                        data.tableContent && data.tableContent.forEach(picker => {
                          let name = picker.userGroupName;
                          pickerList.push(Object.assign(picker, {
                            name: name,
                            value: name
                          }));
                        });
                        this.setData(index, {pickerList});
                      });
                    }
                  });
                  break;
                default:
                  params[key] = value.value;
                  break;
              }
            });
            createService.getRemoteData(dataSource.data.url, params).then(data => {
              let pickerList = [];
              data.tableContent && data.tableContent.forEach(picker => {
                let name = picker.unitName;
                pickerList.push(Object.assign(picker, {
                  name: name,
                  value: name
                }));
              });
              this.setData(index, {pickerList});
            });
            break;
          default:
            break;
        }
      },
      // TODO 处理选择器
      handleSelector(item, index) {
        item.selectorList = [];
        item.inputValue = {};
        let hasRemote = false; // 判断是否从请求获取数据
        let params = {};
        let dataSource = JSON.parse(item.dataSource || "{}");
        switch (dataSource.type) {
          case 'remoteData':
            hasRemote = true;
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
                let nickname = this.userInfo.nickname;
                if (hasRemote) {
                  createService.getRemoteData(dataSource.data.url, Object.assign(params, {
                    filter: JSON.stringify([{
                      operator: 'eq',
                      value: nickname,
                      property: 'nickname'
                    }])
                  })).then(data => {
                    this.setData(index, {
                      inputValue: Object.assign(data.tableContent[0], {
                        name: nickname
                      })
                    });
                  })
                } else {
                  item.inputValue = {
                    name: nickname
                  };
                }
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
      // TODO 处理默认数据
      handleDefault(item, index) {
        // 判断是否有默认值
        if (item.defaultValue) {
          let defaultValue = JSON.parse(item.defaultValue || "{}");
          switch (defaultValue.type) {
            case 'contextData':
              break;
            case 'staticData':
              item.inputValue = defaultValue.data[0];
              break;
            default:
              break;
          }
        }
        if (item.dataSource) {
          let source = JSON.parse(item.dataSource || "{}");
          item.inputValue = this.userInfo[source.data.valueField];
        }
      },
      // TODO picker切换
      popChange(item) {
        console.log(item)
      },
      // TODO 选择器切换
      selecterChange(sel) {
        sel.listeners && Object.values(sel.listeners).forEach(item => {
          item.emit(sel.inputValue);
        })
      },
      // TODO 提交数据
      saveData() {
        let submitData = {
          listId: this.listid,
          referenceId: this.guid(),
          // 'transDetail.file': [],
          // $: {},
          transCode: '',
        };
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
                let val = item.inputValue;
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
        submitData.transCode = this.submitTransCode;
        // console.log(submitData)
        createService.saveData({
          entityId: this.userInfo.entityId,
          transCode: this.submitTransCode,
          jsonData: JSON.stringify(submitData),
          wfPara: JSON.stringify({
            [this.procCode]: {
              businessKey: this.submitTransCode,
            }
          })
        }).then(data => {
          this.showLoading = false;
          // 从返回数据获取表单编码
          let matchCode = data.message.match(/【(.)+】/gi);
          this.transCode = matchCode ? matchCode[0].replace(/[【】]/g, '') : '';
          // 提交编码为null则说明提交失败
          if (this.transCode.indexOf('null') === -1) {
            this.showToastText('提交成功');
          } else {
            this.showToastText('提交失败');
          }
        }).catch(e => {
          this.showToastText(e.message);
        })
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
        if (warn) {
          this.showToastText(warn);
        }
      },
      // TODO 显示错误提示
      showToastText(test = '') {
        this.showToast = true;
        this.toastText = test;
      },
      // TODO 设置数据
      setData(index, data) {
        this.$set(this.configList, index, Object.assign(this.configList[index], data));
      }
    },
    created() {
      // this.getProcess();
      this.handleConfig();
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .dynamic-form-container {
  }
</style>
