<template>
  <div class="x-selector">
    <cell :title="title" :value="name" is-link @click.native="showSelector"></cell>
    <!--<cell title="123" is-link></cell>-->
    <div class="selector-pop" v-transfer-dom>
      <popup v-model="showPop" position='left' width='80%'>
        <div class="x-selector-container" ref="selector">
          <div>
            <p v-for="(item, index) in data" :key="index" class='x-selector-item vux-1px-b'
               @click='getSelector(item)'>{{item.name}}</p>
          </div>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {TransferDom, Cell, Popup} from 'vux'
  import BScroll from 'better-scroll'

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
      }
    },
    directives: {TransferDom},
    components: {Cell, Popup},
    data() {
      return {
        showPop: false,
        listScroll: null,
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
          this.$nextTick(() => {
            if (!this.listScroll) {
              this.listScroll = new BScroll(this.$refs.selector, {
                click: true,
                bounce: false,
              })
            }
          })
        }
      },
    },
    methods: {
      // TODO 显示pop
      showSelector() {
        this.showPop = true;
      },
      // TODO 点击单个项
      getSelector(item) {
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

  .x-selector-container {
    height: 100%;
    background-color: #fff;
    overflow: hidden;
    .x-selector-item {
      @extend %ellipsis;
      line-height: 0.8rem;
      text-align: center;
    }
  }
</style>
