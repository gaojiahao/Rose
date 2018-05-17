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
            title="职能" 
            :value="detailInfo.ssAppType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="职能经理" 
            :value="detailInfo.ssAppName_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="周次" 
            :value="detailInfo.ssRequireType_fgPlanInv.values" 
            value-align="left">
        </cell>
        <cell 
            title="例会时间" 
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
        <cell 
            title="本周关键数据"
            is-link
            :border-intent="false"
            :arrow-direction="datashow ? 'up' : 'down'"
            @click.native="datashow = !datashow" width="7em"></cell>
        <cell-box v-if="datashow">{{detailInfo.baseinfoExt.varchar5}}</cell-box>
        <cell 
            title="本周改善结果"
            is-link
            :border-intent="false"
            :arrow-direction="resultshow ? 'up' : 'down'"
            @click.native="resultshow = !resultshow"></cell>
        <cell-box v-if="resultshow">{{detailInfo.baseinfoExt.varchar6}}</cell-box>
        <cell 
            title="改善机会与下周战略"
            is-link
            :border-intent="false"
            :arrow-direction="nextshow ? 'up' : 'down'"
            @click.native="nextshow = !nextshow"></cell>
        <cell-box v-if="nextshow">{{detailInfo.baseinfoExt.varchar7}}</cell-box>
        <cell 
            title="解决方案"
            is-link
            :border-intent="false"
            :arrow-direction="resolvetshow ? 'up' : 'down'"
            @click.native="resolvetshow = !resolvetshow"></cell>
        <cell-box v-if="resolvetshow">{{detailInfo.baseinfoExt.varchar8}}</cell-box>

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
            datashow:false,
            resultshow:true,
            nextshow:false,
            resolvetshow:false

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


