<template>
  <div class='pages related_apply'>
    <div class="big_title">
      <p class="">相关实例</p>
    </div>
    <div class="swiper-container swiper_related">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(item, index) in RelatedAppList" :key="index">
          <div class="header vux-1px-b">
            <div class="related_info">
              <img class="icon" :src="item.icon">
              <div>
                <div class="related_name">{{item.listName}}</div>
                <div class="related_num">实例数量: <span>{{item.itemCount}}</span></div>
              </div> 
            </div>
            <div @click="goRelation(item)" class="create_order" v-show="item.isrelated">创建并关联</div>
          </div>
          <div class="related_list">
            <div class="related_item vux-1px-b" v-for="(rItem, rIndex) in item.relatedList" @click="goDetail(item, rItem)"
                 :key="rIndex">
              <div>{{rItem.transCode}}</div>
              <div class="creator_name">{{rItem.creatorName}}
                <span>[创建人]</span>
                <span class="iconfont icon-youjiantou"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import {dateFormat} from 'vux'
  import {getAppExampleDetails} from 'service/detailService'
  import {getList} from 'service/commonService'
  import {getListView} from 'service/detailService'
  import Apps from '../../maps/Apps'
  import relatedKey from './../../maps/related'
  export default {
    data() {
      return {
        listId: '',
        transCode: '',
        RelatedAppList: [],
        swiper: null,
        taskType : '',
      }
    },
    methods: {
      //获取相关实例
      getAppExampleDetails() {
        return getAppExampleDetails({
          transCode: this.transCode,
          listId: this.listId
        }).then(({relevantItems: relatedApply}) => {
          relatedApply.forEach(item => {
            if (Apps[item.listId]) {
              //判断是否存在关联并创建关系
              item.isrelated = false;
              if(relatedKey[this.taskType] && relatedKey[this.taskType][item.listId]){
                item.isrelated = true;
              }
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
      // 获取列表的id
      getViewId(listId) {
        return getListView({listId}).then(data => {
          return data[0].id
        })
      },
      // 获取相关实例详情
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
      // 跳转到详情页
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
      // 创建并关联
      goRelation(item) {
        let {uniqueId} = this.$route.query;
        let {parentNav: folder, file, transName} = item;
        this.$router.push({
          path: `/fillform/${folder}/${fileName}`,
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
      if(this.transCode){
        this.taskType = this.transCode.split('_')[0]
      }      
      (async () => {
        await this.getAppExampleDetails();
        let promises = [];
        this.RelatedAppList.forEach(item => {
          promises.push(this.getRelatedList(item));
        });
        Promise.all(promises).then(() => {
          this.$nextTick(() => {
            this.swiper = new this.Swiper('.swiper_related', {
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
    background: #f8f8f8;
    .swiper_related {
      width: 100%;
      height: 2.5rem;
      .swiper-slide {
        width: 90%;
        margin: 0 .05rem;
        border-radius: .1rem;
        background: #fff;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        justify-content: space-between;
        height: .54rem;
        padding: 0.1rem;
        .related_info{
          display: flex;
          .icon {
            margin-right: .1rem;
            width: .54rem;
            height: .54rem;
            border-radius: 0.08rem;
          }
          .related_name {
            font-weight: bold;
            color:#111;
          }
          .related_num{
            font-size: 0.12rem;
            color: #757575;
            span{
              color: #c93d1b;
              font-weight: bold;
            }
          }
        }
        .create_order{
          color: #4F90F9;
          font-size: 0.14rem;
          vertical-align: middle;
          line-height: 0.54rem;
        }
      }
      
      .related_list {
        height: calc(100% - .54rem);
        padding-bottom: 0.2rem;
        box-sizing: border-box;
        overflow: auto;
      }
      .related_item {
        margin: 0 .1rem;
        padding: 0.1rem 0;
        box-sizing: border-box;
        display: flex;
        font-size: 0.14rem;
        justify-content: space-between;
        font-weight: bold;
        .creator_name{
          font-weight: normal;
          span{
            font-size: 0.1rem;
            color: #7d7d7d;
            &.icon-youjiantou{
              font-size: 0.13rem;
              margin-left: 0.05rem;
            }
          }
        }
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

</style>

