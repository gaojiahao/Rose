<template>
    <div class='pages'>
        <ul class='obj_app_list'>
            <li class="each_app vux-1px-b" v-for='(item,index ) in applyList' :key='index' @click='getTask(item)'>
                <div class="app_bg">
                    <img :src='`/dist/${item.icon}`' />
                    <badge :text="item.taskTotal" class="red_caution" v-if='item.taskTotal'></badge>
                </div>
                <div class="app_info">
                    <div class="app_name">{{item.text}}</div>
                    <div class="app_tx">业务应用</div>
                </div>
            </li>           
        </ul>
        
    </div>
    
</template>
<script>
import { Badge } from 'vux';
import homeService from '../service/homeservice.js'
export default {
    data(){
        return{
            applyList : []    
        }
    },
    components:{
        Badge
    },
    methods:{
        getTask(item){
            this.$router.push({
                path : '/list',
                query : {
                    title : item.text,
                    listId : item.listId
                }
            })
        }
    },

    created(){
        let query = this.$route.query;
        this.applyList = JSON.parse(query.list);
    }
}
</script>
<style lang="scss">
    .obj_app_list {
        width: 100%;
        .each_app {
            display: flex;
            margin:0.1rem 0.3rem;
            align-items: center;
            .app_bg {
                flex: 1;
                position: relative;
                img{
                    width:1.4rem;
                    height:1.4rem;
                    border-radius: .28rem;
                }
                .red_caution {
                    position: absolute;
                    right: -.01rem;
                    top: -.08rem;
                }
            }
            .app_info {
                flex: 3.5;
                margin-left: .4rem;
                padding: .4rem 0;
                .app_name {
                    font-size: .36rem;
                    font-weight: 500;
                    color: #333;
                }
                .app_tx {
                    font-size: .28rem;
                    color: #4F90F9;
                    font-weight: 500;
                }
            }
        }
    }

</style>

