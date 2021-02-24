<template>
  <div class="usvSpeedPanel">
    <div id="usvSpeedPanel-speed" class="usvSpeedPanel-speed"></div>
  </div>
</template>

<script>
// import vue from 'Vue'
// 导入eacharts
// import echarts from "echarts";
export default {
  name: 'usvSpeedPanel',
  props: {
    // 船只瞬时速度
    setmanned: {
      type: Object
      // default: '10'
    }
  },

  data() {
    return {
      usvSpeedPanel: null,
      usvDashboardMyChart: null
    };
  },
  methods: {
    // ====================eachart 绘制===============
    dashboardDraw() {
      // 基于准备好的dom，初始化echarts实例
      this.usvSpeedPanel = document.getElementById('usvSpeedPanel-speed');
      this.usvDashboardMyChart = this.$echarts.init(this.usvSpeedPanel);
      if (this.setmanned && this.setmanned.velocity) {
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
          formatter: '{b} : {c} kt'
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
            radius: '100%', //仪表盘大小
            center: ['50%', '55%'], // 仪表盘位置(圆心坐标)
            // 1节(kn)=1海里/时=(1852/3600)m/s
            data: [{ name: '瞬时速度', value: (this.setmanned.velocity / (1852 / 3600)).toFixed(1) }], //指针位置和鼠标移入显示数据
            max: '240',
            splitNumber: 10,
            //仪表盘轴线相关配置
            axisLine: {
              lineStyle: {
                width: 15 // 修改仪表盘宽度的属性
                // color:[['0.2','#fff'],['0.8','#000'],['1','pink']],
              }
            },
            // 分隔线样式
            splitLine: {
              // 分隔线样式。
              show: true, // 是否显示分隔线,默认 true。
              length: 20, // 分隔线线长。支持相对半径的百分比,默认 30。
              lineStyle: {
                // 分隔线样式。
                color: '#fff', //线的颜色,默认 #eee。
                opacity: 0.6, //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                width: 1.5, //线度,默认 2。
                type: 'solid', //线的类型,默认 solid。 此外还有 dashed,dotted
                shadowBlur: 10, //(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。
                shadowColor: '#fff' //阴影颜色。支持的格式同color。
              }
            },
            pointer: {
              width: 5, //指针的宽度
              length: '70%' //指针长度，按照半圆半径的百分比
            },
            title: {
              fontSize: 16,
              offsetCenter: [0, '80%'], // 标题展示位置
              color: 'rgba(100,100,100)'
            },
            detail: {
              formatter: '{value} kt',
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
    this.dashboardDraw();
  },
  watch: {
    'setmanned.velocity': {
      handler() {
        if (this.setmanned && this.setmanned.velocity) {
          this.usvDashboardMyChart.setOption(this.upsateOption(), true);
        }
      },
      deep: true
    }
  },
  destroyed() {}
};
</script>

<style lang="less" scoped>
.usvSpeedPanel {
  width: 100%;
  height: 100%;
}
.usvSpeedPanel > .usvSpeedPanel-speed {
  height: 100%;
  width: 100%;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.5);
}
</style>
