/**
 *corpid 企微-公司的id
 *corpsecret 企微-企业应用secret
*/
let Rxports = {
	url_host:window.location.host,
	base_url:'/H_roleplay-si',
	AgentId:'1000017',
	Secret:'5W9EORlDW5D90HooZCgNgAgGZ8KS_OsDXE4A64tqb4M',
	corpid:'ww3c1aa17c16e380b7',
	corpsecret:'Cd4Vgugvfpi21NEweNXXL0WZO-CjM1Kx5dNMWqnAeMA',
	dev:process.env.NODE_ENV === 'development', //用于配置当前是否是开发模式
	devToken:'656f701b59da4e009582ec48a344c6cfMOBILE' //如果是开发模式下，请求接口token 使用该值
}

export default Rxports;




















































