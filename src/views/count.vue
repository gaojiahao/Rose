<template>
  <div class="pages pd_btm">
    <div class="mescroll">
      <group class="count_part">
        <cell title="最终合计" :value="finalAmt | numberComma"></cell>
        <cell-form-preview class="count_dt_part" :list="finalList"></cell-form-preview>
      </group>

      <load-more tip="项目类产品" :show-loading='false'></load-more>
      <form-preview
        class="project_part"
        header-label="金额"
        :header-value="projectAmt | numberComma"
        :body-items="projectList">
      </form-preview>

      <load-more tip="A类产品" :show-loading='false'></load-more>
      <form-preview
        class="project_part"
        header-label="金额"
        :header-value="aClassAmt | numberComma"
        :body-items="listSalesAmt">
      </form-preview>

      <load-more tip="B类产品" :show-loading='false'></load-more>
      <form-preview
        class="project_part"
        header-label="金额"
        :header-value="bClassAmt | numberComma" :body-items="bClassList">
      </form-preview>
    </div>


    <x-button
      id="submit_button"
      :gradients="['#B99763', '#E7D0A2']"
      @click.native="sendOrder"
    >
      确定提交
    </x-button>
    <alert></alert>
    <confirm></confirm>
  </div>
</template>

<script>
  import saleRepotService from "service/saleRepotService";
  import {
    Cell,
    Alert,
    Group,
    Confirm,
    Divider,
    XButton,
    LoadMore,
    FormPreview,
    numberComma,
    querystring,
    CellFormPreview
  } from "vux";
  // 方法引入
  import {toFixed, accAdd, accMul} from 'plugins/calc'

  export default {
    components: {
      Alert,
      Cell,
      Group,
      Divider,
      XButton,
      Confirm,
      LoadMore,
      FormPreview,
      CellFormPreview
    },
    data() {
      return {
        projectList: [], // 项目类产品展示item
        finalList: [], // 最终合计展示的item
        projectAmt: "", // 项目类产品合计金额
        aClassAmt: "", // A类产品合计金额
        bClassAmt: "", // B类产品合计金额
        finalAmt: "", // 最终合计
        childInfo: "",
        listSalesAmt: [],
        bClassList: [], // b类产品展示的item
      };
    },
    filters: {
      numberComma
    },
    methods: {
      /*
           * 提交数据
           */

      sendOrder() {
        let that = this;
        this.$vux.confirm.show({
          title: "温馨提示",
          content: "请确认提交数据是否正确？",
          confirmText: "我已确认",
          cancelText: "再去看看",
          onConfirm() {
            saleRepotService.subAmount(querystring.stringify(that.childInfo)).then(data => {
              if (data.success) {
                that.$vux.alert.show({
                  title: "提示",
                  content: data.message,
                  onHide() {
                    that.$router.replace("/Home");
                    localStorage.removeItem("saleReportInfo");
                    localStorage.removeItem("HELP_BASIC_INFO");
                    localStorage.removeItem("HELP_FORM_INFO");
                    localStorage.removeItem("SALE_FORM_INFO");
                  }
                });
              }
            });
          }
        });
      },
      //获取数据
      info() {
        let projectAmt = 0, // 项目类产品金额
          aClassAmt = 0, // A类金额
          bClassAmt = 0, // B类金额
          list4_num = 0, // 最终合计 数量
          totalNum1 = 0, // 最终合计 套数
          listSalesAmt = [],
          bClassList = [];

        //从缓存中拿到上个页面提交的数据
        let jsonData = JSON.parse(this.childInfo.jsonData);
        let {transDetailUncalc, baseinfoExt = {}} = jsonData;

        for (let i = 0; i < transDetailUncalc.length; i++) {
          let item = transDetailUncalc[i];
          switch (item.containerCode) {
            case '项目类产品':
              if (item.transObjCode) {
                //项目类产品明细
                this.projectList.push({
                  label: item.transObjCode,
                  value: `${item.qty || 0}件/折合${item.num1 || 0}套`
                });
                // 最终合计 数量
                list4_num = accAdd(list4_num, Number(item.qty || 0));
                totalNum1 = accAdd(totalNum1, Number(item.num1 || 0));
                //项目类产品金额汇总
                projectAmt = accAdd(projectAmt, item.amount);
              }
              break;
            case 'A':
              aClassAmt = accAdd(aClassAmt, item.amount);
              break;
            case '其他A类':
              listSalesAmt.unshift({
                label: item.transObjCode,
                value: item.amount,
              });
              break;
            case 'B':
              if (item.transObjCode === 'B类产品') {
                bClassAmt = accAdd(bClassAmt, item.amount);
              } else {
                bClassList.push({
                  label: item.transObjCode,
                  value: item.amount
                });
              }
              break;
            default:
              break;
          }
        }
        this.projectAmt = "￥" + projectAmt;
        this.aClassAmt = "￥" + aClassAmt;
        this.bClassAmt = "￥" + bClassAmt;
        this.bClassList = bClassList;
        this.finalAmt = "￥" + accAdd(Number(aClassAmt), Number(bClassAmt));
        this.finalList = [
          {
            label: "合计数量",
            value: `${list4_num}件/折合${totalNum1}套`
          }
        ];
        this.listSalesAmt = [
          ...listSalesAmt,
          {
            label: '住宿费',
            value: `￥${numberComma(baseinfoExt.double7)}`,
          }, {
            label: '市内交通费',
            value: `￥${numberComma(baseinfoExt.double10)}`,
          }, {
            label: '长途交通费',
            value: `￥${numberComma(baseinfoExt.double11)}`,
          }, {
            label: '其他费用',
            value: `￥${numberComma(baseinfoExt.double8)}`,
          }, {
            label: '合计',
            value: `￥${numberComma(baseinfoExt.double9)}`,
          }, {
            label: '费用销量比',
            value: baseinfoExt.varchar13,
          },
        ]
      }
    },
    mounted() {
      this.childInfo = JSON.parse(
        localStorage.getItem("saleReportInfo")
      ).saleReportRemark;
      this.info();
    }
  };
</script>

<style>
  .mescroll {
    width: 100%;
    padding-bottom: 50px;
    background-color: #f5f5f5;
  }

  /* 提交订单按钮  */
  #submit_button {
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    border-radius: 0;
    margin-top: 10px;
  }

  .pd_btm .weui-cells {
    width: 100%;
    box-sizing: border-box;
  }

  .pd_btm .project_part {
    width: 100%;
    box-sizing: border-box;
  }
</style>
