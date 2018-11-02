<template>
  <div class="pages">
    <tab :line-width=2 active-color='#B99763'>
      <tab-item
        class="vux-center"
        :selected="demo2 === item"
        v-for="(item, index) in listTab"
        @click.native="mylist(index)"
        :key="index"
      >
        {{item}}
      </tab-item>
    </tab>
    <div class="my_info_part">
      <divider>项目类产品</divider>
      <form-preview
        class="project_part"
        header-label="销量金额"
        :header-value="'￥'+list1Total | numberComma"
        :body-items="list1">
      </form-preview>

      <divider>A类产品</divider>
      <form-preview
        class="project_part"
        header-label="销量金额"
        :header-value="'￥'+list2Total | numberComma"
        :body-items="list2">
      </form-preview>
      <divider>B类产品</divider>
      <form-preview
        class="project_part"
        header-label="销量金额"
        :header-value="'￥'+list3Total | numberComma"
        :body-items="list3">
      </form-preview>

    </div>
    <loading :show='spinner'></loading>
  </div>
</template>

<script>
  import {
    Tab,
    TabItem,
    Divider,
    SwiperItem,
    FormPreview,
    numberComma,
    CellFormPreview
  } from "vux";
  import myReportService from "service/myReportService";
  import {setTimeout} from "timers";
  import loading from "components/common/loading";
  // 方法引入
  import {toFixed, accAdd, accMul} from 'plugins/calc'

  const list = () => ["本日", "本周", "本月", "本年"];
  export default {
    components: {
      Tab,
      TabItem,
      Divider,
      loading,
      SwiperItem,
      FormPreview,
      CellFormPreview
    },
    data() {
      return {
        listTab: list(),
        demo2: "本日",
        list1: [],
        list2: [],
        list3: [],
        list1Total: 0,
        list2Total: 0,
        list3Total: 0,
        remark: "",
        spinner: false
      };
    },
    filters: {
      numberComma
    },
    methods: {
      mylist(tab) {
        if (tab == 0) {
          this.listpanl(this.remark.days);
        } else if (tab == 1) {
          this.listpanl(this.remark.weeks);
        } else if (tab == 2) {
          this.listpanl(this.remark.months);
        } else if (tab == 3) {
          this.listpanl(this.remark.years);
        }
      },
      listData() {
        let ROSE_OPTION = JSON.parse(localStorage.getItem("ROSE_OPTION"));
        let jsonData = {
          // shengName: ROSE_OPTION.region,
          // bankName: ROSE_OPTION.bank,
          // sybName: ROSE_OPTION.dept,
          // bmName: ROSE_OPTION.captain,
          shengName: '',
          bankName: '',
          sybName: '',
          bmName: '',
        };
        myReportService
          .myRepotList(jsonData)
          .then(data => {
            if (data) {
              this.spinner = false;
            }
            this.remark = data;
            this.mylist(0);
          })
          .catch(data => {
            this.spinner = true;
          });
      },
      listpanl(m) {
        this.list1Total = 0;
        this.list2Total = 0;
        this.list3Total = 0;
        this.list1.length = 0;
        this.list2.length = 0;

        for (let i = 0; i < m.length; i++) {
          let item = m[i];
          if (item.objType == "项目类产品" && item.objName) {
            this.list1Total += Number(item.amount);
            this.list1.push({
              label: item.objName,
              // value: "￥" + numberComma(item.amount, 3) + " " + "(" + item.qty + "件/套" + ")",
              value: `￥${numberComma(item.amount, 3)} (${item.qty}件/折合${toFixed(item.coverNum || 0)}套)`,
            });
          } else if (item.objType == "A") {
            this.list2Total = item.amount;
            this.list2 = [
              {
                label: '费用明细',
                value: '',
              }, {
                label: '住宿费',
                value: item.hotelCost ? `￥${numberComma(toFixed(item.hotelCost))}` : '无',
              }, {
                label: '交通费',
                value: item.hotelCost ? `￥${numberComma(toFixed(item.trafficCost))}` : '无',
              }, {
                label: '其他费用',
                value: item.elseCost ? `￥${numberComma(toFixed(item.elseCost))}` : '无',
              }, {
                label: '合计',
                value: item.hotelAndElseCost ? `￥${numberComma(toFixed(item.hotelAndElseCost))}` : '无',
              }, {
                label: '费用销售比',
                // value: item.costSalesRatio || '无',
                value: `${toFixed(accMul(item.hotelAndElseCost / item.amount, 100))}%`,
              },
            ]
          } else if (item.objType == "B") {
            this.list3Total = item.amount;
          }
        }
        this.list1Total = this.list1Total.toFixed(2);
      }
    },
    created() {
      this.spinner = true;
      this.listData();
    }
  };
</script>

<style lang="less" scoped>
  @import "~vux/src/styles/1px.less";
  @import "~vux/src/styles/center.less";

  .tab-swiper {
    background-color: #fff;
    height: 100%;
  }

  .spinner_task {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    z-index: 99;
  }
</style>
