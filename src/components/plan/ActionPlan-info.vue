<template>
  <!-- 执行计划页面 -->
  <div class="actionplan-info" v-loading="setActionLoading">
    <div class="actionplan-info-title">
      <h2 v-if="planId">
        {{ nowPlanName }}
        <div class="action-back-but">
          <el-button type="danger" @click="stopPlan">停止执行计划</el-button>
          <el-button type="primary" @click="SuspendedTask()" v-show="shipStop">暂停任务</el-button>
          <el-button type="primary" @click="restoreTask()" v-show="!shipStop">恢复任务</el-button>
          <el-button type="primary" @click="immediatelyReturn()">立即返航</el-button>
          <!-- <el-button type="primary" @click="softReset()">无人船软复位</el-button> -->
        </div>
        <p class="action-network-error" v-if="!$store.state.isNetworkConnected">网络连接错误，请稍后 <i class="el-icon-loading"></i></p>
      </h2>
      <h2 v-else>
        {{ usvName }}
        <p class="action-network-error" v-if="!$store.state.isNetworkConnected">网络连接错误，请稍后 <i class="el-icon-loading"></i></p>
      </h2>
    </div>
    <div class="actionplan-amap">
      <Amap
        :pointDataList="pointList"
        :routerTrackLineLoca="routerTrack.Line"
        :routerTrackLineTwoLoca="routerTrackTwo.Line"
        :targetDistance="targetDistance"
        :setmanned="setmanned"
        ref="amap"
      ></Amap>
      <!-- 船只信息显示 -->
      <amapright class="amap-right" :setmanned="setmanned" :setMeasurement="setMeasurement" :usvName="usvName" ref="mapright"></amapright>
      <div class="actionplan-speed" v-if="setmanned">
        <speedPanel class="speedPanel" :setmanned="setmanned"></speedPanel>
      </div>
      <!-- 视频显示 -->
      <div class="online-video">
        <OnlineVideo
          v-show="isShowVide"
          :accessToken="videoTokenData.token"
          :url="videoTokenData.url"
          :width="300"
          :height="200"
          ref="refOnlineVideo"
        ></OnlineVideo>
      </div>
      <!-- 障碍物坐标显示 -->
      <div class="actionplan-obstacles" v-if="obstaclesCoorFalse">
        <h6>附近障碍物坐标</h6>
        <li v-for="(coor, index) in obstaclesCoor" :key="index">
          <span v-for="(coors, index) in coor" :key="index">{{ coors }}</span>
        </li>
      </div>
      <div class="actionplan-batteryAndSetyleDashboard" ref="actionplanBatteryAndSetyleDashboard">
        <!-- 电池电量 -->
        <div class="actionplan-battery" v-if="setmanned && setmanned.battery">
          <el-progress type="dashboard" :percentage="parseInt(setmanned.battery * 100)" :color="batteryColor" :width="100"></el-progress>
          <p>电量</p>
        </div>
        <!-- 方位角显示仪表盘（姿态盘） -->
        <div class="actionplan-setyleDashboard">
          <styleDashbord :setmanned="setmanned"></styleDashbord>
        </div>
      </div>

      <el-button v-show="isShowVide" type="primary" @click="closeVideo" class="close-video">关闭监控</el-button>
      <el-button v-show="!isShowVide" type="primary" @click="openVideo" class="close-video">开启监控</el-button>
    </div>
  </div>
</template>

<script>
// 导入地图
import '@/plugins/amap';
import Amap from '@/amap/Amaps.vue';
import amapright from '@/components/plan/amap-information';
import { log } from 'util';
// 检查token是否过期
import { checkTokenTime, trun } from '@/utils/common';
import { viewOnlineVideo, getOnlineVideoToken } from '@/utils/request';

import { stringify } from 'querystring';
import * as signalr from '@/utils/shioSignalR';
// 实时监控组件
import OnlineVideo from '@/components/video/OnlineVideo';
import LoginVue from '../../views/login/Login.vue';
import { setInterval } from 'timers';
//姿态盘
import styleDashbord from '@/components/plan/usv-styleDashboard';
// 速度仪
import speedPanel from '@/components/plan/usv-speedPanel';
import bus from '@/components/common/bus';
export default {
  name: 'actionplanInfo',
  components: {
    Amap,
    amapright,
    OnlineVideo,
    styleDashbord,
    speedPanel
  },
  props: {
    usvId: {
      type: String
    }
  },
  data() {
    return {
      setActionLoading: true,
      // 计划id
      planId: null,
      // 锚点
      pointList: [],
      // 船的单独信息
      setmanned: null,
      // 测量计划的信息
      setMeasurement: null,

      // 当前计划名称
      nowPlanName: '',
      // 船只名称
      usvName: '',
      // 定时器

      checkTokenInterval: null,
      TokenUpdateTime: null,
      isgetPlanInfoTime: null,
      // 障碍物坐标
      obstaclesCoor: [],
      // 轨迹绘制
      routerTrack: {
        Line: [],
        Length: 0,
        Time: null
      },
      routerTrackTwo: {
        Line: [],
        Length: 0,
        Time: null
      },
      tolerance: 1,
      // 模拟障碍物坐标
      obstaclesCoorFalse: '',
      // 电池颜色
      batteryColor: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ],
      // 当前坐标到下一个目标点的位置
      targetDistance: [],

      // 经纬度按照指定规则转换
      LatiLongConversion: {
        sridWgs84: 'wgs84',
        sridGcj02: 'gcj02',
        setLatiLong: ''
      },
      // 停止执行计划
      shipStop: true,
      // 订阅id存储
      usvRuntimeInfoChangedId: '',
      planExecutionStateChangedId: '',

      // 是否显示diveo
      isShowVide: true,
      videoTokenData: {
        url: null,
        token: null,
        exp: null
      }
    };
  },
  computed: {},
  methods: {
    // ====================页面加载数据获取==================
    // 获取船信息
    getShipInfor(res) {
      // 不能存放相同的经纬度
      const isLine = this.routerTrack.Line.some(item => {
        return res.location.longitude == item[0] && res.location.latitude == item[1];
      });
      if (!isLine) {
        // 轨迹绘制始终只绘制一小时以内的标记
        if (this.routerTrack.Line.length <= 14400) {
          // 无人船实时位置
          this.$set(this.routerTrack.Line, this.routerTrack.Line.length, [res.location.longitude, res.location.latitude]);
        } else {
          this.routerTrack.Line.shift();
          this.$set(this.routerTrack.Line, this.routerTrack.Line.length, [res.location.longitude, res.location.latitude]);
        }
      }

      // 不能存放相同的第二条经纬度
      const isLineTwo = this.routerTrackTwo.Line.some(item => {
        return res.calibratedLocation.longitude == item[0] && res.calibratedLocation.latitude == item[1];
      });
      if (!isLineTwo) {
        // 轨迹绘制始终只绘制一小时以内的标记
        if (this.routerTrack.Line.length <= 14400) {
          // 无人船实时位置
          this.$set(this.routerTrackTwo.Line, this.routerTrackTwo.Line.length, [
            res.calibratedLocation.longitude,
            res.calibratedLocation.latitude
          ]);
        } else {
          this.routerTrackTwo.Line.shift();
          this.$set(this.routerTrackTwo.Line, this.routerTrackTwo.Line.length, [
            res.calibratedLocation.longitude,
            res.calibratedLocation.latitude
          ]);
        }
      }
      // 调用方法，障碍坐标显示
      if (res.obstacleInfo) {
        this.obstaclesCoorFalse = res.obstacleInfo;
        this.setObstaclesCoor(res.obstacleInfo);
      }
      // 数据被赋值后，马上使用数据库的信息
      if (this.setMeasurement && this.pointList.length != 0) {
        if (this.setMeasurement.targetFix && this.routerTrack.Line.length != 0) {
          // 将轨迹的最后一个坐标和获取到的指定信息路径存储做虚线指示
          this.targetDistance.splice(0, 1, this.routerTrackTwo.Line[this.routerTrackTwo.Line.length - 1]);
          this.targetDistance.splice(1, 1, [
            this.pointList[this.setMeasurement.targetFix - 1].location.longitude,
            this.pointList[this.setMeasurement.targetFix - 1].location.latitude
          ]);
        } else {
          this.targetDistance.splice(0, this.targetDistance.length - 1);
        }
      }
      setTimeout(() => {
        this.setActionLoading = false;
      }, 150);
    },
    // 关闭video
    closeVideo() {
      this.isShowVide = false;
      console.log(this.$refs.refOnlineVideo);
      this.$refs.refOnlineVideo.colseVideo();
      if (this.$refs.actionplanBatteryAndSetyleDashboard) {
        this.$refs.actionplanBatteryAndSetyleDashboard.style.top = '0px';
      }
    },
    // 开启video
    openVideo() {
      this.isShowVide = true;
      // 调用子组件的开启方法
      this.$refs.refOnlineVideo.openVideo();
      if (this.$refs.actionplanBatteryAndSetyleDashboard) {
        this.$refs.actionplanBatteryAndSetyleDashboard.style.top = '200px';
      }
    },
    // 转换为wgs坐标 暫時沒有用到了
    async wgsCoor(res) {
      if (res) {
        const { data: wsg } = await this.$http.get(
          `geography/convert?coord=${res.runtimeInfo.location.latitude}%2C${res.runtimeInfo.location.longitude}&srid=${this.LatiLongConversion.sridWgs84}`
        );
        if (!wsg.errorCode) {
          console.log(wsg);
          wsg.data.longitude = trun(wsg.data.longitude);
          this.LatiLongConversion.setLatiLong = { longitude: wsg.data.longitude, latitude: wsg.data.latitude };
        } else {
          this.$message.error(wsg.message);
        }
      }
    },
    // 获取计划标记点
    async getPlanCoor() {
      if (this.planId) {
        const { data: res } = await this.$http.get(`/plan/get?id=${this.planId}`);
        if (!res.errorCode) {
          // 排序获取信息
          res.data.fixes.sort(function(a, b) {
            return a.order - b.order;
          });
          for(let val of res.data.fixes){
            val.location = trun(val.location)
          }
          this.pointList = res.data.fixes;
          this.nowPlanName = res.data.name;
        }
      }
    },
    // 获取船只名字,获取计划id
    async getUsvName() {
      console.log(`当前船只usvID======》${this.usvId}`);
      const { data: res } = await this.$http.get(`usv/get?id=${this.usvId}`);
      if (!res.errorCode) {
        // 船只名字
        this.usvName = res.data.displayName;
        // 当前船只是否在执行计划,获取执行计划的id
        if (res.data.isExecutingPlan) {
          if (this.planId != res.data.executingPlanId) {
            this.planId = res.data.executingPlanId;
          }
        } else {
          this.planId = null;
        }
      }
    },
    // 调用Usv接口做一个token更新
    // async setTokenUpdata() {
    //   const { data: res } = await this.$http.get(`usv/get?id=${this.usvId}`);
    // },
    // 获取计划信息
    async getPlanInfor() {
      const { data: res } = await this.$http.get(`plan/getexecutioncontext?usvId=${this.usvId}`);
      if (!res.errorCode) {
        if (res.data.stage == 4) {
          this.$confirm('计划已经执行完毕是否退出页面?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.$message({
                type: 'success',
                message: '退出成功!'
              });
              let deletePath = this.$router.history.current.path;
              this.$store.commit('VueXDeleteTags', deletePath);
              this.$router.go(-1);
            })
            .catch(() => {
              // 将当前状态直接改为 运行状态
              this.planId = null;
            });
        }
      }
    },
    // ======================通过signalr获取信息==========================
    // 同时获取两种信息
    getUsvPlanInfo(reconnect) {
      var _this = this;
      function doSubscribe() {
        // 获取船只具体信息
        signalr
          .subscribe('usvRuntimeInfoChanged', _this.usvId, data => {
            if (data) {
              data.calibratedLocation = trun(data.calibratedLocation);
              data.location = trun(data.location);
              data.wgs84Location = trun(data.wgs84Location);
              _this.setmanned = data;
              data.location && _this.getShipInfor(data);
            } else {
              this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
            }
          })
          .then(codingId => {
            _this.usvRuntimeInfoChangedId = codingId;
          });
        // 获取计划详细信息
        signalr
          .subscribe('planExecutionStateChanged', _this.usvId, data => {
            if (data) {
              data.lastLocation = trun(data.lastLocation);
              _this.setMeasurement = data;

              if (_this.isgetPlanInfoTime) {
                window.clearTimeout(_this.isgetPlanInfoTime);
              }

              // 每10秒获取一次计划状态信息,提示用户是否弹出，并且装换为 运行状态
              _this.isgetPlanInfoTime = setTimeout(() => {
                if (_this.$store.state.isNetworkConnected) {
                  _this.getPlanInfor();
                }
              }, 10000);

              if (_this.setMeasurement.stage == 4) {
                _this.getPlanInfor();
                if (_this.isgetPlanInfoTime) {
                  window.clearTimeout(_this.isgetPlanInfoTime);
                }
              }
            } else {
              this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
            }
          })
          .then(codingId => {
            _this.planExecutionStateChangedId = codingId;
          });
      }
      doSubscribe();
    },
    // 查看运行状态只需要一个信息
    getRunStateInfo(reconnect) {
      signalr
        .subscribe('usvRuntimeInfoChanged', this.usvId, data => {
          if (data) {
            data.calibratedLocation = trun(data.calibratedLocation);
            data.location = trun(data.location);
            data.wgs84Location = trun(data.wgs84Location);
            this.setmanned = data;
            data.location && this.getShipInfor(data);
          } else {
            this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
          }
        })
        .then(codingId => {
          this.usvRuntimeInfoChangedId = codingId;
        });
    },
    // 事件流清除
    unsubscribeFun() {
      if (this.planExecutionStateChangedId) {
        signalr.unsubscribe([this.usvRuntimeInfoChangedId, this.planExecutionStateChangedId]);
      } else if (this.usvRuntimeInfoChangedId) {
        signalr.unsubscribe([this.usvRuntimeInfoChangedId]);
      }
    },
    // =====================通过signalr获取信息结束====================
    // =====================页面加载获取信息结束====================
    // ========================计划操作开始========================
    // 停止计划==确认框弹出
    async stopPlan() {
      this.$confirm('是否停止该计划执行?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(data => {
          this.stopPlanFun();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消停止计划'
          });
        });
    },
    // 停止任务==函数
    async stopPlanFun() {
      const { data: res } = await this.$http.post(`plan/cancel?usvId=${this.usvId}`);
      if (!res.errorCode) {
        let deletePath = this.$router.history.current.fullPath;
        console.log(deletePath); // /actionplan
        // bus.$emit('setDestroy',{index,full,tagsList})
        this.$parent.setDestroy();
        this.$store.commit('VueXDeleteTags', deletePath);
        this.$message.success('计划已经停止！');
        // this.$router.go(-1);
      } else {
        this.$message.error(res.message);
      }
    },
    // 暂停任务
    async SuspendedTask() {
      const { data: res } = await this.$http.post(`/usv/pause?id=${this.setmanned.id}`);
      if (!res.errorCode) {
        console.log(res);
        this.shipStop = false;
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // 恢复任务
    async restoreTask() {
      const { data: res } = await this.$http.post(`/usv/resume?id=${this.setmanned.id}`);
      if (!res.errorCode) {
        console.log(res);
        this.shipStop = true;
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // 立即返航
    async immediatelyReturn() {
      const { data: res } = await this.$http.post(`/usv/return?id=${this.setmanned.id}`);
      if (!res.errorCode) {
        console.log(res);
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // 无人船软复位
    async softReset() {
      const { data: res } = await this.$http.post(`/usv/reset?id=${this.setmanned.id}`);
      if (!res.errorCode) {
        console.log(res);
      } else {
        this.$message.error('当前未有接口' + this.setmanned.id);
      }
    },
    // =======================计划操作结束===================
    // =======================数据操作=======================
    // 障碍物信息拆分为二维数组
    setObstaclesCoor(str) {
      let splitArr = str.split('/');
      for (let arr of splitArr) {
        let arr2 = arr.split(',');
        for (let i in arr2) {
          arr2[i] = parseFloat(arr2[i]);
        }
        this.obstaclesCoor = [];
        this.$set(this.obstaclesCoor, this.obstaclesCoor.length, arr2);
      }
    },
    // 监测是否获取到地图并设置中心点
    getRefsAmap() {
      this.$refs.amap.isAutoTrack = false;
      this.$refs.amap.onCompleted(x => this.$refs.amap.clickMapCenter());
      // 进入页面优先地图自适应
      // this.$refs.amap.onCompleted(x => this.$refs.amap.setView());
    },
    // 将经纬度二维数组转换成纬经度对象
    setArrayConversionLocation(arr) {
      let location = [];
      let locationObject;
      if (arr) {
        arr.forEach((element, index) => {
          locationObject = {
            latitude: element[1],
            longitude: element[0]
          };
          location.push(locationObject);
        });
      }
      return location;
    },
    // 将纬经度对象转换成经纬度二维数组
    setLocationConversionArray(locationValue) {
      let location = [];
      let locationArray;
      if (locationValue) {
        locationValue.forEach((element, index) => {
          locationArray = [element.longitude, element.latitude];
          location.push(locationArray);
        });
      }
      return location;
    },
    // 调用接口，轨迹简化
    async setActionLineSimplified(newLine) {
      console.log(newLine);
      console.log('轨迹简化执行==========');
      if (newLine.Length != newLine.Line.length) {
        // 需要转换的经纬度长度
        let setLocationLength = newLine.Line.length - newLine.Length;
        let setLocation = newLine.Line.slice(newLine.Length, newLine.Line.length);
        let SimLine = this.setArrayConversionLocation(setLocation);
        let SimLineTrun = [];
        for (let val of SimLine) {
          let data = trun(val);
          SimLineTrun.push(data);
        }
        if (SimLineTrun.length > 1) {
          const { data: res } = await this.$http.post(
            `/geography/reduce?tolerance=${this.tolerance}&algorithmSource=application`,
            SimLineTrun
          );
          if (!res.errorCode) {
            console.log(res);
            let trunSimLineOld = JSON.parse(JSON.stringify(res.data.geom))
            let trunSimLine = [];
            for (let val of trunSimLineOld) {
              trunSimLine.push(trun(val));
            }
            let setArrayLocation = this.setLocationConversionArray(trunSimLine);
            console.log(setArrayLocation);
            newLine.Line.splice(newLine.Length, setLocationLength, ...setArrayLocation);
            newLine.Length = newLine.Length + res.data.outputSize;
          }
        }
      }
    },
    // ======================数据操作结束=======================
    // ========================状态修改==========================
    // ==执行计划页面==
    actioniPlan() {
      console.log('执行计划页面数据获取');
      this.getPlanCoor();
      this.unsubscribeFun();
      // 连接事件流
      signalr.connected(this.getUsvPlanInfo);
    },
    // ==查看状态页面==
    ViewRunStatus() {
      console.log('查看状态页面数据获取');
      this.unsubscribeFun();
      signalr.connected(this.getRunStateInfo);
      setTimeout(() => {
        this.setActionLoading = false;
      }, 150);
    },

    // 定时器设置
    ActionPlanTime() {
      // 初试获取计划信息
      this.getPlanInfor();
      if (this.isgetPlanInfoTime) {
        window.clearInterval(this.isgetPlanInfoTime);
      }
      if (this.TokenUpdateTime) {
        window.clearInterval(this.TokenUpdateTime);
      }
      if (this.checkTokenInterval) {
        window.clearInterval(this.checkTokenInterval);
      }
      if (this.routerTrack.Time) {
        window.clearInterval(this.routerTrack.Time);
      }
      if (this.routerTrackTwo.Time) {
        window.clearInterval(this.routerTrackTwo.Time);
      }
      // 5分钟获取一次token
      this.TokenUpdateTime = window.setInterval(() => {
        this.getUsvName();
      }, 300000);
      // 十秒检查一次视频token是否快过期,快过期给新的tokne
      this.checkTokenInterval = window.setInterval(() => {
        if (checkTokenTime(this.videoTokenData.exp, 3600)) {
          // 更新token的函数
          this.isShowVide && getOnlineVideoToken(this.videoTokenData);
        }
      }, 10000);

      //每一分钟简化一次新的轨迹线
      this.routerTrack.Time = window.setInterval(() => {
        this.setActionLineSimplified(this.routerTrack);
      }, 60000);
      this.routerTrackTwo.Time = window.setInterval(() => {
        this.setActionLineSimplified(this.routerTrackTwo);
      }, 60000);
    },
    async createdRun() {
      await this.getUsvName();
      if (this.planId) {
        // 如果执行计划进入，必然改变planId，自动执行计划
        this.$route.meta.title = `${this.usvName}执行中`;
        // this.$store.commit('setTags', this.$route);
        this.$store.dispatch('updateTagsTitleActions', this.$route);
      } else {
        // 如果只是查看，则planId不会改变，手动执行计划
        this.ViewRunStatus();
        this.$route.meta.title = `${this.usvName}状态信息`;
        // this.$store.commit('setTags', this.$route);
        this.$store.dispatch('updateTagsTitleActions', this.$route);
      }
      this.ActionPlanTime();
    }
  },
  created() {
    viewOnlineVideo(this.usvId, this.videoTokenData);
  },
  mounted() {
    //获取坐标信息后再执行地图自适应，此时数据才能获取到信息
    this.getRefsAmap();
  },
  // 销毁当前实例清除掉定时器
  destroyed() {
    window.clearInterval(this.isgetPlanInfoTime);
    window.clearInterval(this.TokenUpdateTime);
    window.clearInterval(this.checkTokenInterval);
    window.clearInterval(this.routerTrack.Time);
    window.clearInterval(this.routerTrackTwo.Time);

    this.routerTrack.Line = [];
    this.routerTrackTwo.Line = [];
    this.unsubscribeFun();
  },
  // 进入路由切换执行 (失败，当前页面是组件，并非路由。所以这里直接不会执行)
  // beforeRouteEnter(to, from, next) {
  //   console.log(to);
  //   // 进入路由获取不到当前实例的数据，通过传参获取
  //   next(self => {
  //     // console.log(self.isCreated);
  //     // if (self.isCreated) {
  //       if (self.usvId != to.query.usvId) {
  //         self.usvId = to.query.usvId;
  //         console.log(self.usvId);
  //       // }
  //       console.log(self.usvId);
  //       // console.log(self.$route.query.usvId);
  //       // console.log(self.$route.params.usvId);
  //       // console.log(self.$refs.actionPlanInfo);
  //       // self.$refs.actionPlanInfo.createdRun();
  //       self.createdRun();
  //     }
  //   });
  // },
  watch: {
    usvId: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal);
        // this.ActionPlanTime();
        // viewOnlineVideo(this.usvId, this.videoTokenData);
        // this.getUsvName()
      }
    },
    planId: {
      handler(newVal, oldVal) {
        console.log('数据被修改了=====================================');
        // 清除前面的数据获取编码
        if (oldVal && !newVal) {
          // 执行转查看
          this.unsubscribeFun();
          // 清除航线和  //暂时不清轨迹
          this.pointList.splice(0, this.pointList.length);
          // this.targetDistance.splice(0, this.targetDistance.length);
          this.setMeasurement = null;
        } else if (!oldVal && newVal) {
          // 查看转执行
          this.unsubscribeFun();
          // this.getUsvName();
        } else {
          // 执行的计划被修改了
          this.unsubscribeFun();
        }

        // 页面加载时通过传过来的数据，进行数据获取
        if (this.planId) {
          this.actioniPlan();
          this.$route.meta.title = `${this.usvName}执行中`;
          // this.$store.commit('setTags', this.$route);
          this.$store.dispatch('updateTagsTitleActions', this.$route);
        } else {
          this.ViewRunStatus();
          this.$route.meta.title = `${this.usvName}状态查看`;
          // this.$store.commit('setTags', this.$route);
          this.$store.dispatch('updateTagsTitleActions', this.$route);
        }

        // 重置所有定时器
        this.ActionPlanTime();
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
.action-network-error {
  font-size: 12px;
  color: red;
  position: absolute;
  right: 0;
  top: 0;
}
.actionplan-info {
  width: 100%;
  height: 100%;
  .actionplan-info-title {
    height: 50px;
  }
  h2 {
    line-height: 50px;
    text-align: center;
    position: relative;
    overflow: hidden;
    .action-back-but {
      position: absolute;
      left: 0;
      top: 50%;
      z-index: 500;
      transform: translateY(-50%);
    }
  }
}
.actionplan-amap {
  width: 100%;
  height: calc(100% - 50px);
  position: relative;
}

.actionplan-obstacles {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.online-video {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  height: 200px;
}
// 速度仪样式
.actionplan-speed {
  position: absolute;
  right: 300px;
  top: 0;
  min-width: 200px;
  width: 200px;
  min-height: 200px;
  height: 200px;
}
// 实时视频的iframe样式
#ysopen {
  width: 300px;
  height: 200px;
}
.amap-right {
  width: calc(100% - 500px);
  height: auto;
}
.amap-right-plan {
  width: 100%;
  height: auto;
}
.close-video {
  position: absolute;
  bottom: 10px;
  right: 90px;
}
// 电量和姿态盘
.actionplan-batteryAndSetyleDashboard {
  position: absolute;
  width: auto;
  height: auto;
  top: 200px;
  right: 0;
  display: flex;
}
.actionplan-battery {
  position: relative;
  border-radius: 20px;
  background: rgba(100, 100, 100, 0.5);
  text-align: center;
  font-size: 12px;
  color: #fff;
  height: 100px;
  p {
    position: absolute;
    bottom: 5px;
    width: 100%;
  }

  /deep/.el-progress__text {
    color: #fff;
  }
}
//姿态盘
.actionplan-setyleDashboard {
  position: relative;
  width: 200px;
  height: auto;
  background: #333a;
  border-radius: 25px;
}
</style>
