/**
 * @author snack.huang
 * @param iconUrl
 * @description 为apk格式化图片请求地址
 */
const appIconFilter  = (iconUrl) => {
    if(!iconUrl.includes('http') && window.baseURL){
        iconUrl = `${window.baseURL}${iconUrl}`
    }
    return iconUrl;
}

export default appIconFilter