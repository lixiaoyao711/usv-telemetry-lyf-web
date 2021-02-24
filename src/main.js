import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
// 事件总线
import bus from '@/components/common/bus';
import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/global.css';
// 自定义icon
import './assets/css/icon.css';
import './assets/icon/icon.css';

import './components/common/directives';
import 'babel-polyfill';

import axios from 'axios';
import store from './store/store';

// 导入vxetable样式和组件
import 'xe-utils';
import VXETable from 'vxe-table';
import 'vxe-table/lib/style.css';

// 导入NProgress加载美化条
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import nProgress from 'nprogress';

// 导入地图
import '@/plugins/amap';

//导入lodash,深拷贝插件
import _ from 'lodash';
//扩展vue的插件
Vue.prototype._ = _;

//返回错误状态码封装函数
import { returnMessage } from '../src/api/index';
import { updateToken } from '../src/utils/request';
//,导入注册SignalR
import { install } from '@/utils/shioSignalR';
// 断开事件流的函数
import { logout } from '@/utils/shioSignalR';
install();

// 定义事件总线
Vue.prototype.$bus = new Vue();

// 导入使用 echarts
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;

Vue.prototype.$http = axios;
axios.defaults.baseURL = 'api';

//axios请求拦截
//控制当前响应完成后,才能点击下一次
var loading;

axios.interceptors.request.use(
  async config => {
    NProgress.start();
    //如果Authorization中没有token就给他token,否者不能登录系统
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${window.localStorage.getItem('token')}`;
    }
    //发送的是登录请求和更新token请求,那么不能发起请求否者会进入回调地狱死循环.
    if (config.url == '/auth/refreshtoken' || config.url == '/auth/signin') {
      return config;
    }
    // 更新token函数,如果过期时间>0小于30分钟就更新token
    updateToken(1800, config);
    return config;
  },
  err => {}
);

//axios响应拦截
axios.interceptors.response.use(
  res => {
    nProgress.done();
    loading = false;
    bus.$emit('loading', {
      loading: loading,
    });
    // 响应请求为200,但是有erroermessage时,统一提示给用户
    if (res.data.message) {
      ElementUI.Message({
        message: res.data.message,
        type: 'error',
      });
    }
    // 处理没有errormessage的情况,提示默认信息
    else if (res.data.errorCode != 0) {
      ElementUI.Message({
        message:
          '服务器在处理您的请求的过程中出现了未预料的错误，请稍后再试。如果此错误重复出现，请联系系统管理员。',
        type: 'error',
      });
    }
    return res;
  },
  err => {
    console.log(err);
    // 错误的状态码
    // console.log(err.response.status);
    if (err.response.status === 401) {
      logout();
      // 清空localStorage跳转登录页面
      window.localStorage.clear();
      // 因为是在main.js中使用router所以使用tihs.$router会报错,应该直接使用router
      router.push('/login');
      // 传递一个标识给登录页面判读是否登陆失效
      window.localStorage.setItem('loginOut', true);
    }
    // 请求为非200和非401会进入到这里,返回错误信息~~~~err.response 可以获取到错误的信息
    else {
      // 在main.js不能使用挂载方式否者会提示udf
      // this.$message.error(err.response.data.message)
      // 使用官方原生方法才有效
      console.log(err);
      if (err.response.data.message) {
        ElementUI.Message({
          message: err.response.data.message,
          type: 'error',
        });
      } else {
        // 接收返回的信息,并提示用户
        let errorMessage = returnMessage(err.response.status);
        ElementUI.Message({
          message: errorMessage,
          type: 'error',
        });
      }
    }
    loading = false;
    bus.$emit('loading', {
      loading: loading,
    });
  }
);

Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(VXETable);
Vue.use(ElementUI, {
  size: 'small',
});
const i18n = new VueI18n({
  locale: 'zh',
  messages,
});

document.title = ` 无人船水质检测后台管理系统`;

//全局修改默认配置，点击空白处不能关闭弹窗dialog
ElementUI.Dialog.props.closeOnClickModal.default = false;

// //使用钩子函数对路由进行权限跳转
// router.beforeEach((to, from, next) => {
//     const role = localStorage.getItem('ms_username');
//     if (!role && to.path !== '/login') {
//         next('/login');
//     } else if (to.meta.permission) {
//         // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
//         role === 'admin' ? next() : next('/403');
//     } else {
//         // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
//         if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
//             Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
//                 confirmButtonText: '确定'
//             });
//         } else {
//             next();
//         }
//     }
// });

let vm = new Vue({
  router,
  i18n,
  store,
  render: h => h(App),
}).$mount('#app');
