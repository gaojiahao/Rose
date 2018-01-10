import axios from 'axios'
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
	console.log(token);
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
export function getDoneTask(token){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/getMyDoneTask", {headers:{
			"authorization":token
			}
		})
		.then((response)=>{
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
export function getListTask(transCode,token){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/listTaskLogByTransCode",{headers:{
			"authorization":token
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

