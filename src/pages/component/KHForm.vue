<template>
    <group label-width="6em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            :value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
        </cell>	
        <cell 
            title="提交人" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="客户编码" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="客户名称" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="客户简称" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="地址" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
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
            title="联系人"
            is-link
            :border-intent="false"
            :arrow-direction="qjInfo ? 'up' : 'down'"
            @click.native="qjInfo = !qjInfo">
        </cell>
        <div class="qjDetail" v-if="qjInfo">
            <div v-for="(item,index) in detailInfo.transDetail" :key="index" class='qgProcess'>
                <ul>
                    <li>
                        <label>联系人:</label>
                        <span>{{item.explain}}</span>
                    </li>
                    <li>
                        <label>联系方式:</label>
                        <span>{{item.num1}}</span>
                    </li>
                    <li>
                        <label>地址:</label>
                        <span>{{item.inventoryType.value}}</span>
                    </li>
                    <li>
                        <label>电邮:</label>
                        <span>{{item.date1+item.starttime.value}}</span>
                    </li>
                    <li>
                        <label>备注:</label>
                        <span>{{item.date2+item.endtime.value}}</span>
                    </li>
                </ul>	
            </div>
            
        </div>
        <cell 
            title="技术方案说明"
            is-link
            :border-intent="false"
            :arrow-direction="acceptStandard ? 'up' : 'down'"
            @click.native="acceptStandard = !acceptStandard">
        </cell>
        <cell-box v-if="acceptStandard">{{detailInfo.ssAcceptStandard_fgPlanInv.values}}</cell-box>

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
            qjInfo:true,

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


