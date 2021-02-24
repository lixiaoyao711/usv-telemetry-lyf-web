<template>
  <div class="login-wrap" id="login-wrap">
    <canvas id="demo-canvas"></canvas>
    <div class="ms-login">
      <div class="ms-title">无人船水质检测后台管理系统</div>
      <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
        <el-form-item prop="userName">
          <el-input v-model="param.userName" placeholder="请输入用户名">
            <i slot="prepend" class="el-icon-lx-people"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="请输入密码" v-model="param.password" show-password @keyup.enter.native="submitForm()">
            <i slot="prepend" class="el-icon-lx-lock"></i>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm()" :loading="loginLoading">登录</el-button>
        </div>
        <p class="login-tips">Tips : 请填写正确的用户名和密码</p>
      </el-form>
    </div>
  </div>
</template>

<script>
import '../../assets/js/login/rAF';
import '../../assets/js/login/EasePack.min.js';
import { test } from '../../assets/js/login/demo-1';
import jwt_decode from 'jwt-decode';

// 节流函数
import { throttle } from '@/utils/common';
// 事件总线
import bus from '@/components/common/bus';
// 断开事件流的函数
import { logout } from '@/utils/shioSignalR';

export default {
  data: function() {
    let a = {
      param: {
        userName: process.env.VUE_APP_DEFAULT_ACCOUNT,
        password: process.env.VUE_APP_DEFAULT_PASSWORD,
      },
      rules: {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
      loginLoading: false,
    };

    return a;
  },
  methods: {
    submitForm: throttle(function() {
      this.btnlogin();
    }, 1000),
    btnlogin() {
      this.$refs.login.validate(async valid => {
        if (valid) {
          this.loginLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.loginLoading = loading;
          });
          const { data: res } = await this.$http.post('/auth/signin', this.param);
          console.log('发送了请求');
          if (res.errorCode) {
            console.log(res);
            this.$message({
              duration: '1500',
              message: `${res.message}`,
              type: 'error',
            });
          } else {
            console.log(res);
            let objToken = jwt_decode(res.data.token);
            let arrayToken = [];
            for (let i in objToken) {
              arrayToken.push(objToken[i]);
            }
            console.log(objToken);
            console.log(arrayToken);
            this.$message.success('登录成功!');
            // 更新token
            window.localStorage.setItem('token', res.data.token);
            // 将token的过期时间设置到localStorage中,以此来完成刷新token的功能
            window.localStorage.setItem('tokenTime', arrayToken[7]);
            window.localStorage.setItem('username', objToken.sub);
            window.localStorage.setItem('role', arrayToken[4]);
            window.localStorage.setItem('organizationId', arrayToken[5]);
            this.$router.push('/index');
          }
        } else {
          this.$message.info('请输入用户名和密码');
        }
      });
    },
    // 判断是否是因为登录失效返回登陆页面,如果是则提示用户
    loginOut() {
      if (window.localStorage.loginOut == 'true') {
        this.$notify({
          title: '提示',
          message: '用户登录信息失效,请重新登录',
          type: 'warning',
        });
      }
      // 将判断的值改为false,避免用户刷新弹出
      window.localStorage.setItem('loginOut', false);
    },
  },
  created() {
    // 返回登录页面清空token,以防事件流重新连接
    window.localStorage.removeItem('token');

    this.loginOut();
    logout();
  },
  mounted() {
    test();
  },
  beforeDestroy() {},
};
</script>

<style scoped>
@import '../../assets/css/login/demo.css';
@import '../../assets/css/login/component.css';
@import '../../assets/css/login/normalize.css';
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(../../assets/img/login/login.jpg);
  background-size: 100%;
}
.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  color: #fff;
  border-bottom: 1px solid #ddd;
}
.ms-login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 350px;
  margin: -190px 0 0 -175px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}
.ms-content {
  padding: 30px 30px;
}
.login-btn {
  text-align: center;
}
.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}
.login-tips {
  font-size: 12px;
  line-height: 30px;
  color: #fff;
}
</style>
