import axios from 'axios'
/*
export function getLogin(code){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/wxLogin?code="+code+"&state=1")
		.then((response)=>{
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
export function getTask(token){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/getMyToDoTask", {headers:{
			"authorization":token
			}
		})
		.then((response)=>{
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
 */
//测试代码
export function getLogin(code){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/wxLogin?code=Cz5XDOLO6BROKnUepF-qSr7d86wY-ujA4TQ2vNW494s&state=1")
		.then((response)=>{
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
export function getTask(token){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/getMyToDoTask", {headers:{
			"authorization":"a6fd04a8db6e46fca3a10a2d98cffd65MOBILE"
			}
		})
		.then((response)=>{
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
export function getDoneTask(token){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/getMyDoneTask", {headers:{
			"authorization":"a6fd04a8db6e46fca3a10a2d98cffd65MOBILE"
			}
		})
		.then((response)=>{
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
export function getListTask(transCode){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/listTaskLogByTransCode",{headers:{
			"authorization":"a6fd04a8db6e46fca3a10a2d98cffd65MOBILE"
			},params:{
				transCode:transCode
			}
		})
		.then((response)=>{
			const result = response.data.tableContent;
			resolve(result);
		})
		
		
	})
}