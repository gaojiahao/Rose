let ua = navigator.userAgent.toLowerCase();
export let isIOS = !!ua.match(/\(i[^;]+;( u;)? cpu.+mac os x/); // 是否为IOS系统
export let isIPhone = ua.indexOf('iphone') > 0; // 是否为iPhone
export let isIPad = ua.indexOf('ipad') > 0; // 是否为iPad
export let isAndroid = ua.indexOf('android') > 0; // 是否为安卓机
export let isPC = !(isIOS || isAndroid); // 是否为PC
export let isQYWX = ua.match(/wxwork/) !== null; // 是否为企业微信

export default {
  isIOS,
  isIPhone,
  isIPad,
  isAndroid,
  isPC,
  isQYWX,
}
