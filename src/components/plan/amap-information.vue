<template>
  <!-- 点击无人船后。具体信息展示 右边 -->

  <div class="ampm-Unmanned-ship-information-right">
    <div class="amap-information-ship-plan-information" v-if="setmanned">
      <li>
        <p><span>无人船名称：</span> {{ usvName }}</p>
      </li>
      <li>
        <span>无人船状态：</span>
        {{ enums.usvState(setmanned.state) }}
      </li>
      <li>
        <p><span>电池电量：</span> {{ parseInt(setmanned.battery * 100) }}%</p>
      </li>
      <li>
        <p><span>故障模块：</span> {{ setmanned.moduleFailures }}</p>
      </li>
      <li>
        <p><span>GPS卫星数量：</span> {{ setmanned.gpsSatellites }}</p>
      </li>
      <li>
        <p><span>船只纬度：</span> {{ setmanned.location.latitude.toFixed(7) }}</p>
      </li>
      <li>
        <p><span>船只经度：</span> {{ setmanned.location.longitude.toFixed(7) }}</p>
      </li>
      <li>
        <p><span>WGS-84纬度：</span> {{ setmanned.wgs84Location.latitude.toFixed(7) }}</p>
      </li>
      <li>
        <p><span>WGS-84经度：</span> {{ setmanned.wgs84Location.longitude.toFixed(7) }}</p>
      </li>
      <li>
        <p><span>方位角：</span> {{ setmanned.yaw.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>俯仰角：</span> {{ setmanned.pitch.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>翻滚角：</span> {{ setmanned.roll.toFixed(2) }} °</p>
      </li>
      <li>
        <p><span>瞬时速度：</span> {{ setmanned.velocity.toFixed(1) }} m/s</p>
      </li>
      <!-- <li ><span>瞬时速度：</span>{{ setMeasurement.instantaneousSpeed.toFixed(1) }} m/s</li> -->
      <li v-if="setMeasurement">
        <p><span>平均速度：</span> {{ setMeasurement.averageSpeed.toFixed(1) }} m/s</p>
      </li>
      <!-- 运行状态页面不显示 -->
      <li v-if="setMeasurement && setMeasurement.targetFix != 0">
        <p><span>下一个站点:</span> {{ setMeasurement.targetFix }}</p>
      </li>
      <li v-if="setMeasurement && setMeasurement.targetFix == 0">
        <p><span>下一个站点:</span>返航中</p>
      </li>
      <li v-if="setMeasurement && setMeasurement.targetFix != 0">
        <p><span>下一个站点距离:</span> {{ setMeasurement.distanceToNextFix.toFixed(1) }} m</p>
      </li>
      <li v-if="setMeasurement">
        <p><span>预计航行里程：</span> {{ setMeasurement.estimatedTotalDistance.toFixed(1) }} m</p>
      </li>
      <li v-if="setMeasurement">
        <p><span>已航行里程：</span> {{ setMeasurement.accumulatedDistance.toFixed(1) }} m</p>
      </li>
      <li v-if="setMeasurement">
        <span>计划执行状态：</span>
        {{ enums.planState(setMeasurement.stage) }}
      </li>
      <li v-if="setMeasurement">
        <span>返航方式：</span>
        {{ enums.returnMode(setMeasurement.returnMode) }}
      </li>
    </div>
    
  </div>
</template>

<script>

import enums from '@/utils/enums'

export default {
  name: 'ampm-Unmanned-ship-information-right',
  props: {
    // 船的信息
    setmanned: Object,
    // 测量计划信息
    setMeasurement: Object,
    usvName: String
  },
  components: {

  },
  data() {
    return {
      currentRow: null,
      enums: enums
    };
  },
  methods: {
    // 无人船小船信息显示
    setCurrent() {
      this.$emit('clearTable');
    }
  },
  created() {}
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
// div通用样式设置
.information {
  position: absolute;
  top: 0;
  border-radius: 0 0 4px 4px;
  padding: 0;
  overflow: auto;
}
.ampm-Unmanned-ship-information-right {
  .information;
  width: 100%;
  height: 100%;
  display: flex;
  .amap-information-ship-plan-information {
    display: flex;
    min-height: 200px;
    justify-content: space-between;
    padding: 5px 10px;
    box-sizing: border-box;
    background: rgba(100, 100, 100, 0.5);
    flex-wrap: wrap;
    li {
      color: #fff;
      width: 220px;
      display: flex;
      align-items: center;

      p {
        height: 24px;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-wrap: break-word;
        overflow: hidden;
      }
    }
  }
}

</style>
