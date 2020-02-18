const ua = navigator.userAgent.toLowerCase();
export const isIOS = !!ua.match(/\(i[^;]+;( u;)? cpu.+mac os x/); // 是否为IOS系统
export const isIPhone = ua.indexOf('iphone') > 0; // 是否为iPhone
export const isIPad = ua.indexOf('ipad') > 0; // 是否为iPad
export const isAndroid = ua.indexOf('android') > 0; // 是否为安卓机
export const isPC = !(isIOS || isAndroid); // 是否为PC
export const isQYWX = ua.match(/wxwork/) !== null; // 是否为企业微信
export const isDD = ua.match(/dingtalk/) !== null; // 是否钉钉

if(ua.indexOf('chrome')>0) window.isDebug = true;
export default {
  isPC,
  isIOS,
  isQYWX,
  isIPad,
  isIPhone,
  isAndroid,
  isDD,
}
