<template>
  <div class="x-selector">
    <cell :title="title" :value="name" is-link @click.native="showSelector"></cell>
    <!--<cell title="123" is-link></cell>-->
    <div class="x-selector-pop" v-transfer-dom>
      <popup v-model="showPop" position='left' width='80%'>
        <!--<search position="absolute"></search>-->
        <div class="x-selector-container" ref="selector">
          <div>
            <!--<p v-for="(item, index) in data" :key="index" class='x-selector-item vux-1px-b'-->
            <p v-for="(item, index) in selectorList" :key="index" class='x-selector-item vux-1px-b'
               @click='selectorItemClick(item)'>{{item.name}}</p>
            <spinner type="crescent" size="2em" v-show="hasNext"></spinner>
            <!--<div v-show="!hasNext">没有更多内容</div>-->
          </div>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {TransferDom, Cell, Popup, Search, Spinner} from 'vux'
  import BScroll from 'better-scroll'
  import createService from './../../service/createService'

  export default {
    name: "XSelector",
    props: {
      // 标题
      title: {
        type: String,
        default: ''
      },
      // 数据
      data: {
        type: Array,
        default() {
          return [];
        }
      },
      // 默认值
      selValue: {
        type: Object,
        default() {
          return {}
        }
      },
      // 配置参数
      options: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    directives: {TransferDom},
    components: {Cell, Popup, Search, Spinner},
    data() {
      return {
        showPop: false,
        listScroll: null,
        limit: 100,
        page: 1,
        selectorList: [],
        showLoading: false,
        hasNext: true,
      }
    },
    computed: {
      // 显示选中的名字
      name() {
        return this.selValue.name
      }
    },
    watch: {
      showPop(val) {
        if (val) {
          if (this.page === 1 && this.selectorList.length > 0) {
            this.listScroll.scrollTo(0, 0);
          } else {
            this.page = 1;
            this.selectorList = [];
            this.initSelector();
          }
          /*this.$nextTick(() => {
            if (!this.listScroll) {
              this.listScroll = new BScroll(this.$refs.selector, {
                click: true,
                bounce: false
              });
            }
          })*/
        }
      },
    },
    methods: {
      // TODO 请求数据
      getSelectorList() {
        return new Promise((resolve, reject) => {
          let {url, params, displayField, valueField} = this.options;
          createService.getRemoteData(url, Object.assign({}, params, {
            page: this.page,
            limit: this.limit
          })).then(data => {
            let {dataCount, tableContent} = data;
            let selectorList = [];
            tableContent && tableContent.forEach(sel => {
              selectorList.push(Object.assign(sel, {
                name: sel[displayField],
                value: sel[valueField],
              }))
            });
            this.selectorList = this.page === 1 ? selectorList : this.selectorList.concat(selectorList);
            // 判断是否有下一页
            this.hasNext = dataCount > (tableContent.length + (this.limit * this.page - 1));
            resolve(this.hasNext);
          }).catch(e => {
            reject();
          });
        })
      },
      // TODO 初始化列表
      initSelector() {
        this.getSelectorList().then(() => {
          this.$nextTick(() => {
            if (!this.listScroll) {
              this.listScroll = new BScroll(this.$refs.selector, {
                click: true,
                bounce: {
                  top: false,
                  bottom: true
                },
                pullUpLoad: {
                  threshold: -20
                }
              });
              // 判断是否还有下一页，没有则关闭滚动加载
              if (!this.hasNext) {
                this.listScroll.closePullUp();
              } else {
                this.listScroll.openPullUp();
              }
              let onPullingUp = () => {
                this.page++;
                this.getSelectorList().then(() => {
                  this.$nextTick(() => {
                    // 判断是否还有下一页，没有则关闭滚动加载
                    if (!this.hasNext) {
                      this.listScroll.closePullUp();
                      return
                    }
                    this.listScroll.finishPullUp();
                    this.listScroll.refresh();
                  });
                });
              };
              // 绑定上拉加载事件
              this.listScroll.off('pullingUp', onPullingUp);
              this.listScroll.on('pullingUp', onPullingUp);
            }
          })
        });
      },
      // TODO 显示pop
      showSelector() {
        this.showPop = true;
      },
      // TODO 点击单个项
      selectorItemClick(item) {
        this.showPop = false;
        this.$emit('input', item);
        this.$emit('on-change', item);
      },
    },
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  %ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .x-selector {
    .weui-cell__ft {
      @extend %ellipsis;
      width: 60%;
    }
  }

  /* 会被抽取到外层，所以不能写在x-selector中 */
  .x-selector-pop {
    .vux-search-box {
      & + .x-selector-container {
        height: calc(100% - 44px);
      }
      &.vux-search-fixed {
        & + .x-selector-container {
          margin-top: 44px;
        }
      }
    }
    .x-selector-container {
      height: 100%;
      background-color: #fff;
      overflow: hidden;
      .x-selector-item {
        @extend %ellipsis;
        line-height: 0.8rem;
        text-align: center;
      }
      .vux-spinner {
        display: block;
        margin: 10px auto 0;
      }
    }
  }
</style>
