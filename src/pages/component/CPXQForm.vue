<template>
    <group label-width="6em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            :value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
        </cell>	
        <cell 
            title="需求名称" 
            :value="detailInfo.cpRequireName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="提交人" 
            :value="detailInfo.creatorName_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="创建时间" 
            :value="detailInfo.crtTime_fgPlanInv.values" 
            value-align="left" >
        </cell>
        <cell 
            title="需求维度" 
            :value="detailInfo.cpRequireDemension_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="优先级" 
            :value="detailInfo.requirementLevel_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.requirementLevel_fgPlanInv.values'>
        </cell>
        <datetime  
            format="YYYY-MM-DD HH:mm" 
            @on-change="change" 
            title="预计交付时间" 
            placeholder="请选择" 
            value-align="left"
            v-if='status'>
        </datetime>				      
        <cell 
            title="用户故事"
            is-link
            :border-intent="false"
            :arrow-direction="storyshow ? 'up' : 'down'"
            @click.native="storyshow = !storyshow">
        </cell>
        <div  
            v-html="detailInfo.cpUserStory_fgPlanInv.values"
            class='htmlfiel vux-1px-t' 
            v-if='storyshow'>
        </div>  
        <group>
            <div v-if='detailInfo.cpAcceptStandard_fgPlanInv.values.length>11'>
                <cell 
                    title="验收标准"
                    is-link
                    :border-intent="false"
                    :arrow-direction="acceptStandard ? 'up' : 'down'"
                    @click.native="acceptStandard = !acceptStandard">
                </cell>
                <cell-box v-if="acceptStandard">{{detailInfo.cpAcceptStandard_fgPlanInv.values}}</cell-box>
            </div>
            <cell 
                title="验收标准" 
                :value="detailInfo.cpAcceptStandard_fgPlanInv.values" 
                value-align="left"
                v-else>
            </cell>
        </group>
        <group>
            <div v-if='detailInfo.cpTechnicalAnalysis_fgPlanInv.values.length>11'>
                <cell 
                    title="需求技术分析"
                    is-link
                    :border-intent="false"
                    :arrow-direction="technicalAnalysis ? 'up' : 'down'"
                    @click.native="technicalAnalysis = !technicalAnalysis">
                </cell>
                <cell-box v-if="technicalAnalysis">{{detailInfo.cpTechnicalAnalysis_fgPlanInv.values}}</cell-box>
            </div>
            <cell 
                title="需求技术分析" 
                :value="detailInfo.cpTechnicalAnalysis_fgPlanInv.values" 
                value-align="left"
                v-else>
            </cell>
        </group>
        <group>
            <div v-if='detailInfo.cpApprovalOpinion_fgPlanInv.values.length>11'>
                 <cell 
                    title="需求评审意见"
                    is-link
                    :border-intent="false"
                    :arrow-direction="approvalOpinion ? 'up' : 'down'"
                    @click.native="approvalOpinion = !approvalOpinion">
                </cell>
                <cell-box v-if="approvalOpinion">{{detailInfo.cpApprovalOpinion_fgPlanInv.values}}</cell-box>
            </div>
             <cell 
                title="需求评审意见" 
                :value="detailInfo.cpApprovalOpinion_fgPlanInv.values" 
                value-align="left"
                v-else>
            </cell>
        </group>
       

    </group>
</template>
<script>
import { Group, Cell , Datetime , CellBox} from 'vux'
export default {
    props:{
        'detailInfo':{
            type : Object,
            required : true
        },
        'status':{
            type : Boolean,
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


