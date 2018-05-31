<template>
    <group label-width="6em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
        </cell>	
        <cell 
            title="需求名称" 
            value="目标管理" 
            value-align="left">
        </cell>
        <cell 
            title="创建人" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="创建时间" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
         <cell 
            title="目标时间" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="责任分类" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="责任人" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <!-- <cell 
            title="优先级" 
            :value="detailInfo.requirementProject.level.value" 
            value-align="left">
        </cell> -->
        <!-- <cell 
        title="预计交付时间" 
        :value="detailInfo.requirementProject.level.value" 
        value-align="left"> -->
        </cell>
        <datetime  
            format="YYYY-MM-DD HH:mm" 
            @on-change="change" 
            title="预计交付时间" 
            placeholder="请选择" 
            value-align="left">
        </datetime>				
        <cell 
            title="具体目标"
            is-link
            :border-intent="false"
            :arrow-direction="goalInfo ? 'up' : 'down'"
            @click.native="goalInfo = !goalInfo">
        </cell>
        <div class="qjDetail" v-if="goalInfo">
            <div v-for="(item,index) in detailInfo.transDetail" :key="index" class='qgProcess'>
                <ul>
                    <li>
                        <label>责任:</label>
                        <span>{{item.explain}}</span>
                    </li>
                    <li>
                        <label>目标:</label>
                        <span>{{item.num1}}</span>
                    </li>
                    <li>
                        <label>关键任务:</label>
                        <span>{{item.inventoryType.value}}</span>
                    </li>
                    <li>
                        <label>是否实现:</label>
                        <span>{{item.date1+item.starttime.value}}</span>
                    </li>
                    <li>
                        <label>关键成果:</label>
                        <span>{{item.date2+item.endtime.value}}</span>
                    </li>
                </ul>	
            </div>
            
        </div>

    </group>
</template>
<script>
import { Group, Cell , Datetime , CellBox} from 'vux'
export default {
    props:{
        'detailInfo':{
            type : Object,
            required : true
        }
    },
    data(){
        return{
            goalInfo:true,

        }
    },
	components: {
		Group,
		Cell,
		Datetime,
		CellBox,
	},
    methods:{
        change(){

        }
    }
    
}
</script>
<style lang="scss" >
.qjDetail{
    padding: 10px 15px;   
    .qgProcess{
        width:100%;
        font-size: .9em;
        text-align: right;
        color: #999999;
        line-height: 2; 
        label{
            float: left;
            margin-right: 1em;
            min-width: 4em;
            color: #999999;
            text-align: justify;
            text-align-last: justify;  
        }
        span{
            display: block;
            overflow: hidden;
            word-break: normal;
            word-wrap: break-word;
        }
    }
}
</style>


