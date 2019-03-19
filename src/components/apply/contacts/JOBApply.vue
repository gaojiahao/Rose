<template>
  <div class='childPage'>
    <div class='content'>
      <div class='each_property vux-1px-b '>
        <label class='required'>职位名称:</label>
        <input type='text' v-model="jobInfo.name" class='property_val'/>
      </div>   
      <r-picker required title="职位类型:" :data="officeTypeList" :value="jobInfo.officeTypeList"
                v-model="jobInfo.functionType">
      </r-picker>
      <r-picker required title="职能:" :data="officeList" :value="jobInfo.office"
                v-model="jobInfo.function">
      </r-picker>
      <r-picker title="职级通道:" :data="rankPassList" :value="jobInfo.rankPass"
                v-model="jobInfo.rankPass" :required='true'>
      </r-picker>
      <r-picker title="职级:" :data="rankList" :value="jobInfo.rank"
                v-model="jobInfo.rank" :required='true'>
      </r-picker>
      <div class='each_property vux-1px-b '>
        <label class='required'>小时成本:</label>
        <input type='text' v-model="jobInfo.hourCost" class='property_val'/>
      </div>   
      <div class='each_property vux-1px-b '>
        <label>职责描述:</label>
        <input type='text' v-model="jobInfo.describe" class='property_val'/>
      </div>
    </div>
    <!--提交按钮-->
    <div class='vux-1px-t btn' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save"  v-html="this.$route.query.id?'保存':'提交'"></div>
    </div>
  </div>
</template>
<script>
// 请求引入
import { save, update, getJobList, getListByValue } from 'service/Directorys/jobService';
// 自定义组件引入
import RPicker from 'components/public/RPicker';
// mixin引入
import common from 'mixins/common';
import { resolve } from 'path';
export default {
  mixins: [common],
  components: { RPicker },
  data() {
    return {
      jobInfo: {                    // 职位信息
        status: 1,
        hourCost: 0.1,
        type: '',
        rank: '',
        rankPass: '',
        function: '',
        functionType: ''           
      },                  
      rankList: [],                 // 职级
      officeList: [],               // 职能
      rankPassList: [],             // 职级通道
      officeTypeList: [],           // 职能类型
      jobId: null,                  // 职位id
    }
  },
  watch: {
    // 监听 <职位类型> - 触发 <职能> 请求
    'jobInfo.functionType'(val) {
      const requestArr = [val, 'officeTypeList', 'officeList', 'function']
      this.handleRequest(requestArr);
    },
    // 监听 <职级通道> - 触发 <职级> 请求
    'jobInfo.rankPass'(val) {
      const requestArr = [val, 'rankPassList', 'rankList', 'rank']
      this.handleRequest(requestArr);
    }
  },
  methods: {
    // 处理 监听提交
    handleRequest(args) {
      /**
       *  @requestType 请求参数
       *  @val 监听获取的数值
       *  @list 级联关系 - 父级数组列表
       *  @childArr 级联关系 - 子级数组列表
       *  @childKey 级联关系 - 子级key
       */ 
      let [ requestType, [val, list, childArr, childKey] ] = [ '', args ];
      
      for (let item of this[list]) {
        if (item.name === val) {
          requestType = item.type;
          break;
        }
      }

      this.getDropList(requestType, childArr, childKey);
    },
    // 提交
    submit() {
      for (let key in this.jobInfo) {
        if (typeof(this.jobInfo[key]) === 'string' && this.jobInfo[key].indexOf(' ')>=0) {
          this.jobInfo[key] = this.jobInfo[key].replace(/\s/g,'');
        }
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          //转化职位类型
          // switch (this.jobInfo.type) {
          //   case '营销类':
          //     this.jobInfo.changeType = 'Y';
          //     break;
          //   case '专业类':
          //     this.jobInfo.changeType = 'Z';
          //     break;
          //   case '技术类':
          //     this.jobInfo.changeType = 'J';
          //     break;
          //   case '操作类':
          //     this.jobInfo.changeType = 'C';
          //     break;
          //   case '管理类':
          //     this.jobInfo.changeType = 'M';
          //     break;
            
          // }
          //转化职位状态
          // switch (this.jobInfo.status) {
          //   case '使用中':
          //     this.jobInfo.changeStatus = 1;
          //     break;
          //   case '未使用':
          //     this.jobInfo.changeStatus = 2;
          //     break;
          //   case '草稿':
          //     this.jobInfo.changeStatus = 3;
          //     break;
          //   case '停用':
          //     this.jobInfo.changeStatus = -1;
          //     break;
          // }
          let submitData = {
            ...this.jobInfo
          };
          //修改
          if (this.jobId) {
            submitData.id = this.jobId;
            update(submitData).then( data => {
              if (data.success) {
                this.$emit('change', true);
                this.$vux.alert.show({
                  content: '修改成功',
                  onHide: () => {
                    this.$router.go(-1);
                  }
                })
              }
              else {
                this.$vux.alert.show({
                  content: data.message
                })
              }
            })
          }
          // 新增
          else {
            save(submitData).then(data=> {
              if (data.id) {
                this.$emit('change', true);
                this.$vux.alert.show({
                  content:'提交成功',
                  onHide: () => {
                    this.$router.go(-1);
                  }

                })
              }
              else {
                this.$vux.alert.show({
                  content:data.message
                })
              }
            })
          }
        }
      })
    },
    // 
    save() {     
      let warn = '';
      let validateMap = [
        {
          key: 'name',
          message: '【职位名称】',
        }, {
          key: 'functionType',
          message: '【职位类型】',
        }, {
          key: 'function',
          message: '【职能】',
        }, {
          key: 'rankPass',
          message: '【职级通道】',
        }, {
          key: 'rank',
          message: '【职级】',
        }, {
          key: 'hourCost',
          message: '【小时成本】',
        }
      ];
      validateMap.every(item => {
        if (!this.jobInfo[item.key]) {
          warn = `${item.message}不能为空`;
          return false
        }
        return true
      });
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      this.submit();     
    },
    // 职位信息
    findData() {
      return getJobList({
        filter: JSON.stringify([{operator:"eq",value:this.jobId,property:"id"}])
      }).then(({tableContent = []}) => {
        tableContent.forEach(item => {
          switch (item.type) {
            case 'Y':
              item.type = '营销类';
              break;
            case 'Z':
              item.type = '专业类';
              break;
            case 'J':
              item.type = '技术类';
              break;
            case 'C':
              item.type = '操作类';
              break;
            case 'M':
              item.type = '管理类';
              break;
              
          }
          switch (item.status) {
            case 1:
              item.status = '使用中';
              break;
            case 2:
              item.status = '未使用';
              break;
            case 3:
              item.status = '草稿';
              break;
            case -1:
              item.status = '停用';
              break;
          }
        })
        this.jobInfo = tableContent[0];
        this.$loading.hide();
      }).catch(e=> {
        this.$loading.hide();
      });
    },
    // 获取 下拉框数据
    getDropList(type, arrName, key) {
      return getListByValue({ value: type }).then( data => {
        let [ first ] = data;
        for (let item of data) {
          item.value = item.name;
        }
        // 赋值 对应的列表
        this[arrName] = data;
        // 设置 选项默认值
        this.jobInfo[key] = first.name;
      }) 
    }
  },
  created() {
    this.$loading.show();

    this.getDropList('functionType', 'officeTypeList', 'functionType');
    this.getDropList('rankPass', 'rankPassList', 'rankPass');

    let { query } = this.$route;
    this.listId = query.listId;
    if (query.id) {
      this.jobId = query.id;
      this.findData().then(() => {
        this.$loading.hide();
      }); 
      return  
    }
    // 列表的tab栏如果处于被选中状态 此时点击*新增* 职位类型默认为tab选中值
    if (query.jobType) {
      this.jobInfo.type = query.jobType;
    }
    this.$loading.hide();

  }
}
</script>
<style lang="scss" scoped>
@import '~scss/biz-app/bizApply';
</style>


