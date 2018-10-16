<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">物料编码:</label>
            <input type='text' :readonly="codeReadOnly" v-model.trim="inventory.inventoryCode" class='property_val' :class='{readonly : codeReadOnly}'/>
          </div>
          <div class='each_property'>
            <label class="required">物料名称:</label>
            <input type='text' v-model.trim="inventory.inventoryName" class='property_val'/>
          </div>
        </div>
        <upload-image :src="MatPic" @on-upload="onUpload" @on-error="getDefaultImg"></upload-image>
      </div>
      <r-picker title="加工属性:" :data="matNatureList" :value="inventory.processing" v-model="inventory.processing"
                :required="true" @on-change="natureChange"></r-picker>
      <r-picker title="材料大类:" :data="matBigList" :value="inventory.inventoryType" v-model="inventory.inventoryType"
                @on-change="bigChange"></r-picker>
      <r-picker title="材料子类:" :data="matSmlList" :value="inventory.inventorySubclass"
                v-model="inventory.inventorySubclass"></r-picker>
      <div class='each_property vux-1px-b'>
        <label>型号规格:</label>
        <input type='text' v-model.trim="inventory.specification" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>颜色:</label>
        <input type='text' v-model.trim="inventory.inventoryColor" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>主材质:</label>
        <input type='text' v-model.trim="inventory.material" class='property_val'/>
      </div>
      <r-picker title="主计量单位:" :data="measureList" :value="inventory.measureUnit" :required="true"
                v-model="inventory.measureUnit"></r-picker>
      <r-picker title="物料状态:" :data="statusList" :value="inventoryStatus" 
                v-model="inventoryStatus"></r-picker>
    </div>
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">{{this.transCode? '保存':'提交'}}</div>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group} from 'vux';
  import RPicker from 'components/RPicker';
  import common from 'mixins/common'
  import {
    save,
    update,
    findData,
  } from 'service/materService';
  import {getBaseInfoDataBase, getDictByType, getDictByValue,} from 'service/commonService';
  import UploadImage from 'components/UploadImage'

  export default {
    data() {
      return {
        listId: '78a798f8-0f3a-4646-aa8b-d5bb1fada28c',
        biReferenceId: '',
        MatPic: '', // 图片地址
        matNatureList: [], // 加工属性列表
        matBigList: [], // 材料大类列表
        matSmlList: [], // 材料子类列表
        measureList: [], // 主计量单位列表
        statusList :[],//物料状态
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
          measureUnit: '', // 主计量单位
          specification: '', // 型号规格
          material: '', // 主材质
          inventoryColor: '', // 颜色
          keepingDays: 1, // 保质期天数
          safeStock: 1, // 安全库存
          nearKeepingDays: 1, // 临保天数
          inventoryStatus: '', // 物料状态
          inventoryPic: '',
          comment: '', // 物料说明
          technicsCode :'' //工艺路线
        },
        invMoreUnit: [],
        invNetWeight: [],
        transCode: '',
        hasDefault: false, // 判断是否为回写
        imgFileObj: {}, // 上传的图片对象
        imgFile: null,
        codeReadOnly: false, // 物料编码是否只读
        submitSuccess: false, // 是否提交成功
        inventoryStatus :'使用中'
      }
    },
    directives: {
      TransferDom
    },
    mixins: [common],
    components: {
      Picker,
      Popup,
      Group,
      RPicker,
      UploadImage,
    },
    methods: {
      // TODO 上传图片成功触发
      onUpload(val){
        this.inventory.inventoryPic = val.src;
      },
      // TODO 加工属性切换
      natureChange(val) {
        if (this.hasDefault) {
          return
        }
        this.getBig().then(data => {
          let [defaultSelect = {}] = data;
          this.inventory.inventoryType = defaultSelect.name;
        });
      },
      // TODO 材料大类切换
      bigChange(val) {
        if (this.hasDefault) {
          return
        }
        this.getSml(val).then(data => {
          let [defaultSelect = {}] = data;
          this.inventory.inventorySubclass = defaultSelect.name;
        });
      },
      getStatus(){
        return getDictByType('objStatus').then(data => {
          //仓库分类无值，请求
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.name;
            item.value = item.name;
          });
          this.statusList = tableContent;
        })
      },
      // TODO 提交/修改物料
      save() {
        let requiredMap = {
          inventoryCode: '物料编码',
          inventoryName: '物料名称',
          processing: '加工属性',
          measureUnit: '主计量单位',
        };
        for(let key in this.inventory){
          if(typeof(this.inventory[key]) === 'string' && this.inventory[key].indexOf(' ')>=0){
            this.inventory[key] = this.inventory[key].replace(/\s/g,'');
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
        if(this.inventory.status){
          delete this.inventory.status
        }
        let submitData = {
          listId: this.listId,
          // biReferenceId: this.biReferenceId,
          formData: {
            baseinfo: this.baseinfo,
            inventory: this.inventory,
            invMoreUnit: this.invMoreUnit.length ? this.invMoreUnit : null,
            invNetWeight: this.invNetWeight.length ? this.invNetWeight : null,
          }
        };
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
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }

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
                message = '物料提交成功';
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
          this.baseinfo = {...this.baseinfo, ...baseinfo,};
          this.inventory = {...this.inventory, ...inventory,};
          this.invMoreUnit = invMoreUnit;
          this.invNetWeight = invNetWeight;
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
      // TODO 获取加工属性列表
      getNature() {
        return getDictByType('processing').then(data => {
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.matNatureList = tableContent;
          return tableContent
        }).catch(e => {
          this.matNatureList = [];
          this.inventory.processing = '';
        })
      },
      // TODO 获取材料大类
      getBig() {
        let [selected = {}] = this.matNatureList.filter(item => {
          return item.name === this.inventory.processing
        });
        return getDictByValue(selected.originValue).then(data => {
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.matBigList = tableContent;
          return tableContent
        }).catch(e => {
          this.matBigList = [];
          this.inventory.inventoryType = '';
        })
      },
      // TODO 获取材料子类
      getSml() {
        let [selected = {}] = this.matBigList.filter(item => {
          return item.name === this.inventory.inventoryType
        });
        return getDictByValue(selected.originValue).then(data => {
          let {tableContent} = data;
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.matSmlList = tableContent;
          return tableContent
        }).catch(e => {
          this.matSmlList = [];
          this.inventory.inventorySubclass = '';
        })
      },
      // TODO 获取主计量单位列表
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
        this.MatPic = require('assets/wl_default02.png');
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
          await this.findData();
          await this.getNature();
          await this.getBig();
          requestPromise.push(this.getSml());
          requestPromise.push(this.getMeasure());
          requestPromise.push(this.getStatus());
          this.hasDefault = false;
          this.codeReadOnly = true;
          Promise.all(requestPromise).then(() => {
            this.$loading.hide();
          })
        })();
        return
      }
      requestPromise.push(this.getNature().then(data => {
        let [defaultSelect = {}] = data;
        this.inventory.processing = this.$route.query.matterType ? this.$route.query.matterType : defaultSelect.name;
      }));
      requestPromise.push(this.getMeasure());
      requestPromise.push(this.getBaseInfoData());
      requestPromise.push(this.getStatus());
      Promise.all(requestPromise).then(() => {
        this.$loading.hide();
      })
    },
    beforeRouteEnter (to, from, next) {
      // 修改title
      to.meta.title = '新增物料';
      if(to.query.transCode){
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
  .vux-1px-b:after, .vux-1px-l:before {
    border-color: #e8e8e8;
    color: #e8e8e8;
  }

  .content {
    height: 90%;
    overflow-y: auto;
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
      .readonly{
        color:#999;
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


