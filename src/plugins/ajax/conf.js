/**
 *corpid 企微-公司的id
 *corpsecret 企微-企业应用secret
*/
let Rxports = {
	url_host:window.location.host,
	base_url:'/H_roleplay-si',
	AgentId:'1000003',
	Secret:'_eBwV6vckSkekltSm2LSefz-VNPV3x2rhw8nAwAKKn8',
	corpid:'ww082959ae67224850',
	corpsecret:'Cd4Vgugvfpi21NEweNXXL0WZO-CjM1Kx5dNMWqnAeMA',
	dev:process.env.NODE_ENV === 'development', //用于配置当前是否是开发模式
	devToken:'a44fcbbac03a45ff83afdc11b041eba3MOBILE' //如果是开发模式下，请求接口token 使用该值
}

export default Rxports;




















































