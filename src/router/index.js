import Vue from 'vue';
import store from '@/store/store';
import Router from 'vue-router';
// 地图加载出现问题，改用全局直接加载
import amap from 'views/home/child/plan-management/Plan.vue';
import home from '../components/common/Home.vue';
import planChannel from 'views/home/child/plan-channel/planchannel.vue';
import { watch } from 'less';

Vue.use(Router);

const routes = [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
  },
  {
    path: '/home',
    name: 'Home',
    // component : () => import('../components/common/Home.vue'),
    component: home,
    redirect: '/index',
    children: [
      {
        path: '/shipinfo',
        component: () => import('../views/home/child/unmanned-ship/Shipinfo.vue'),
        meta: { title: '无人船信息管理' },
      },
      // {
      //     path: "/configuration",
      //     component: () => import("../views/home/child/unmanned-ship/Configuration.vue"),
      //     meta: { title: '配置信息管理' },
      // },
      {
        path: '/index',
        component: () => import('views/home/Index.vue'),
        meta: { title: '运行状态' },
      },
      {
        path: '/checkpoint',
        component: () => import('views/home/child/plan-management/CheckPoint.vue'),
        meta: { title: '检测点管理' },
      },
      {
        path: '/plan',
        component: () => import('views/home/child/plan-management/Plan.vue'),
        meta: { title: '计划管理' },
      },
      {
        path: '/planroute',
        component: () => import('views/home/child/plan-route/PlanRoute.vue'),
        meta: { title: '航线规划' },
      },
      {
        path: '/navmark',
        component: () => import('views/home/child/plan-route/NavigationMark.vue'),
        meta: { title: '航标管理' },
      },
      {
        path: '/actionplan',
        name: 'actionplan',
        component: () => import('views/home/child/plan-management/ActionPlan.vue'),
        meta: { title: '执行计划' },
      },
      {
        path: '/actionplan123',
        name: 'actionplan123',
        component: () => import('views/home/child/plan-management/ActionPlan.vue'),
        meta: { title: '运行状态' },
      },
      {
        path: '/user',
        component: () => import('views/home/child/basic-info-manage/UserInfo.vue'),
        meta: { title: '用户信息管理' },
      },
      {
        path: '/organization',
        component: () => import('views/home/child/basic-info-manage/Organization.vue'),
        meta: { title: '组织机构管理' },
      },
      {
        path: '/planchannel',
        // component: () => import("views/home/child/plan-channel/planchannel.vue"),
        component: planChannel,
        meta: { title: '航道管理' },
      },
      {
        path: '/portrerth',
        component: () => import('views/home/child/port-berth-info/PortBerth.vue'),
        meta: { title: '港口泊位管理' },
      },
    ],
  },
  // 重定向 錯誤頁面自動跳轉到index頁面
  // { path: '*', redirect: '/index' }
];

const router = new Router({
  mode: 'history', //历史记录模式
  routes,
});

router.beforeEach((to, from, next) => {
  const token = window.localStorage.getItem('token');
  // console.log(from);
  if (to.path === '/login') return next();
  if (!token) {
    // this.$message.error('用户登录信息失效,请重新登录')
    return next('./login');
  } else {
    return next();
  }
});

export default router;
