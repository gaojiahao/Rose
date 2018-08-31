<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 用户地址和基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div class="no-selected" v-if="!dealerInfo">
            <div class="title">客户列表</div>
            <div class="mode">请选择客户</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
          <div v-else>
            <div class="user_info">
              <span class="user_name">{{dealerInfo.dealerName || ''}}</span>
            </div>
            <div class="cp_info">
              <span class="user_tel" v-if="dealerInfo.dealerMobilePhone">{{dealerInfo.dealerMobilePhone}}</span>
              <span class="user_tel" v-if="dealerInfo.dealerPhone">{{dealerInfo.dealerPhone}}</span>
              <p class="cp_ads">
                {{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
            </div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="30"></x-icon>
          </div>
        </div>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="drDealerPaymentTerm"
                           v-model="drDealerPaymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="formData.drDealerLogisticsTerms"
                           v-model="formData.drDealerLogisticsTerms"></pop-single-select>
        <!-- 有效期至 -->
        <div class="or_ads mg_auto box_sd" @click="clickDateSelect">
          <p class="title">有效期至</p>
          <p class="mode">{{this.formData.validUntil || '请选择有效期'}}</p>
          <span class="iconfont icon-gengduo"></span>
        </div>
        <!-- 物料列表 -->
        <div class="materiel_list mg_auto box_sd">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="tips">请选择物料</div>
              <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
            </div>
          </template>
          <!-- 已经选择了物料 -->
          <template v-else>
            <div class="title" @click="showDelete">
              <div>物料列表</div>
              <div class='edit' v-if='!matterModifyClass'>编辑</div>
              <div class='finished' v-else>完成</div>
            </div>
            <div class="mater_list">
              <div class="each_mater" :class="{mater_delete : matterModifyClass}" v-for="(item, index) in matterList" :key='index'>
                <div class="each_mater_wrapper" @click="delClick(index,item)">
                  <div class="mater_img">
                    <img :src="item.inventoryPic" alt="mater_img" @error="getDefaultImg(item)">
                  </div>
                  <div class="mater_main">
                    <!-- 物料名称 -->
                    <div class="mater_name">
                      <!-- <span class="whiNum">No.{{index + 1}}</span> -->
                      {{item.inventoryName}}
                    </div>
                    <!-- 物料基本信息 -->
                    <div class="mater_info">
                      <!-- 物料编码、规格 -->
                      <div class="withColor">
                        <!-- 物料编码 -->
                        <div class="ForInline" style="display:inline-block">
                          <div class="mater_code">
                            <span class="title">编码</span>
                            <span class="num">{{item.inventoryCode}}</span>
                          </div>
                        </div>
                        <!-- 物料规格 -->
                        <div class="ForInline" style="display:inline-block">
                          <div class="mater_spec">
                            <span class="title">规格</span>
                            <span class="num">{{item.specification || '无'}}</span>
                          </div>
                        </div>
                      </div>
                      <!-- 物料分类、材质 -->
                      <div class="withoutColor">
                        <!-- 物料分类 -->
                        <div class="mater_classify">
                          <span class="type">属性: {{item.processing}}</span>
                          <span class="father">大类: {{item.inventoryType}}</span>
                          <span class="child">子类: {{item.inventorySubclass}}</span>
                        </div>
                        <!-- 物料材质等 -->
                        <div class="mater_material">
                          <span class="unit">单位: {{item.measureUnit}}</span>
                          <span class="color">颜色: {{item.inventoryColor || '无'}}</span>
                          <span class="spec">材质: {{item.material || '无'}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class='delete_icon' v-if='matterModifyClass'>
                    <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                    <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                  </div>
                </div> 
                <!-- 物料输入内容 -->
                <div class="userInp_mode">
                  <group>
                    <x-input type="number" title="单价" text-align='right' placeholder='请填写'
                             @on-blur="priceBlur(item)" v-model.number="item.price"></x-input>
                  </group>
                  <r-picker title="价格类型" :data="priceTypeList" :mode="'2'" :show-arrow="true"
                            v-model="item.priceType"></r-picker>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <!-- <div class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</div> -->
          <div class="handle_part" v-if="matterList.length">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
              @click="stopOrder" >终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 往来popup -->
          <pop-dealer-list :show="showDealerPop" v-model="showDealerPop"
                           @sel-dealer="selDealer" @closePop='showDealerPop = !showDealerPop'
                           ref="dealer"></pop-dealer-list>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" ref="matter"></pop-matter-list>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t' v-if="!matterModifyClass">
      <!-- <div class="btn-item stop" @click="stopOrder" v-if="this.actions.includes('stop')">终止</div> -->
      <div class="btn-item" @click="save">提交</div>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline' v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='count_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton, dateFormat,} from 'vux'
// 请求 引入
import { resolve } from 'url';
import { getSOList } from 'service/detailService'
import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
// mixins 引入
import ApplyCommon from './../mixins/applyCommon'
// 组件引入
import RPicker from 'components/RPicker'
import InputBox from 'components/Xinput'
import PopMatterList from 'components/Popup/PopMatterList'
import PopDealerList from 'components/Popup/PopDealerList'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
export default {
  mixins: [ApplyCommon],
  components: {
    Icon, Cell, Group, XInput, RPicker, InputBox,
    Swipeout, SwipeoutItem, SwipeoutButton,
    PopMatterList, PopDealerList, PopSingleSelect
  },
  data() {
    return {
      listId: '58a607ce-fe93-4d26-a42e-a374f4662f1c',
      matterList: [],  // 物料列表
      showMaterielPop: false, // 是否显示物料的popup
      transCode: '',
      dealerInfo: null,
      transMode: ['现付', '预付', '账期', '票据'],          // 结算方式
      logisticsTerm: ['上门', '自提', '离岸', '到港'],      // 物流条款
      drDealerPaymentTerm: '现付',  //结算方式
      formData: {
        biComment: '',
        drDealerLogisticsTerms: '上门', // 物流条款
        validUntil: '', // 有效期
      },
      priceMap: {},
      showDealerPop: false,
      priceTypeList: ['渠道价', '零售价'],
      inputOptions: {
        title: '单价',
        type: 'number',
        placeholder: '请填写'
      },
    }
  },
  watch: {
    matterList: {
      handler(val) {
        let data;
        for (let i = 0; i < val.length; i++) {
          if (val[i].price) {
            data = {
              XSBJ_DATA: {
                matter: this.matterList,
                dealer: this.dealerInfo,
              }
            }
            break;
          }
        }
        if (data) {
          this.$emit('sel-data', data)
        }
      },
      deep: true
    },
    dealerInfo(val) {
      if (this.matterList.length) {
        let data = {
          XSBJ_DATA: {
            matter: this.matterList,
            dealer: this.dealerInfo,
          }
        }
        this.$emit('sel-data', data)
      }

    }
  },
  methods: {
    // 滑动删除
      delClick(index, sItem) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
        //若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon(sItem) {
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
      },
      //全选
      checkAll(){
        if(this.selItems.length === this.matterList.length){
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      //删除选中的
      deleteCheckd(){
        this.$vux.confirm.show({
          content: '确认删除?',
          // 确定回调
          onConfirm: () => {
            this.selItems.forEach(item=>{
              let index = this.matterList.findIndex(item2=>item2.inventoryCode === item.inventoryCode);
              if(index >= 0){
                this.matterList.splice(index,1);
              }
            })
            this.selItems = [];
            this.matterModifyClass = false;
          }
        })

      },
    // TODO 点击增加更多物料
    addMatter() {
      this.matterList.forEach(item => {
        // 存储已输入的价格
        this.priceMap[item.inventoryCode] = {
          price: item.price,
          priceType: item.priceType,
        };
      });
      this.showMaterielPop = !this.showMaterielPop
    },
    // TODO 选中往来项
    selDealer(val) {
      let [sels] = JSON.parse(val);
      this.dealerInfo = sels;
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      sels.forEach(item => {
        let defaultValue = this.priceMap[item.inventoryCode] || {};
        item.price = defaultValue.price || '';
        item.priceType = defaultValue.priceType || '渠道价';
      });
      this.priceMap = {};
      this.matterList = [...sels];
    },
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = require('assets/wl.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // TODO 提交
    save() {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key: 'dealerInfo',
          message: '往来信息'
        },
      ];
      validateMap.every(item => {
        if (!this[item.key]) {
          warn = `请选择${item.message}`;
          return false
        }
        return true
      });
      if (!warn && !this.matterList.length) {
        warn = '请选择物料';
      }
      this.matterList.every(item => {
        if (!item.price) {
          warn = '请输入单价';
          return false
        }
        let mItem = {
          inventoryName_transObjCode: item.inventoryName,
          transObjCode: item.inventoryCode,
          comment: item.comment || null,
          priceType: item.priceType || null,
          price: item.price
        };
        if (this.transCode) {
          mItem.tdId = item.tdId || '';
        }
        dataSet.push(mItem);
        return true
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
          let operation = saveAndStartWf;
          let formData = {
            creator: this.formData.handler,
            ...this.formData,
            modifer: this.formData.handler,
            handlerEntity: this.entity.dealerName,
            dealerDebitContactPersonName: this.dealerInfo.creatorName || '',
            dealerDebitContactInformation: this.dealerInfo.mobilePhone || '',
            order: {
              dealerDebit: this.dealerInfo.dealerCode || '',
              drDealerLabel: this.dealerInfo.dealerLabelName || '客户',
              drDealerPaymentTerm: this.drDealerPaymentTerm || '现付',
              dataSet
            }
          };
          let submitData = {
            listId: this.listId,
            biComment: '',
            formData: JSON.stringify(formData),
            wfPara: JSON.stringify({
              [this.processCode]: {
                businessKey: 'QUOT',
                createdBy: formData.creator,
              }
            }),
          };
          // 若为重新提交，则修改提交参数
          if (this.transCode) {
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
            submitData.wfPara = JSON.stringify({
              businessKey: this.transCode,
              createdBy: formData.creator,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ''
            });
          }
          this.saveData(operation, submitData);
        }
      });
    },
    // TODO 获取详情
    getFormData() {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode: this.transCode
      }).then(data => {
        let {success = true, formData = {}} = data;
        // http200时提示报错信息
        if (!success) {
          this.$vux.alert.show({
            content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
          });
          return;
        }
        let matterList = [];
        // 获取合计
        let {order} = formData;
        let {dataSet = []} = order;
        for (let item of dataSet) {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.processing_transObjCode,
            inventoryType: item.inventoryType_transObjCode,
            inventorySubclass: item.inventorySubclass_transObjCode,
            measureUnit: item.measureUnit_transObjCode,
            inventoryColor: item.inventoryColor_transObjCode,
            material: item.material_transObjCode,
          };
          matterList.push(item);
        }
        // 客户信息
        this.dealerInfo = {
          creatorName: formData.dealerDebitContactPersonName || '', // 客户名
          dealerName: order.dealerName_dealerDebit || '', // 公司名
          dealerMobilePhone: formData.dealerDebitContactInformation || '', // 手机
          dealerCode: order.dealerDebit || '', // 客户编码
          dealerLabelName: order.drDealerLabel || '客户', // 关系标签
          province: order.province_dealerDebit || '', // 省份
          city: order.city_dealerDebit || '', // 城市
          county: order.county_dealerDebit || '', // 地区
          address: order.address_dealerDebit || '', // 详细地址
        };
        this.formData = {
          ...this.formData,
          creator: formData.creator,
          biComment: formData.biComment,
          drDealerLogisticsTerms: formData.drDealerLogisticsTerms,
          validUntil: dateFormat(formData.validUntil, 'YYYY-MM-DD'),
        };
        this.drDealerPaymentTerm = order.drDealerPaymentTerm;
        this.biReferenceId = formData.biReferenceId;
        this.matterList = matterList;
        this.$loading.hide();
        // this.$emit('input', false);
      })
    },
    // TODO 展示时间选择器
    clickDateSelect() {
      this.$vux.datetime.show({
        confirmText: '确定',
        cancelText: '取消',
        value: this.formData.validUntil,
        onConfirm: (value) => {
          this.formData.validUntil = value;
        }
      })
    },
    // TODO 价格保留两位小数
    priceBlur(item){
      item.price = Math.abs(item.price.toFixed(2));
    },
  },
  created() {
    let data = sessionStorage.getItem('XSBJ_DATA');
    if (data) {
      this.matterList = JSON.parse(data).matter;
      this.dealerInfo = JSON.parse(data).dealer;
    }
  },
}
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';

  .xsbj-apply-container {
    /deep/ .weui-cells {
      font-size: .14rem;
      margin-top: unset;
      &:before {
        border-top: none;
      }
    }
    /deep/ .picker {
      padding-left: .07rem;
      font-size: .14rem;
    }
  }
</style>
