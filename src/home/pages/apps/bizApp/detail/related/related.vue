<template>
  <div class='pages related_apply'>
    <div class="big_title">
      <p class="vux-1px-b">相关实例</p>
    </div>
    <!--<div class="relevant_list">
      <div class="each_app vux-1px-b" v-for='(item, index) in RelatedAppList' :key="index"
           @click="getRelatedData(item)">
        <div class="app_info">
          <div class="title">业务应用</div>
          <div class="app_name">
            <span>{{item.listName}}</span>
          </div>
          <div class="msg_num">
            {{item.itemCount}}
            <span class="msg_tx">关联</span>
          </div>
          <div class="r_arrow" v-if='item.itemCount>0'>
            <x-icon type="ios-arrow-right" size="20"></x-icon>
          </div>
        </div>
      </div>
    </div>-->
    <div class="swiper-container swiper-related">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(item, index) in RelatedAppList" :key="index">
          <header class="header">
            <div>
              <img class="icon" :src="item.icon">
              <span class="related-name">{{item.listName}}</span>
            </div>
            <div @click="goRelation(item)">创建并关联</div>
          </header>
          <div class="related-list">
            <div class="related-item" v-for="(rItem, rIndex) in item.relatedList" @click="goDetail(item, rItem)"
                 :key="rIndex">
              <div class="code">
                <span class="order_title">编码</span>
                <span class="order_num">{{rItem.transCode}}</span>
              </div>
              <div class="app-name">{{rItem.transTypeName}}</div>
              <div>创建人: {{rItem.creatorName}}</div>
              <div>创建时间: {{rItem.crtTime | dateFormat('YYYY-MM-DD')}}</div>
              <div>生效时间: {{rItem.effectiveTime | dateFormat('YYYY-MM-DD')}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <pop-related-list :show='true' :idInfo='idInfo' :filtersData='filtersData' v-model='showPop'
                      ref='relatedList'></pop-related-list>
  </div>

</template>

<script>
  import {dateFormat} from 'vux'
  import PopRelatedList from 'components/Popup/PopRelatedList'
  import {getAppExampleDetails} from 'service/detailService'
  import {getList} from 'service/commonService'
  import {getListView} from 'service/detailService'
  import Apps from '../../maps/Apps'

  export default {
    data() {
      return {
        showPop: false,
        listId: '',
        transCode: '',
        idInfo: {},                     // 当中包括 fileId(文件夹(应用分类)id) listId(应用id)
        filtersData: [],
        RelatedAppList: [],
        activeIndex: -1,
        swiper: null,
      }
    },
    components: {
      PopRelatedList
    },
    methods: {
      //显示相关实例的pop
      getRelatedData(item) {
        if (item.itemCount > 0) {
          this.idInfo = {
            fileId: item.parentNav,
            listId: item.listId
          }
          item.content.forEach(val => {
            this.filtersData.push(val.transCode);
          })
          this.$HandleLoad.show();
        }
      },
      //TODO 获取相关实例
      getAppExampleDetails() {
        return getAppExampleDetails({
          transCode: this.transCode,
          listId: this.listId
        }).then(({relevantItems: relatedApply}) => {
          relatedApply.forEach(item => {
            if (Apps[item.listId]) {
              let defaultFilter = item.content.map(cItem => {
                return cItem.transCode
              }).join(',');
              this.RelatedAppList.push({
                ...item,
                page: 1,
                limit: 10,
                defaultFilter,
                // 图片处理
                icon: item.icon ? `/dist/${item.icon}` : ''
              });
            }
          })
        })
      },
      // TODO 获取列表的id
      getViewId(listId) {
        return getListView({listId}).then(data => {
          return data[0].id
        })
      },
      // TODO 获取相关实例详情
      async getRelatedList(item) {
        let {listId = '', defaultFilter = '', page = 1, limit = 10} = item;
        let viewId = await this.getViewId(listId);
        let filter = [{property: "transCode", operator: "in", value: defaultFilter}];
        return getList(viewId, {
          limit: limit,
          page: page,
          start: (page - 1) * limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          item.hasNext = dataCount > (page - 1) * limit + tableContent.length;
          let relatedList = page === 1 ? tableContent : [...item.relatedList, ...tableContent];
          this.$set(item, 'relatedList', relatedList);
        });
      },
      // TODO 跳转到详情页
      goDetail(item, rItem) {
        let {parentNav, listId} = item;
        this.$router.push({
          path: `/detail/${parentNav}/${listId}`,
          query: {
            name: rItem.transTypeName,
            transCode: rItem.transCode,
            fromRalted: true
          }
        })
      },
      // TODO 创建并关联
      goRelation(item) {
        let {uniqueId} = this.$route.query;
        let {parentNav: fileId, listId, transName} = item;
        this.$router.push({
          path: `/fillform/${fileId}/${listId}`,
          query: {
            name: transName,
            uniqueId,
            relationKey: this.transCode
          }
        })
      },
    },
    filters: {
      dateFormat,
    },
    created() {
      this.$loading.show();
      this.listId = this.$route.params.listId;
      this.transCode = this.$route.query.transCode;
      (async () => {
        await this.getAppExampleDetails();
        let promises = [];
        this.RelatedAppList.forEach(item => {
          promises.push(this.getRelatedList(item));
        });
        Promise.all(promises).then(() => {
          this.$nextTick(() => {
            this.swiper = new this.Swiper('.swiper-related', {
              slidesPerView: 'auto',
              centeredSlides: true,
              observer: true,       //修改swiper自己或子元素时，自动初始化swiper
              observeParents: true,
            });
          });
          this.$loading.hide();
        });
      })();
    }
  }
</script>

<style lang="scss" scoped>
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  .related_apply {
    background: #fff;
    .swiper-related {
      width: 100%;
      height: calc(100% - .56rem);
      .swiper-slide {
        padding: .1rem;
        width: 90%;
        margin: 0 .05rem;
        border-radius: .2rem;
        background: #f0f1f5;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        justify-content: space-between;
        height: .54rem;
      }
      .icon {
        margin-right: .1rem;
        width: .54rem;
        height: .54rem;
      }
      .related-name {
        vertical-align: top;
      }
      .related-list {
        height: calc(100% - .54rem);
        overflow: auto;
      }
      .related-item {
        margin: .1rem auto .2rem;
        padding: .06rem .08rem .04rem;
        border-radius: .08rem;
        background-color: #fff;
        box-shadow: 0 2px 10px #e8e8e8;
        box-sizing: border-box;
      }
      //实例编码
      .code {
        display: flex;
        color: #fff;
        font-size: 0;
        font-weight: bold;
        .order_title {
          padding: 0 .04rem;
          background: #1160aa;
          font-size: .12rem;
        }
        // 订单号
        .order_num {
          padding: 0 .04rem;
          background: #9bb4da;
          border-top-right-radius: .08rem;
          font-size: .12rem;
        }
      }
      .app-name {
        font-weight: 300;
        font-size: .2rem;
        margin-top: .02rem;
      }
    }
  }

  .big_title {
    width: 90%;
    color: #111;
    margin: 0 auto;
    padding: .04rem;
    font-size: .3rem;
    font-weight: 300;
    box-sizing: border-box;
  }

  // 相关应用
  .relevant_list {
    width: 90%;
    margin: 0 auto;
    .each_app {
      margin-bottom: .1rem;
      position: relative;
      border-radius: .08rem;
      .app_info {
        padding: .1rem;
        box-sizing: border-box;
        .title {
          color: #4F90F9;
          font-size: .12rem;
          font-weight: bold;
        }
        .app_name {
          font-size: .18rem;
          .msg_count {
            float: right;
            margin-right: .1rem;
          }
        }
        .msg_num {
          color: #3f72af;
          font-size: .2rem;
          .msg_tx {
            // color: #757575;
            font-size: .12rem;
          }
        }
        .r_arrow {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translate(0, -50%);
        }
      }
    }
  }

</style>

