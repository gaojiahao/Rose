<template>
  <div class="pages">

    <group >
      <cell class="count_part" title="最终合计" value="¥800000"></cell>
      <cell-form-preview class="count_dt_part" :list="list4"></cell-form-preview>
    </group>

    <load-more tip="项目类产品" :show-loading='false'></load-more>
      <form-preview 
        class="project_part"
        header-label="金额" 
        header-value="¥330000.00" 
        :body-items="list1">
      </form-preview>
      <form-preview 
        class="project_part"
        header-label="金额" 
        header-value="¥240000.00" 
        :body-items="list2">
      </form-preview>
      <form-preview 
        class="project_part"
        header-label="金额" 
        header-value="¥230000.00" 
        :body-items="list3">
      </form-preview>

<load-more tip="A类产品" :show-loading='false'></load-more>
      <form-preview 
        class="project_part"
        header-label="金额" 
        header-value="¥230000.00" 
        :body-items="list3">
      </form-preview>

    <load-more tip="B类产品" :show-loading='false'></load-more>
      <form-preview 
        class="project_part"
        header-label="金额" 
        header-value="¥230000.00" 
        :body-items="list3">
      </form-preview>


    <x-button 
        class="submit_button" 
        :gradients="['#B99763', '#E7D0A2']" 
        @click.native="sendOrder"
        >
        确定提交
    </x-button>
    <confirm 
        v-model="show"
        title="温馨提示" 
        content="请确认提交数据是否正确？"
        confirm-text="我已确认"
        cancel-text="再去看看"
    ></confirm>
  </div>
</template>

<script>
import { Cell , Group, Confirm , Divider,  XButton, LoadMore, FormPreview, CellFormPreview  } from 'vux'
export default {
    components:{
        Cell,
        Group,
        Divider,
        XButton,
        Confirm,
        LoadMore,
        FormPreview,
        CellFormPreview
    },
    data(){
        return{
            list1: 
                [ 
                    { label: '产品',value: '足金999' }, 
                    { label: '数量',value: '10000件' }
                ],
            list2: 
                [ 
                    { label: '产品',value: '千金888' },
                    { label: '数量',value: '10888件' }, 
                ],
            list3: 
                [ 
                    { label: '产品',value: '千足金666' }, 
                    { label: '数量',value: '10666件' } 
                ],
            list4: 
                [
                    { label: '足金999',value: '20000 件/套' }, 
                    { label: '千金888',value: '12312 件/套' }, 
                    { label: '千足金666',value: '4232 件/套' }
                ],
            show:false    
        }
    },
    methods:{
        /*
         * 提交数据
         */ 
        sendOrder(){
            this.show = true;
        }
    }
}
</script>

<style scoped>
/* 提交订单按钮  */
.submit_button {
  border-radius: 0;
  margin-top: 10px;
  z-index: 99;
}
</style>
