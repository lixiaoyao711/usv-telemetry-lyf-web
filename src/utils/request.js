import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Vue from 'vue';
import router from '../router';
// 导入SignalR.js
import { authenticate } from '@/utils/shioSignalR';

import { trun } from '@/utils/common';
// const service = axios.create({
//     // process.env.NODE_ENV === 'development' 来判断是否开发环境
//     // easy-mock服务挂了，暂时不使用了
//     // baseURL: 'https://www.easy-mock.com/mock/592501a391470c0ac1fab128',
//     timeout: 5000
// });

// service.interceptors.request.use(
//     config => {
//         return config;
//     },
//     error => {
//         console.log(error);
//         return Promise.reject();
//     }
// );

// service.interceptors.response.use(
//     response => {
//         if (response.status === 200) {
//             return response.data;
//         } else {
//             Promise.reject();
//         }
//     },
//     error => {
//         console.log(error);
//         return Promise.reject();
//     }
// );

// export default service;

/**
 * 监听token过期时间,更新token
 * @return: Boolean
 */
// 如果用户在操作的时候,token过期时间减去当前的时间小于设置的时间,那么更新token到Authorization,并且重新将token的过期时间设置到localStorage
export const updateToken = async (timer, config) => {
  let date = new Date();
  let tokenTime = localStorage.getItem('tokenTime');
  let countTime = Number(tokenTime) - parseInt(date.getTime() / 1000);
  // 过期时间减去当前时间的值是否小于半小时且大于0,如果是就更新token,如果不是就不用
  if (countTime > 0 && countTime < timer) {
    const { data: res } = await axios.get('/auth/refreshtoken', config.headers.Authorization);
    // 解析token并且遍历取出数据
    let objToken = jwt_decode(res.data.token);
    let arrayToken = [];
    for (let i in objToken) {
      arrayToken.push(objToken[i]);
    }
    // 更新token
    window.localStorage.setItem('token', res.data.token);
    // 重新将token的过期时间设置到localStorage,否者时间不刷新,会一直获取新的token,导致用户永久在线
    window.localStorage.setItem('tokenTime', arrayToken[7]);
    config.headers.Authorization = `Bearer ${res.data.token}`;
    // 事件流更新token
    authenticate(res.data.token);
  }
};

//查看实时视频
export async function viewOnlineVideo(id, obj) {
  const { data: res } = await axios.get(`/camera/live?usvId=${id}`);
  if (!res.errorCode) {
    obj.url = res.data;
    // 执行获取token的函数
    getOnlineVideoToken(obj);
  }
}
//获取实时视频token函数
export async function getOnlineVideoToken(obj) {
  const { data: videoRes } = await axios.get(`/camera/accesstoken`);
  // 传了对象进入if赋值,直接调用没传对象只返回时间
  if (!videoRes.errorCode) {
    // 保存token,和过期时间
    obj.token = videoRes.data.token;
    obj.exp = parseInt(new Date(videoRes.data.expiry).getTime() / 1000);
  }
}

// 获取航标函数
export async function getMakerData(makerQuery) {
  console.log(makerQuery);
  let makerInfoList = [];
  const { data: res } = await axios({
    method: 'get',
    url: '/navaid/search',
    params: {
      'Condition.keyword': makerQuery.Condition.keyword,
      'Condition.radius': makerQuery.Condition.radius,
      'Condition.zoomLevel': makerQuery.Condition.zoomLevel,
      //如果传的空字符串就转换成null
      'Condition.Rect.TopLeft': makerQuery.Condition.Rect.TopLeft
        ? makerQuery.Condition.Rect.TopLeft
        : null,
      'Condition.Rect.TopRight': makerQuery.Condition.Rect.TopRight
        ? makerQuery.Condition.Rect.TopRight
        : null,
      'Condition.Rect.BottomLeft': makerQuery.Condition.Rect.BottomLeft
        ? makerQuery.Condition.Rect.BottomLeft
        : null,
      'Condition.Rect.BottomRight': makerQuery.Condition.Rect.BottomRight
        ? makerQuery.Condition.Rect.BottomRight
        : null,
      Page: makerQuery.page,
      Size: makerQuery.size,
    },
  });
  if (!res.errorCode) {
    makerInfoList = res.data.result;
    // 添加需要使用的经纬度
    for (const i of makerInfoList) {
      i.location = trun(i.location);
    }
    makerQuery.total = res.data.total;
  }
  return makerInfoList;
}

// 获取港口函数
export async function getPortData(portrQuery) {
  let portrInfoList = [];
  const { data: res } = await axios({
    method: 'get',
    url: '/port/search',
    params: {
      'Condition.keyword': portrQuery.Condition.keyword,
      'Condition.zoomLevel': portrQuery.Condition.zoomLevel,
      //如果传的空字符串就转换成null
      'Condition.Rect.TopLeft': portrQuery.Condition.Rect.TopLeft
        ? portrQuery.Condition.Rect.TopLeft
        : null,
      'Condition.Rect.TopRight': portrQuery.Condition.Rect.TopRight
        ? portrQuery.Condition.Rect.TopRight
        : null,
      'Condition.Rect.BottomLeft': portrQuery.Condition.Rect.BottomLeft
        ? portrQuery.Condition.Rect.BottomLeft
        : null,
      'Condition.Rect.BottomRight': portrQuery.Condition.Rect.BottomRight
        ? portrQuery.Condition.Rect.BottomRight
        : null,
      Page: portrQuery.page,
      Size: portrQuery.size,
    },
  });
  if (!res.errorCode) {
    portrInfoList = res.data.result;
    // 添加需要使用的经纬度
    for (const i of portrInfoList) {
      i.location = trun(i.location);
    }
    portrQuery.total = res.data.total;
  }
  return portrInfoList;
}
