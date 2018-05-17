<template>
    <group label-width="6em" label-margin-right="2em" label-align="left" v-if='detailInfo.transCode_fgPlanInv'>
        <cell 
            title="需求编码" 
            :value="detailInfo.transCode_fgPlanInv.values" 
            value-align="left" >
        </cell>	
        <cell 
            title="BUG标题" 
            :value="detailInfo.ssReqProjectName_fgPlanInv.values" 
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
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="BUG类型" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="操作系统" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="浏览器" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="迭代/项目" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
         <cell 
            title="严重程度" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
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
        <cell 
            title="BUG重现步骤"
            is-link
            :border-intent="false"
            :arrow-direction="bugShow ? 'up' : 'down'"
            @click.native="bugShow = !bugShow">
        </cell>
        <cell-box v-if="bugShow">{{detailInfo.ssTechnicalAnalysis_fgPlanInv.values}}</cell-box>			
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
                class='htmlfiel vux-cell-box' 
                v-if='storyshow'>
            </div>  
        </group>
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
            storyshow:false,
            bugShow:false,

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


