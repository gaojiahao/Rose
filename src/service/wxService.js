import $axios from '../plugins/ajax';

// TODO 获取企业微信config参数
export let getJsApiSignature = (url = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/getJsApiSignature',
    data: {
      url,
    }
  })
};

export default {
  getJsApiSignature,
}
