<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart">
      <!-- 用户地址和基本信息-->
      <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
        <div class="no-selected" v-if="!customInfo">
          <div class="title">客户列表</div>
          <div class="mode">请选择客户</div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>
        <div v-else>
          <div class="user_info">
            <span class="user_name">{{customInfo.name}}</span>
            <span class="user_tel">{{customInfo.phone}}</span>
          </div>
          <div class="cp_info">
            <p class="cp_name">{{customInfo.company}}</p>
            <p class="cp_ads">{{customInfo.address}}</p>
          </div>
          <x-icon class="r_arrow" type="ios-arrow-right" size="30"></x-icon>
        </div>
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
              </div>
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="matterList.length" @click="addMatter">新增更多物料</div>
        <!-- 往来popup -->
        <pop-dealer-list :show="showDealerPop" v-model="showDealerPop" @sel-dealer="selDealer"
                         ref="dealer"></pop-dealer-list>
        <!-- 物料popup -->
        <pop-matter-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                         :default-value="matterList" ref="matter"></pop-matter-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton} from 'vux'
  import PopMatterList from 'components/PopMatterList'
  import PopDealerList from 'components/PopDealerList'
  import {saveAndStartWf, saveAndCommitTask,} from 'service/commonService'
  import Loading from 'components/Loading'
  import ApplyCommon from './../mixins/applyCommon'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton, PopMatterList, Loading, PopDealerList,
    },
    data() {
      return {
        matterList: [],  // 物料列表
        showMaterielPop: false, // 是否显示物料的popup
        transCode: '',
        customInfo: null,
        formData: {},
        priceMap: {},
        showLoading: false,
        showDealerPop: false,
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
          this.priceMap[item.inventoryCode] = item.price;
        });
        this.showMaterielPop = !this.showMaterielPop
      },
      // TODO 选中往来项
      selDealer(val) {
        let [sels] = JSON.parse(val);
        this.customInfo = {
          name: sels.creatorName,
          mobilePhone: sels.dealerMobilePhone,
          phone: sels.dealerMobilePhone || sels.dealerPhone,
          company: sels.dealerName,
          address: sels.province + sels.city + sels.county + sels.address,
        };
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
        sels.forEach(item => {
          item.price = this.priceMap[item.inventoryCode] || ''
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
        if (!this.matterList.length) {
          warn = '请选择物料';
        }
        this.matterList.every(item => {
          if (!item.price) {
            warn = '请输入单价';
            return false
          }
          dataSet.push({
            transObjCode: item.inventoryCode,
            comment: '',
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
            // this.showLoading = true;
            let operation = saveAndStartWf;
            let submitData = {
              listId: '58a607ce-fe93-4d26-a42e-a374f4662f1c',
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                dealerDebitContactInformation: this.customInfo ? this.customInfo.mobilePhone : '',
                order: {
                  dataSet
                }
              }),
            };

            if (this.transCode) {
              operation = saveAndCommitTask
            }
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 获取详情
      getFormData() {
      },
    },
    created() {
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
  }
</style>
