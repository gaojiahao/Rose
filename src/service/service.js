import axios from 'axios'
export function getLogin(){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/wxLogin?code=Cz5XDOLO6BROKnUepF-qSr7d86wY-ujA4TQ2vNW494s&state=1")
		.then((response)=>{
			console.log(response.data);
			const result = response.data;
			resolve(result);
		})
		
		
	})
}
export function getTask(){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/ds/getMyToDoTask", {headers:{
			"authorization":"a6fd04a8db6e46fca3a10a2d98cffd65MOBILE"
			}
		})
		.then((response)=>{
			console.log(response.data);
			const result = response.data;
			resolve(result);
		})
		
		
	})
}