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
              <span class="user_name">{{dealerInfo.creatorName}}</span>
              <span class="user_tel">{{dealerInfo.dealerMobilePhone}}</span>
            </div>
            <div class="cp_info">
              <p class="cp_name">{{dealerInfo.dealerName}}</p>
              <p class="cp_ads">{{dealerInfo.province + dealerInfo.city + dealerInfo.county + dealerInfo.address}}</p>
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
            <div class="title">物料列表</div>
            <div class="mater_list">
              <div class="each_mater" v-for="(item, index) in matterList" :key='index'>
                <swipeout>
                  <swipeout-item>
                    <div slot="right-menu">
                      <swipeout-button @click.native="delClick(item, index)" type="warn">删除</swipeout-button>
                    </div>
                    <div class="each_mater_wrapper" slot="content">
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
                    </div>
                  </swipeout-item>
                </swipeout>
                <!-- 物料输入内容 -->
                <div class="userInp_mode">
                  <group>
                    <x-input type="number" title="单价" text-align='right' placeholder='请填写'
                            v-model.number="item.price"></x-input>
                  </group>
                  <r-picker title="价格类型" :data="priceTypeList" :mode="'2'" :show-arrow="true" v-model="item.priceType"></r-picker>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</div>
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
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton,} from 'vux'
  import PopMatterList from 'components/PopMatterList'
  import PopDealerList from 'components/PopDealerList'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
  import ApplyCommon from './../mixins/applyCommon'
  import PopSingleSelect from 'components/PopSingleSelect'
  import RPicker from 'components/RPicker'
  import InputBox from 'components/Xinput'
import { resolve } from 'url';
  export default {
    mixins: [ApplyCommon],
    components: {
      Icon,
      Cell,
      Group,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      PopMatterList,
      PopDealerList,
      PopSingleSelect,
      RPicker,
      InputBox
    },
    data() {
      return {
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
        inputOptions:{
          title:'单价',
          type : 'number',
          placeholder : '请填写'
        }
      }
    },
    watch:{
      matterList(val){
        let data = {
          XSBJ_DATA:{
            matter : this.matterList,
            dealer : this.dealerInfo,
          }
        }
        this.$emit('sel-data',data)
      },
      dealerInfo(val){
        let data = {
          XSBJ_DATA:{
            matter : this.matterList,
            dealer : this.dealerInfo,
          }
        }
        this.$emit('sel-data',data)

      }
    },
    methods: {
      // TODO 滑动删除
      delClick(item, index) {
        let arr = this.matterList;
        arr.splice(index, 1);
        // 删除输入过的价格
        delete this.priceMap[item.inventoryCode];
        this.$refs.matter.delSelItem(item);
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
          dataSet.push({
            inventoryName_transObjCode: item.inventoryName,
            transObjCode: item.inventoryCode,
            comment: item.comment || null,
            priceType: item.priceType || null,
            price: item.price
          });
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
            let operation = submitAndCalc;
            let submitData = {
              listId: '58a607ce-fe93-4d26-a42e-a374f4662f1c',
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                dealerDebitContactPersonName: this.dealerInfo.creatorName || '',
                dealerDebitContactInformation: this.dealerInfo.mobilePhone || '',
                order: {
                  dealerDebit: this.dealerInfo.dealerCode || '',
                  drDealerLabel: this.dealerInfo.dealerLabelName || '客户',
                  drDealerPaymentTerm: this.drDealerPaymentTerm || '现付',
                  dataSet
                }
              }),
            };

            if (this.transCode) {
              operation = saveAndCommitTask
            }
            console.log(submitData)
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 获取详情
      getFormData() {
      },
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
    },
    created() {
      let data = sessionStorage.getItem('XSBJ_DATA');
      if(data){
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
