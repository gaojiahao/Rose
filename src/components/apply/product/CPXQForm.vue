<template>
  <div class='childPage'>
    <div class="content" ref="fill">
      <div class="wrapper">
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">标题:</label>
            <input type='text' v-model.trim="formData.demandTitle" class='property_val'/>
            <div></div>
          </div>
        </div>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">描述:</label>
            <input type='text' v-model.trim="formData.demandDescribe" class='property_val'/>
          </div>
        </div>
        <r-picker title="大类:" :data="typeList" :value="formData.demandType"
                  @on-change="typeChange" v-model="formData.demandType" required></r-picker>
        <r-picker title="子类:" :data="subList" :value="formData.demandSubclass"
                  v-model="formData.demandSubclass" required></r-picker>
        <div class='mater_property' @click="getDate">
          <div class='each_property vux-1px-b'>
            <label class="required">规划:</label>
            <div class='property_val'>{{formData.demandPlan}}</div>
          </div>
        </div>
        <r-picker title="流程状态:" :data="statusList" :value="formData.processStatus"
                  v-model="formData.processStatus" required></r-picker>
        <r-picker title="按期信心指数:" :data="confidenceList" :value="formData.timeConfidenceIndex"
                  v-model="formData.timeConfidenceIndex" required></r-picker>
        <r-picker title="被授权团队:" :data="authorizedList" :value="formData.authorizedTeam"
                  v-model="formData.authorizedTeam"></r-picker>
        <r-picker title="版本:" :data="versionList" :value="formData.demandVersion"
                  v-model="formData.demandVersion"></r-picker>
        <upload-file @on-upload="onUploadFile" :contain-style="uploadStyle"></upload-file>
      </div>
    </div>
    <div class='btn vux-1px-t' :class="{'btn_hide' : btnIsHide}">
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import RPicker from 'components/RPicker';
  // 请求 引入
  import {
    submitAndCalc,
    updateAndCalc,
    saveAndStartWf,
    saveAndCommitTask,
    getDictByType,
    getDictByValue
  } from 'service/commonService'
  import { getAuthorizedList } from 'service/listService'
  import { getSOList } from 'service/detailService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  const DRAFT_KEY = 'CPXQ_DATA';
  export default {
    name: 'ApplyCPXQForm',
    data() {
      return {
        listId: 'b30f4d3e-b23d-11e8-96a5-005056a136d0',
        typeList: [],
        subList: [],
        statusList: [],
        confidenceList: [],
        authorizedList: [],
        versionList: [],
        formViewUniqueId: 'b018ef18-f0d1-41a8-985e-29de19e6b705',
        formData: {
          biId: '',
          demandTitle: '', // 标题
          demandDescribe: '', // 描述
          demandType: '', // 大类
          demandSubclass: '', // 子类
          demandPlan: '', // 规划
          processStatus: '', // 流程状态
          timeConfidenceIndex: '', // 按期信息指数
          authorizedTeam: '', // 被授权团队
          demandVersion: '', // 版本
          biComment: '', // 备注
        },
        hasDefault: false,
        biReferenceId: '',
        uploadStyle : {
          width : '100%',
          padding : '0.05rem 0.08rem',
          margin : '0 auto'
        }
      }
    },
    mixins: [ApplyCommon],
    components: {
      RPicker,
    },
    methods: {
      // TODO 提交/修改物料
      save () {
        let requiredMap = {
          demandTitle: '标题',
          demandDescribe: '描述',
          demandType: '大类',
          demandSubclass: '子类',
          demandPlan: '规划',
          processStatus: '流程状态',
          timeConfidenceIndex: '按期信息指数',
        };
        for (let key in this.formData) {
          if (typeof(this.formData[key]) === 'string' && this.formData[key].indexOf(' ') >= 0) {
            this.formData[key] = this.formData[key].replace(/\s/g, '');
          }
        }

        let warn = '';
        !warn && Object.entries(requiredMap).every(([key, msg]) => {
          if (!this.formData[key]) {
            warn = `${msg}不能为空`;
            return false;
          }
          return true;
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }

        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            let operation = submitAndCalc;
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify({
                handlerEntity: this.entity.dealerName,
                ...this.formData
              }),
            };

            if (this.transCode) {
              operation = updateAndCalc;
              submitData.biReferenceId = this.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 设置规划时间
      getDate () {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.formData.demandPlan,
          onConfirm: (value) => {
            this.formData.demandPlan = value;
          }
        })
      },
      // TODO 获取用户数据
      getFormData () {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode: this.transCode
        }).then(data => {
          let {success = true, formData = {}, biReferenceId = ''} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          this.hasDefault = true;
          this.biReferenceId = biReferenceId;
          this.formData = {
            ...this.formData,
            ...formData
          };

          this.$loading.hide();
        })
      },
      // TODO 请求大类、流程状态、信心指数列表数据
      getDictByType (type = 'bigType', key = 'typeList') {
        return getDictByType(type).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.value = item.name;
          });
          this[key] = tableContent;
        })
      },
      // TODO 获取子类列表
      getSubList () {
        let matched = this.typeList.find(item => item.value === this.formData.demandType);
        return getDictByValue(matched.type).then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.value = item.name;
          });
          this.subList = tableContent;

          // 回写时不设置默认值
          if (this.hasDefault) {
            this.hasDefault = false;
            return
          }
          let [first = {}] = tableContent;
          this.formData.demandSubclass = first.value;
        }).catch(e => {
          this.hasDefault = false;
        })
      },
      // TODO 获取授权团队列表
      getAuthorizedList () {
        return getAuthorizedList().then(({tableContent = []}) => {
          tableContent.forEach(item => {
            item.name = item.groupName;
            item.value = item.groupName;
          });
          this.authorizedList = tableContent;
        })
      },
      // TODO 大类切换
      typeChange () {
        this.subList = [];
        this.getSubList()
      },
      // TODO 请求picker数据
      initRequest () {
        let promises = [];
        promises.push(this.getDictByType('bigType', 'typeList'));
        promises.push(this.getDictByType('processStatus', 'statusList'));
        promises.push(this.getDictByType('timeConfidenceIndex', 'confidenceList'));
        promises.push(this.getDictByType('demandVersion', 'versionList'));
        promises.push(this.getAuthorizedList());
        return Promise.all(promises);
      },
      // TODO 是否保存草稿
      hasDraftData () {
        let formData = this.formData;
        if (formData.demandTitle || formData.demandDescribe || formData.demandType || formData.processStatus || formData.timeConfidenceIndex) {
          return {
            [DRAFT_KEY]: {
              formData: this.formData,
            }
          };
        }
        
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  .pages {
    background: #fff;
    z-index: 10;
  }

  .childPage {
    height: 100%;
  }

  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }

  .content {
    height: 90%;
    overflow: hidden;
    .mater_baseinfo {
      display: flex;
      align-items: flex-end;
      .mater_property {
        flex: 1;
      }
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
        min-height: .24rem;
        line-height: 0.24rem;
        border: none;
        outline: none;
        font-size: 0.16rem;
      }
      .readonly {
        color: #999;
      }
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
    &.btn_hide {
      display: none;
    }
  }
</style>
