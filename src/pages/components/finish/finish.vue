<template>
	<div>
		<ul class='list' >
			<li @click="goDetail(tab)" v-for="tab in doneList">
				<p>
					<span class='task_name'>{{tab.requireName}}</span>
					<i class="date">{{tab.startTime.substring(0,10)}}</i>
				</p>
				
				<p>
					<span class='do_user'>操作名称：{{tab.nodeName}}</span>
					<em class='status'>{{tab.status}}</em>
					
				</p>  
				<p>
					<span class='do_user'>发起人：{{tab.crtName}}</span>
				</p>      		
				<p>							
					<em class='code'>交易号：{{tab.businessKey}}</em>
				</p> 
				<p>							
					<em class='code'>完成时间：{{tab.endTime}}</em>
				</p>        		
				
				
			</li>
		</ul>				
	</div>
</template>

<script>
import { getLogin,getDoneTask } from '../../service/service.js'
let iscroll;
    export default{
    	data(){
    		return{
				doneList:[]
    		}
    	},
    	methods:{
    		
    		goDetail(tab){
				this.$router.push({path:"to_do/detail",query:{
					info:tab
				}})
    		}
    	
    	},
		created(){
			var token = localStorage.getItem("token")
			getDoneTask(token).then((res)=>{
				this.doneList = res.tableContent;
				
			})
		}
    	
    }
</script>

<style>
</style>