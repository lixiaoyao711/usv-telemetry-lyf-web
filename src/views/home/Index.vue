<template>
  <div class="index" v-loading="indexLoading">
    <div>
      <el-card>
        <el-row class="map">
          <el-col>
            <Amap
              @ViewLocation="ViewLocation"
              :shipDataList="shipDataList"
              :shipNameList="shipNameList"
              :isOpenTrack="!isShowTrackBtn"
              :clearTrackBtn="clearTrackBtn"
              ref="Indexamap"
            ></Amap>
            <el-button v-if="isShowTrackBtn" @click="openTrack" class="track-btn" type="primary"
              >开启轨迹</el-button
            >
            <el-button v-else @click="closeTrack" class="track-btn" type="primary"
              >关闭轨迹</el-button
            >
            <el-button v-if="!isShowTrackBtn" @click="clearTrack" class="clear-btn" type="primary"
              >清除轨迹</el-button
            >
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>
<script>
// 导入地图
import '@/plugins/amap';
import amapright from '@/components/plan/amap-information';
import amapleft from '@/components/plan/ampm-Unmanned';
import Breadcrumb from 'common/Breadcrumb';
import Amap from '@/amap/Amaps.vue';
import * as signalr from '@/utils/shioSignalR';
// import ActionPlan from './ActionPlan.vue';
// 事件总线
import bus from '@/components/common/bus';
import enums from '@/utils/enums';
import { trun } from '@/utils/common';

export default {
  name: 'Index',
  //数据
  data() {
    return {
      // 分页数据查询条件
      shipQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 10,
      },
      // =================loading==================
      getloading: false,
      indexLoading: true,
      // =================数据====================
      shipInfoList: [],
      shipDataList: [],
      // 所有船只的名称
      shipNameList: [],
      viewRunStatusFrom: {},
      usvRuntimeInfoChangedId: null,
      code: null,
      routerTrackLine: [],
      pointList: [],
      // 船只id
      usvIdList: [],
      // 调用事件流subscribeAll的id
      eventsList: [],
      wsConnectedCbHandle: 0,
      //控制开启关闭轨迹的显隐
      isShowTrackBtn: true,
      // 通过监听来判断是否点击了清空轨迹功能
      clearTrackBtn: false,
      // 通过监听来判断事件流是否断开连接
      DisconnectMessage: '',
    };
  },
  //组件传值
  props: {},
  //方法
  methods: {
    async getShipData() {
      this.getloading = true;
      let query = this.shipQuery.condition.keyword;
      let page = this.shipQuery.page;
      let size = this.shipQuery.size;
      const { data: res } = await this.$http.get(
        `/usv/search?Condition.Keyword=${query}&Page=${page}&Size=${size}`
      );
      if (!res.errorCode) {
        this.shipInfoList = res.data.result;
        this.total = res.data.total; // 将shipInfoList得state转换成对应得无人船状态
        // 获取船只id,传回subscribeAll
        for (const item of this.shipInfoList) {
          item.runtimeInfo.state = enums.usvState(item.runtimeInfo.state);
          if (item.runtimeInfo.location) {
            this.routerTrackLine.push(item.runtimeInfo.location);
            this.shipNameList.push(item.displayName);
          }
          this.usvIdList.push(item.id);
        }
        this.getloading = false;
      }
      // 需要传回给事件流的arr
      this.eventsList = this.usvIdList.map(id => {
        return { eventName: 'usvRuntimeInfoChanged', shipId: id, callback: this.signalrCallback };
      });
    },
    // 查看状态信息的事件流函数
    showShipStatusInfo() {
      // 传入事件名,和所需要的arr参数
      signalr.subscribeAll(this.eventsList).then(data => {
        // 保存编码,是取消事件流的唯一标识
        console.log('进入了.then');
        if (data) {
          this.usvRuntimeInfoChangedId = data;
        } else {
          this.$message.error(`指定的无人船不存在或者用户没有访问指定无人船的权限`);
        }
      });
    },
    // 获取所有事件流的回调函数
    signalrCallback(data) {
      // 如果没有船只数据直接显示地图
      !data ? (this.indexLoading = false) : '';
      if (data.length) {
        console.log('进入了if');
        this.shipDataList = data;
        // 状态转换
        for (let i in this.shipDataList) {
          this.$set(this.shipDataList[i], 'state', enums.usvState(this.shipDataList[i].state));
          i.location = trun(i.location);
        }
        console.log(this.shipDataList);
      } else {
        this.viewRunStatusFrom = data;
        // 状态转换
        // this.viewRunStatusFrom.state = enums.usvState(data.state);
        this.$set(this.viewRunStatusFrom, 'state', enums.usvState(data.state));
        this.$set(this.shipDataList, 0, this.viewRunStatusFrom);
        // if (this.shipDataList.length == 0) {
        //   this.shipDataList.push(this.viewRunStatusFrom)
        // }
        // else if (data.id == this.shipDataList[this.shipDataList.length - 1].id) {
        //   this.$set(this.shipDataList, this.shipDataList.length - 1, this.viewRunStatusFrom)
        // }
        // else {
        //   this.shipDataList.push(this.viewRunStatusFrom)
        // }
      }
    },
    // 开机轨迹
    openTrack() {
      this.isShowTrackBtn = !this.isShowTrackBtn;
    },
    // 关闭轨迹
    closeTrack() {
      this.isShowTrackBtn = !this.isShowTrackBtn;
    },
    // 清空轨迹
    clearTrack() {
      this.clearTrackBtn = !this.clearTrackBtn;
    },
    // 经纬度查看
    ViewLocation(data) {
      this.lnglat = data;
    },
  },
  //计算属性
  computed: {},
  //注册组件
  components: {
    Breadcrumb,
    Amap,
  },
  //创建前
  beforeCreate() {},
  //创建完成
  created() {
    this.getShipData();
  },
  //挂载前
  beforeMount() {},
  //挂载完成
  mounted() {
    // 每次点击自适应地图标点
    this.$refs.Indexamap.onCompleted(x => this.$refs.Indexamap.setView(this.viewRunStatusFrom));
    // 地图中心点变换
    bus.$on('isShowIndex', ({ val }) => {
      this.indexLoading = val;
    });
    // 事件流断开
    bus.$on('Disconnect', ({ message }) => {
      this.DisconnectMessage = message;
    });
  },
  //更新前
  beforeUpdate() {},
  //更新完成
  updated() {},
  //销毁前
  beforeDestroy() {
    // 离开前传回编码关闭事件流,要将他以数组传回去
    signalr.unsubscribe(this.usvRuntimeInfoChangedId);
    console.log(this.usvRuntimeInfoChangedId);
    signalr.unconnected(this.wsConnectedCbHandle);
    this.option ? this.option.close() : '';
  },
  //销毁完成
  destoryed() {},
  //监听
  watch: {
    eventsList() {
      this.wsConnectedCbHandle = signalr.connected(this.showShipStatusInfo);
    },
    // DisconnectMessage变化了证明事件流连接发生了变化
    DisconnectMessage() {
      if (this.DisconnectMessage) {
        this.option = this.$message({
          type: 'error',
          message: this.DisconnectMessage,
          duration: 0,
        });
      } else {
        this.option ? this.option.close() : '';
      }
    },
  },
};
</script>
<style lang="less" scoped>
.index {
  height: 100%;
}
.map {
  height: 85vh;
  .el-col {
    height: 100%;
  }
}
/deep/ .el-card__body {
  padding: 0;
}
.track-btn {
  padding: 9px;
  position: absolute;
  right: 95px;
  bottom: 10px;
}
.clear-btn {
  margin-left: 0px;
  padding: 9px;
  width: 73px;
  position: absolute;
  right: 10px;
  bottom: 52px;
}
</style>
