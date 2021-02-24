<template>
  <div class="wrapper">
    <vHead></vHead>
    <v-sidebar></v-sidebar>
    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <vTags></vTags>
      <div class="content">
        <transition name="move" mode="out-in">
          <keep-alive :include="tagsList" exclude="Shipinfo,UserInfo,Index">
            <!-- 每个船只进入页面的代码不可以复用，添加key值 -->
            <!-- <router-view ></router-view> -->
            <router-view :key="$route.fullPath"></router-view>
          </keep-alive>
        </transition>
        <el-backtop target=".content"></el-backtop>
      </div>
    </div>
  </div>
</template>

<script>
import vHead from './Header.vue';
import vSidebar from './Sidebar.vue';
import vTags from './Tags.vue';
// 事件总线
import bus from './bus';
import { install } from '@/utils/shioSignalR';

// 定期检查token是否过期
import { checkTokenTime } from '@/utils/common';
// 断开事件流的函数
import { logout } from '@/utils/shioSignalR';
export default {
  data() {
    return {
      tagsList: [],
      collapse: false,
      checkTokenTimeInterval: null,
    };
  },
  components: {
    vHead,
    vSidebar,
    vTags,
  },
  methods: {},
  created() {
    bus.$on('collapse-content', msg => {
      this.collapse = msg;
    });
    // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
    bus.$on('tags', msg => {
      let arr = [];
      for (let i = 0, len = msg.length; i < len; i++) {
        msg[i].name && arr.push(msg[i].name);
      }
      this.tagsList = arr;
      console.log(this.tagsList);
    });
  },
  watch: {},
  mounted() {
    // 每隔10s检查一次token是否过期
    this.checkTokenTimeInterval = setInterval(() => {
      // 获取token过期时间
      let expTime = window.localStorage.getItem('tokenTime');
      // 如果返回为ture证明过期会执行if语句跳转到登陆页面
      if (checkTokenTime(expTime, 0)) {
        // 断开事件流
        logout();
        // 传递一个标识给登录页面判读是否登陆失效,并且清空token信息
        window.localStorage.setItem('loginOut', true);
        window.localStorage.removeItem('token');
        this.$router.push('/login');
      }
    }, 10000);
  },
  beforeDestroy() {
    // 页面销毁前,清空定时器,否者会出现多个定时器
    clearInterval(this.checkTokenTimeInterval);
  },
};
</script>
