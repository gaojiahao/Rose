<template>
  <div class="pages">
    <div id='mescroll' class="mescroll">
      <div>
        <div class="top_caution" v-show="false">
          您有即将逾期的任务，快去看看！
          <icon type="cancel f_r"></icon>
        </div>
        <div class="each_duty" v-for="(item, index) in listData" :key="index">
          <div class="duty_top">
            <p class="duty_name">
              <span class="duty_status">
                <span class="duty_status_name">{{item.statusName}}</span><span class="duty_status_info"
                                                                               :class="item.statusClass">{{item.status}}</span>
              </span>
              {{item.requireName}}
            </p>
          </div>
          <div class="duty_btm">
            <p class="duty_code">
              {{item.code}}
              <span class="duty_crt_man">{{item.crtName}}</span></p>
            <p class="duty_time">{{item.time | filterTime}}</p>
          </div>
          <span class="red_caution" v-show="item.hasRedPoint"></span>
        </div>
        <divider class="no-data" v-show="listData.length === 0">暂无代办数据</divider>
        <!--<div class="each_duty">
          <div class="duty_top">
            <p class="duty_name">
              <span class="duty_status">
                <span class="duty_status_name">实施</span><span class="duty_status_info duty_urgent_c">将逾期</span>
              </span>
              新增 项目类产品 应用
            </p>
          </div>
          <div class="duty_btm">
            <p class="duty_code">SSXQ_1803_0024<span class="duty_crt_man">刘治增</span></p>
            <p class="duty_time">2018-03-07</p>
          </div>
        </div>-->
      </div>
    </div>
  </div>
</template>

<script>
  import {numberPad, Divider, Icon, Search} from 'vux'
  import todoService from './../service/todoService'
  import businessMap from './maps/business'

  export default {
    components: {
      Divider,
      Icon,
      Search,
    },
    data() {
      return {
        todoScroll: null,
        listData: [],
        page: 1
      }
    },
    methods: {
      // TODO 获取状态名字
      getStatusName(item) {
        let business = item.businessKey.split('_');
        return businessMap[business[0]] || '未知项';
      },
      // TODO 获取状态、状态的class、是否展示红点
      filterStatusAndClass(item) {
        let obj = {
          status: item.status || '',
          hasRedPoint: false
        };
        switch (item.status) {
          case '进行中':
            if (item.endTime) {
              obj.statusClass = 'duty_process_c';
            } else {
              obj.status = '待处理';
              obj.statusClass = 'duty_wait_c';
              obj.hasRedPoint = true;
            }
            break;
          case '已生效':
            obj.statusClass = 'duty_process_c';
            break;
          case '将逾期':
            obj.statusClass = 'duty_urgent_c';
            break;
        }
        return obj;
      },
      // TODO 获取代办列表
      getTodoList() {
        return new Promise((resolve, reject) => {
          todoService.getList({
            page: this.page
          }).then(data => {
            let tmpList = [];
            tmpList = data.tableContent && data.tableContent.map(item => {
              return Object.assign({}, {
                statusName: this.getStatusName(item),
                requireName: item.requireName || '见详情',
                code: item.businessKey || '',
                crtName: item.crtName,
                time: item.crtTime,
              }, this.filterStatusAndClass(item));
            });
            this.listData = this.page === 1 ? tmpList : this.listData.concat(tmpList);
            resolve();
          })
        })
      }
    },
    filters: {
      // TODO 过滤日期
      filterTime(val) {
        let date = new Date(val.replace(/-/g, '/'));
        return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`;
      }
    },
    created() {
      this.getTodoList();
    },
    mounted() {
      let Mescroll = this.Mescroll;
      this.$nextTick(() => {
        if (!this.todoScroll) {
          this.todoScroll = new Mescroll("mescroll", {
            up: {
              use: false,
              isBounce: true,
              auto: false
            },
            down: {
              use: true,
              autoShowLoading: false,
              showLoading: (mescroll) => {
                this.page = 1;
                this.getTodoList().then(() => {
                  mescroll.endDownScroll(false);
                })
              }
            }
          })
        }
      })
    }
  }
</script>

<style lang='scss' scoped>
  .mescroll {
    position: fixed;
    top: 0;
    bottom: 0;
    height: auto;
    .top_caution {
      width: 100%;
      height: 0.7rem;
      line-height: 0.7rem;
      color: #D7803D;
      background: #FDFBDF;
      box-sizing: border-box;
      font-size: 0.28rem;
      padding: 0 0.4rem;
      position: relative;
      .f_r {
        position: absolute;
        top: 0.13rem;
        right: 0.4rem;
      }

    }
    .each_duty { //任务栏
      margin: .4rem auto;
      padding: .2rem .2rem;
      position: relative;
      width: 85%;
      box-shadow: 0 .04rem .2rem #e8e8e8;

      .duty_name { //任务名称
        width: 100%;
        font-size: .32rem; // 1rem=100px 手机像素2：1 这里原字体大小为16px
        font-weight: bold;
        max-height: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        .duty_status { //任务状态
          font-size: .24rem; // 这里原字体大小为14px
          color: #fff;
          margin-right: .1rem;
          padding: .05rem 0;
          .duty_status_name {
            background: #000;
            display: inline-block;
            padding: 0 .1rem;
            border-top-left-radius: .24rem;
            border-bottom-left-radius: .24rem;
          }
          .duty_status_info { //进行中
            padding: 0 .1rem;
            display: inline-block;
            border-top-right-radius: .24rem;
            border-bottom-right-radius: .24rem;
          }
          .duty_process_c {
            background: #26AB28;
          }
          .duty_wait_c {
            background: #FADB51;
            color: #000;
          }
          .duty_urgent_c {
            background: #E34E43;
          }
        }
      }
      .duty_btm {
        height: .48rem;
        line-height: .48rem;

        .duty_code { //任务编码
          float: left;
          font-size: .3rem;
          color: #7D7D7D;
          font-weight: 200;

          .duty_crt_man { // 任务创建者
            position: relative;
            background: #333;
            font-size: 0.24rem;
            color: #FDF6A4;
            padding: .04rem;

          }
          .duty_crt_man:before { //左尖角
            position: absolute;
            content: "";
            width: 0;
            height: 0;
            top: 0;
            left: -.08rem;
            border-right: .08rem solid #333;
            border-bottom: .08rem solid transparent;
          }
        }
        .duty_time { //任务创建时间
          float: right;
          font-size: .3rem;
          color: #7D7D7D;
          font-weight: 200;
        }
      }
      .red_caution { //红点
        width: 0.12rem;
        height: 0.12rem;
        background: red;
        border-radius: 50%;
        position: absolute;
        left: .01rem;
        top: .4rem;
      }
    }
    .no-data {
      margin: 0 .8rem;
    }
  }
</style>
