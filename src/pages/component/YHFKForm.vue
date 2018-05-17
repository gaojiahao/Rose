<template>
    <group label-width="6em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            :value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
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
            title="客户" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="用户" 
            :value="detailInfo.ssAppName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="反馈时间" 
            :value="detailInfo.ssRequireType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="反馈分类" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="紧急分类" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="期望解决时间" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="是否新问题" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="应用类型" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="应用名称" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="问题简述" 
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
        <cell 
            title="验收标准"
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


