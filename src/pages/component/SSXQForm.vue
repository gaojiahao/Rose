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
            title="需求名称"
            :value="detailInfo.ssRequireName_fgPlanInv.values"
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
            title="应用类型"
            :value="detailInfo.ssAppType_fgPlanInv.values"
            value-align="left"
            v-if='detailInfo.ssAppType_fgPlanInv.values.length>0'>
        </cell>
        <cell
            title="应用名称"
            :value="detailInfo.ssAppName_fgPlanInv.values"
            value-align="left"
            v-if='detailInfo.ssAppName_fgPlanInv.values.length>0'>
        </cell>
        <cell
            title="业务类型"
            :value="detailInfo.ssRequireType_fgPlanInv.values"
            value-align="left"
            v-if='detailInfo.ssRequireType_fgPlanInv.values.length>0'>
        </cell>
        <cell
            title="实现方式"
            :value="detailInfo.ssProvideType_fgPlanInv.values"
            value-align="left"
            v-if='detailInfo.ssProvideType_fgPlanInv.values.length>0'>
        </cell>
        <cell
            title="优先级"
            :value="detailInfo.requirementLevel_fgPlanInv.values"
            value-align="left"
            v-if='detailInfo.requirementLevel_fgPlanInv.values.length>0'>
        </cell>
        <cell
            title="预计交付时间"
            :value="formatTime(detailInfo.requirementEtc_fgPlanInv.values)"
            value-align="left"
            v-if='!status&&detailInfo.requirementEtc_fgPlanInv.values'>
        </cell>
        <!-- <cell
            title="预计交付时间"
            :value="formatTime(detailInfo.requirementEtc_fgPlanInv.values)"
            value-align="left"
            v-if='status&&detailInfo.requirementEtc_fgPlanInv.values'>
        </cell> -->
        <datetime
            format="YYYY-MM-DD HH:mm"
            @on-change="change"
            title="预计交付时间"
            placeholder="请选择"
            value-align="left"
            v-if='status'>
        </datetime>
        <group v-if='detailInfo.ssUserStory_fgPlanInv.values.length>0'>
            <cell
                title="用户故事"
                :value="detailInfo.ssUserStory_fgPlanInv.values"
                value-align="left"
                v-if='detailInfo.ssUserStory_fgPlanInv.values.length<11'>
            </cell>
            <div v-else>
                <cell
                    title="用户故事"
                    is-link
                    :border-intent="false"
                    :arrow-direction="storyshow ? 'up' : 'down'"
                    @click.native="storyshow = !storyshow">
                </cell>
                <div
                    v-html="detailInfo.ssUserStory_fgPlanInv.values"
                    class='htmlfiel vux-1px-t'
                    v-if='storyshow'>
                </div>
            </div>
            
        </group>
         <group v-if='detailInfo.ssAcceptStandard_fgPlanInv.values.length>0'>
            <div v-if='detailInfo.ssAcceptStandard_fgPlanInv.values.length>11'>
                <cell
                    title="验收标准"
                    is-link
                    :border-intent="false"
                    :arrow-direction="acceptStandard ? 'up' : 'down'"
                    @click.native="acceptStandard = !acceptStandard">
                </cell>
                <div
                    class='htmlfiel vux-1px-t'
                    v-if='acceptStandard'>
                  <div v-html="detailInfo.ssAcceptStandard_fgPlanInv.values"></div>
                </div>
            </div>
            <cell
                title="验收标准"
                :value="detailInfo.ssAcceptStandard_fgPlanInv.values"
                value-align="left"
                v-else>
            </cell>
        </group>
        <group v-if='detailInfo.ssTechnicalAnalysis_fgPlanInv.values.length>0'>
            <div v-if='detailInfo.ssTechnicalAnalysis_fgPlanInv.values.length>11'>
                <cell
                    title="需求技术分析"
                    is-link
                    :border-intent="false"
                    :arrow-direction="technicalAnalysis ? 'up' : 'down'"
                    @click.native="technicalAnalysis = !technicalAnalysis">
                </cell>
                <cell-box v-if="technicalAnalysis">{{detailInfo.ssTechnicalAnalysis_fgPlanInv.values}}</cell-box>
            </div>
            <cell
                title="需求技术分析"
                :value="detailInfo.ssTechnicalAnalysis_fgPlanInv.values"
                value-align="left"
                v-else>
            </cell>
        </group>
        <group v-if='detailInfo.ssApprovalOpinion_fgPlanInv.values.length>0'>
            <div v-if='detailInfo.ssApprovalOpinion_fgPlanInv.values.length>11'>
                 <cell
                    title="需求评审意见"
                    is-link
                    :border-intent="false"
                    :arrow-direction="approvalOpinion ? 'up' : 'down'"
                    @click.native="approvalOpinion = !approvalOpinion">
                </cell>
                <cell-box v-if="approvalOpinion">{{detailInfo.ssApprovalOpinion_fgPlanInv.values}}</cell-box>
            </div>
             <cell
                title="需求评审意见"
                :value="detailInfo.ssApprovalOpinion_fgPlanInv.values"
                value-align="left"
                v-else>
            </cell>
        </group>
        <cell
        title="分配给"
        value-align='left'
        is-link
        @click.native="changeUser"
        :value='assignedName.nickname'
        v-if='status&&detailInfo.assignedTo_fgPlanInv'></cell>
    </group>
</template>
<script>
import { Group, Cell , Datetime , CellBox} from 'vux'
import {formatTime} from '../maps/date.js'
import BScroll from 'better-scroll'
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
            acceptStandard : false,
            storyshow : true,
            technicalAnalysis : false,
            approvalOpinion : false,
        }
    },
	components: {
		Group,
		Cell,
		Datetime,
        CellBox,
	},
    methods:{
        formatTime,
        change(value){
            this.$emit('date',value)
        },
        changeUser(){
            this.$emit("assigned",true)
        },
    }
}
</script>
<style lang="scss" >
.vux-popup-dialog{
    overflow: hidden;
}

</style>


