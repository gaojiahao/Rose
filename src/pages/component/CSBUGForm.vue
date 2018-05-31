<template>
    <group label-width="6.5em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            :value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
        </cell>	
        <cell 
            title="BUG标题" 
            :value="detailInfo.bugRequireName_fgPlanInv.values" 
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
            title="所属模块" 
            :value="detailInfo.bugRequireNature_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.bugRequireNature_fgPlanInv.values.length>0'>
        </cell>
         <cell 
            title="BUG类型" 
            :value="detailInfo.bugRequireDemension_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.bugRequireDemension_fgPlanInv.values.length>0'>
        </cell>
        <cell 
            title="操作系统" 
            :value="detailInfo.operatingSystem_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.operatingSystem_fgPlanInv.values.length>0'>
        </cell>
        <cell 
            title="浏览器" 
            :value="detailInfo.browser_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.browser_fgPlanInv.values.length>0'>
        </cell>
        <cell 
            title="迭代/项目" 
            :value="detailInfo.iterationProject_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.iterationProject_fgPlanInv.values.length>0'>
        </cell>
         <cell 
            title="严重程度" 
            :value="detailInfo.severity_fgPlanInv.values" 
            value-align="left"
            v-if='detailInfo.severity_fgPlanInv.values.length>0'>
        </cell>
        <cell
            title="预计交付时间"
            :value="formatTime(detailInfo.bugRequirementEtc_fgPlanInv.values)"
            value-align="left"
            v-if='!status&&detailInfo.bugRequirementEtc_fgPlanInv.values'>
        </cell>
        <datetime  
            format="YYYY-MM-DD HH:mm" 
            @on-change="change" 
            title="预计交付时间" 
            placeholder="请选择" 
            value-align="left"
            v-if='status'>
        </datetime>
        <group v-if='detailInfo.bugReproducStep_fgPlanInv.values.length>0'>
            <div  v-if='detailInfo.bugReproducStep_fgPlanInv.values.length>11'>
               <cell 
                    title="BUG重现步骤"
                    is-link
                    :border-intent="false"
                    :arrow-direction="bugShow ? 'up' : 'down'"
                    @click.native="bugShow = !bugShow">
                </cell>
                <div  
                    v-html="detailInfo.bugReproducStep_fgPlanInv.values"
                    class='htmlfiel vux-1px-t' 
                    v-if='bugShow'>
                </div>   
            </div>
            <cell 
                title="BUG重现步骤" 
                :value="detailInfo.bugReproducStep_fgPlanInv.values" 
                value-align="left"
                v-else>
            </cell>

        </group>	
        
        <!-- <cell-box v-if="bugShow">{{detailInfo.bugReproducStep_fgPlanInv.values}}</cell-box>			 -->
         <cell 
            title="用户故事"
            is-link
            :border-intent="false"
            :arrow-direction="storyshow ? 'up' : 'down'"
            @click.native="storyshow = !storyshow"
            v-if='detailInfo.bugUserStory_fgPlanInv.values.length>0'>
        </cell>
        <div  
            v-html="detailInfo.bugUserStory_fgPlanInv.values"
            class='htmlfiel vux-1px-t' 
            v-if='storyshow'>
        </div> 
        <group>
            <div v-if='detailInfo.bugAcceptStandard_fgPlanInv.values.length>11'>
                <cell 
                    title="验收标准"
                    is-link
                    :border-intent="false"
                    :arrow-direction="acceptStandard ? 'up' : 'down'"
                    @click.native="acceptStandard = !acceptStandard">
                </cell>
                 <div  
                    v-html="detailInfo.bugAcceptStandard_fgPlanInv.values"
                    class='htmlfiel vux-1px-t' 
                    v-if='acceptStandard'>
                </div>  
                <!-- <cell-box v-if="acceptStandard">{{detailInfo.cpAcceptStandard_fgPlanInv.values}}</cell-box> -->
            </div>
            <cell 
                title="验收标准" 
                :value="detailInfo.bugAcceptStandard_fgPlanInv.values" 
                value-align="left"
                v-else-if='detailInfo.bugAcceptStandard_fgPlanInv.values.length>0&&detailInfo.bugAcceptStandard_fgPlanInv.values.length<=11'>
            </cell>
        </group>
        <group>
            <div v-if='detailInfo.bugTechnicalAnalysis_fgPlanInv.values.length>11'>
                <cell 
                    title="需求技术分析"
                    is-link
                    :border-intent="false"
                    :arrow-direction="technicalAnalysis ? 'up' : 'down'"
                    @click.native="technicalAnalysis = !technicalAnalysis">
                </cell>
                <cell-box v-if="technicalAnalysis">{{detailInfo.bugTechnicalAnalysis_fgPlanInv.values}}</cell-box>
            </div>
            <cell 
                title="需求技术分析" 
                :value="detailInfo.bugTechnicalAnalysis_fgPlanInv.values" 
                value-align="left"
                v-else-if='detailInfo.bugTechnicalAnalysis_fgPlanInv.values.length>0&&detailInfo.cpTechnicalAnalysis_fgPlanInv.values.length<=11'>
            </cell>
        </group>
        <group>
            <div v-if='detailInfo.bugApprovalOpinion_fgPlanInv.values.length>11'>
                 <cell 
                    title="需求评审意见"
                    is-link
                    :border-intent="false"
                    :arrow-direction="approvalOpinion ? 'up' : 'down'"
                    @click.native="approvalOpinion = !approvalOpinion">
                </cell>
                <cell-box v-if="approvalOpinion">{{detailInfo.bugApprovalOpinion_fgPlanInv.values}}</cell-box>
            </div>
             <cell 
                title="需求评审意见" 
                :value="detailInfo.bugApprovalOpinion_fgPlanInv.values" 
                value-align="left"
                v-else-if='detailInfo.bugApprovalOpinion_fgPlanInv.values.length>0&&detailInfo.bugApprovalOpinion_fgPlanInv.values.length<=11'>
            </cell>
        </group>
        <cell 
            title="分配给" 
            value-align="left" 
            is-link 
            @click.native="changeUser" 
            :value='assignedName.nickname'
            v-if='status&&!detailInfo.assignedTo_fgPlanInv.values'>
        </cell>

    </group>
</template>
<script>
import { Group, Cell , Datetime , CellBox} from 'vux'
import {formatTime} from '../maps/date.js'
export default {
    props:{
        'detailInfo':{
            type : Object,
            required : true
        },
        'status':{
            type : Boolean,
            required : true
        },
        'assignedName':{
            type : Object,
            required : true
        }
    },
    data(){
        return{
            acceptStandard:false,
            storyshow:false,
            bugShow:true,
            approvalOpinion:false,
            technicalAnalysis:false,
            flowShow:false,
            user:'',
            distributionScroll: null
        }
    },
	components: {
		Group,
		Cell,
		Datetime,
        CellBox
	},
    methods:{
        formatTime,
        change(value){
            this.$emit('date',value)
        },
        changeUser(){
            //this.flowShow = !this.flowShow;
            this.$emit("assigned",true)
        },
    }
    
}
</script>
<style lang="scss" >

</style>


