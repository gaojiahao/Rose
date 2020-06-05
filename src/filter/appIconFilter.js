/**
 * @author snack.huang
 * @param iconUrl
 * @description 为apk格式化图片请求地址
 */
const appIconFilter  = (iconUrl) => {
    if(iconUrl != null && !iconUrl.includes('http') && window.baseURL){
        iconUrl = `${window.baseURL}${iconUrl}`
    }

    if(!iconUrl)  iconUrl ='https://lab.roletask.com/resource/common-icon/male.png';
    return iconUrl;
}

export default appIconFilter