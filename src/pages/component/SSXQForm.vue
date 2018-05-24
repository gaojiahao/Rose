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
            value-align="left">
        </cell>
        <cell 
            title="应用名称" 
            :value="detailInfo.ssAppName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="业务类型" 
            :value="detailInfo.ssRequireType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="实现方式" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="优先级" 
            :value="detailInfo.requirementLevel_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="预计交付时间" 
            :value="formatTime(detailInfo.requirementEtc_fgPlanInv.values)" 
            value-align="left"
            v-if='!status&&detailInfo.requirementEtc_fgPlanInv.values'>
        </cell>
        <cell 
            title="预计交付时间" 
            :value="formatTime(detailInfo.requirementEtc_fgPlanInv.values)" 
            value-align="left"
            v-if='status&&detailInfo.requirementEtc_fgPlanInv.values'>
        </cell>
        <datetime  
            format="YYYY-MM-DD HH:mm" 
            @on-change="change" 
            title="预计交付时间" 
            placeholder="请选择" 
            value-align="left"
            v-if='status&&!detailInfo.requirementEtc_fgPlanInv.values'>
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
                class='htmlfiel vux-1px-t' 
                v-if='storyshow'>
            </div>  
        </group>
         <group>
            <div v-if='detailInfo.ssAcceptStandard_fgPlanInv.values.length>11'>
                <cell 
                    title="验收标准"
                    is-link
                    :border-intent="false"
                    :arrow-direction="acceptStandard ? 'up' : 'down'"
                    @click.native="acceptStandard = !acceptStandard">
                </cell>
                <cell-box v-if="acceptStandard">{{detailInfo.ssAcceptStandard_fgPlanInv.values}}</cell-box>
            </div>
            <cell 
                title="验收标准" 
                :value="detailInfo.ssAcceptStandard_fgPlanInv.values" 
                value-align="left"
                v-else>
            </cell>
        </group>
        <group>
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
        <group>
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
        value-align="left" 
        is-link 
        @click.native="changeUser" 
        :value='user'
        v-if='status&&detailInfo.assignedTo_fgPlanInv'></cell>
        <div v-transfer-dom>
            <popup v-model="show8" position="left" width="100%">
               <group>
                    <p v-for="(item,index) in assignedList" :key="index" class='user_list vux-1px-b' @click='getUser(item)'>{{item.nickname}}</p>
                </group>
            </popup>
        </div>
    </group>
</template>
<script>
import { Group, Cell , Datetime , CellBox,Popup ,TransferDomDirective as TransferDom } from 'vux'
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
        'assignedList':{
            type : Array,
            required : true
        }
    },
    data(){
        return{
            acceptStandard : false,
            storyshow : true,
            technicalAnalysis : false,
            approvalOpinion : false,
            show8:false,
            user:''
        }
    },
    directives: {
      TransferDom
    },
	components: {
		Group,
		Cell,
		Datetime,
        CellBox,
        Popup
        
	},
    methods:{
        formatTime,
        change(value){
            //console.log(value);
            this.$emit('date',value)

        },
        changeUser(){
            console.log("111");
            this.show8 = !this.show8;
        },
        getUser(item){
            this.show8 = false;
            this.$emit("userId",item)
            this.user = item.nickname;
        }
    },
    created(){
    }
    
    
}
</script>
<style lang="scss" >

</style>


