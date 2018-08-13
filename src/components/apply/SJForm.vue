<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <!-- 用户地址和基本信息-->
        <div class="or_ads mg_auto box_sd" @click="showDealerPop = !showDealerPop">
          <div v-if='dealerInfo.dealerName'>
            <div class="user_info" v-if="dealerInfo.creatorName">
              <span class="user_name">{{dealerInfo.creatorName || ''}}</span>
              <span class="user_tel">{{dealerInfo.dealerMobilePhone}}</span>
            </div>
            <div class="cp_info">
              <p class="cp_name">{{dealerInfo.dealerName}}</p>
              <p class="cp_ads">{{dealerInfo.province}}{{dealerInfo.city}}{{dealerInfo.county}}{{dealerInfo.address}}</p>
            </div>
          </div>
          <div v-else>
            <div class="title">往来列表</div>
            <div class="mode">请选择往来</div>
          </div>    
          <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
        </div>
        
        <div class="basicPart">
          <!-- 商机列表 -->
          <div class="materiel_list mg_auto box_sd">
            <div class="mater_list">
              <div class="each_mater">
                <div class="each_mater_wrapper">
                  <div class="mater_main">
                    <div class="userInp_mode">
                      <div class="title">商机明细</div>
                      <group class="SJ_group" @group-title-margin-top="0">
                        <x-input  title="商机标题" text-align='right' v-model="formData.opportunityTitle" placeholder='请填写'></x-input>
                        <x-input  title="预期销售额" ref="salePrice" @on-click-clear-icon="clearSaleVal" :value="formData.tdAmount | numberComma(3)" @on-blur="saleVal" text-align='right' placeholder='请填写'></x-input>
                        <popup-radio title="当前所在阶段" :options="options" v-model="formData.currentStage"></popup-radio>
                        <datetime
                          v-model="formData.validUntil"
                          title="有效期至"
                          ></datetime>
                          <div class="SJForm_cell" @click="showSalesmanPop = !showSalesmanPop">
                            <div>销售人员</div>
                            <div>
                              <span>{{salesmanInfo.dealerName}}</span>
                            </div>
                          </div>
                          <div class="SJForm_cell" @click="showSalechannelPop = !showSalechannelPop">
                            <div>销售渠道</div>
                            <div>
                              <span>{{salechannelInfo.dealerName}}</span>
                            </div>
                          </div>
                        <x-textarea title="商机内容" v-model="formData.comment" :max="200"></x-textarea>
                      </group>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- popup列表 -->
        <div class=" mg_auto box_sd">
          <!-- 往来popup -->
          <pop-dealer-list :show="showDealerPop" v-model="showDealerPop"
                          @sel-dealer="selDealer" :dealerLabelName="'2167'">
          </pop-dealer-list>
          <!-- 销售人员popup -->
          <pop-salesman-list :show="showSalesmanPop" v-model="showSalesmanPop"
                          @sel-dealer="selSalesman">
          </pop-salesman-list>
          <!-- 销售渠道popup -->
          <pop-salechannel-list :show="showSalechannelPop" v-model="showSalechannelPop"
                          @sel-dealer="selSalechannel">
          </pop-salechannel-list>
        </div>
      </div>
    </div>
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{total}}
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
  </div>
</template>

<script>
  import {Popup,TransferDom,Cell ,CellBox ,Group,XInput,numberComma,XTextarea,PopupRadio,Datetime,AlertModule } from 'vux'
  import {getBaseInfoData, saveAndStartWf, saveAndCommitTask,submitAndCalc} from 'service/commonService'
  import common from 'components/mixins/applyCommon.js'
  import PopDealerList from 'components/PopDealerList'
  import PopSalesmanList from 'components/PopSalesmanList'
  import PopSalechannelList from 'components/PopSalechannelList'
  import PopBusinessList from 'components/PopBusinessList'
  export default {
    directives: {
      TransferDom
    },
    filters:{
      numberComma
    },
    components: {
      Popup,
      PopDealerList,
      PopSalesmanList,
      PopSalechannelList,
      Cell ,
      Group, 
      XInput,
      PopBusinessList,
      XTextarea,
      PopupRadio,
      Datetime   
    },
    data() {
      return {
        showDealerPop: false,                          // 是否显示往来的popup
        showSalesmanPop: false,                          // 是否显示销售人员的popup
        showSalechannelPop: false,                          // 是否显示销售渠道的popup
        dealerInfo: {},
        salesmanInfo:{},
        salechannelInfo:{},
        dealer: {},
        formData: {
          "handlerName": "",
          "handlerUnitName": "",
          "handlerRoleName": "",
          "handler": "",
          "handlerUnit": "",
          "handlerRole": "",
          "creator": "",
          "modifer": "",
          "biId": "",//为空
          "dealerDebit": "",
          "drDealerLabel": "",
          "dealerDebitContactPersonName": "",
          "dealerDebitContactInformation": "",
          "opportunityTitle": "",
          "comment": "",
          "tdAmount": '',
          "currentStage": "",//与PC端一致
          "validUntil": "",
          "salesPerson": "",
          "salesChannels": "",
          "categoryLabels": "",
          "biComment": ""
        },
        options: ['初步交流(10%)', '需求沟通(30%)', '商务沟通(50%)','签约交款(100%)','签约失败(0%)'],
      }
    },
    computed: {
      //总金额
      total(){
        return this.formData.tdAmount == ''?0:numberComma(this.formData.tdAmount);
      }
    },
    mixins: [common],
    methods: {
      //清除金额
      clearSaleVal(e){
        this.formData.tdAmount = '';
      },
      //格式化金额
      saleVal(e){
        let str = '';
        if(e.toString().indexOf(",") != -1 ){
          for(let i = 0 ;i<e.toString().split(',').length ; i++){
            str += e.toString().split(',')[i];
          }
          this.formData.tdAmount = str;
        }else{
          this.formData.tdAmount = e;
        }
      },
      //选中的往来
      selDealer(val) {
        this.dealerInfo = JSON.parse(val)[0];
        this.formData.dealerDebitContactPersonName = this.dealerInfo.creatorName || '';
        this.formData.dealerDebitContactInformation = this.dealerInfo.dealerMobilePhone;
        this.formData.drDealerLabel = this.dealerInfo.dealerLabelName;
        this.formData.dealerDebit = this.dealerInfo.dealerCode;
      },
      //选中销售人员
      selSalesman(val){
        this.salesmanInfo = JSON.parse(val)[0];
      },
      //选中销售渠道
      selSalechannel(val){
        this.salechannelInfo = JSON.parse(val)[0];
      },
      // TODO 提交
      submitOrder() {
        let that = this;
        let salePriceVal = this.$refs.salePrice.currentValue;
        if(JSON.stringify(this.dealerInfo)=='{}'){
              AlertModule.show({
                content: '请选择往来',
              });
            return;
          }else if(this.formData.opportunityTitle == ''){
            AlertModule.show({
                content: '请填写商机标题',
              });
            return;
          }else if(this.formData.tdAmount == ''){
            AlertModule.show({
                content: '请填写预期销售额',
              });
            return;
          }else if(salePriceVal!=''&&!/^[0-9]+.?[0-9]*$/.test(salePriceVal)){
          AlertModule.show({
              content: '请输入正确的金额格式',
              onHide (){
                salePriceVal = '';
                that.formData.tdAmount = '';
              }
          });
          return;
        }else if(this.formData.currentStage == ''){
            AlertModule.show({
                content: '请选择所在阶段',
              });
            return;
          }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            let operation = submitAndCalc;
            let submitData = {
              listId: '32a2c333-02a3-416f-a133-95c7a32da678',
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                creator:this.formData.handler,
                modifer:this.formData.handler,
                salesPerson: this.salesmanInfo.dealerName ? this.formData.handler : '',
                salesChannels: this.salechannelInfo.dealerName ? this.formData.handler : '',
              }),
            };
            this.saveData(operation, submitData);
          }
        });
      },
    },
    created() {
    },
  }
</script>

<style lang="scss" scoped>
  @import '../scss/bizApply.scss';
  // @import '~components/scss/bizDetail.scss';
  .weui-cell{
    padding: 10px 0;
    &:before{
      left:0;
    }
  }
  .pop-single-container {
    position: relative;
    margin: 10px auto;
    padding: .06rem .08rem;
    width: 95%;
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
    .icon-gengduo {
      top: 50%;
      right: .1rem;
      font-size: .24rem;
      position: absolute;
      transform: translate(0, -50%);
    }
    .title {
      color: #757575;
      font-weight: 200;
      font-size: .12rem;
    }
    .mode {
      color: #111;
      font-weight: 500;
    }
  }

  /* 弹出框 */
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      // 顶部
      .title {
        font-size: .2rem;
        position: relative;
        padding: 0.08rem 0 .14rem;
        // 关闭icon
        .close_icon {
          top: 50%;
          right: -2%;
          position: absolute;
          transform: translate(0, -50%);
        }
      }
      .each_mode {
        margin-right: .1rem;
        margin-bottom : .1rem;
        display: inline-block;
        padding: .04rem .2rem;
        border: 1px solid #C7C7C7;
        border-radius: 40px;
      }
      .choiced {
        background: #5077aa;
        color: #fff;
      }
      .vux-1px:before {
        border-radius: 40px;
      }
    }
    // 确定
    .cfm_btn {
      left: 50%;
      bottom: 5%;
      width: 2.8rem;
      color: #fff;
      height: .44rem;
      line-height: .44rem;
      position: absolute;
      text-align: center;
      background: #5077aa;
      border-radius: .4rem;
      transform: translate(-50%, 0);
      box-shadow: 0 2px 12px #5077aa;
    }
  }
  .SJForm_cell{
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    border-top: 0.5px solid #D9D9D9;
  }
  .SJForm_cell>div:last-child{
    padding-right: 13px;
    color: #999;
    position: relative;
  }
  .SJForm_cell>div:last-child:after{
    content: " ";
    display: inline-block;
    height: 6px;
    width: 6px;
    border-width: 2px 2px 0 0;
    border-color: #C8C8CD;
    border-style: solid;
    transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
    position: relative;
    top: -2px;
    position: absolute;
    top: 50%;
    margin-top: -4px;
    right: 2px;
  }
  .materiel_list{
    padding: 0;
  }
  .basicPart{
    height: auto;
  }
  .materiel_list .mater_list .each_mater_wrapper .mater_main{
    padding-left: 0;
  }
</style>
<style>
  .SJ_group>.vux-no-group-title{
    margin-top: 0.08rem;
  }
</style>
