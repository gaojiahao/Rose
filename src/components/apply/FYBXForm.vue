<template>
  <div class="pages xsbj-apply-container">
    <div class="basicPart">
      <!-- 物料列表 -->
      <div class="materiel_list mg_auto box_sd">
        <!-- 没有选择物料 -->
        <template v-if="!CostList.length">
          <div @click="showMaterielPop = !showMaterielPop">
            <div class="title">费用列表</div>
            <div class="tips">请选择费用</div>
            <x-icon class="r_arrow" type="ios-arrow-right" size="20"></x-icon>
          </div>
        </template>
        <!-- 已经选择了物料 -->
        <template v-else>
          <div class="title">费用列表</div>
          <div class="mater_list">
            <div class="each_mater" v-for="(item, index) in CostList" :key='index'>
              <swipeout>
                <swipeout-item>
                  <div slot="right-menu">
                    <swipeout-button @click.native="delClick(item, index)" type="warn">删除</swipeout-button>
                  </div>
                  <div class="each_mater_wrapper" slot="content">
                    <div class="mater_main">
                      <!-- 物料名称 -->
                      <div class="mater_name">
                        <span class="whiNum">No.{{index + 1}}</span>
                        {{item.COST_NAME}}
                      </div>
                      <!-- 物料基本信息 -->
                      <div class="mater_info">
                        <!-- 物料编码、规格 -->
                        <div class="withColor">
                          <!-- 物料编码 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_code">
                              <span class="title">编码</span>
                              <span class="num">{{item.COST_CODE}}</span>
                            </div>
                          </div>
                          <!-- 物料规格 -->
                          <div class="ForInline" style="display:inline-block">
                            <div class="mater_spec">
                              <span class="title">类型</span>
                              <span class="num">{{item.COST_TYPE || '无'}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="userInp_mode">
                        <group>
                          <cell title="费用科目" text-align='right' :value="item.expSubject" @click.native="item.showPop = true" is-link></cell>
                          <x-input  title="金额" text-align='right' placeholder='请填写'
                                    type='number'
                                    v-model='item.price'></x-input>
                          <x-input type="text" title="报销事由" text-align='right' placeholder='请填写'
                          v-model="item.reson"></x-input>
                        </group>
                        <div v-transfer-dom>
                          <popup v-model="item.showPop" height="70%" class="trade_pop_part">
                            <div class="trade_pop">
                              <div class="title">费用科目
                                <x-icon class="close_icon" type="ios-close-empty" size="30" @click="item.showPop = false"></x-icon>
                              </div>
                              <span class="each_mode"
                                    :class="{choiced : val === item.expSubject}"
                                    v-for="(val, i) in item.COST_SUB"
                                    :key="i"
                                    @click="selItem(val,index,i)">{{val}}</span>
                            </div>
                            <div class="cfm_btn" @click="confirm(item)">确定</div>
                          </popup>
                        </div>
                      </div>
                    </div>
                  </div>
                </swipeout-item>
              </swipeout>
              <!-- 物料输入内容 -->
              
            </div>
          </div>
        </template>
        <!-- 新增更多 按钮 -->
        <div class="add_more" v-if="CostList.length" @click="addMatter">新增更多物料</div>
        <!-- 费用popup -->
        <pop-cost-list :show="showMaterielPop" v-model="showMaterielPop" @sel-matter="selMatter"
                        :default-value="CostList" ref="matter"></pop-cost-list>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t">
      <span class="count_num">
        <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}}
      </span>
      <span class="count_btn stop" @click="stopOrder" v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="submitOrder">提交订单</span>
    </div>
  </div>
</template>

<script>
  import { Cell ,Group,XInput, Swipeout, SwipeoutItem, SwipeoutButton,Popup,numberComma} from 'vux'
  import PopCostList from 'components/PopCostList'
  import {submitAndCalc, saveAndStartWf, saveAndCommitTask} from 'service/commonService'
  import ApplyCommon from './../mixins/applyCommon'

  export default {
    mixins: [ApplyCommon],
    components: { 
      Cell ,
      Group,   
      Popup,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      PopCostList,
    },
    data() {
      return {
        showMaterielPop :false,
        CostList: [],  // 物料列表
        transCode: '',
        formData: {
          biComment: ''
        },
        showPop: false,
        tmp: '',
      }
    },
    computed: {
      // 合计金额
      totalAmount() {
        let total = 0;
        this.CostList.forEach(item=>{
          if(item.price){
            total += Number(item.price);
          }         
        })
        return total;
      }
    },
    filters:{
      numberComma,
      checkPrice(val){
        if(val){
          return numberComma(val)
        }
      }
    },
    methods: {
      showcCostPop(item){
        item.showPop = true
      },     
      selItem(item1,index,i){
        this.CostList[index].expSubject = item1;
      },
      confirm(item){
        item.showPop = false;
      },
      // TODO 滑动删除
      delClick(item, index) {
        let arr = this.CostList;
        arr.splice(index, 1);
      },
      // TODO 点击增加更多物料
      addMatter() {
        this.showMaterielPop = !this.showMaterielPop
      },
      // TODO 选中物料项
      selMatter(val) {
        let sels = JSON.parse(val);
       
        sels.map(item=>{
          item.showPop = false;
        })
         this.CostList = sels;
        console.log(this.CostList);
      },
      // TODO 提交
      submitOrder() {
        let warn = '';
        let dataSet = [];
        if (!warn && !this.CostList.length) {
          warn = '请选择费用';
        }
        this.CostList.every(item => {
          if (!item.price) {
            warn = '请输入报销金额';
            return false
          }
          if(!item.reson){
            warn = '请输入报销事由'
            return false
          }
          dataSet.push({
            costName_expCode: item.COST_NAME,
            expCode: item.COST_CODE,
            expSubject: item.expSubject || null,
            costType_expCode: item.COST_TYPE || null,
            tdAmount: item.price,
            expCause : item.reson,
            comment : null
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
              listId: 'b61ef324-f261-48d6-9c79-d1b475c24943',
              biComment: '',
              formData: JSON.stringify({
                ...this.formData,
                creator: this.transCode ? this.formData.handler : '',
                modifer: this.transCode ? this.formData.handler : '',
                order: {
                  dealerDebit: this.formData.handler,
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
  @import '../scss/bizApply.scss';
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
</style>
