<template>
  <div class="baseinfo_wrapper">
    <div class="baseinfo_content">
      <div class="each_info" @click="showPop = true">
        <div class="title">经办人</div>
        <div class="mode">
          <span class="mode_content">{{selItems.nickname}}</span>
          <x-icon class="r_arrow" type="ios-arrow-forward" size="18" ></x-icon>
        </div>
      </div>
      <popup-picker title="经办组织" :data="groupList" :columns="1" v-model="group" @on-change="changeGroup" ref="groupPicker">
        <template slot="title">
          <span class="title" :class="{required : isRequired}">经办组织
          </span>
        </template>
      </popup-picker>
      <popup-picker title="经办职位" :data="roleList" :columns="1" v-model="role" @on-change="changeRole" ref="rolePicker"></popup-picker>
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
            <div class="pop-mater-list-item box_sd" v-for="(item, index) in listData" :key='index'
                 @click.stop="selThis(item,index)">
              <div class="pop-list-main ">
                <!-- 头像 -->
                <div class="user-photo">
                  <img :src="item.photo" alt="mater_img" @error="getDefaultImg(item)">
                </div>
                <div class="pop-list-info">
                  <!-- 名字 -->
                  <div class="withColor">
                    <div class="ForInline name" style="display:inline-block">
                      <span>{{item.nickname}}</span>
                    </div>
                  </div>
                  <!-- 用户id -->
                  <div class="withColor" v-if="item.userCode" style="margin-top:0;">
                    <div class="ForInline " style="display:inline-block">
                      <span>{{item.userCode}}</span>
                    </div>
                  </div>
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
    //是否为必填项
    isRequired: {
      type: Boolean,
      default: true
    }   
  },
  directives: {TransferDom},
  components: {
    Icon, Popup, RScroll, DSearch,LoadMore,PopupPicker 
  },
  data() {
    return {
      currentUser: {},
      limit: 50,
      page: 1,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
      },
      showPop: false,
      srhInpTx: '', // 搜索框内容
      selItems: {}, // 哪些被选中了
      listData: [], // 经办人列表
      groupList: [], // 组织列表
      roleList: [], // 职位列表
      group: [], // 选中的组织
      role: [], // 选中的职位
      isSetInitial: false, //用于判断经办组织和经办部门是否设置初始值

    }
  },
  watch: {
    defaultValue(val) {
      this.setDefaultValue();
    },
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
      this.role = [this.selItems.handlerRoleName];
      this.getGroupByUserId();
      this.getRoleByUserId();
      
      
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      return this.selItems.userId === sItem.userId;
    },
    // TODO 获取默认图片
    getDefaultImg(item) {
      let url = item.gender === '男'
        ? require('assets/ava03.png')
        : require('assets/ava04.png')
      if (item) {
        item.photo = url;
      }
      return url;
    },
    // 选择组织
    changeGroup(val) {
      this.selItems.handlerUnitName = val[0]
      this.groupList.forEach( item => {
        if (item.name === val[0]) {
          this.selItems.handlerUnit = item.userGroupId;
          return false;
        }
      })
      let emitObj = {
        handler: this.selItems.userId,
        handlerName: this.selItems.nickname,
        handlerUnit: this.selItems.handlerUnit,
        handlerUnitName: this.selItems.handlerUnitName,
        handlerRole: this.selItems.handlerRole,
        handlerRoleName: this.selItems.handlerRoleName,
      }
      this.$emit('sel-item',emitObj);
    },
    // 选择职位
    changeRole(val) {
      this.selItems.handlerRoleName = val[0]
      this.roleList.forEach(item => {
        if(item.name === val[0]){
          this.selItems.handlerRole = item.userGroupId;
          return false;
        }
      })
      let emitObj = {
        handler: this.selItems.userId,
        handlerName: this.selItems.nickname,
        handlerUnit: this.selItems.handlerUnit,
        handlerUnitName: this.selItems.handlerUnitName,
        handlerRole: this.selItems.handlerRole,
        handlerRoleName: this.selItems.handlerRoleName,
      }
      this.$emit('sel-item',emitObj);
    },
    // TODO 选择物料
    selThis (sItem, sIndex) {
      this.isSetInitial = true;
      this.showPop = false;
      this.selItems = sItem;
      this.getGroupByUserId();
      this.getRoleByUserId();
    },
    // TODO 请求部门
    getGroupByUserId(){
      return getGroupByUserId(this.selItems.userId).then(({tableContent = []}) => {
        this.groupList = []
        tableContent.forEach(item=>{          
          this.groupList.push({
            ...item,
            name: item.userGroupName,
            value: item.userGroupName,
          })
        })
        if(tableContent.length && this.isSetInitial){
          this.group = [tableContent[0].userGroupName];
          this.selItems.handlerUnit = tableContent[0].userGroupId;
        }
      })
    },
    // TODO 请求职位
    getRoleByUserId() {
      return getRoleByUserId(this.selItems.userId).then(({tableContent = []}) => {
        this.roleList = []
        tableContent.forEach(item=>{          
          this.roleList.push({
            ...item,
            name: item.userGroupName,
            value: item.userGroupName,
          })

        })
        if(tableContent.length && this.isSetInitial){
          this.role = [tableContent[0].userGroupName];
          this.selItems.handlerRole = tableContent[0].userGroupId;
        }               
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
          font-weight: bold;
          color: #5077aa;
        }
        .mode{
          font-weight: 500;
          display: flex;
          align-items: center;
          position: relative;
          .mode_content{
            color: #111;
            margin-right: 13px;
          }
          .iconfont{
            font-weight: bold;
            font-size: 0.14rem;
          }
          .r_arrow {
            right: -5px;
            fill: #C8C8CD;
            position: absolute;
            top: .02rem;
            // right: -.05rem;
            

          }
        }
      }
      /deep/ .weui-cell{
        padding: 0.05rem 0;
        .title{
          font-size: 0.14rem;
          color: #757575;
          &.required{
            font-weight: bold;
            color: #5077aa;
          }
        }
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
      // .required{
      //   font-weight: bold;
      //   color: #5077aa;
      //   font-size: 0.14rem;
      // }
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
        .pop-mater-list-item {
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
            // padding-left: .1rem;
            box-sizing: border-box;
            // display: inline-block;
            display: flex;
            //头像
            .user-photo{
              width: .5rem;
              height: .5rem;
              margin-right: .1rem;
              img{
                border-radius: .05rem;
                width: 100%;
                height: 100%;
              }
            }
            // 物料信息
            .pop-list-info {
              color: #757575;
              font-size: .14rem;
              // 有颜色包裹的
              .withColor {
                margin-top: .04rem;
                .name {
                  // color: #5077aa;
                  color: #111;
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
