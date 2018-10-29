<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo"></pop-dealer-list>
        <!-- 结算方式 -->
        <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm"
            v-model="dealerInfo.paymentTerm"></pop-single-select>
        <!-- 物流条款 -->
        <pop-single-select title="物流条款" :data="logisticsTerm" :value="formData.drDealerLogisticsTerms"
                           v-model="formData.drDealerLogisticsTerms">
        </pop-single-select>
        <!-- 有效期至 -->
        <div class="mg_auto no_top" >
          <div class="valid_until" @click="clickDateSelect">
            <div class="title">有效期至</div>
            <div class="mode">
              <span class="mode_content">{{formData.validUntil || '请选择有效期'}}</span>
              <span class="iconfont icon-shenglve"></span>
            </div>
          </div>
        </div>
        <!-- 物料列表 -->
        <div class="materiel_list">
          <!-- 没有选择物料 -->
          <template v-if="!matterList.length">
            <div @click="showMaterielPop = !showMaterielPop">
              <div class="title">物料列表</div>
              <div class="required">请选择物料</div>
              <i class="iconfont icon-youjiantou r_arrow"></i>
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
              <div class="each_mater" :class="{mater_delete : matterModifyClass,'vux-1px-b' : index < matterList.length-1 }"
                  v-for="(item, index) in matterList" :key='index'>
                <matter-item :item="item" @on-modify="modifyMatter(item,index)" :show-delete="matterModifyClass"
                              @click.native="delClick(index,item)">
                  <template slot="info" slot-scope="{item}">
                      <!-- 物料属性和单位 -->
                      <div class="mater_more">
                          <span class="processing">属性：{{item.processing}}</span>
                          <span class='unit'>单位：{{item.measureUnit}}</span>
                          <span class='mater_color'>颜色：{{item.inventoryColor || '无'}}</span>
                          <span class='mater_color' v-show="item.priceType">价格类型：{{item.priceType}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other'>
                        <div class='mater_price' v-if="item.price">
                          <span class="symbol">￥</span>{{item.price}}
                        </div>
                      </div>
                  </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.price && !matterModifyClass">
                      <div class="edit-tips">
                        <span class="tips-word">填写</span>
                      </div>
                    </div>
                  </template>
                </matter-item>
                <div class='delete_icon' @click="delClick(index,item)" v-if='matterModifyClass'>
                  <x-icon type="ios-checkmark" size="20" class="checked" v-show="showSelIcon(item)"></x-icon>
                  <x-icon type="ios-circle-outline" size="20" v-show="!showSelIcon(item)"></x-icon>
                </div>
              </div>
            </div>
          </template>
          <!-- 新增更多 按钮 -->
          <div class="handle_part vx-1px-t" v-if="matterList.length && !matterModifyClass">
            <span class="add_more stop" v-if="this.actions.includes('stop')"
                  @click="stopOrder">终止提交</span>
            <span class="symbol" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>或</span>
            <span class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</span>
          </div>
          <!-- 物料popup -->
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                           :default-value="matterList" ref="matter"></pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
               <x-input title="单价" type="number"  v-model.number='modifyMatter.price' text-align="right"
                        @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)"></x-input>
              <div class="price_type vux-1px-t" @click="showPrice = !showPrice">
                <div class="current_type">
                  <label>价格类型</label>
                  <div class='matter_val'>{{modifyMatter.priceType}}
                    <x-icon  type="ios-arrow-down" :class="{'arrow-up': showPrice}" size="14"></x-icon>
                  </div>
                </div>
                <div class="r-dropdown-list" v-show="showPrice">
                  <div class="r-dropdown-item" :class="{'vux-1px-b': index !== priceTypeList.length - 1}" v-for="(item, index) in priceTypeList"
                      @click.stop="dropItemClick(item)" :key="index">
                    <span :class='{ active : currentType === item}'>{{item}}</span>
                  </div>
                </div>
              </div>
          </template>
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn-no-amt vux-1px-t' :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <div class="btn-item" @click="save">提交</div>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline'
                v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import { Icon, XInput, XTextarea, dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  import {submitAndCalc, saveAndStartWf, getDictByType, saveAndCommitTask} from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopMatterList from 'components/Popup/PopMatterList'
  import PopDealerList from 'components/Popup/PopDealerList'
  import PopSingleSelect from 'components/Popup/PopSingleSelect'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import UploadFile from 'components/upload/UploadFile'
  const DRAFT_KEY = 'XSBJ_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Icon, XInput, RPicker,XTextarea,
      PopMatterList, PopDealerList, PopSingleSelect,
      PopMatter, UploadFile
    },
    data() {
      return {
        listId: '58a607ce-fe93-4d26-a42e-a374f4662f1c',
        matterList: [],                               // 物料列表
        showMaterielPop: false,                       // 是否显示物料的popup
        transCode: '',
        dealerInfo: {},
        transMode: [],                                // 结算方式 数组
        logisticsTerm: [],                            // 物流条款 数组
        formData: {
          biComment: '',
          drDealerLogisticsTerms: '',              // 物流条款
          validUntil: '', // 有效期
        },
        priceMap: {},
        showDealerPop: false,
        priceTypeList: ['渠道价', '零售价'],
        currentType : '渠道价',
        showPrice:false,
      }
    },
    methods: {
      // 获取 结算方式
      getPaymentTerm(){
        return getDictByType('paymentTerm').then(({ tableContent }) => {
          this.transMode = tableContent;
        })
      },
      // 获取 物流条款
      getLogisticsTerms(){
        return getDictByType('dealerLogisticsTerms').then(({ tableContent }) => {
          this.logisticsTerm = tableContent;
        })
      },
      //选择价格类型
      dropItemClick(item) {
        this.currentType = item;
        this.matter.priceType = item;
        this.showPrice = false;
      },
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
      checkAll() {
        if (this.selItems.length === this.matterList.length) {
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      //删除选中的
      deleteCheckd() {
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
          item.price = defaultValue.price;
          item.priceType = defaultValue.priceType || '渠道价';
        });
        this.priceMap = {};
        this.matterList = [...sels];
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
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
            message: '客户'
          },
          {
            key: 'matterList',
            message: '物料'
          }
        ];
        validateMap.every(item => {
          if (!Object.values(this[item.key]).length) {
            warn = `请选择${item.message}`;
            return false
          }
          return true
        });
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
            this.$HandleLoad.show();
            let operation = saveAndStartWf;
            let formData = {
              creator: this.formData.handler,
              ...this.formData,
              modifer: this.formData.handler,
              handlerEntity: this.entity.dealerName,
              dealerDebitContactPersonName: this.dealerInfo.creatorName || '',
              dealerDebitContactInformation: this.dealerInfo.dealerMobilePhone || '',
              order: {
                dealerDebit: this.dealerInfo.dealerCode || '',
                drDealerLabel: this.dealerInfo.dealerLabelName || '客户',
                drDealerPaymentTerm: this.dealerInfo.paymentTerm || '现付',
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
            //无工作流
            if(!this.processCode.length){
              operation = submitAndCalc;
              delete submitData.wfPara;
              delete submitData.biReferenceId;
            }
            if (this.biReferenceId) {
              submitData.biReferenceId = this.biReferenceId
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
          let {success = true, formData = {},attachment = []} = data;
          // http200时提示报错信息
          if (!success) {
            this.$vux.alert.show({
              content: '抱歉，无法支持您查看的交易号，请确认交易号是否正确'
            });
            return;
          }
          let matterList = [];
          this.attachment = attachment;
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
            paymentTerm: order.drDealerPaymentTerm || '现付',
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
            validUntil: dateFormat(formData.validUntil, 'YYYY-MM-DD') ,
          };
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
      // TODO 是否保存草稿
      hasDraftData() {
        if (!this.matterList.length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            matter: this.matterList,
            dealer: this.dealerInfo,
            formData :this.formData
          }
        };
      },
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.matterList = JSON.parse(data).matter;
        this.dealerInfo = JSON.parse(data).dealer;
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xsbj-apply-container {
    background: #f8f8f8;
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
  //有效期
  .no_top{
    margin-top:0;
    margin-bottom: 0.1rem;
  }
  .valid_until{
    background: #fff;
    box-sizing: border-box;
    padding: .02rem .1rem;
    display: flex;
    font-size: .14rem;
    align-items: center;
    justify-content: space-between;
    .title{
      color:#757575;
    }
    .mode{
      color: #111;
      font-weight: 500;
      display: flex;
      align-items: center;
      .mode_content{
        margin-right: .06rem;
      }
      .icon-shenglve{
        font-size: .2rem;
        color: #707070;
      }
    }
  }
  //价格类型
  .price_type{
    padding: 0.1rem 0.15rem;
    font-size:0.14rem;
    position: relative;
    overflow: visible;
    .current_type{
      display: flex;
      justify-content: space-between;
      align-items: center;
      .matter_val{
        color:#999;
      }
    }

  }
  /* 列表容器 */
    .r-dropdown-list {
      position: absolute;
      right: 0;
      top: 100%;
      z-index: 999;
      width:1rem;
      border-bottom-left-radius: .08rem;
      border-bottom-right-radius: .08rem;
      background-color: #fff;
      box-shadow: 0 2px 10px #e8e8e8;
      box-sizing: border-box;
    }
    /* 列表项 */
    .r-dropdown-item {
      position: relative;
      line-height: .4rem;
      font-size: .16rem;
      text-align: right;
      span{
        display: inline-block;
        width:100%;
        box-sizing: border-box;
        padding: 0 .1rem;
      }
      .active{
        background: #e8e8e8;
      }
      .weui_icon_success-no-circle {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
    /* 倒三角 */
    .vux-x-icon-ios-arrow-down {
      transition: transform 200ms linear;
      &.arrow-up {
        transform: rotate(-180deg);
      }
    }
</style>
