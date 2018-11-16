<template>
  <div class="baseinfo_wrapper">
    <div class="baseinfo_content">
      <div class="each_info" @click="showPop = true">
        <div class="title">经办人</div>
        <div class="mode">
          <span class="mode_content">{{selItems.nickname}}</span>
          <x-icon class="r_arrow" type="ios-arrow-forward" size="18" ></x-icon>
          <!-- <span class="iconfont icon-youjiantou"></span> -->
        </div>
      </div>
      <popup-picker title="经办组织" :data="groupList"  v-model="group" value-text-align="right" :columns="1" @on-change="changeGroup($event)"></popup-picker>
      <popup-picker title="经办职位" :data="roleList"  v-model="role" value-text-align="right" :columns="1" @on-change="changeRole($event)"></popup-picker>
      <div class="each_info">
        <!-- <popup-picker title="经办组织" :data="groupList"  v-model="group" value-text-align="right"></popup-picker> -->
        <!-- <div class="title">经办组织</div>
        <div class="mode">
          <span class="mode_content">{{selItems.handlerUnitName}}</span>
          <span class="iconfont icon-youjiantou"></span>
        </div> -->
      </div>
      <div class="each_info">
        <!-- <popup-picker title="经办职位" :data="roleList"  v-model="role" value-text-align="right"></popup-picker> -->
        <!-- <div class="title">经办职位</div>
        <div class="mode">
          <span class="mode_content">{{selItems.handlerRoleName}}</span>
          <span class="iconfont icon-youjiantou"></span>
        </div> -->
      </div>

    </div>
     <div v-transfer-dom>
      <popup v-model="showPop" height="80%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
        <div class="trade_pop">
          <div class="title">
            <!-- 搜索栏 -->
            <d-search @search='searchList' @turn-off="onHide" :isFill='true'></d-search>
          </div>
          <!-- 经理列表 -->
          <r-scroll class="pop-list-container" :options="scrollOptions" :has-next="hasNext"
                    :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
            <div class="pop-list-item box_sd" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item,index)">
              <div class="pop-list-main ">
                <div class="pop-list-info">
                  <!--联系人电话 -->
                  <div class="withColor">
                    <div class="ForInline name" style="display:inline-block">
                      <span>{{item.nickname}}</span>
                    </div>
                  </div>
                  <div class="withColor" v-if="item.dealerMobilePhone">
                    <div class="ForInline " style="display:inline-block">
                      <span class='creator'>{{item.dealerMobilePhone}}</span>
                    </div>
                  </div>
                  <!-- 地址 -->
                  <!-- <div class="withoutColor">
                    <span>{{item.province}}{{item.city}}{{item.county}}{{item.address}}</span>
                  </div> -->
                </div>
              </div>
              <!-- icon -->
              <x-icon class="isSelIcon" type="ios-checkmark" size="20" v-show="showSelIcon(item)"></x-icon>
            </div>
          </r-scroll>
        </div>
      </popup>
    </div>

  </div>
</template>

<script>
// vux 引入
import {Icon, Popup, TransferDom, LoadMore, PopupPicker } from 'vux'
// 请求 引入
import { listUsers, getGroupByUserId, getRoleByUserId } from 'service/commonService'
// 组件 引入
import RScroll from 'components/RScroll'
import DSearch from 'components/search'
export default {
  name: 'BaseInfo',
  props: {
    info: {
      type: Object,
      default() {
        return {}
      }
    },
    // 默认值
    defaultValue: {
      type: Object,
      default() {
        return {}
      }
    },    
  },
  directives: {TransferDom},
  components: {
    Icon, Popup, RScroll, DSearch,LoadMore,PopupPicker 
  },
  data() {
    return {
      currentUser: {},
      limit: 50,
      page: 1.,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
      },
      showPop: false,
      srhInpTx: '', // 搜索框内容
      selItems: {}, // 哪些被选中了
      listData: [],
      groupList: [],
      roleList: [],
      group: [],
      role: []

    }
  },
  watch: {
    // info: {
    //   handler(val) {
    //     this.currentUser = {...val}
    //   }
    // },
    defaultValue(val) {
      this.setDefaultValue();
    }
  },
  methods: {
    // TODO 弹窗展示时调用
    onShow() {
      this.$nextTick(() => {
        if (this.$refs.bScroll) {
          this.$refs.bScroll.refresh();
        }
      })
    },
    // TODO 弹窗隐藏时调用
    onHide() {
      this.showPop = false;
    },
    // TODO 搜索仓库
    searchList({val = ''}) {
      this.srhInpTx = val;
      this.listData = [];
      this.page = 1;
      this.hasNext = true;
      this.getlistUsers();
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getlistUsers();
    },
    // TODO 设置默认值
    setDefaultValue() {
      this.selItems = this.defaultValue ? {...this.defaultValue,userId: this.defaultValue.handler,nickname: this.defaultValue.handlerName} : {};
      this.group = [this.selItems.handlerUnitName];
      this.role = [this.selItems.handlerRoleName]
      // this.group = [{name: this.selItems.handlerUnitName,value: this.selItems.handlerUnitName}];
      // this.role = [{name: this.selItems.handlerRoleName,value: this.selItems.handlerRoleName}]
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      return this.selItems.userId === sItem.userId;
    },
    changeGroup(e){
      console.log(e)
    },
    changeRole(e){
      console.log(e)
    },
    // TODO 选择物料
    async selThis(sItem, sIndex) {
      this.showPop = false;
      this.selItems = sItem;
      await this.getGroupByUserId().then(()=>{
        this.group = [this.groupList[0].name];
      });
      await this.getRoleByUserId().then(()=>{
        this.role = [this.roleList[0].name];
      });
      let emitObj = {
        handler: this.selItems.userId,
        handlerName: this.selItems.nickname,
        handlerUnit: 347,
        handlerUnitName: this.group[0],
        handlerRole: 1,
        handlerRoleName: this.role[0],
      }
      this.$emit('sel-item',emitObj);
    },
    // TODO 请求部门
    getGroupByUserId(){
      return getGroupByUserId(this.selItems.userId).then(({tableContent = []}) => {
        tableContent.forEach(item=>{          
          this.groupList.push({
            ...item,
            name: item.userGroupName,
            value: item.userGroupName,
          })

        })
      })
    },
    // TODO 请求职位
    getRoleByUserId(){
      return getRoleByUserId(this.selItems.userId).then(({tableContent = []}) => {
        tableContent.forEach(item=>{          
          this.roleList.push({
            ...item,
            name: item.userGroupName,
            value: item.userGroupName,
          })

        })
      })

    },
    // TODO 获取仓库列表
    getlistUsers() {
      let filter = [];
      if (this.srhInpTx) {
        filter = [
          ...filter,
          {
            operator: 'like',
            value: this.srhInpTx,
            property: 'nickname',
          }];
      }
      return listUsers({
        limit: this.limit,
        page: this.page,
        start: (this.page - 1) * this.limit,
        filter: JSON.stringify(filter),
      }).then(({dataCount = 0, tableContent = []}) => {
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      });
    },
  },
  created() {
    this.setDefaultValue();
    this.getlistUsers();
  }

}
</script>

<style scoped lang="scss">
  .baseinfo_wrapper{
    width: 95%;
    margin: .1rem auto;
    background: #fff;
    margin-bottom: 0.1rem;
    box-sizing: border-box;
    padding: .06rem .1rem;
    .baseinfo_content{
      .each_info{
        display: flex;
        font-size: .14rem;
        align-items: center;
        justify-content: space-between;
        padding: 0.05rem 0;
        .title{
          color: #757575;
        }
        .mode{
          font-weight: 500;
          display: flex;
          align-items: center;
          .mode_content{
            color: #111;
            // margin-right: .06rem;
          }
          .iconfont{
            font-weight: bold;
            font-size: 0.14rem;
          }
          .r_arrow {
            fill: #C8C8CD;
          }
        }
      }
      /deep/ .weui-cell{
        padding: 0.05rem 0;
        &.before{
          border:none;
        }
        .weui-label{
          color: #757575;
          font-size: 0.14rem;
        }
        .vux-cell-value{
          color: #111;
          font-size: 0.14rem;
        }
        // .weui-cell__ft:after{
        //   border-color: #757575;
        // }
      }
      .vux-cell-box:not(:first-child):before{
        border: none;
      }
    }
  }
   // 弹出层
  .trade_pop_part {
    background: #fff;
    .trade_pop {
      padding: 0 .08rem;
      height: 100%;
      overflow: hidden;
      // 顶部
      .title {
        position: relative;
        margin: .08rem 0;
        font-size: .2rem;
      }
      .each_mode {
        margin-right: .1rem;
        display: inline-block;
        padding: .04rem .2rem;
      }
      // 列表容器
      .pop-list-container {
        width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        height: calc(100% - .46rem);
        /deep/ .scroll-wrapper {
          padding: .04rem .04rem 0 .3rem;
        }
        // 列表项
        .pop-list-item {
          position: relative;
          display: flex;
          padding: 0.08rem;
          margin-bottom: .2rem;
          box-sizing: border-box;
          // 阴影
          &.box_sd {
            box-sizing: border-box;
            box-shadow: 0 0 8px #e8e8e8;
          }
          // 列表主体
          .pop-list-main {
            flex: 1;
            padding-left: .1rem;
            box-sizing: border-box;
            display: inline-block;
            // 物料信息
            .pop-list-info {
              color: #757575;
              font-size: .14rem;
              // 有颜色包裹的
              .withColor {
                margin-top: .04rem;
                .name {
                  color: #5077aa;
                  font-size: .14rem;
                  font-weight: bold;
                }
                .creator {
                  color: #111;
                  font-weight: bold;
                }
              }
            }
          }
          // 选择icon
          .selIcon,
          .isSelIcon {
            top: 50%;
            left: -.3rem;
            position: absolute;
            transform: translate(0, -50%);
          }
          .isSelIcon {
            fill: #5077aa;
          }
        }
      }

    }
  }

</style>
