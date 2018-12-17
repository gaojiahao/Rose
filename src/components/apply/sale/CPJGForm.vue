<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 用户地址和基本信息-->
        <!-- <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo"  @sel-contact="selContact"></pop-dealer-list> -->
        <!-- 结算方式 -->
        <!-- <pop-single-select title="结算方式" :data="transMode" :value="dealerInfo.paymentTerm"
            v-model="dealerInfo.paymentTerm"></pop-single-select> -->
        <!-- 物流条款 -->
        <!-- <pop-single-select title="物流条款" :data="logisticsTerm" :value="formData.drDealerLogisticsTerms"
                           v-model="formData.drDealerLogisticsTerms">
        </pop-single-select> -->
        <!-- 有效期至 -->
        <!-- <div class="mg_auto no_top" >
          <div class="valid_until" @click="clickDateSelect">
            <div class="title">有效期至</div>
            <div class="mode">
              <span class="mode_content">{{formData.validUntil || '请选择有效期'}}</span>
              <span class="iconfont icon-shenglve"></span>
            </div>
          </div>
        </div> -->
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
                          <!-- <span class="processing">属性: {{item.processing}}</span> -->
                          <span class='unit'>单位: {{item.measureUnit}}</span>
                          <span class='mater_color' v-show="item.drDealerLabel">客户类型: {{item.drDealerLabel}}</span>
                          <span class='mater_color' v-show="item.qtyOnline">数量上线: {{item.qtyOnline}}</span>
                          <span class='mater_color' v-show="item.qtyDownline">数量下线: {{item.qtyDownline}}</span>
                      </div>
                      <!-- 物料数量和价格 -->
                      <div class='mater_other'>
                        <div v-if="item.price" class="price">
                          保准价格: <span class="mater_price"><span class="symbol">￥</span>{{item.price}}</span>
                        </div>
                        <div v-if="item.specialReservePrice" class="price">
                          特批低价: <span class="mater_price"><span class="symbol">￥</span>{{item.specialReservePrice}}</span>
                        </div>
                      </div>
                  </template>
                  <template slot="edit" slot-scope="{item}">
                    <div class='mater_other' @click="modifyMatter(item,index)" v-if="!item.price && !matterModifyClass">
                      <div class="edit-tips">
                        <span class="tips-word">点击进行填写</span>
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
          <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter" get-list-method="getProductPriceAllInventory"
                           :default-value="matterList" ref="matter"></pop-matter-list>
        </div>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :is-show-amount="false">
          <template slot="modify" slot-scope="{modifyMatter}">
              <x-input type="number"  v-model.number='modifyMatter.qtyDownline' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
                <template slot="label">
                  <span class='required'>数量下线
                  </span>
                </template>      
              </x-input>
              <x-input type="number"  v-model.number='modifyMatter.qtyOnline' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
                <template slot="label">
                  <span class='required'>数量上线
                  </span>
                </template>      
              </x-input>
              <x-input type="number"  v-model.number='modifyMatter.price' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
                <template slot="label">
                  <span class='required'>标准价格
                  </span>
                </template>      
              </x-input>
              <x-input type="number"  v-model.number='modifyMatter.specialReservePrice' text-align="right"
                      @on-blur="checkAmt(modifyMatter)" placeholder="请输入" @on-focus="getFocus($event)">
                <template slot="label">
                  <span class='required'>特批底价
                  </span>
                </template>      
              </x-input>
              <popup-picker :data='dealerTypeList' v-model="modifyMatter.PopDealerLabel" :popup-style="pickerStyle" @on-change="onChange($event,modifyMatter)">
                <template slot="title">
                  <span class='required'>客户类型
                  </span>
                </template>   
              </popup-picker>
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
  import { Icon, XInput, XTextarea, dateFormat, PopupPicker,Picker  } from 'vux'
  // 请求 引入
  import { getSOList } from 'service/detailService'
  import { submitAndCalc, saveAndStartWf, getDictByType, saveAndCommitTask } from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  import PopMatterList from 'components/Popup/PopMatterList'
  import PopMatter from 'components/apply/commonPart/MatterPop'
  import UploadFile from 'components/upload/UploadFile'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'

  const DRAFT_KEY = 'CPJG_DATA';

  export default {
    data() {
      return {
        matterList: [], // 物料列表
        showMaterielPop: false, // 是否显示物料的popup
        transCode: '',
        formData: {
          biComment: '',
          biId: '',
          biProcessStatus: ''
        },
        priceMap: {},
        showDealerPop: false,
        dealerTypeList: [],
        currentType: '',
        showPrice: false,
        pickerStyle: {
          zIndex: 550
        }
      }
    },
    components: {
      Icon, XInput, RPicker, XTextarea, PopupPicker, Picker ,
      PopMatterList,
      PopMatter, UploadFile, PopBaseinfo
    },
    mixins: [ApplyCommon],
    methods: {
      onChange(e,modifyMatter){
        modifyMatter.drDealerLabel = e[0];
      },
      // 获取 客户类型
      initRequest () {
        return getDictByType('dealerRelLabel').then(({ tableContent }) => {
          let arr = [];
          tableContent.forEach(item => {
            arr.push(item.name)
          })
          this.dealerTypeList.push(arr);
        })
      },
      // 滑动删除
      delClick (index, sItem) {
        let arr = this.selItems;
        let delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
        // 若存在重复的 则清除
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          return;
        }
        arr.push(sItem);
      },
      // TODO 判断是否展示选中图标
      showSelIcon (sItem) {
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
      },
      // 全选
      checkAll () {
        if (this.selItems.length === this.matterList.length) {
          this.selItems = [];
          return
        }
        this.selItems = JSON.parse(JSON.stringify(this.matterList));
      },
      // 删除选中的
      deleteCheckd () {
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
      addMatter () {
        this.matterList.forEach(item => {
          // 存储已输入的价格
          this.priceMap[item.inventoryCode] = {
            price: item.price,
            drDealerLabel: item.drDealerLabel,
            PopDealerLabel: item.PopDealerLabel,
            qtyOnline: item.qtyOnline,
            qtyDownline: item.qtyDownline,
            specialReservePrice: item.specialReservePrice,
          };
        });
        this.showMaterielPop = !this.showMaterielPop
      },
      // TODO 选中物料项
      selMatter (val) {
        let sels = JSON.parse(val);
        sels.forEach(item => {
          let defaultValue = this.priceMap[item.inventoryCode] || {};
          item.price = defaultValue.price || '';
          item.qtyOnline = defaultValue.qtyOnline || '';
          item.qtyDownline = defaultValue.qtyDownline || '';
          item.specialReservePrice = defaultValue.specialReservePrice || '';
          item.PopDealerLabel = defaultValue.PopDealerLabel || []
          item.drDealerLabel = defaultValue.drDealerLabel || ''
        });
        this.priceMap = {};
        this.matterList = [...sels];
      },
      // TODO 获取默认图片
      getDefaultImg (item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // TODO 提交
      save () {
        let warn = '',
            dataSet = [];
        let validateMap = [
          {
            key: 'drDealerLabel',
            message: '请选择客户类型'
          },
          {
            key: 'qtyDownline',
            message: '请填写数量下线'
          },
          {
            key: 'qtyOnline',
            message: '请填写数量上线'
          },
          {
            key: 'price',
            message: '请填写标准价格'
          },
          {
            key: 'specialReservePrice',
            message: '请填写特批低价'
          }
        ];
        if(!this.matterList.length){
          warn = '请选择物料'
        }
        if (!warn) {
          this.matterList.every(item => {
            validateMap.every(vItem => {
              if (!item[vItem.key]) {
                warn = vItem.message;
              }
              return !warn
            });
            let mItem = {
              transObjCode: item.inventoryCode,
              drDealerLabel: item.drDealerLabel,
              qtyDownline: item.qtyDownline,
              qtyOnline: item.qtyOnline,
              price: item.price,
              specialReservePrice: item.specialReservePrice,
              comment: ''
            };
            if (this.transCode) {
              mItem.tdId = item.tdId || '';
            }
            dataSet.push(mItem);
            return !warn
          });
        }
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
              order: {
                dataSet
              }
            };
            let submitData = {
              listId: this.listId,
              biComment: '',
              formData: JSON.stringify(formData),
              wfPara: JSON.stringify({
                [this.processCode]: {
                  businessKey: 'PQ',
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
            // 无工作流
            if (!this.processCode.length) {
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
      getFormData () {
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
              inventoryCode: item.transObjCode,
              inventoryName: item.inventoryName_transObjCode,
              measureUnit:item.measureUnit_transObjCode,
              specification: item.specification_transObjCode,
              PopDealerLabel: [item.drDealerLabel],
              inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            };
            matterList.push(item);
          }
          this.handlerDefault = {
            handler: formData.handler,
            handlerName: formData.handlerName,
            handlerUnit: formData.handlerUnit,
            handlerUnitName: formData.handlerUnitName,
            handlerRole: formData.handlerRole,
            handlerRoleName: formData.handlerRoleName,
          };
          // 基本信息
          this.formData = {
            ...this.formData,
            ...this.handlerDefault,
            biComment: formData.biComment,
            biId: formData.biId,
            biProcessStatus: formData.biProcessStatus,
            creator: formData.creator,
            modifer: formData.modifer,
          }
          this.biReferenceId = formData.biReferenceId;
          this.matterList = matterList;
          this.$loading.hide();
        })
      },
      // TODO 是否保存草稿
      hasDraftData () {
        if (!this.matterList.length) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            matter: this.matterList,
            formData: this.formData
          }
        };
      },
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        this.matterList = JSON.parse(data).matter;
        this.formData = JSON.parse(data).formData;
        sessionStorage.removeItem(DRAFT_KEY)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
  .vux-popup-picker{
    z-index: 700;
  }
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
  .mater_other{
    font-size: 0.14rem;
    color: #111;
    font-weight: bold;
    flex-wrap: wrap;
    .price{
      .mater_price{
        color: #ea5455;
      }
    }
  }
  //有效期
  .no_top {
    margin-top: 0;
    margin-bottom: 0.1rem;
    color:#111;
  }
  .valid_until {
    background: #fff;
    box-sizing: border-box;
    padding: .02rem .1rem;
    display: flex;
    font-size: .14rem;
    align-items: center;
    justify-content: space-between;
    .title {
      color:#757575;
    }
    .mode {
      color: #111;
      font-weight: 500;
      display: flex;
      align-items: center;
      .mode_content {
        margin-right: .06rem;
      }
      .icon-shenglve {
        font-size: .2rem;
        color: #707070;
      }
    }
  }
  //价格类型
  .price_type {
    padding: 0.1rem 0.15rem;
    font-size: 0.14rem;
    position: relative;
    overflow: visible;
    .current_type {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .matter_val {
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
      width: 1rem;
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
      span {
        display: inline-block;
        width: 100%;
        box-sizing: border-box;
        padding: 0 .1rem;
      }
      .active {
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
