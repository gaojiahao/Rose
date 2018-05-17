<template>
    <group label-width="6em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            :value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
        </cell>	
        <cell 
            title="项目名称" 
            :value="detailInfo.ssReqProjectName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="服务名称" 
            :value="detailInfo.ssRequireName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="服务编码" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="服务id" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="标准工时" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="数量" 
            :value="detailInfo.ssAppName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="标准周期" 
            :value="detailInfo.ssRequireType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="开始时间" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="结束时间" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
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
        <group>
            <cell 
                title="用户故事"
                is-link
                :border-intent="false"
                :arrow-direction="storyshow ? 'up' : 'down'"
                @click.native="storyshow = !storyshow">
            </cell>
            <div  
                v-html="detailInfo.ssUserStory_fgPlanInv.values"
                class='htmlfiel weui-cell' 
                v-if='storyshow'>
            </div>  
        </group>
        <cell 
            title="项目基本信息"
            is-link
            :border-intent="false"
            :arrow-direction="acceptStandard ? 'up' : 'down'"
            @click.native="acceptStandard = !acceptStandard">
        </cell>
        <cell-box v-if="acceptStandard">{{detailInfo.ssAcceptStandard_fgPlanInv.values}}</cell-box>
        <cell 
            title="规划信息"
            is-link
            :border-intent="false"
            :arrow-direction="technicalAnalysis ? 'up' : 'down'"
            @click.native="technicalAnalysis = !technicalAnalysis">
        </cell>
        <cell-box v-if="technicalAnalysis">{{detailInfo.ssTechnicalAnalysis_fgPlanInv.values}}</cell-box>

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
            acceptStandard:false,
            storyshow:true,
            technicalAnalysis:false,
            approvalOpinion:false

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

</style>


