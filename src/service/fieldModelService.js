/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-12 16:54:03
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-12-09 15:22:52
 */
import $flyio from 'plugins/ajax'

// 获取视图列表
export let getFieldSetting = () => {
    return $flyio.ajax({
      url: `/H_roleplay-si/ds/getFieldSetting`,
    })
};

// 获取视图列表
export let getAllFieldSettingListLevel = () => {
  return $flyio.ajax({
    url: `/H_roleplay-si/ds/getAllFieldSettingListLevel`,
  })
};

// 获取视图列表
export let getAllDict = () => {
  return $flyio.ajax({
    url: `/H_roleplay-si/ds/getAllDict`,
  })
};
