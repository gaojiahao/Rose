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
            title="发布环境" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="代码分支" 
            :value="detailInfo.ssAppName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="前后端" 
            :value="detailInfo.ssRequireType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="预计发布时间" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="预计发布说明" 
            :value="detailInfo.ssProvideType_fgPlanInv.values" 
            value-align="left">
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


