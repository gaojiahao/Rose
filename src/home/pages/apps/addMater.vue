<template>
  <div class='childPage'>
    <div class='content'>
      <div class='mater_baseinfo vux-1px-b'>
        <div class='mater_property'>
          <div class='each_property vux-1px-b'>
            <label class="required">物料编码:</label>
            <input type='text' v-model="inventory.inventoryCode" class='property_val'/>
          </div>
          <div class='each_property'>
            <label class="required">物料名称:</label>
            <input type='text' v-model="inventory.inventoryName" class='property_val'/>
          </div>
        </div>
        <div class='mater_pic vux-1px-l'>
          <input type="file" name="file" id='file' @change="uploadFile" accept="image/*" style="display:none;"/>
          <div class='add_icon' v-if='!picShow'>
            <label for="file"></label>
            <div class='upload'>
              <span class='iconfont icon-icon'></span>
              <span class='add_text'>增加图片</span>
            </div>
          </div>
          <div class='add_icon' v-else>
            <label for="file"></label>
            <img :src='matPic' class='upload'/>
          </div>
        </div>
      </div>
      <r-picker title="加工属性:" :data="matNatureList" value="inventory.processing" v-model="inventory.processing"
                :required="true" @on-change="natureChange"></r-picker>
      <r-picker title="材料大类:" :data="matBigList" value="inventory.inventoryType" v-model="inventory.inventoryType"
                @on-change="bigChange"></r-picker>
      <r-picker title="材料子类:" :data="matSmlList" value="inventory.inventorySubclass"
                v-model="inventory.inventorySubclass"></r-picker>
      <div class='each_property vux-1px-b'>
        <label>型号规格:</label>
        <input type='text' v-model="inventory.specification" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>颜色:</label>
        <input type='text' v-model="inventory.inventoryColor" class='property_val'/>
      </div>
      <div class='each_property vux-1px-b'>
        <label>主材质:</label>
        <input type='text' v-model="inventory.material" class='property_val'/>
      </div>
      <!--<div class='each_property vux-1px-b'>
        <label>主计量单位:</label>
        <input type='text' v-model="inventory.measureUnit" class='property_val'/>
      </div>-->
      <r-picker title="主计量单位:" :data="measureList" value="inventory.measureUnit" :required="true"
                v-model="inventory.measureUnit"></r-picker>
    </div>
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
    <loading :show="showLoading"></loading>
  </div>
</template>
<script>
  import {TransferDom, Picker, Popup, Group, AlertModule} from 'vux';
  import Loading from './../components/Loading'
  import RPicker from './../components/RPicker';
  import common from './../mixins/common'
  import {
    save,
    update,
    findData,
    upload,
    getDictByType,
    getDictByValue,
    getBaseInfoData
  } from './../../service/materService';

  export default {
    data() {
      return {
        listId: '78a798f8-0f3a-4646-aa8b-d5bb1fada28c',
        biReferenceId: '',
        matPic: '', // 图片地址
        matNatureList: [], // 加工属性列表
        matBigList: [], // 材料大类列表
        matSmlList: [], // 材料子类列表
        measureList: [], // 主计量单位列表
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
          safeStock: '', // 安全库存
          nearKeepingDays: 1, // 临保天数
          inventoryStatus: '1', // 物料状态
          inventoryPic: '',
          comment: '' // 物料说明
        },
        transCode: '',
        hasDefault: false, // 判断是否为回写
        imgFileObj: {}, // 上传的图片对象
        imgFile: null,
        showLoading: false,
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
      Loading,
    },
    methods: {
      preloadFile(e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        this.imgFile = file;
        reader.onload = (evt) => {
          this.picShow = true;
          this.matPic = evt.target.result;
        };
        reader.readAsDataURL(file);
        // this.uploadFile();
      },
      // TODO 选择、预览图片
      uploadFile(e) {
        let file = e.target.files[0];
        if (!file) {
          return
        }
        return upload({
          file: file,
          // biReferenceId: this.biReferenceId
        }).then(res => {
          let {success = false, message = '上传失败', data} = res;
          let [detail = {}] = data;
          this.picShow = true;
          // this.preloadFile(e);
          this.matPic = `/H_roleplay-si/ds/download?url=${detail.attacthment}`;
          this.inventory.inventoryPic = detail.attacthment;
          // this.biReferenceId = detail.biReferenceId
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        });
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
      // TODO 提交/修改物料
      save() {
        let requiredMap = {
          inventoryCode: '物料编码',
          inventoryName: '物料名称',
          processing: '加工属性',
          measureUnit: '主计量单位',
        };
        let submitData = {
          listId: this.listId,
          // biReferenceId: this.biReferenceId,
          formData: {
            baseinfo: this.baseinfo,
            inventory: this.inventory
          }
        };
        let operaction = save;
        let warn = '';
        Object.entries(requiredMap).every(([key, msg]) => {
          if (!this.inventory[key]) {
            warn = `${msg}不能为空`;
            return false;
          }
          return true;
        });
        if (warn) {
          AlertModule.show({
            content: warn,
          });
          return
        }
        // 修改
        if (this.transCode) {
          operaction = update;
          submitData.formData.effectiveTime = this.changeDate(new Date(), true);
        }
        this.showLoading = true;
        operaction(submitData).then(data => {
          this.showLoading = false;
          let {success = false, message = '提交失败'} = data;
          AlertModule.show({
            content: message,
            onHide: () => {
              if (success) {
                this.$router.go(-1);
              }
            }
          });
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        });
      },
      // TODO 查询物料详情
      findData() {
        return findData(this.transCode).then(({formData = {}, attachment = []}) => {
          let {baseinfo = {}, inventory = {}} = formData;
          this.hasDefault = true;
          this.baseinfo = {...this.baseinfo, ...baseinfo,};
          this.inventory = {...this.inventory, ...inventory,};
          // this.biReferenceId = this.inventory.referenceId;
          if (this.inventory.inventoryPic) {
            this.picShow = true;
            this.matPic = `/H_roleplay-si/ds/download?url=${this.inventory.inventoryPic}`;
          }
          let [imgFileObj = {}] = attachment.filter(item => {
            return item.attacthment === this.inventory.inventoryPic
          });
          this.imgFileObj = imgFileObj;
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        });
      },
      // TODO 获取加工属性列表
      getNature() {
        return getDictByType({
          type: 'processing',
        }).then(data => {
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
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 获取材料大类
      getBig() {
        let [selected = {}] = this.matNatureList.filter(item => {
          return item.name === this.inventory.processing
        });
        return getDictByValue({
          value: selected.originValue
        }).then(data => {
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
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 获取材料子类
      getSml() {
        let [selected = {}] = this.matBigList.filter(item => {
          return item.name === this.inventory.inventoryType
        });
        return getDictByValue({
          value: selected.originValue
        }).then(data => {
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
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 获取主计量单位列表
      getMeasure() {
        return getDictByType({
          type: 'measureUnit',
        }).then(data => {
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
          AlertModule.show({
            content: e.message,
          })
        })
      },
      // TODO 获取用户基本信息
      getBaseInfoData() {
        return getBaseInfoData().then(data => {
          this.baseinfo = {
            ...this.baseinfo,
            ...data,
            activeTime: this.changeDate(new Date(), true),
          }
        }).catch(e => {
          AlertModule.show({
            content: e.message,
          })
        });
      },
    },
    created() {
      this.showLoading = true;
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
          this.hasDefault = false;
          Promise.all(requestPromise).then(() => {
            this.showLoading = false;
          })
        })();
        return
      }
      requestPromise.push(this.getNature().then(data => {
        let [defaultSelect = {}] = data;
        this.inventory.processing = defaultSelect.name
      }));
      requestPromise.push(this.getMeasure());
      requestPromise.push(this.getBaseInfoData());
      Promise.all(requestPromise).then(() => {
        this.showLoading = false;
      })
    }
  }
</script>
<style lang="scss" scoped>
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
      .mater_pic {
        .add_icon {
          position: relative;
          label {
            display: block;
            width: 1.2rem;
            height: 1.2rem;
          }
          .upload {
            width: 1.2rem;
            height: 1.2rem;
            position: absolute;
            left: 0;
            top: 0;
            z-index: -999;
            span {
              display: block;
              text-align: center;
            }
            .iconfont {
              font-size: 0.24rem;
              margin-top: 0.24rem;
            }
          }

        }

        .pic {
          width: 1.2rem;
          height: 1.2rem;
          border: 0;
        }
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
        color: red;
        font-weight: bold;
      }
      .property_val {
        display: block;
        width: 100%;
        font-size: 0.16rem;
        line-height: 0.24rem;
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


