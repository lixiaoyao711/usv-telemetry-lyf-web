<template>
  <div class="amap">
    <el-amap
      class="amap-demo"
      ref="map"
      vid="amapDemo"
      :center="center"
      :zoom="zoom"
      :plugin="plugin"
      :events="amapEvents"
      :zooms="zooms"
      :expandZoomRange="true"
      :amap-manager="amapManager"
    ></el-amap>
  </div>
</template>
<script>
import Vue from 'vue';
import VueAMap from 'vue-amap';
import { AMapManager, lazyAMapApiLoaderInstance } from 'vue-amap';
import { log } from 'util';
Vue.use(VueAMap);
let amapManager = new VueAMap.AMapManager();

export default {
  name: "IndexAmap",
  //数据
  data() {
    // 用于在定制中将this指向data
    let self = this;
    return {
      amapManager,
      center: [106.587556, 29.567932],
      zoom: 18,
      zooms: [2, 20],
      // 高德地图原生使用
      VueMap: null,
      isCompleted: false,
      completedCallbacks: [],
      amapEvents: {
        // 将原生地图暴露出去
        init(o) {
          lazyAMapApiLoaderInstance.load().then(() => {
            self.VueMap = amapManager._map;
            self.sateLayer = new AMap.TileLayer.Satellite();
            for (let cb of self.completedCallbacks) {
              cb(self);
            }
            self.isCompleted = true;
          });
        },
      },
      // ==插件==
      plugin: [
        // 缩小放大
        {
          pName: 'ToolBar',
          events: {
            init(instance) { }
          }
        }
      ]
    }
  },
  //组件传值
  props: {
  },
  //方法
  methods: {},
  //计算属性
  computed: {},
  //注册组件
  components: {},
  //创建前
  beforeCreate() { },
  //创建完成
  created() { },
  //挂载前
  beforeMount() { },
  //挂载完成
  mounted() { },
  //更新前
  beforeUpdate() { },
  //更新完成
  updated() { },
  //销毁前
  beforeDestroy() { },
  //销毁完成
  destoryed() { },
  //监听
  watch: {},
}
</script>
<style lang="less" scoped>
.amap-demo {
  width: 100%;
  height: 100%;
  position: relative;
}
.amap {
  height: 100%;
}
</style>
