<template>
<div>
  <div class="duplicate-wrapper" v-for="(item, index) in duplicateConfig" :key="`${item.name}+${index}`">
    <template v-if="!item.hiddenInRun">
      <div class="title" v-if="duplicateData[item.name] && !duplicateData[item.name].length">
      <div class="each_property">
        <label>{{item.title}}</label>
        <span class="add" @click="addMoreUnit(item)">新增</span>
      </div>
    </div>
    <template v-else-if="duplicateData[item.name] &&duplicateData[item.name].length">
      <div class="duplicate-item" :class="{'has_border' : sIndex > 0}" v-for="(sItem, sIndex) in duplicateData[item.name]" :key="sIndex">
        <div v-for="(dItem,dIndex) in item.items" :key="dIndex" :class="{'vux-1px-b': dIndex < item.items.length-1}">
          <!-- 可编辑的字段 -->
          <template v-if="!dItem.readOnly">
            <!-- 下拉框 -->
            <r-picker :title="dItem.text" :data="dItem.remoteData" :value="sItem[dItem.fieldCode]"
                    v-model="sItem[dItem.fieldCode]" :required="!dItem.allowBlank"
                    @on-change="onChange($event, index, dItem, sItem)"
                    v-if="dItem.editorType === 'r2Combo' || dItem.editorType === 'r2Selector'"></r-picker>
            <!-- 输入框（数字） -->
            <div class='each_property ' v-if="dItem.editorType === 'r2Numberfield'">
              <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
              <input type='number' v-model.number="sItem[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
            </div>
            <!-- 输入框（文字） -->
            <div class='each_property' v-if="dItem.editorType === 'r2Textfield'">
              <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
              <input type='text' v-model="sItem[dItem.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
            </div>
            <!-- 日期 -->
            <div class='each_property' v-if="dItem.editorType === 'r2Datefield'" @click="getDate(sItem,dItem)">
              <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
              <div class='picker'>
                <span class='mater_nature'>{{sItem[dItem.fieldCode] || "请选择"}}</span>
                <span class='icon-right'></span>
              </div>
            </div>
          </template>
          <!--不可编辑的字段 -->
          <template  v-else>
            <div class='each_property readOnly'>
              <label :class="{required: !dItem.allowBlank}">{{dItem.text}}</label>
              <span class='property_val'>{{sItem[dItem.fieldCode]}}</span>
            </div>
          </template>
        </div>

      </div>
    </template>
    <div class="add_more" v-show="duplicateData[item.name].length">
      您还需要添加新的{{item.title}}?请点击
      <span class='add' @click="addMoreUnit(item)">新增</span>
      <em v-show="duplicateData[item.name].length > 0">或</em>
      <span class='delete' @click="deleteMoreUnit(item)" v-show="duplicateData[item.name].length > 0">删除</span>
    </div> 
    </template>
    
  </div>
</div>
  
</template>

<script>
import RPicker from 'components/basicPicker';
import { requestData } from 'service/commonService';
export default {
  name: 'duplicateComponent',
  props: {
    config: {
      type: Array,
      default() {
        return []
      }
    },
    defaultValue: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    duplicateConfig() {
      return this.config
    }
  },
  data() {
    return {
      duplicateData : {}
    }
  },
  components: {
    RPicker
  },
  watch: {
    defaultValue: {
      handler(val){
        this.duplicateData = JSON.parse(JSON.stringify(this.defaultValue))
      },
      deep : true
    },
    // 监听当前的重复项数据，若发生改变，通知父组件修改
    duplicateData: {
      handler(val){
        let defaultData = JSON.stringify(this.defaultValue), currentData = JSON.stringify(val);
        if(currentData !== defaultData){
          this.$emit('input', val)
        }
      },
      deep: true
    }
  },
  methods: {
    // TODO 新增重复项
    addMoreUnit(item) {
      let obj = {};
      item.items.forEach(item => {
        if(!item.hidden){
          obj[item.fieldCode] = ''
        }
      })
      this.duplicateData[item.name].push(obj);
    },
    // TODO 删除重复项
    deleteMoreUnit(item) {
      this.duplicateData[item.name].pop()
    },
    // 选择日期
    getDate(sItem, dItem){
      this.$vux.datetime.show({
        value: '', // 其他参数同 props
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: (val)=> {
          sItem[dItem.fieldCode] = val;
        },
      })
    },
    // 选择省市区
    onChange(val, index, dItem, sItem){
      // 选择省，更新市，区数据
      if(dItem.fieldCode === 'deliveryProvince'){
        for(let item of this.duplicateConfig[index].items) {
          // 根据省，重新请求市的数据
          if(item.fieldCode === 'deliveryCity') {
            if(item.requestParams.data.provinceName !== undefined){
              item.requestParams.data.provinceName = val;
            }
            requestData(item.requestParams).then(data => {
              if(data.tableContent){
                if(data.tableContent.length){
                  data.tableContent.forEach(dItem => {
                    dItem.name = dItem[item.displayField];
                    dItem.value = dItem[item.displayField]
                  })
                  sItem.deliveryCity = data.tableContent[0].name;
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
        for(let item of this.duplicateConfig[index].items) {
          // 根据市，重新请求区的数据
          if(item.fieldCode === 'deliveryCounty') {
            item.requestParams.data.cityName = val;
            item.requestParams.data.provinceName = sItem.deliveryProvince;
            requestData(item.requestParams).then(data => {
              if(data.tableContent){
                if(data.tableContent.length){
                  data.tableContent.forEach(dItem => {
                    dItem.name = dItem[item.displayField];
                    dItem.value = dItem[item.displayField];
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
    //输入框获取焦点时内容选中
    getFocus(e){
      event.currentTarget.select();
    }
  }

}
</script>

<style lang="scss" scoped>
 @import '../scss/basicApp.scss';

</style>
