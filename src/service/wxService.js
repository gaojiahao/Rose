import $flyio from 'plugins/ajax';

// 获取企业微信config参数
export let getJsApiSignature = (url = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/getJsApiSignature',
    data: {
      url,
    }
  })
};

export default {
  getJsApiSignature,
}
