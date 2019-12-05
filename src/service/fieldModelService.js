/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-12 16:54:03
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-12-04 16:06:11
 */
import $flyio from 'plugins/ajax'

// 获取视图列表
export let getFieldSetting = () => {
    return $flyio.ajax({
      url: `/H_roleplay-si/ds/getFieldSetting`,
    })
};
