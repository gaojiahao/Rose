import axios from 'axios'
export function getLogin(){
	return new Promise((resolve, reject)=>{
		axios.get("/H_roleplay-si/wxLogin?code=8_EZ-6GQqnNNiTFylKBtC1O6fc0y0Ppp_MHi3x1s2k8&state=1")
		.then((response)=>{
			console.log(response);
			const result = response.data;
			resolve(result);
		})
		
		
	})
}