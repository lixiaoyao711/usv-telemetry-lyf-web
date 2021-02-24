<template>
  <!-- 方位角和仪表盘刻度用 -->
  <div class="echatsCalibration">
    <div class="echatsCalibration_Calibration" ref="Calibration_style">
      <div class="echats-font" v-if="yaw">
        <div class="echats-font_top echats-font_div">
          <div class="echats-font_deg  echats-font_deg--offset--left" v-if="yaw">330</div>
          <div class="echats-font_deg echats-font_deg--offset--center">0</div>
          <div class="echats-font_deg echats-font_deg--offset--right">30</div>
        </div>
        <div class="echats-font_right echats-font_div">
          <div class="echats-font_deg echats-font_deg--offset--left">60</div>
          <div class="echats-font_deg echats-font_deg--offset--center">90</div>
          <div class="echats-font_deg echats-font_deg--offset--right">120</div>
        </div>
        <div class="echats-font_bottom echats-font_div">
          <div class="echats-font_deg echats-font_deg--offset--left">150</div>
          <div class="echats-font_deg echats-font_deg--offset--center">180</div>
          <div class="echats-font_deg echats-font_deg--offset--right">210</div>
        </div>
        <div class="echats-font_left echats-font_div" v-if="yaw">
          <div class="echats-font_deg echats-font_deg--offset--left">240</div>
          <div class="echats-font_deg echats-font_deg--offset--center">270</div>
          <div class="echats-font_deg echats-font_deg--offset--right">300</div>
        </div>
      </div>
      <div class="echats-font" v-else>
        <div class="echats-font_top echats-font_div">
          <div class="echats-font_deg echats-font_deg--offset--left echats-font_deg--offset--roll--left">150</div>
          <div class="echats-font_deg echats-font_deg--offset--center echats-font_deg--offset--roll--center">180</div>
          <div class="echats-font_deg echats-font_deg--offset--right echats-font_deg--offset--roll--right">-150</div>
        </div>
        <div class="echats-font_right echats-font_div">
          <div class="echats-font_deg echats-font_deg--offset--left echats-font_deg--offset--roll--left">-120</div>
          <div class="echats-font_deg echats-font_deg--offset--center echats-font_deg--offset--roll--center">-90</div>
          <div class="echats-font_deg echats-font_deg--offset--right echats-font_deg--offset--roll--right">-60</div>
        </div>
        <div class="echats-font_bottom echats-font_div">
          <div class="echats-font_deg echats-font_deg--offset--right echats-font_deg--offset--roll--right">30</div>
          <div class="echats-font_deg echats-font_deg--offset--center echats-font_deg--offset--roll--center">0</div>
          <div class="echats-font_deg  echats-font_deg--offset--left echats-font_deg--offset--roll--left">-30</div>
        </div>
        <div class="echats-font_left echats-font_div">
          <div class="echats-font_deg echats-font_deg--offset--left echats-font_deg--offset--roll--left">60</div>
          <div class="echats-font_deg echats-font_deg--offset--center echats-font_deg--offset--roll--center">90</div>
          <div class="echats-font_deg echats-font_deg--offset--right echats-font_deg--offset--roll--right">120</div>
        </div>
      </div>
      <div class="Calibration" ref="Calibration"></div>
    </div>
  </div>
</template>

<script>
import { rotate } from '@/components/common/rotate';
export default {
  name: 'echatsCalibration',
  props: {
    // 船只瞬时速度
    setmannedDeg: {
      type: Number
      // default: '10'
    },
    // 判断是方位角还是速度
    yaw: {
      type: String,
      default: null
    },
    speed: {
      type: String
    }
  },
  components: {},
  data() {
    return {
      // 仪表起始度
      series: {
        radius: null,
        startAngle: null,
        endAngle: null,
        max: null,
        min: null,
        splitNumber: null,
        center: null
      },
      // arr: [-27, 27, -3, -6, -2, 1, 150, 270, 189, 356],
      // setmannedDeg: null,
      // 图像选装变化，命名不能一样
      rotateDeg: rotate()
    };
  },
  methods: {
    // ====================eachart 绘制===============
    dashboardDraw() {
      // 基于准备好的dom，初始化echarts实例
      this.usvDashboardMyChart = this.$echarts.init(this.$refs.Calibration);
      if (this.setmannedDeg) {
        this.usvDashboardMyChart.setOption(this.upsateOption(), true);
      }
    },
    upsateOption() {
      // 绘制姿态仪表
      // myChart.setOption({里面就可复制官方文档里的内容}); 指定配置项和数据
      return {
        // 鼠标移入 提示框组件
        tooltip: {
          // 文档-》配置项组件 查看具体信息
          // trigger 触发方式 --》axis 鼠标放入横纵坐标就能触发
          formatter: '{b} : {c}/K'
        },
        toolbox: {
          show: false,
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        // 数据配置
        series: [
          {
            name: '瞬时速度',
            type: 'gauge',
            radius: this.series.radius, //仪表盘大小
            center: this.series.center, // 仪表盘位置(圆心坐标)
            startAngle: this.series.startAngle,
            endAngle: this.series.endAngle,
            data: [{ value: parseInt(this.setmannedDeg).toFixed(1) }], //指针位置和鼠标移入显示数据
            max: this.series.max,
            min: this.series.min,
            splitNumber: this.series.splitNumber, //仪表刻度数量
            //仪表盘轴线相关配置
            axisLine: {
              show: false,
              lineStyle: {
                width: 10, // 修改仪表盘宽度的属性
                color: [['1', '#fff']]
                // color:'#000'
              }
            },
            // 刻度样式
            axisTick: {
              show: true,
              lineStyle: {
                color: '#fff'
              }
            },
            // 分隔线样式
            splitLine: {
              // 分隔线样式。
              show: true, // 是否显示分隔线,默认 true。
              length: 12, // 分隔线线长。支持相对半径的百分比,默认 30。
              lineStyle: {
                // 分隔线样式。
                color: '#fff', //线的颜色,默认 #eee。
                // opacity: '0.9', //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                width: 1.5, //线度,默认 2。
                type: 'solid' //线的类型,默认 solid。 此外还有 dashed,dotted
                // shadowBlur: 10, //(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。
                // shadowColor: '#fff' //阴影颜色。支持的格式同color。
              }
            },
            axisLabel: {
              show: false,
              distance: 0
            },
            pointer: {
              show: false
            },
            title: {
              show: false,
              fontSize: 16,
              offsetCenter: [0, '80%'], // 标题展示位置
              color: '#000'
            },
            detail: {
              show: false,
              formatter: '{value}/K',
              textStyle: {
                color: 'auto',
                fontSize: 16
              },
              offsetCenter: ['0', '55%'] //实际值位置
            }
          }
        ]
      };
    }
  },
  created() {},
  mounted() {
    // 判断方位角和速度谁有值，用于给予圆盘起始度
    if (this.yaw) {
      this.series.radius = '100%';
      this.series.startAngle = 90;
      this.series.endAngle = -270;
      this.series.max = '360';
      this.series.min = '0';
      this.series.splitNumber = 12;
      this.series.center = ['50%', '50%'];
    } else {
      this.series.radius = '100%';
      this.series.startAngle = 90;
      this.series.endAngle = -270;
      this.series.max = '180';
      this.series.min = '-180';
      this.series.splitNumber = 12;
      this.series.center = ['50%', '50%'];
    }
    this.dashboardDraw();
  },
  watch: {
    setmannedDeg: {
      handler() {
        if (this.setmannedDeg) {
          // this.usvDashboardMyChart.setOption(this.upsateOption(), true);
          this.rotateDeg(this.$refs.Calibration_style, parseFloat(this.setmannedDeg * -1), 500);
        }
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.echatsCalibration {
  width: 100%;
  height: 200px;
  position: relative;
  top: 0;
  left: 0;
}
.echatsCalibration_Calibration {
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
}
.echats-font {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2000;
  color: #fff;
  font-size: 14px;
}
.echats-font_div {
  width: 100%;
  height: 25%;
  z-index: 2000;
  transform-origin: center;
  display: flex;
  justify-content: space-around;
}

.echats-font_top {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(0deg);
}
.echats-font_right {
  transform-origin: right;
  position: absolute;
  bottom: -13%;
  right: 12%;
  transform: rotate(90deg);
}
.echats-font_bottom {
  position: absolute;
  bottom: 0;
  right: 0%;
  transform: rotate(180deg);
}
.echats-font_left {
  transform-origin: left;
  position: absolute;
  bottom: -13%;
  left: 12%;
  transform: rotate(-90deg);
}
.echats-font_deg--offset--left {
  text-align: center;
  position: absolute;
  top: 23px;
  left: 51px;
  transform: rotate(-31deg);
}
.echats-font_deg--offset--center {
  text-align: center;
  transform: translate(50%);
  position: absolute;
  top: 12px;
  right: 50%;
}
.echats-font_deg--offset--right {
  text-align: center;
  position: absolute;
  top: 23px;
  right: 51px;
  transform: rotate(31deg);
}
.echats-font_deg--offset--roll--left {
  transform: rotate(149deg);
}
.echats-font_deg--offset--roll--center {
  transform: translate(50%) rotate(180deg);
}
.echats-font_deg--offset--roll--right {
  transform: rotate(211deg);
}
.Calibration {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  transition: all 0.5s linear;
  transform: rotate(0deg);
}
</style>
