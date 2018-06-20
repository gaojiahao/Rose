<template>
  <div class="pages pd_btm">
    <div class="mescroll">
        <group class="count_part">
        <cell title="最终合计" :value="total4 | numberComma"></cell>
        <cell-form-preview class="count_dt_part" :list="list4"></cell-form-preview>
        </group>

        <load-more tip="项目类产品" :show-loading='false'></load-more>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="total1 | numberComma" 
            :body-items="list1">
        </form-preview>

        <load-more tip="A类产品" :show-loading='false'></load-more>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="total2 | numberComma">
        </form-preview>

        <load-more tip="B类产品" :show-loading='false'></load-more>
        <form-preview 
            class="project_part"
            header-label="金额" 
            :header-value="total3 | numberComma">
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
import saleRepotService from "../service/saleRepotService";
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
      list1: [],
      list2: [],
      list3: [],
      list4: [],
      total1: "",
      total2: "",
      total3: "",
      total4: "",
      childInfo: ""
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
          saleRepotService
            .subAmount(querystring.stringify(that.childInfo))
            .then(data => {
              if (data.success) {
                that.$vux.alert.show({
                  title: "提示",
                  content: data.message,
                  onHide() {
                    that.$router.replace("/Home");
                    localStorage.removeItem("help_saleReport");
                    localStorage.removeItem("saleReportInfo");
                    localStorage.removeItem("saleReport");
                  }
                });
              }
            })
            .catch(data => {
              if (data.success == false) {
                that.$vux.alert.show({
                  title: "提示",
                  content: data.message
                });
              }
            });
        }
      });
    },
    //获取数据
    info() {
      let total1 = 0, // 项目类产品金额
        total2 = 0, // A类金额
        total3 = 0, // B类金额
        list4_num = 0; // 最终合计 数量

      //从缓存中拿到上个页面提交的数据
      let jsonData = JSON.parse(this.childInfo.jsonData).transDetailUncalc;

      for (let i = 0; i < jsonData.length; i++) {
        if (
          jsonData[i].containerCode === "项目类产品" &&
          jsonData[i].transObjCode
        ) {
          //项目类产品明细
          this.list1.push({
            label: jsonData[i].transObjCode,
            value: `${jsonData[i].qty}件/套`
          });
          // 最终合计 数量
          list4_num += jsonData[i].qty;

          this.list4 = [
            {
              label: "合计数量",
              value: `${list4_num}件/套`
            }
          ];
          //项目类产品金额汇总
          total1 += jsonData[i].amount;
        } else if (jsonData[i].containerCode == "A") {
          this.list2.push({
            label: jsonData[i].transObjCode,
            value: jsonData[i].qty
          });
          total2 = jsonData[i].amount;
        } else if (jsonData[i].containerCode == "B") {
          this.list3.push({
            label: jsonData[i].transObjCode,
            value: jsonData[i].qty
          });
          total3 = jsonData[i].amount;
        }
      }
      this.total1 = "￥" + total1;
      this.total2 = "￥" + total2;
      this.total3 = "￥" + total3;
      let num = Number(total2) + Number(total3);
      this.total4 = "￥" + num;
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
