<template>
  <group class="x-grid" ref="xGrid">
    <div class="x-grid-container" :class="{'vux-1px-b': lIndex !== listData.length - 1}"
         v-for="(lItem, lIndex) in listData" :key="lIndex">
      <div :class="{'vux-1px-b': index !== lItem.length - 1}" v-for="(item, index) in lItem" v-show="!item.hidden"
           :key="index">
        <popup-picker :title="item.text" :data="item.pickerList" :value="item.inputValue" v-model="item.inputValue"
                      :columns="1" @on-change="popChange(item, lIndex,index)"
                      v-if="item.editorType === 'r2Combo'"></popup-picker>
        <datetime :title="item.text" format="YYYY-MM-DD" v-model="item.inputValue"
                  v-else-if="item.editorType === 'r2Datefield'"></datetime>
        <x-input type="number" :title="item.text" text-align="right" :required="!item.allowBlank"
                 v-model="item.inputValue" :readonly="item.readOnly" @on-change="inputChange(item, lIndex, index)"
                 v-else-if="item.editorType === 'r2Numberfield'"></x-input>
        <x-input :title="item.text" text-align="right" :required="!item.allowBlank" v-model="item.inputValue"
                 :readonly="item.readOnly" v-else-if="item.editorType === 'r2Textfield'"></x-input>
        <!-- 选择器 -->
        <x-selector :title="item.text" v-model="item.inputValue" @on-change="selectorChange(item, lIndex, index)"
                    :sel-value="item.inputValue" :options="item.options"
                    v-else-if="item.editorType === 'r2Selector'"></x-selector>
      </div>
    </div>
    <div class="grid-btn-group">
      <x-button @click.native="addGridItem" mini plain>新增</x-button>
      <x-button type="warn" @click.native="removeGridItem" :disabled="listData.length <= 1" mini plain>删除</x-button>
    </div>
  </group>
</template>

<script>
  import {Group, GroupTitle, Cell, XInput, PopupPicker, Datetime, XButton} from 'vux'
  import XSelector from './XSelector'
  import createService from './../../service/createService'
  import UserEvent from './../../plugins/userEvent'

  export default {
    name: "XGrid",
    props: {
      title: {
        type: String,
        default: ''
      },
      data: {
        type: Array,
        default() {
          return []
        }
      },
      // 合计监听器
      totalListener: {
        type: Object,
        default() {
          return {}
        }
      },
      // 数据模板
      tmp: {
        type: Array,
        default() {
          return []
        }
      },
      index: {
        type: Number,
        default: 0
      },
    },
    components: {Group, GroupTitle, Cell, XInput, PopupPicker, Datetime, XButton, XSelector},
    data() {
      return {
        listData: [], // 展示数据
        needListeners: [], // 监听列表
        lastIndex: 0, // 最新索引
        totalData: [], // 合计值数组
      }
    },
    methods: {
      // TODO 生成模板数据
      copy() {
        let currentIndex = this.lastIndex;
        let template = JSON.parse(JSON.stringify(this.tmp));
        this.needListeners.push([]);
        template = template.map((item, index) => {
          item.inputValue = '';
          switch (item.editorType) {
            case 'r2Combo':
              this.handleCombo(item, currentIndex, index);
              break;
            case 'r2Selector':
              this.handleSelector(item, currentIndex, index);
              break;
            case 'r2Numberfield':
              this.handleNumber(item, currentIndex, index);
              break;
            case 'r2Textfield':
              this.handleText(item, currentIndex, index);
              break;
            default:
              break;
          }
          return item;
        });
        // 设置监听事件
        this.needListeners[currentIndex].forEach(listener => {
          template.forEach((item, index) => {
            // 下拉框级联
            if (item.dataIndex === listener.dataIndex) {
              this.addListener(item, {listener, currentIndex});
            }
            // 输入框计算
            if (listener.computeParams && (item.dataIndex in listener.computeParams)) {
              this.addListener(item, {listener, currentIndex});
            }
          });
        });
        this.listData.push(template);
        this.$emit('add-item', {
          index: this.index,
          template
        });
        this.lastIndex++;
      },
      // TODO 添加事件监听
      addListener(item, options) {
        let {listener, currentIndex} = options;
        this.$nextTick(() => {
          let type = `userevent-${item.dataIndex}-${currentIndex}`;
          let userEvent = new UserEvent(this.$refs.xGrid.$el, type);
          userEvent.on((e) => {
            listener.handler(e);
          });
          !item.listeners ? item.listeners = {} : '';
          item.listeners[type] = userEvent;
        })
      },
      // TODO 处理下拉框
      handleCombo(item, currentIndex, index) {
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
                item.pickerList = pickerList;
                // this.setData(currentIndex, index, {
                //   pickerList,
                //   inputValue: firstVal ? [firstVal] : []
                // });
              }).catch(e => {
              });
            };
            // 判断传值中是否需要依赖其他组件
            Object.entries(dataSource.data.params).forEach(([key, value]) => {
              switch (value.type) {
                case 'contrl':
                  hasContrl = true; // 有依赖组件
                  let {dataIndex, valueField} = value.value;
                  // 匹配取值的key，如["transDetail.var4.extraData"]["unitName"]
                  let valueFieldKey = valueField.replace(`["${dataIndex}.extraData"]`, '').replace(/[\[\"\]]/g, '');
                  // 增加监听操作
                  this.needListeners[currentIndex].push({
                    dataIndex: dataIndex,
                    handler: (e) => {
                      Object.assign(params, {
                        [key]: e.data.value[valueFieldKey] // valueField与外层valueField不同
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
      },
      // TODO 处理选择器
      handleSelector(item, currentIndex, index) {
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
            item.options = {
              url: dataSource.data.url,
              params: Object.assign({}, params),
              displayField,
              valueField
            };
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
              // name = contextData.getContext(defaultValue.data);
              break;
            default:
              break;
          }
        }
      },
      // TODO 处理数字输入框
      handleNumber(item, currentIndex, index) {
        // 判断是否有数据源
        if (item.dataSource) {
          this.handleInputDataSource(item, currentIndex, index);
        }
        // 判断是否有计算表达式
        if (item.expression) {
          item.inputValue = 0;
          // "[transDetail.num1]*[transDetail.num2]"
          let expressions = item.expression.match(/\[[^\[]*\]/g); // 获取括号中的值(含括号)，如["('FJSL.value')", "('FJJJ.value')"]
          let computeParams = {}; // 存储计算数值
          // 组装计算对象，如{'transDetail.num1': 0, 'transDetail.num2': 0}
          expressions && expressions.forEach(item => {
            // 匹配每个计算项
            let key = item.replace(/[\['\]]/g, '');
            computeParams[key] = 0;
          });

          // 增加监听操作
          this.needListeners[currentIndex].push({
            computeParams,
            handler: (e) => {
              try {
                let {dataIndex, value} = e.data;
                let computeStr = item.expression;
                computeParams[dataIndex] = value;
                Object.entries(computeParams).forEach(([cKey, cValue]) => {
                  // 将值转换为可计算的字符串
                  computeStr = computeStr.replace(`[${cKey}]`, cValue);
                });
                let inputVal = eval(computeStr);
                // 设置计算后的值
                item.inputValue = inputVal;
                // 判断当前dataIndex是否与需要获取的合计id相同
                if (item.dataIndex === this.totalListener.id) {
                  this.totalData[currentIndex] = inputVal;
                  this.totalListener.userEvent.emit(this.totalData);
                }

              } catch (e) {
                console.log(e);
                item.inputValue = 0;
              }
            }
          });
        }
      },
      // TODO 处理输入框
      handleText(item, currentIndex, index) {
        // 判断是否有数据源
        if (item.dataSource) {
          this.handleInputDataSource(item, currentIndex, index);
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
      // TODO 处理输入框含dataSource的情况
      handleInputDataSource(item, currentIndex, index) {
        let dataSource = JSON.parse(item.dataSource || "{}");
        switch (dataSource.type) {
          case 'formData':
            let {valueField} = dataSource.data;
            // dataSource指向自己
            if (valueField === item.dataIndex) {
              return;
            }
            let [dataIndex, valueKey] = valueField.match(/\[[^\[]*\]/g) || []; // 匹配中括号
            valueKey = valueKey && valueKey.replace(/[\['"\]]/g, '');
            dataIndex = dataIndex && dataIndex.replace(/[\['"\]]/g, '').replace('.extraData', '');
            // 增加监听操作
            this.needListeners[currentIndex].push({
              dataIndex,
              handler: (e) => {
                item.inputValue = e.data.value[valueKey] || '';
              }
            });
            // item.inputValue = this.currentUser[valueField];
            break;
          default:
            break;
        }
      },
      // TODO picker切换
      popChange(picker, currentIndex, index) {
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
        /*this.setData(currentIndex, index, {
          inputValue: picker.inputValue
        });*/
      },
      selectorChange(selector, currentIndex, index) {
        selector.listeners && Object.values(selector.listeners).forEach(item => {
          item.emit({
            value: selector.inputValue
          });
        });
        /*this.setData(index, {
          inputValue: selector.inputValue
        });*/
      },
      // TODO 文本框修改值
      inputChange(input) {
        input.listeners && Object.values(input.listeners).forEach(item => {
          item.emit({
            dataIndex: input.dataIndex,
            value: input.inputValue
          });
        })
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
      // TODO 校验数据
      checkData() {
        let warn = '';
        let submitData = [];
        let gridKey = '';
        this.listData && this.listData.every(lItem => {
          let submitItem = {};
          lItem.every(item => {
            console.log(`${item.text}---${item.allowBlank}---${item.inputValue}`);
            // 通过切割dataIndex获取source和key
            let [source, businesskey] = item.dataIndex.split('.');
            let {allowBlank, text, editorType, inputValue, valueField, submitValue} = item;
            gridKey = !gridKey ? source : gridKey;
            if (businesskey === 'id') {
              // 生成随机id
              submitItem[businesskey] = this.guid();
              return true
            }
            // 校验
            if (allowBlank !== undefined && !allowBlank) {
              switch (item.editorType) {
                // 下拉框类型
                case 'r2Combo':
                  warn = !inputValue[0] ? `${text || ''}不能为空` : '';
                  break;
                case 'r2Selector':
                  warn = this.isEmptyObject(inputValue) ? `${text || ''}不能为空` : '';
                  break;
                default:
                  warn = !inputValue ? `${text || ''}不能为空` : '';
                  break;
              }
            }
            // 赋值
            if (submitValue) {
              switch (editorType) {
                case 'r2Combo':
                  let comboData = inputValue[0] || '';
                  submitItem[businesskey] = {
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
                  break;
                default:
                  submitItem[businesskey] = inputValue || '';
                  break;
              }
            }
            return !warn;
          });
          submitData.push(submitItem);
          return !warn;
        });
        if (!warn) {
          this.$emit('input', {
            [gridKey]: submitData
          })
        }
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
            Object.assign(submitData, item.inputValue);
          }
        });
        return {
          submitData,
          wfData
        }
      },
      // TODO 增加表格项
      addGridItem() {
        this.totalData.push(0);
        this.copy();
      },
      // TODO 删除表格项
      removeGridItem() {
        if (this.listData.length > 1) {
          // 删除最后一个合计值
          this.totalData.pop();
          this.totalListener.userEvent.emit(this.totalData);

          this.listData.pop();
          this.$emit('remove-item', {
            index: this.index,
          });
          this.needListeners.pop();
          this.lastIndex--;
        }
      },
      // TODO 设置数据，触发视图更新
      setData(currentIndex, index, data) {
        this.$set(this.listData[currentIndex], index, Object.assign({}, this.listData[currentIndex][index], data));
      }
    },
    created() {
      this.addGridItem();
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .x-grid {
    .title {
      display: flex;
      justify-content: space-between;
    }
    .weui-cells {
      margin-top: 0;
    }
    .x-grid-container {
      padding: 0 5px;
      &.vux-1px-b {
        &:after {
          left: 0;
        }
      }
    }
    .grid-btn-group {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px 0;
      color: blue;
      .weui-btn {
        margin: 0 .1rem;
      }
    }
  }
</style>
