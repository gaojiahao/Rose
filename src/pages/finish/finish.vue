<template>
	<div>
		<div id="finish" class="page">
    	<div class='wrapper'>
	    	<div class="weui-search-bar" id="searchBar">
	            <form class="weui-search-bar__form">
	                <div class="weui-search-bar__box">
	                    <i class="weui-icon-search"></i>
	                    <input type="search" class="weui-search-bar__input" id="searchInput" placeholder="搜索" required="">
	                    <a href="javascript:" class="weui-icon-clear" id="searchClear"></a>
	                </div>
	                <label class="weui-search-bar__label" id="searchText">
	                    <i class="weui-icon-search"></i>
	                    <span>搜索</span>
	                </label>
	            </form>
	            <a href="javascript:" class="weui-search-bar__cancel-btn" id="searchCancel">取消</a>
	        </div>
		        <ul class='list'>
		        	<li @click="goDetail()">
		        		<span class='task_name'>项目增加字段</span>
		        		<p>
		        			<span class='do_user'>王建国</span>
		        		</p>        		
		        		<p>
		        			<em class='status'>已完成</em>
		        			<em class='code'>SSXQ_1801_0003</em>
		        		</p>       		
		        		<i class="date">10-13</i>
		        	</li>
		        	<li @click="goDetail()">
		        		<span class='task_name'>项目增加字段</span>
		        		<p>
		        			<span class='do_user'>王建国</span>
		        		</p>        		
		        		<p>
		        			<em class='status'>已完成</em>
		        			<em class='code'>SSXQ_1801_0003</em>
		        		</p>       		
		        		<i class="date">10-13</i>
		        	</li>
		        	<li @click="goDetail()">
		        		<span class='task_name'>项目增加字段</span>
		        		<p>
		        			<span class='do_user'>王建国</span>
		        		</p>        		
		        		<p>
		        			<em class='status'>已完成</em>
		        			<em class='code'>SSXQ_1801_0003</em>
		        		</p>       		
		        		<i class="date">10-13</i>
		        	</li>
	        	</ul>
    		</div>
   
    	</div>
     	<router-view></router-view>
	</div>
    
    
</template>

<script>
    export default{
    	data(){
    		return{
    			isLoadMore:false
    		}
    	},
    	methods:{
    		goDetail(){
    			this.$router.push("/to_do/detail")
    		}
    	},
		mounted(){ 		
			 var iscroll = new IScroll('#td', {
				probeType: 3
			});
			iscroll.on('scrollStart', ()=>{
			
				if(iscroll.maxScrollY < 0){
					this.isLoadMore = true;
				}
			})
			iscroll.on("scroll",()=>{
				if(iscroll.y<=iscroll.maxScrollY-30){
					alert("加载更多");					
				}
			})
    	}
    	
    }
</script>

<style>
#finish{
	overflow: hidden;
}
#finish .status{
	background-color:#09BB07 ;
}
	
</style>