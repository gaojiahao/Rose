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
    <div class="my-info-total">
      <span>销量套数</span>
      <span>{{totalCoverNum}}/套</span>
    </div>
    <div class="my-info-total">
      <span>费用销售比</span>
      <span>{{costSalesRatio || '0%'}}</span>
    </div>
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
        :header-value="'￥'+AclassTotal | numberComma"
        :body-items="list2">
      </form-preview>

      <divider>B类产品</divider>
      <form-preview
        class="project_part"
        header-label="销量金额"
        :header-value="'￥'+BClassTotal | numberComma"
        :body-items="bClassList">
      </form-preview>
    </div>
    <div class="my_info_part">
      <divider>个性化产品</divider>
      <form-preview
        class="project_part"
        header-label="销量金额"
        :header-value="'￥'+SClassTotal | numberComma"
        >
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
        list1Total: 0,
        AclassTotal: 0,
        BClassTotal: 0,
        remark: "",
        spinner: false,
        totalCoverNum: 0, // 销量套数
        costSalesRatio: '', // 费用销售比
        bClassList: [], // b类产品展示的item
        SClassTotal: 0,
      };
    },
    filters: {
      numberComma
    },
    methods: {
      mylist(tab) {
        this.totalCoverNum = 0;
        this.costSalesRatio = '';
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
        let AclassTotal = 0;
        let BClassTotal = 0;
        let list2 = [];
        let bClassList = [];
        let hotelAndElseCost = 0;
        let totalCoverNum = 0;
        this.list1Total = 0;
        this.list1.length = 0;
        this.list2.length = 0;
        let SClassTotal = 0;

        for (let i = 0; i < m.length; i++) {
          let item = m[i];
          switch (item.objType) {
            case '项目类产品':
              if (item.objName) {
                this.list1Total += Number(item.amount);
                this.list1.push({
                  label: item.objName,
                  value: `￥${numberComma(toFixed(item.amount))} (${item.qty}件/折合${toFixed(item.coverNum || 0)}套)`,
                });
                totalCoverNum = accAdd(totalCoverNum, item.coverNum);
              }
              break;
            case 'A':
              if (item.objName === 'A类产品') {
                AclassTotal = accAdd(AclassTotal, item.amount);
                list2 = [
                  ...list2,
                  {
                    label: '费用明细(如下)',
                    value: '',
                  }, {
                    label: '住宿费',
                    value: item.hotelCost ? `￥${numberComma(toFixed(Number(item.hotelCost)))}` : '无',
                  }, {
                    label: '市内交通费',
                    value: item.cityTrafficCost ? `￥${numberComma(toFixed(Number(item.cityTrafficCost)))}` : '无',
                  }, {
                    label: '长途交通费',
                    value: item.longCityTrafficCost ? `￥${numberComma(toFixed(Number(item.longCityTrafficCost)))}` : '无',
                  }, {
                    label: '其他费用',
                    value: item.elseCost ? `￥${numberComma(toFixed(Number(item.elseCost)))}` : '无',
                  }, {
                    label: '合计',
                    value: item.hotelAndElseCost ? `￥${numberComma(toFixed(Number(item.hotelAndElseCost)))}` : '无',
                  },
                ];
                hotelAndElseCost = item.hotelAndElseCost;
              } else {
                list2.unshift({
                  label: item.objName,
                  value: `￥${toFixed(item.amount)}`,
                });
              }
              break;
            case '其他A类':
              list2 = [
                {
                  label: '其他A类金额',
                  value: `￥${numberComma(toFixed(item.amount))}/折合${Number(item.coverNum)}套`,
                },
                ...list2
              ]
              totalCoverNum = accAdd(totalCoverNum, item.coverNum);
              break;
            case 'B':
              if (item.objName === 'B类产品') {
                BClassTotal = accAdd(BClassTotal, item.amount);
              } else {
                totalCoverNum = accAdd(totalCoverNum, item.coverNum);
                bClassList.push({
                  label: item.objName,
                  value: `￥${numberComma(toFixed(item.amount))}/折合${Number(item.coverNum)}套`,
                });
              }
              break;
            case 'S':
              if (item.objName === '个性化产品') {
                SClassTotal = accAdd(SClassTotal, item.amount);
              }
              break;
            default:
              break;
          }
        }
        this.totalCoverNum = totalCoverNum;
        this.list2 = list2;
        this.bClassList = bClassList;
        this.costSalesRatio = Number(AclassTotal) !== 0 ? `${toFixed(accMul(hotelAndElseCost / AclassTotal, 100))}%` : '∞';
        this.AclassTotal = AclassTotal;
        this.BClassTotal = toFixed(BClassTotal);
        this.SClassTotal = toFixed(SClassTotal);
        this.list1Total = toFixed(this.list1Total);
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

  .pages {
    .my-info-total {
      display: flex;
      font-size: 18px;
      margin-top: 10px;
      color: #999999;
      padding: 10px 15px;
      background-color: #fff;
      justify-content: space-between;
    }
  }

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
  .vux-divider {
    background-color: #f5f5f5;   
  }
</style>
