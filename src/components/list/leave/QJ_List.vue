<template>
  <div class="pages cpxq-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="instance-item-wrapper" v-for="(item, index) in listData" @click="goDetail(item, index)"
             :class="{visited: item.visited}" :key="index">
          <div class="instance-header">
            <span class="instance_code vux-1px-l">{{item.transCode}}</span>
            <span class="instance_status" :class="item.statusClass">{{item.biStatus}}</span>
          </div>
          <div class="instance-main">
            <div class="instance_info_wrapper">
              <div class="instance_header_wrapper">
                <div class="leave_info">
                  <div class="leave_type">
                    <span v-for="(tItem, tIndex) in item.leaveTypes" :key="tIndex">{{tItem}}</span>
                  </div>
                  <div class="leave_content">
                    <div class="creator">
                      <img :src="item.photo" alt="user-img" @error="getDefaultImg(item, item.gender)">
                      <div class="creator_name">
                        <span class="name">{{item.handlerName}}</span>
                        <span>工号: {{item.userCode}}</span>
                      </div>
                    </div>
                    <div class="leave_days">
                      <span class="day">{{item.daysCount}}天</span>
                      <span>请假天数</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="instance_detail vux-1px-t">
                <div class="instance_detail_item">
                  <i class="icon icon-handler"></i>
                  <span>创建人：{{item.creatorName}}</span>
                </div>
                <div class="instance_detail_item">
                  <i class="icon icon-mod-time"></i>
                  <span>修改时间：{{item.modTime | dateFormat("YYYY-MM-DD HH:mm")}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
  import {getAllUsers} from 'service/Directorys/userService'
  import {getList} from 'service/commonService'
  import { getLeaveDetailItem } from 'service/listService'
  import listCommon from 'pageMixins/bizListCommon'
  import { dateFormat } from 'vux'
  import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
  // 映射表引入
  import Apps from '@/home/pages/apps/bizApp/maps/Apps'

  export default {
    name: 'QJ_List',
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        filterList: [ // 过滤列表
          {
            name: '经办人',
            value: 'creatorName',
          },{
            name: '交易号',
            value: 'transCode',
          },
        ],
        listViewID: 2600,
        daysCount: null,
      }
    },
    mixins: [listCommon],
    methods: {
      // 获取默认图片
      getDefaultImg(item, gender) {
        let url = gender === 1
          ? require('assets/ava01.png')
          : require('assets/ava02.png');
        if (item.photo) {
          item.photo = url;
        }
        return url;
      },
      // 获取订单数据
      getList (noReset = false) {
        let filter = [];
        // tab 切换
        if (this.activeTab) {
          filter = [{
            operator: "like",     //模糊查询like，精确查询eq
            property: "biStatus",
            value: this.activeTab
          }]
        }
        // 搜索
        if (this.serachVal) {
          let obj = {
            operator: "like",
            property: this.filterProperty,
            value: this.serachVal
          }
          if (this.activeTab) {
            obj.attendedOperation = 'and';
          }
          filter = [
            ...filter,
            obj
          ];
        }
        // 过滤
        if(Object.keys(this.otherFilter).length){
          let keyArr = Object.keys(this.otherFilter);
          for(let key in this.otherFilter){
            let obj = {
              property: key,
              operator: 'in'
            }
            this.otherFilter[key].value.forEach((item, index) => {
              let key = `value${index+1}`;
              obj[key] = item;
            })
            filter.push(obj);
          }

        }
        // 时间过滤
        if(this.timeFilter.startDate || this.timeFilter.endDate) {
          let obj = {
            property: "modTime",
            operator: "date",
            startDate: this.timeFilter.startDate,
            endDate: this.timeFilter.endDate,
          }
          filter.push(obj);
        }
        return getLeaveDetailItem({
          limit: this.limit,
          page: this.page,
          filter: JSON.stringify(filter),
          sort: JSON.stringify(this.sort),
        }).then(({total = 0, instanceList = []}) => {
          this.hasNext = total > (this.page - 1) * this.limit + instanceList.length;
          instanceList.forEach(item => {
            this.setStatus(item);
            item.daysCount = 0;
            item.leaveTypes = []
            // 不同应用返回的字段名不同，统一增加渲染的公共字段包括（物料，往来）
            item.crtTime = dateFormat(item.crtTime, 'YYYY-MM-DD HH:mm:ss');
            item.modTime = dateFormat(item.modTime, 'YYYY-MM-DD HH:mm:ss');
            item.itemCount = item.detailItem.length;
            // 列表当中每个订单最多展现3个物料
            item.detailItem = item.detailItem.slice(0, 3);
            // 如没有头像 则指定默认头像
            if (!item.photo) {
              item.photo = this.getDefaultImg('', item.gender);
            }
            item.detailItem.forEach(mItem => {
              item.leaveTypes.push(mItem.leaveType)
              item.daysCount = accAdd(item.daysCount, mItem.leaveDays)
            })
            item.leaveTypes = [...new Set(item.leaveTypes)]
          });
          this.listData = this.page === 1 ? instanceList : [...this.listData, ...instanceList];
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
          // 判断最近有无新增数据
          let text = '';
          if (noReset && this.activeIndex === 0) {
            if (this.total) {
              text = total - this.total === 0 ? '暂无新数据' : text = `新增${total - this.total}条数据`;
              this.$vux.toast.show({
                text: text,
                position: 'top',
                width: '50%',
                type: "text",
                time: 700
              })
            }
          }
          // 列表总数据缓存
          if (this.activeIndex == 0 && this.page === 1) {
            sessionStorage.setItem(this.applyCode, total);
          }
        }).catch(e => {
          this.resetScroll();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
  .instance-item-wrapper {
    color: #333;
    padding: .15rem;
    background: #fff;
    border-radius: 4px;
    margin: .1rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    // box-shadow: 0 2px 10px #e8e8e8;
    transition: background-color 200ms linear;
    box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.5);
    &.visited {
      background-color: $list_visited;
    }
    .instance-header {
      display: flex;
      justify-content: space-between;
      .instance_code {
        position: relative;
        left: -.15rem;
        padding-left: .14rem;
        line-height: .12rem;
        font-size: .12rem;
        &:before {
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .instance_status {
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .duty_done_c {
      color: #3296FA;
    }
    .duty_doing_c {
      color: #333;
    }
    .duty_fall_c {
      color: #999;
    }

    .instance-main {
      .icon {
        display: inline-block;
        width: .5rem;
        height: .5rem;
      }
      .instance_header_wrapper {
        display: flex;
        align-items: flex-start;
      }
      .leave_info {
        width: 100%;
        .leave_type {
          display: flex;
          padding: .12rem 0;
          span {
            padding: .04rem .06rem;
            background: #eaf6ff;
            border-radius: .02rem;
            font-size: .12rem;
            line-height: .12rem;
            color: #299DFF;
            margin-right: .08rem;
          }
        }
      }
      .leave_content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: .12rem;
        padding-bottom: .15rem;
        .creator {
          display: flex;
          .creator_name{
            color: #999999;
            span {
              display: block;
            }
            .name {
              color: #333;
              line-height: .2rem;
              margin-bottom: .04rem;
            }
          }
        }
        img {
          width: .4rem;
          height: .4rem;
          border-radius: .08rem;
          margin-right: .12rem;
        }
        .leave_days {
          text-align: right;
          span {
            display: block;
            color: #999;
          }
          .day {
            font-size: .18rem;
            color: #FA7138;
            font-weight: bold;
            line-height: .22rem;
          }

        }

      }
      .instance_header {
        flex: 1;
        line-height: .18rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .instance_process_status {
        margin-left: .22rem;
        padding: .04rem .05rem;
        line-height: .12rem;
        border: 1px solid #FB880B;
        border-radius: .04rem;
        color: #FB880B;
        font-size: .1rem;
        font-weight: 500;
      }

      .instance_detail {
        display: flex;
        padding-top: .15rem;
        justify-content: space-between;
        .icon {
          margin-right: .05rem;
          width: .16rem;
          height: .16rem;
        }
      }
      .instance_detail_item {
        display: flex;
        align-items: center;
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
      }
    }
  }
</style>
