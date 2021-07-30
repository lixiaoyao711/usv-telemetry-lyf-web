import Vue from 'vue';
// 引入vue-amap
import VueAMap from 'vue-amap';

Vue.use(VueAMap);

// 初始化vue-amap
VueAMap.initAMapApiLoader({
  // 高德的key
  key: '8733dcdfa0e7bf4591471788c4dcac9c',
  // 插件集合
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.Scale',
    'AMap.OverView',
    'AMap.ToolBar',
    'AMap.MapType',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'AMap.Geocoder',
  ],
  // plugin: [ 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor'],

  // 高德 sdk 版本，默认为 1.4.4
  v: '1.4.4',
});
