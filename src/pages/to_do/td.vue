<template>
    <div id="td" class="page">
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
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			<!--<em class='iconfont icon-daiban'></em>-->
        			<span class='do_user'>宇文玥</span>
        		</p>        		
        		<p>
        			<em class='status'>进行中</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status near'>将临近</em>
        			<em class='code over'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status over'>已逾期</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			<!--<em class='iconfont icon-daiban'></em>-->
        			<span class='do_user'>宇文玥</span>
        		</p>        		
        		<p>
        			<em class='status'>进行中</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status near'>将临近</em>
        			<em class='code over'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status over'>已逾期</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status over'>已逾期</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			<!--<em class='iconfont icon-daiban'></em>-->
        			<span class='do_user'>宇文玥</span>
        		</p>        		
        		<p>
        			<em class='status'>进行中</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status near'>将临近</em>
        			<em class='code over'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	<li>
        		<span class='task_name'>售后申请列表</span>
        		<p>
        			
        			<span class='do_user'>宇文玥</span>
        		</p>
        		<p>
        			<em class='status over'>已逾期</em>
        			<em class='code'>SSXQ_1801_0003</em>
        		</p>       		
        		<i class="date">12-12</i>
        	</li>
        	
        </ul>
    		<div class="bottom"  v-if="isLoadMore">
				<span>加载中</span>
			</div>
    	</div>
    </div>
</template>

<script>
    export default{
    	data(){
    		return{
    			isLoadMore:false
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
				//homeScroll.refresh();
			})
			iscroll.on("scroll",()=>{
				//console.log(iscroll.y)
				if(iscroll.y<=iscroll.maxScrollY-30){
					alert("加载更多");
					
				}
			})
    	}
    	
    }
</script>

<style>
	#td{
		overflow: hidden;
	}
.list{	
	width:100%;
}
.list li{
	border-bottom:1px solid #e5e5e5;
	padding:10px  15px;
	overflow: hidden;
	position: relative;
	color:lightslategrey
}
li .task_name{
	display:block;
	font-size:16px;
	color: #666666;	
	margin-bottom: 3px;
}
.do_user{
	display: inline-block;
	font-size:12px;
	margin-bottom: 3px;
}
.status{
	padding: 1px;
	display: inline-block;	
	/*border:1px solid #10AEFF;*/
	border-radius: 5px;
	text-align: center;
	background-color:#10AEFF;
	color:#fff
}
.status.near{
	background-color:#FFBE00 ;
	
}
.status.over{
	background-color:#F76260;
	
}
.code{
	display: inline-block;
	color:#D2D2D2;
}
.date{
	position: absolute;
	right:15px;
	top:20px;
}
.bottom{
	width:100%;
	height:30px;
	line-height: 30px;
	text-align: center;
}
</style>

