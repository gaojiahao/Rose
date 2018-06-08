let ua = navigator.userAgent.toLowerCase();
let isIOS = !!ua.match(/\(i[^;]+;( u;)? cpu.+mac os x/); // 是否为IOS系统
let isIPhone = ua.indexOf('iphone') > 0; // 是否为iPhone
let isIPad = ua.indexOf('ipad') > 0; // 是否为iPad
let isAndroid = ua.indexOf('android') > 0; // 是否为安卓机
let isPC = !(isIOS || isAndroid); // 是否为PC
let isQYWX = ua.match(/wxwork/) !== null; // 是否为企业微信

export default {
  isIOS,
  isIPhone,
  isIPad,
  isAndroid,
  isPC,
  isQYWX,
}
