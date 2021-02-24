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
    >
      <!-- 计划-航线点标记 -->
      <el-amap-marker
        v-for="(marker, index) in pointDataList"
        v-if="pointDataList.length != 0"
        :position="[marker.location.longitude, marker.location.latitude]"
        :key="marker.order"
        :draggable="isClick"
        :events="markerEvents"
        ref="amapsMarkers"
      >
        <div class="markerImg">{{ marker.order }}</div>
        <!-- 点击删除 -->
        <div class="close-btn" v-if="isClick" @click="deleteMarke(index)">x</div>
      </el-amap-marker>
      <!-- 返航点标记 -->
      <el-amap-marker
        v-for="(marker, index) in returnHomeData"
        v-if="returnHomeData"
        :position="[marker.location.longitude, marker.location.latitude]"
        :key="index"
        :draggable="isClick"
        :events="retrunHomeMakerEvents"
        ref="amapsMarkers"
      >
        <div class="markerImg">返</div>
      </el-amap-marker>

      <!-- 所有实时无人船 -->
      <div v-if="shipDataList">
        <el-amap-marker
          v-for="(marker, index) in shipDataList"
          :key="index"
          :events="shipMarkerEvents"
          :position="[marker.location.longitude, marker.location.latitude]"
          ref="maker"
          :id="index"
        >
          <div class="all-ship-box">
            <div>船名:{{ shipNameList[index] }}</div>
            <div>状态:{{ marker.state }}</div>
            <!-- 状态离线不显示速度 -->
            <div class="speed" v-if="marker.state != '离线'">航行速度:{{ marker.velocity.toFixed(2) }}m/s</div>
          </div>
          <div class="all-ship-view-marker" @click="toShipinfo(marker)" ref="allShipMarker">
            <img src="@/assets/img/ship-view/ship.png" alt />
          </div>
        </el-amap-marker>
      </div>
      <!-- 航标maker -->
      <div v-if="navMakerInfoList">
        <el-amap-marker
          v-for="(marker, index) in navMakerInfoList"
          :key="index"
          :events="navMarkerEvents"
          :position="[marker.location.longitude, marker.location.latitude]"
          :offset="[-18, -15]"
        >
          <div class="nav-maker" @click="btnMarker(marker)">
            {{ marker.ident }}
          </div>
        </el-amap-marker>
      </div>
      <div v-if="portInfoList">
        <!-- 港口maker -->
        <el-amap-marker
          v-for="(port, index) in portInfoList"
          :key="index"
          :position="[port.location.longitude, port.location.latitude]"
          :offset="[-18, -15]"
        >
          <div class="port-maker" @click="btnPort(port)">
            <el-button type="primary" icon="iconfont el-icon-gangkou" class="chartAmap_button">{{ port.name }}</el-button>
          </div>
          <div class="port-box" v-show="isShowPortBox" @mouseenter="addPortBoxOnmouseover" @mouseleave="addPortBoxmouseleave">
            <i class="el-icon-close" @click="closePortBox('data')"></i>
            <div>ident:<input type="text" v-model="port.ident" disabled /></div>
            <div>港口名: <input type="text" :class="{ test: portClassList[1] }" v-model="port.name" @blur="blurName(port)" /></div>
            <div>
              面积:
              <input v-model="port.area" disabled />
              ㎡
            </div>
            <div>经纬度:{{ port.location.longitude + ',' + port.location.latitude }}</div>
            <div>半径: <input type="text" :class="{ test: portClassList[2] }" v-model="port.radius" @blur="blurRadius(port)" />m</div>
            <div>层级:<input type="text" :class="{ test: portClassList[3] }" v-model="port.zoomLevel" @blur="blurZoomLevel(port)" /></div>
            <div class="port-btn-box">
              <span v-show="portTips" class="tips">Tips:数据不合法</span>
              <button class="delete-btn" @click="deletePort(port)">删除</button
              ><button class="edit-btn" @click="editPort(port)">修改</button>
            </div>
          </div>
        </el-amap-marker>
        <!-- 港口范围 -->
        <el-amap-polygon
          :bubble="true"
          :editable="isPolylineChange"
          :path="boundsList"
          strokeColor="#FF33FF"
          strokeStyle="solid"
          strokeWeight="6"
          fillColor="#1791fc"
          :strokeOpacity="0.2"
          :fillOpacity="0.4"
          :zIndex="999"
          :events="portpolylineEvents"
        ></el-amap-polygon>
        <!-- 港口半径 -->
        <div v-if="portCircle && portCircle.location && boundsList.length">
          <el-amap-circle
            :bubble="true"
            :center="[portCircle.location.longitude, portCircle.location.latitude]"
            :editable="true"
            :radius="portCircle.radius"
            :fill-opacity="0.3"
            :events="portCircleEvents"
          ></el-amap-circle>
        </div>
        <!-- 泊位maker -->
        <div v-if="berthInfoList">
          <el-amap-marker
            v-for="(berth, index) in berthInfoList"
            :key="index"
            :position="[berth.location.longitude, berth.location.latitude]"
            :offset="[-18, -15]"
          >
            <div class="berth-maker" @click="clickBerth(berth, index)">
              <i class="iconfont el-icon-bowei"></i>
              {{ berth.ident }}
            </div>
            <div class="berth-box" v-show="berthPolylineChangeList[index]">
              <i class="el-icon-close" @click="closePortBox('berthData', index)"></i>
              <div>ident:<input type="text" :class="{ test: portClassList[0] }" v-model="berth.ident" @blur="blurIdent(berth)" /></div>
              <div>
                面积:
                <input v-model="berth.area" disabled />
                ㎡
              </div>
              <div>经纬度:{{ berth.location.longitude.toFixed(5) + ',' + berth.location.latitude.toFixed(5) }}</div>
              <span v-show="portTips" class="tips">Tips:数据不合法</span>
              <div class="port-btn-box">
                <button class="delete-btn" @click="deleteBerth(berth)">删除</button
                ><button class="edit-btn" @click="editBerth(berth)">修改</button>
              </div>
            </div>
          </el-amap-marker>
          <!-- 泊位范围 -->
          <div v-for="(bound, index) in berthInfoList">
            <el-amap-polygon
              :editable="berthPolylineChangeList[index]"
              :path="bound.bounds"
              strokeColor="#1dd1a1"
              strokeStyle="solid"
              strokeWeight="3"
              fillColor="#ee5253"
              :strokeOpacity="0.7"
              :fillOpacity="0.8"
              :zIndex="999"
              :events="berthpolylineEvents"
            ></el-amap-polygon>
          </div>
        </div>
        <!-- 新增泊位maker -->
        <div v-if="addBerthData && addBerthData.location.longitude != null">
          <el-amap-marker
            :position="[addBerthData.location.longitude, addBerthData.location.latitude]"
            :offset="[-18, -15]"
            :events="addPortEvents"
          >
            <div class="berth-maker" @click="btnAddBerth(addBerthData)">
              <i class="iconfont el-icon-bowei"></i>
              {{ addBerthData.ident }}
            </div>
            <div class="berth-box" v-show="isShowAddBerthBox">
              <i class="el-icon-close" @click="closePortBox('berthAdd')"></i>
              <div>
                ident:<input type="text" :class="{ test: portClassList[0] }" v-model="addBerthData.ident" @blur="blurIdent(addBerthData)" />
              </div>
              <div class="port-btn-box" @mouseover="berthMouseover" @mouseout="berthMouseout">
                <span v-show="portTips" class="tips">Tips:数据不合法</span>
                <button class="delete-btn" @click="closePortBox('berthCancel')">取消</button
                ><button class="edit-btn" @click="addBerth(addBerthData)">保存</button>
              </div>
            </div>
          </el-amap-marker>
          <!-- 新增泊位范围 -->
          <el-amap-polygon
            :editable="true"
            :path="addBerthBoundsList"
            strokeColor="#1dd1a1"
            strokeStyle="solid"
            strokeWeight="3"
            fillColor="#ee5253"
            :strokeOpacity="0.7"
            :fillOpacity="0.8"
            :zIndex="999"
          ></el-amap-polygon>
        </div>
      </div>
      <!-- 新增港口maker -->
      <div v-if="addPortData && addPortData.location.longitude != null">
        <el-amap-marker
          :position="[addPortData.location.longitude, addPortData.location.latitude]"
          :offset="[-18, -15]"
          :events="addPortEvents"
        >
          <div class="port-maker" @click="btnAddPort">
            <i class="iconfont el-icon-gangkou"></i>
            {{ addPortData.name }}
            <!-- <el-button type="primary"><i class="iconfont el-icon-gangkou"></i>{{addPortData.name }}</el-button> -->
          </div>
          <div class="port-box" v-show="isShowAddPortBox" @mouseenter="addPortBoxOnmouseover" @mouseleave="addPortBoxmouseleave">
            <i class="el-icon-close" @click="closePortBox('add')"></i>
            <div>
              ident:<input
                type="text"
                :class="{ test: portClassList[0] }"
                ref="portIdent"
                v-model="addPortData.ident"
                @blur="blurIdent(addPortData)"
              />
            </div>
            <div>
              港口名: <input type="text" :class="{ test: portClassList[1] }" v-model="addPortData.name" @blur="blurName(addPortData)" />
            </div>
            <div>
              面积:
              <input v-model="addPortData.area" disabled />
              ㎡
            </div>
            <div>经纬度:{{ addPortData.location.longitude + ',' + addPortData.location.latitude }}</div>
            <div>
              半径: <input type="text" :class="{ test: portClassList[2] }" v-model="addPortData.radius" @blur="blurRadius(addPortData)" />m
            </div>
            <div>
              层级:<input
                type="text"
                :class="{ test: portClassList[3] }"
                v-model="addPortData.zoomLevel"
                @blur="blurZoomLevel(addPortData)"
              />
            </div>
            <span v-show="portTips" class="tips">Tips:数据不合法</span>
            <div class="port-btn-box">
              <button class="delete-btn" @click="closePortBox('cancel')">取消</button>
              <!-- <button class="zoom-level" @click="useZoom">应用当前层级</button> -->
              <button class="edit-btn" @click="addPort(addPortData)">保存</button>
            </div>
          </div>
        </el-amap-marker>
        <el-amap-circle
          :bubble="true"
          :center="[addPortData.location.longitude, addPortData.location.latitude]"
          :editable="true"
          :radius="addPortData.radius"
          :fill-opacity="0.3"
          :events="addPortCircleEvents"
        ></el-amap-circle>
        <!-- 新增港口范围 -->
        <el-amap-polygon
          :editable="true"
          :path="addBoundsList"
          strokeColor="#d63031"
          strokeStyle="solid"
          strokeWeight="2"
          :bubble="true"
          :zIndex="999"
          :events="addPortpolylineEvents"
        ></el-amap-polygon>
      </div>
      <div v-if="proMarkerRadius">
        <el-amap-marker
          v-for="(marker, index) in proMarkerRadius"
          :key="index"
          :events="navMarkerEvents"
          :position="[marker.location.longitude, marker.location.latitude]"
          :offset="[-18, -15]"
        >
          <div class="nav-maker">
            {{ marker.ident }}
          </div>
        </el-amap-marker>
      </div>
      <div v-if="proMarkerRadius">
        <el-amap-circle
          v-for="(circle, index) in proMarkerRadius"
          :key="index"
          :bubble="true"
          :center="[circle.location.longitude, circle.location.latitude]"
          :editable="true"
          :radius="circle.radius"
          :fill-opacity="0.3"
          :events="navCircleEvents"
        ></el-amap-circle>
      </div>
      <el-amap-polyline
        :path="path"
        stype="dashed"
        strokeColor="#26bef0"
        strokeStyle="dashed"
        strokeWeight="2"
        :events="polylineEvents"
        editable="true"
        :zIndex="polylineZIndex"
      ></el-amap-polyline>
      <!-- 绘制所有船只轨迹用 -->
      <div v-if="isOpenTrack">
        <el-amap-polyline
          v-for="(line, index) in allShipTrack"
          :key="index"
          :path="line"
          stype="solid"
          :strokeColor="strokeColorList[index]"
          strokeStyle="solid"
          strokeWeight="4"
          :events="polylineEvents"
          editable="true"
        ></el-amap-polyline>
      </div>
      <!-- 绘制轨迹用 -->
      <el-amap-polyline
        :path="routerTrackLine"
        stype="solid"
        strokeColor="#999"
        strokeStyle="solid"
        strokeWeight="1"
        :events="polylineEvents"
        editable="true"
      ></el-amap-polyline>
      <el-amap-polyline
        :path="routerTrackLineTwo"
        stype="solid"
        strokeColor="#000"
        strokeStyle="solid"
        strokeWeight="4"
        :events="polylineEvents"
        editable="true"
      ></el-amap-polyline>
      <!-- 连接线 -->
      <el-amap-polyline
        :path="targetDistance"
        stype="solid"
        strokeColor="#FF00FF"
        strokeStyle="solid"
        strokeWeight="2"
        editable="true"
        v-if="targetDistance && targetDistance[0]"
      ></el-amap-polyline>
      <!-- 实时无人船 -->
      <div v-if="routerTrackLine">
        <el-amap-marker :events="shipMarkerEvents" :position="shipRealTimeLocation" v-if="routerTrackLine.length != 0">
          <div class="ship-view-marker" ref="shipViewMarker">
            <img src="@/assets/img/ship-view/ship.png" alt />
          </div>
        </el-amap-marker>
      </div>
      <el-amap-marker :position="returnHomeRealTimeLocation" v-if="returnHomeRealTimeLocation && returnHomeRealTimeLocation.length != 0">
        <div class="ship-view-marker" ref="shipViewMarker">
          <img src="@/assets/img/ship-view/ship.png" alt />
        </div>
      </el-amap-marker>
      <!-- 航标 -->
      <div v-if="navaidAllInfor && navaidAllInfor.length != 0">
        <el-amap-marker
          v-for="(navaidAllInfors, index) in navaidAllInfor"
          :key="navaidAllInfors.id"
          :position="[navaidAllInfors.location.longitude, navaidAllInfors.location.latitude]"
          :events="channelMarkerEvents"
          :offset="[-3, -3]"
        >
          <div class="channelInfoMarker">
            <div class="channelInfoMarker_circle"></div>
            <div class="channelInfoMarker_popover">
              <!-- 当前可选择航道 -->
              <el-popover
                ref="popoversss"
                class="channelInfoMarker_popover--popover"
                placement="right"
                trigger="click"
                :width="200"
                :disabled="Boolean(!(amapAddArray.length || amapReplaceArray.length || amapDeleteArray.length))"
              >
                <!-- 航标信息 -->
                <div
                  class="channelInfo-markerImg"
                  slot="reference"
                  @click="channelMarker([navaidAllInfors.location.longitude, navaidAllInfors.location.latitude], navaidAllInfors)"
                >
                  {{ navaidAllInfors.ident }}
                </div>
                <div class="amapchannel--inforView" v-if="amapAddArray.length || amapReplaceArray.length || amapDeleteArray.length">
                  <div class="amapchannel--inforView_add">
                    <h5>可<b style="color:#ff6700;">添加</b>航点</h5>
                    <div class="amapchannel--inforView_marker" v-if="amapAddArray.length">
                      <el-radio-group v-model="channelAddSelet" size="mini">
                        <!-- <el-radio label="1" border>备选项1</el-radio> -->
                        <el-radio
                          v-for="(amapAddArrays, index) in amapAddArray"
                          :label="amapAddArrays.id"
                          border
                          @change="$emit('ChannelUpdateADR', amapAddArrays, 'Add')"
                          >{{ amapAddArrays.ident }}</el-radio
                        >
                      </el-radio-group>
                    </div>
                    <div v-else>暂无数据</div>
                  </div>
                  <div class="amapchannel--inforView_replace">
                    <h5>可<b style="color:#ff6700;">替换</b>航点</h5>
                    <div class="amapchannel--inforView_marker" v-if="amapReplaceArray.length">
                      <el-radio-group v-model="channelAddSelet" size="mini">
                        <el-radio
                          v-for="amapReplaceArrays in amapReplaceArray"
                          :label="amapReplaceArrays.id"
                          border
                          @change="$emit('ChannelUpdateADR', amapReplaceArrays, 'Replace')"
                          >{{ amapReplaceArrays.ident }}</el-radio
                        >
                      </el-radio-group>
                    </div>
                    <div v-else>暂无数据</div>
                  </div>
                  <div
                    class="amapchannel--inforView_delete"
                    v-if="amapDeleteArray.length"
                    @click="$emit('ChannelUpdateADR', amapDeleteArray[0], 'Delete')"
                  >
                    <i class="el-icon-delete"></i>
                  </div>
                </div>
              </el-popover>
              <!-- <el-button v-popover:popoversss @click="channelMarker([navaidAllInfors.location.longitude, navaidAllInfors.location.latitude], navaidAllInfors)" >{{ navaidAllInfors.ident }}</el-button> -->
              <!-- </div> -->
            </div>
          </div>
        </el-amap-marker>
      </div>
      <!-- 航道线路 -->
      <div v-if="channelInfo && channelInfo.length != 0">
        <el-amap-polyline
          v-for="channelInfos in channelInfo"
          :key="channelInfos.id"
          :path="channelInfos.fixesArray"
          :strokeColor="channelInfos.strokeColor"
          strokeStyle="solid"
          :strokeWeight="channelInfos.strokeWeight"
          :geodesic="true"
          :events="channelPolylineEvents"
          Zindex="50"
          ref="channelPolyLine"
        ></el-amap-polyline>
      </div>
      <!-- 航道修改线路 -->
      <!-- <div v-if="updateAddArray && updateAddArray.length != 0">
        <el-amap-polyline
          v-for="updateAddArrays in updateAddArray"
          :key="updateAddArrays.setFixArray.navaidId"
          :path="updateAddArrays.path"
          strokeColor="#FF9E80"
          strokeStyle="dashed"
          strokeWeight="1"
        ></el-amap-polyline>
      </div> -->
      <!-- 手动航道绘制轨迹 -->
      <div v-if="manualAddArrayLine.length != 0">
        <el-amap-polyline
          :path="manualAddArrayLine"
          strokeColor="#ff000"
          strokeStyle="solid"
          strokeWeight="4"
          editable="true"
          :events="channelPolylineEvents"
        ></el-amap-polyline>
      </div>
      <!-- 圆形图像 -->
      <div v-if="ChannelRadiusCircle && ChannelRadiusCircle.location">
        <el-amap-circle
          :center="[ChannelRadiusCircle.location.longitude, ChannelRadiusCircle.location.latitude]"
          :radius="ChannelRadiusCircle.radius"
          :fill-opacity="0.3"
          strokeColor="#75CAE7"
          fillColor="#86D4D8"
        ></el-amap-circle>
      </div>
    </el-amap>
    <el-button type="primary" icon="el-icon-aim" @click="satelliteLayer()" class="toglerView" ref="amapLayer">卫星</el-button>
    <el-button
      type="primary"
      icon="el-icon-map-location"
      @click="clickMapCenter"
      class="toglerView-location"
      v-show="routerTrackLine && routerTrackLine.length != 0"
      ref="usvTrackBtn"
      >船只跟踪</el-button
    >
  </div>
</template>
<script>
import Vue from 'vue';
import VueAMap from 'vue-amap';
import { AMapManager, lazyAMapApiLoaderInstance } from 'vue-amap';
import { log } from 'util';
import LoginVue from '../views/login/Login.vue';
import { rotate } from '@/components/common/rotate';

import enums from '@/utils/enums';

// 事件总线
import bus from '@/components/common/bus';

// 导入公用接口函数
import { getMakerData } from '@/utils/request';

// 防抖
import { debounce, navPolyline, trun } from '@/utils/common';

Vue.use(VueAMap);

let amapManager = new VueAMap.AMapManager();

export default {
  name: 'Amap',
  data() {
    // 用于在定制中将this指向data
    let self = this;
    return {
      ischflage: true,
      amapManager,
      center: [106.587556, 29.567932],
      zoom: 11,
      zooms: [2, 20],
      // 地图四个角经纬度
      vueMapLocation: {
        TopLeft: [],
        TopRight: [],
        BottomLeft: [],
        BottomRight: [],
      },
      // 经纬度暂存
      lanlat: {},
      routerTrackLine: [],
      routerTrackLineTwo: [],
      // 区域中心点
      addressCenter: [],
      dels: new Set(),
      path: [],
      polylineZIndex: 100,
      // 设置中心点标识
      isSetFitView: true,
      // 方位角绘制
      reotate: null,
      oldRotate: '',
      // 图像选装变化，命名不能一样
      rotateDeg: rotate(),
      // 判断是否是卫星视图
      sateLayer: null,
      isSate: false,
      // 实时无人船位置
      shipRealTimeLocation: [],
      returnHomeRealTimeLocation: [],
      isAutoTrack: false,
      // 高德地图原生使用
      VueMap: null,
      isCompleted: false,
      completedCallbacks: [],
      //所有船只的移动轨迹
      allShipTrack: [[]],
      // 是否更改center的标识
      isChangeCenter: true,
      // 多条船只显示不同的颜色数组,必须保存到本地才能使用
      strokeColorList: enums.strokeColorList,
      //显示航标的半径
      markerRadius: [],
      navMarkerpolyline: [[]],
      toNavMarkerpolyline: [[]],
      navpolyline: [],
      toNavpolyline: [],
      propsRadius: [],
      // allNavPolyline:[[]],
      // 手动添加航道折线
      manualAddArrayLine: [],
      // 原型图像
      ChannelRadiusCircle: {},
      // 航点可导航信息
      channelNavigation: {
        fromAll: [],
        toAll: [],
      },
      // 港口数据
      // 修改航道信息选择
      channelAddSelet: '0',
      channelReplaceSelet: '0',
      channelNavaidLine: {},

      // ================高德地图方法===================
      // ==========amap方法开始=======
      amapEvents: {
        // 将原生地图暴露出去
        init(o) {
          lazyAMapApiLoaderInstance.load().then(() => {
            self.VueMap = amapManager._map;
            // 通过原生jdk绑定地图事件
            self.zoomchangeFun();
            self.VueMap.on('zoomchange', self.zoomchangeFun);
            self.VueMap.on('dragend', self.zoomchangeFun);

            self.sateLayer = new AMap.TileLayer.Satellite();

            for (let cb of self.completedCallbacks) {
              cb(self);
            }
            self.isCompleted = true;
          });
        },
        // 点击地图获取点击经纬度
        click: e => {
          if (this.isClick) {
            console.log('左键点击了地图');
            // 获取经纬度
            const lnglat = this.getLngLat(e);
            // 更新经纬度
            this.lanlat = lnglat;
            // 回调父级方法
            this.$emit('LngLat', lnglat, this.VueMap);
            // // 点击地图时将导航半径范围关闭
            // this.markerRadius = [];
            // // // 点击地图时候清空航标的导航线
            // this.navpolyline ? navPolyline(this.VueMap, this.navpolyline) : '';
            // this.toNavpolyline ? navPolyline(this.VueMap, this.toNavpolyline) : '';
          }
        },
      },
      // ===========amap方法结束===========
      // ===========地图点标记方法==========
      markerEvents: {
        // 鼠标拖动修改对应的经纬度
        dragging: e => {
          if (this.pointDataList && this.pointDataList.length != 0) {
            // 只获取点击的数字内容，作为下标
            this.pointDataList.splice(parseInt(e.target.Ce.contentDom.querySelector('.markerImg').innerHTML) - 1, 1, {
              location: { latitude: e.lnglat.lat, longitude: e.lnglat.lng },
              order: parseInt(e.target.Ce.contentDom.querySelector('.markerImg').innerHTML),
            });
            // 获取经纬度,用来显示
            const lnglat = this.getLngLat(e);
            this.$emit('ViewLocation', lnglat);
          }
        },

        // 点击可以查看经纬度
        click: e => {
          // 获取经纬度,用来显示
          const lnglat = this.getLngLat(e);
          this.$emit('ViewLocation', lnglat);
        },
      },
      // =============返航点拖拽==============
      retrunHomeMakerEvents: {
        // 鼠标拖动修改对应的经纬度
        dragging: e => {
          console.log(e);
          // 只获取点击的数字内容，作为下标
          this.returnHomeData.splice(0, 1, {
            location: { latitude: e.lnglat.lat, longitude: e.lnglat.lng },
          });
        },
      },
      channelMarkerEvents: {
        click: e => {},
      },
      // ===========地图点标记方法结束==========
      // =============折线方法开始========
      polylineEvents: {
        click: e => {
          if (this.isClick) {
            // 获取经纬度
            const lnglat = this.getLngLat(e);
            // 更新经纬度
            this.lanlat = lnglat;
            // 回调父级方法
            this.$emit('LngLat', lnglat);
          }
        },
      },
      channelPolylineEvents: {
        click: e => {
          let channelPolyLineAll = self.$refs.channelPolyLine;
          self.channelStyleClearALL();
          self.channelStyle(e.target.Ce.path, true);
        },
      },
      // =============折线方法结束==========
      // ============无人船图标方法===========
      shipMarkerEvents: {
        click: () => {
          console.log(this.$refs.maker[0]);
          console.log('高德地图方法使用');
        },
      },
      // ============航标图标方法==============
      navMarkerEvents: {},
      // ===============航标圆方法==============
      navCircleEvents: {
        move: e => {
          this.$emit('navCircleMove', e.lnglat);
        },
        adjust: e => {
          this.$emit('navCircleAdjust', e.radius);
        },
        mouseup: e => {},
      },
      //=====================港口maker方法==============
      addPortEvents: {
        // 移入港口maker
        mouseover: e => {
          // this.$emit('mouseover')
        },
        //移除港口maker
        mouseout: e => {
          // this.$emit('mouseout')
        },
      },
      // =================港口圆方法==================
      portCircleEvents: {
        adjust: e => {
          // this.$emit('navCircleAdjust', e.radius);
          this.portCircle.radius = e.radius;
        },
      },
      // ==================新增港口圆方法=============
      addPortCircleEvents: {
        adjust: e => {
          this.addPortData.radius = e.radius;
        },
        move: e => {
          console.log(e);
          this.addPortData.location.latitude = e.lnglat.lat;
          this.addPortData.location.longitude = e.lnglat.lng;
        },
      },
      // =================港口范围多边形方法==================
      portpolylineEvents: {
        adjust: e => {
          let area = Math.round(AMap.GeometryUtil.ringArea(this.boundsList));
          this.$emit('adjustPolyline', area, this.boundsList);
        },
        // click: e=> {
        //   this.$emit('clickPolyline')
        // },
      },
      //===================新增港口范围多边形编辑方法================
      addPortpolylineEvents: {
        adjust: e => {
          this.$emit('addAdjustPolyline');
        },
      },
      // ==================泊位范围多边形编辑方法=================
      berthpolylineEvents: {
        adjust: e => {
          let index;
          for (const i in this.berthPolylineChangeList) {
            this.berthPolylineChangeList[i] == true ? (index = i) : '';
          }
          let area = Math.round(AMap.GeometryUtil.ringArea(this.berthInfoList[index].bounds));
          this.$emit('adjustBerthPolyline', area, index, this.berthInfoList);
          console.log(this.berthPolylineChangeList);
        },
      },
      // ============无人船方法结束============
      // ============高德地图方法结束=====================
      // ==插件==
      plugin: [
        // 缩小放大
        {
          pName: 'ToolBar',
          events: {
            init(instance) {},
          },
        },
        // {
        //   pName: 'MapType',
        //   defaultType: 0,
        //   events: {
        //     init(instance) {
        //     },
        //   }
        // }
      ],
      // 多条船只显示不同的颜色数组,必须保存到本地才能使用
      strokeColorList: enums.strokeColorList,
      // 多条航道显示颜色，必须存在于本地，否则报错
      channelColors: enums.colorArray,
    };
  },
  props: {
    //通过plan获取的点,渲染到地图上
    pointDataList: {
      type: Array,
    },
    // 返航点数据
    returnHomeData: {
      type: Array,
    },
    proMarkerRadius: {
      type: Array,
    },
    // 航标数据
    navMakerInfoList: {
      type: Array,
    },
    //港口数据
    portInfoList: {
      type: Array,
    },
    //泊位数据
    berthInfoList: {
      type: Array,
    },
    //控制港口多边形的编辑状态集合
    berthPolylineChangeList: {
      type: Array,
    },
    // 港口范围折线
    boundsList: {
      type: Array,
    },
    // 新增港口的范围多边形数据
    addBoundsList: {
      type: Array,
    },
    // 新增泊位的范围多边形数据
    addBerthBoundsList: {
      type: Array,
    },
    //新增港口的验证class数组
    portClassList: {
      type: Array,
    },
    //是否显示tips的标志
    portTips: {
      type: Boolean,
      defalut: false,
    },
    isShowPortBox: {
      type: Boolean,
      default: false,
    },
    isShowAddPortBox: {
      type: Boolean,
      default: false,
    },
    isShowAddBerthBox: {
      type: Boolean,
      default: false,
    },
    // 港口圆
    portCircle: {
      type: Object,
    },
    // 港口圆是否可编辑
    isPolylineChange: {
      type: Boolean,
    },
    // 添加的港口数据
    addPortData: {
      type: Object,
    },
    //添加的泊位数据
    addBerthData: {
      type: Object,
    },
    //防止编辑港口信息框冒泡
    isPortClick: {
      type: Boolean,
      default: false,
    },
    // 地图上显示的所有船只
    shipDataList: {
      type: Array,
    },
    //控制显示新增的maker标识的显隐
    isClickMarker: {
      type: Boolean,
    },
    // 所有船只的名称
    shipNameList: {
      type: Array,
    },
    // 是否开启轨迹功能
    isOpenTrack: {
      type: Boolean,
      default: false,
    },
    // 通过监听来判断是否点击了清空轨迹功能
    clearTrackBtn: {
      type: Boolean,
    },
    // 通过监听判断用户是否点击了绘制点按钮,没有点击不能标记点
    isClick: {
      type: Boolean,
      default: false,
    },
    //航标管理的按钮显隐
    isShowBtn: {
      type: Boolean,
      default: false,
    },
    // 绘制轨迹的二维数组
    routerTrackLineLoca: {
      type: Array,
    },
    // 第二条轨迹
    routerTrackLineTwoLoca: {
      type: Array,
    },
    // 绘制下一站的轨迹
    targetDistance: {
      type: Array,
    },
    // 无人船单独信息
    setmanned: {
      type: Object,
    },
    // 返航点的无人船信息
    returnHomeUsv: {
      type: Object,
    },
    // 航道信息
    channelInfo: {
      type: Array,
    },
    // 航标信息
    navaidAllInfor: {
      type: Array,
    },
    // 手动添加航道绘制轨迹
    manualAddArray: {
      type: Array,
    },
    // 可导航折线
    navaidFromArray: {
      type: Array,
    },
    navaidToArray: {
      type: Array,
    },
    // 修改航道时获取的点击自动规划路径
    updateAddArray: {
      type: Array,
    },
    // 修改航道
    amapAddArray: {
      type: Array,
    },
    amapDeleteArray: {
      type: Array,
    },
    amapReplaceArray: {
      type: Array,
    },
  },
  methods: {
    // 点击设置经纬度
    getLngLat(e) {
      return {
        latitude: e.lnglat.getLat(),
        longitude: e.lnglat.getLng(),
        value: e.lnglat.getLat() + ',' + e.lnglat.getLng(),
        Q: e.lnglat.Q,
        R: e.lnglat.R,
      };
    },
    // 在地图执行成功后才会去执行，没有成功将函数保存在数组中，等待地图成功后执行数组中的函数
    onCompleted(cb) {
      if (this.isCompleted) {
        cb();
      } else {
        this.completedCallbacks.push(cb);
      }
      // 使用方式 this.$refs.amap.onCompleted(x => this.$refs.amap.clickMapCenter());
    },
    // 新的删除标记
    deleteMarke(val) {
      this.$confirm('即将删除' + (val + 1) + '号标记，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.pointDataList.splice(val, 1);
          // 重新设置order值，传输回去
          for (let i in this.pointDataList) {
            this.pointDataList[i].order = Number(i) + 1;
          }
          this.$message({
            type: 'success',
            message: '删除成功!',
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          });
        });
    },
    // 根据地址编码获取经纬度
    getMapCenter(address) {
      let geocoder = new AMap.Geocoder();
      geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.info == 'OK') {
          this.addressCenter = result.geocodes[0].location;
          // 重设中心点
          this.center = [this.addressCenter.lng, this.addressCenter.lat];
        } else {
          alert(`查询区域${address}失败,请检查输入区域是否正确`);
        }
      });
    },
    // 地图标点自适应
    setView(path) {
      this.$nextTick()
        .then(() => {
          // 高德根据指定坐标进行 地图自适应 ，绘制折线覆盖物，但是覆盖物不显示
          if (path) {
            if (this.shipDataList) {
              this.VueMap.setFitView();
            } else {
              this.VueMap.setFitView(new AMap.Polyline({ path: path }));
            }
          } else if (this.path) {
            this.VueMap.setFitView(new AMap.Polyline({ path: this.path }));
          } else {
            this.VueMap.setFitView();
          }
        })
        .catch(err => {
          console.log(err);
          this.zoom = 10;
          this.center = [
            this.pointDataList[this.pointDataList.length - 1].location.longitude,
            this.pointDataList[this.pointDataList.length - 1].location.latitude,
          ];
          this.$message.error('地图报错，请联系管理员进行修改');
        });
    },
    // 自动跟踪船只位置
    setMapCenter() {
      if (this.setmanned && this.isAutoTrack) {
        this.center = [this.setmanned.location.longitude, this.setmanned.location.latitude];
      }
    },
    // 地图中心点实时跟踪
    clickMapCenter() {
      this.isAutoTrack = !this.isAutoTrack;

      if (this.isAutoTrack) {
        this.$refs.usvTrackBtn.$el.innerHTML = '<i class="el-icon-s-help"></i><span>取消跟踪</span>';
      } else {
        this.$refs.usvTrackBtn.$el.innerHTML = '<i class="el-icon-map-location"></i><span>船只跟踪</span>';
        // this.onCompleted(x => this.setView());
      }
    },
    // 根据获取的船信息进行图像操作
    usvTransform() {
      if (this.setmanned && this.setmanned.yaw) {
        this.rotateDeg(this.$refs.shipViewMarker, this.setmanned.yaw, 200);
      }
    },
    // 显示所有船只的样式变换,有多只无人船的时候,会根据每只船的状态显示不同的图标
    allShipTransform() {
      let shipDom = document.querySelectorAll('.all-ship-view-marker');
      if (this.shipDataList && shipDom) {
        // 通过for循环才能保证给每一只船只都设置正确旋转动画角度
        for (let i = 0; i < shipDom.length; i++) {
          this.rotateDeg(this.$refs.allShipMarker[i], this.shipDataList[i].yaw, 200);
        }
      }
    },

    // 获取地图 执行相应计划
    async getVueAmap(callback) {
      // 地图开始回调执行，直到获取到 this.vueAmap
      if (!this.VueMap) {
        await setTimeout(() => {
          this.VueMap = amapManager._map;
          this.getVueAmap(callback);
        }, 200);
      } else {
        this.sateLayer = new AMap.TileLayer.Satellite();
        callback();
      }
    },
    // 设置卫星图层
    satelliteLayer() {
      if (this.VueMap) {
        this.isSate = !this.isSate;
        if (this.isSate) {
          this.VueMap.add(this.sateLayer);
          this.$refs.amapLayer.$el.innerHTML = '<i class="el-icon-s-order"></i><span>路线</span>';
        } else {
          this.VueMap.remove(this.sateLayer);
          this.$refs.amapLayer.$el.innerHTML = '<i class="el-icon-aim"></i><span>卫星</span>';
        }
      } else {
        this.$message.error('网速较慢，地图未获取到，请稍后再试');
      }
    },
    // 获取地图的可视范围范围
    getVueMapBounds() {
      if (this.VueMap) {
        this.$nextTick(() => {
          var tmapBounds = this.VueMap.getBounds();
          var southWest = tmapBounds.southwest;
          var northEast = tmapBounds.northeast;
          this.vueMapLocation.TopLeft = [southWest.R, northEast.Q];
          this.vueMapLocation.TopRight = [northEast.R, northEast.Q];
          this.vueMapLocation.BottomLeft = [southWest.R, southWest.Q];
          this.vueMapLocation.BottomRight = [northEast.R, southWest.Q];

          // 将地图范围和地图层级发送
          this.$emit('setVueMapBounds', this.VueMap, this.vueMapLocation, this.VueMap.getZoom());
        });
      } else {
        console.log('vuemap没有获取到');
      }
    },
    // 地图缩放,拖动执行
    zoomchangeFun() {
      this.getVueMapBounds();
    },
    // 点击船只跳转船只状态页面
    toShipinfo(ship) {
      console.log(ship.id);
      this.$router.push({
        path: 'actionplan',
        query: { usvId: ship.id },
      });
    },
    // 航标管理的的点击事件
    async btnMarker(marker) {
      this.$emit('mapEditMarker', marker, this.VueMap);
    },
    //港口点击事件
    btnPort(port) {
      this.$emit('mapEditPort', port, this.VueMap);
    },
    // 新增泊位点击事件
    btnAddBerth(berth) {
      this.$emit('btnAddBerth');
    },
    //新增港口maker点击事件
    btnAddPort() {
      this.$emit('btnAddPort');
    },
    // 轨迹道航====点标记
    async channelMarker(position, Waypoint) {
      if (this.$parent && this.$parent.navaid) {
        this.$parent.navaid.amapDeleteArray = [];
        this.$parent.navaid.amapAddArray = [];
        this.$parent.navaid.amapReplaceArray = [];
      }
      let Zero = String(parseFloat(position[0]).toFixed(6));
      let One = String(parseFloat(position[1]).toFixed(6));
      // 本体位置，默认当前航道，所有航道
      let positionArray = [];
      let positionArrays = [];
      // 显示原型图像
      this.ChannelRadiusCircle = Waypoint;
      for (let positions of this.channelInfo) {
        for (let i in positions.fixesArray) {
          let R = String(positions.fixesArray[i].R.toFixed(6));
          let Q = String(positions.fixesArray[i].Q.toFixed(6));
          if (R === Zero && Q === One) {
            positionArray.push(positions.fixesArray);
            positionArrays.push(positions);
          }
        }
      }
      this.$emit('channelDeleteArray', positionArrays, Waypoint);
      this.channelStyleClearALL();
      for (let obj of positionArray) {
        this.channelStyle(obj);
      }
    },
    // 样式修改 obj必须传入数组，用于数组判断
    channelStyle(obj, flage) {
      for (let i in this.channelInfo) {
        if (JSON.stringify(this.channelInfo[i].fixesArray) === JSON.stringify(obj)) {
          let channelLine = this.channelInfo[i];
          if (channelLine.strokeColor.length >= 9) {
            this.$emit('ischannelSelect', true);
            channelLine.strokeWeight = '6';
            channelLine.strokeColor = channelLine.strokeColor.slice(0, channelLine.strokeColor.length - 2);
            channelLine.delete = true;
          }
          // 判断是否点击了折线
          if (flage) {
            let channelLineArray = [];
            channelLineArray.push(channelLine);
            // 把点击的折线信息传递回去
            this.$emit('channelDeleteArray', channelLineArray);
          }
        }
      }
    },
    // 清除所有样式
    channelStyleClearALL() {
      for (let i in this.channelInfo) {
        let channelLine = this.channelInfo[i];
        channelLine.strokeWeight = '2';
        if (channelLine.strokeColor.length < 9) {
          this.$emit('ischannelSelect', false);
          channelLine.strokeColor = channelLine.strokeColor + 'bb';
          channelLine.delete = false;
        }
      }
    },
    // 关闭港口详情
    closePortBox(val, index) {
      this.$emit('closePortBox', val, index);
    },
    // 新增港口
    addPort(port) {
      this.$emit('addPort', port);
    },
    addBerth(berth) {
      this.$emit('addBerth', berth);
    },
    // 修改港口信息
    editPort(port) {
      this.$emit('editPort', port);
    },
    // 修改泊位信息
    editBerth(berth) {
      this.$emit('editBerth', berth);
    },
    // 删除港口事件
    deletePort(port) {
      this.$emit('deletePort', port);
    },
    // 泊位maker点击事件
    clickBerth(berth, index) {
      this.$emit('clickBerth', berth, index);
    },
    //泊位删除事件
    deleteBerth(berth) {
      this.$emit('deleteBerth', berth);
    },
    //鼠标移入portbox
    addPortBoxOnmouseover() {
      this.$emit('mouseover');
    },
    //鼠标移出portbox
    addPortBoxmouseleave() {
      this.$emit('mouseout');
    },
    // 移入berthBox
    berthMouseover() {
      this.$emit('berthMouseover');
    },
    // 移除berthBox
    berthMouseout() {
      this.$emit('berthMouseout');
    },
    blurIdent(data) {
      data.ident ? this.$set(this.portClassList, 0, false) : this.$set(this.portClassList, 0, true);
      this.$nextTick(() => {
        this.isShowPortTips();
      });
    },
    blurName(data) {
      data.name ? this.$set(this.portClassList, 1, false) : this.$set(this.portClassList, 1, true);
      this.$nextTick(() => {
        this.isShowPortTips();
      });
    },
    blurRadius(data) {
      data.radius != '' ? this.$set(this.portClassList, 2, false) : this.$set(this.portClassList, 2, true);
      this.$nextTick(() => {
        this.isShowPortTips();
      });
    },
    blurZoomLevel(data) {
      console.log(data);
      data.zoomLevel ? this.$set(this.portClassList, 3, false) : this.$set(this.portClassList, 3, true);
      this.$nextTick(() => {
        this.isShowPortTips();
      });
    },
    isShowPortTips() {
      this.$emit('isShowPortTips');
    },
    // 带方向折线样式
    // showMarker(data, index) {
    //   this.VueMap.remove(this.navpolyline);
    //   console.log(Boolean(this.navpolyline));
    //   this.navpolyline = new AMap.Polyline({
    //     path: this.navMarkerpolyline, // 设置线覆盖物路径
    //     showDir: true,
    //     dirColor: 'pink',
    //     strokeColor: '#336688', // 线颜色
    //     strokeWeight: 5 // 线宽
    //   });
    //   this.VueMap.add(this.navpolyline);
    // }
  },
  created() {},
  components: {},
  computed: {},
  beforeMount() {},
  destroyed() {
    this.completedCallbacks = [];
  },
  mounted() {},
  watch: {
    shipDataList(newValue, oldValue) {
      for (const i of this.shipDataList) {
        i.location = trun(i.location);
      }
      console.log(this.shipDataList);
      // 在开启轨迹的时候,绘制所有船只轨迹
      if (this.isOpenTrack) {
        for (const item in this.shipDataList) {
          this.allShipTrack[item].push([this.shipDataList[item].location.longitude, this.shipDataList[item].location.latitude]);
        }
      }
      // 关闭轨迹清空之前保存的轨迹数据，避免下次开启会有重复轨迹
      else {
        this.allShipTrack = [[]];
      }
      this.allShipTransform();
      // 有新的船只添加或者第一次进入页面时候,自适应一下地图
      if (newValue.length != oldValue.length || this.isChangeCenter) {
        this.center = [this.shipDataList[0].location.longitude, this.shipDataList[0].location.latitude];
        bus.$emit('isShowIndex', {
          val: false,
        });
        if (this.shipDataList.length > 1) {
          this.isChangeCenter = false;
        }
      }
    },
    // 一旦发生变化证明用户点击了清空轨迹按钮,执行清空操作
    clearTrackBtn() {
      console.log('执行了清空操作!');
      this.allShipTrack = [[]];
    },

    routerTrackLineLoca: {
      handler() {
        if (this.routerTrackLineLoca && this.routerTrackLineLoca.length) {
          this.routerTrackLine = JSON.parse(JSON.stringify(this.routerTrackLineLoca));
          // console.log(this.routerTrackLine);
        } else {
          this.routerTrackLine = [];
          // 清空了估计跟踪，船只数据没有清除
          this.shipRealTimeLocation = [];
        }
      },
      deep: true,
      immediate: true,
    },
    routerTrackLineTwoLoca: {
      handler() {
        if (this.routerTrackLineTwoLoca && this.routerTrackLineTwoLoca.length) {
          this.routerTrackLineTwo = JSON.parse(JSON.stringify(this.routerTrackLineTwoLoca));
        } else {
          this.routerTrackLineTwo = [];
        }
      },
      deep: true,
      immediate: true,
    },
    // 每次修改地图，则重新获取折线路径
    pointDataList: {
      handler() {
        this.path = [];
        for (let line of this.pointDataList) {
          this.$set(this.path, this.path.length, [line.location.longitude, line.location.latitude]);
        }
      },
      deep: true,
    },
    // 轨迹变换，中心点始终处于最后
    routerTrackLine: {
      handler() {
        if (this.routerTrackLine) {
          this.setMapCenter();
          if (this.setmanned) {
            this.shipRealTimeLocation = [this.setmanned.calibratedLocation.longitude, this.setmanned.calibratedLocation.latitude];
          }
          this.usvTransform();
        }
      },
      deep: true,
    },
    //设置返航点时实时显示船只位置
    returnHomeUsv: {
      handler() {
        if (this.returnHomeUsv) {
          this.returnHomeUsv.calibratedLocation = trun(this.returnHomeUsv.calibratedLocation);
          this.returnHomeRealTimeLocation = [
            this.returnHomeUsv.calibratedLocation.longitude,
            this.returnHomeUsv.calibratedLocation.latitude,
          ];
          if (this.isSetFitView) {
            // 让页面渲染完成在进行地图的大小适配
            this.$nextTick(() => {
              this.VueMap.setFitView();
            });
            this.isSetFitView = false;
            bus.$emit('returnHome', {
              val: false,
            });
          }
        }
      },
    },
    // 点击保存成功后,自适应一下地图
    isClick() {
      if (!this.isClick) {
        this.VueMap.setFitView();
      }
    }, // 地图位置变化，传值给父级

    // vueMapLocation: {
    //   handler() {
    //     this.$emit('setVueMapBounds', this.vueMapLocation, this.VueMap.getZoom());
    //     this.$emit('setVueMapBoundsLk', this.vueMapLocation, this.VueMap.getZoom());
    //   },
    //   deep: true,
    // },

    // 地图位置变化，传值给父级
    // vueMapLocation: {
    //   handler() {
    //     console.log('地图变化');
    //     this.$emit('setVueMapBounds', this.vueMapLocation, this.VueMap.getZoom());
    //   },
    //   deep: true
    // },
    // 手动轨迹线修改，折线变动
    manualAddArray: {
      handler() {
        if (this.manualAddArray && this.manualAddArray.length != 0) {
          this.manualAddArrayLine = [];
          for (let manualAddArrays of this.manualAddArray) {
            this.$set(this.manualAddArrayLine, this.manualAddArrayLine.length, [
              manualAddArrays.navaid.location.longitude,
              manualAddArrays.navaid.location.latitude,
            ]);
          }
        } else {
          this.manualAddArrayLine = [];
        }
      },
      deep: true,
    },
    // 监听可导航路径是否有值
    // 根据传入的信息去进行折线的方向显示，调用navPolyline函数，需在this.VueMap存在的请况下
    navaidFromArray: {
      handler() {
        this.$set(this.channelNavaidLine, 'navaidFromArray', this.navaidFromArray);
      },
      deep: true,
    },
    // 同步获取数据，所以navaidToArray获得，navaidFromArray也必然获得数据
    navaidToArray: {
      handler() {
        // this.$set(this.channelNavaidLine, 'navaidFromArray', this.navaidFromArray);
        this.$set(this.channelNavaidLine, 'navaidToArray', this.navaidToArray);
      },
      deep: true,
    },
    channelNavaidLine: {
      handler() {
        // console.log(this.channelNavaidLine);
        this.onCompleted(
          x =>
            (this.channelNavigation.fromAll = navPolyline(
              this.VueMap,
              this.channelNavigation.fromAll,
              this.channelNavaidLine.navaidFromArray,
              this.channelNavaidLine.navaidToArray
            ))
        );
        // this.onCompleted(
        //   x =>
        //     (this.channelNavigation.toAll = navPolyline(
        //       this.VueMap,
        //       this.channelNavigation.toAll,
        //       this.channelNavaidLine.navaidToArray,
        //       'to'
        //     ))
        // );
      },
      deep: true,
    },
    // 获取可导航航标
    // navaidFromArray:{
    //   handler(){
    //     console.log(this.navaidFromArray);
    //     for(let i in this.navaidFromArray){
    //       console.log(1);
    //     }
    //   },deep:true
    // },
    // 喊道获取信息,必须深度监听一次，否则无法有效更改页面数据
    // amapAddArray: {
    //   handler(newValue) {
    //     if (newValue.length) {
    //       console.log(newValue);

    //       this.channelAddSelet = this.amapAddArray[0].id;
    //     }
    //   },
    //   deep: true
    // },
    // amapDeleteArray: {
    //   handler(newValue) {
    //     if (newValue.length) {
    //       console.log(newValue);
    //     }
    //   },
    //   deep: true
    // },
    // amapReplaceArray: {
    //   handler(newValue) {
    //     if (newValue.length) {
    //       console.log(newValue);

    //       this.channelReplaceSelet = this.amapReplaceArray[0].id;
    //     }
    //   },
    //   deep: true
    // }
  },
};
</script>
<style lang="less" scoped>
.amap {
  width: 100%;
  height: 100%;
  position: relative;
}
.markerImg {
  width: 20px;
  height: 32px;
  text-align: center;
  color: #fff;
  background: url('../assets/img/login/mark.png') no-repeat center center/100% 100%;
  position: relative;
  .close-btn {
    position: absolute;
    top: 100%;
    left: 0;
  }
}
.channelInfoMarker {
  position: relative;
  .channelInfoMarker_circle {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 2px solid #999;
  }

  .channelInfo-markerImg {
    position: absolute;
    top: -30px;
    font-size: 12px;
    padding: 3px 5px;
    background: #999;
    color: #fff;
    /deep/.el-button--small {
      padding: 6px 4px;
    }
  }

  .channelInfoMarker_popover {
    /deep/.el-popover {
      width: auto;
    }
    /deep/.el-radio {
      margin-right: 0px;
    }
    /deep/.el-radio--mini {
      width: 82px;
      box-sizing: border-box;
      margin-bottom: 3px;
    }
    /deep/.el-radio.is-bordered + {
      margin-left: 0;
    }
    .channelInfoMarker_popover--popover {
      z-index: 20 !important;
    }
    .amapchannel--inforView {
      display: flex;
      justify-content: space-between;
      z-index: 2001 !important;
    }
    .amapchannel--inforView_add {
      width: 50%;
    }
    .amapchannel--inforView_replace {
      width: 50%;
    }
    .amapchannel--inforView_delete {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 14px;
      cursor: pointer;
    }
    .amapchannel--inforView_delete:hover {
      color: #ff6700;
    }
  }

  .channelInfo-markerImg_button {
    position: absolute;
    left: calc(100% + 2px);
    top: 0;
    color: #ff6700;
    width: 10px;
    height: 100%;
    .channelInfo-markerImg_button-btn {
      height: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
}

.close-btn {
  width: 14px;
  line-height: 14px;
  text-align: center;
  border-radius: 50%;
  background-color: rgba(200, 200, 200, 0.5);
  position: absolute;
  right: -7px;
  top: -7px;
  color: #ff6700;
}
.close-btn:hover {
  background-color: rgba(200, 200, 200, 1);
  color: red;
}
.ship-view-marker {
  height: 60px;
  position: absolute;
  top: 0;
  left: 0px;
  // transform: translate(-50%);

  img {
    height: 100%;
    vertical-align: middle;
  }
}
.all-ship-box {
  text-align: center;
  font-size: 12px;
  position: absolute;
  bottom: 0px;
  right: -70px;
  .speed {
    width: 110px;
  }
}
.all-ship-view-marker {
  height: 60px;
  position: absolute;
  top: 0;
  left: 0px;
  z-index: 999;
  // transform: translate(-50%);

  img {
    height: 100%;
    vertical-align: middle;
  }
}
.toglerView {
  z-index: 500;
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.toglerView-location {
  z-index: 500;
  position: absolute;
  bottom: 48px;
  right: 10px;
}
/deep/.amap-controls > .amap-maptypecontrol {
  position: absolute;
  right: 10px;
  top: calc(100% - 70px);
}
// 隐藏路况图层
/deep/.amap-maptype-list {
  display: none !important;
}
.nav-maker {
  font-size: 12px;
  padding: 3px, 5px;
  background-color: #999;
  color: #fff;
}
.berth-maker {
  text-align: center;
  font-size: 12px;
  line-height: 25px;
  background-color: #e84118;
  color: #fff;
}
.info-window {
  font-size: 12px;
}
// 航道显示
.amap_channel--div {
  margin-bottom: 5px;
  border-bottom: 1px solid #ff6700;
  li {
    list-style: none;
    display: flex;
  }
  div {
    display: flex;
    flex-wrap: no-wrap;
    width: 200%;
  }
}
.add-maker-col {
  margin-right: 30px;
}
.div-box {
  width: 10px;
  height: 10px;
  z-index: 100;
}
// .port-maker {
//   min-width: 65px;
//   text-align: center;
//   font-size: 12px;
//   line-height: 25px;
//   // padding: 0, 5px;
//   background-color: #00a8ff;
//   color: #fff;
// }
.chartAmap_button {
  padding: 8px 6px;
}
/deep/ .iconfont {
  margin: 0;
  font-size: 12px;
}
/deep/ .el-icon-gangkou:before {
  margin: 0;
  font-size: 12px;
}
.port-box {
  width: 200px;
  // box-sizing: content-box !important;
  padding: 5px 5px;
  font-size: 12px;
  position: absolute;
  bottom: 0px;
  right: -170px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  .el-icon-close {
    position: absolute;
    right: 0;
  }
}
.berth-box {
  width: 161px;
  font-size: 12px;
  position: absolute;
  bottom: 0px;
  right: 35px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  .el-icon-close {
    position: absolute;
    right: 0;
  }
}
.port-box:hover {
  cursor: default;
}
.el-icon-close:hover {
  background-color: rgb(250, 250, 250);
  cursor: pointer;
}
/deep/ .port-maker .el-form-item {
  margin-bottom: 0px;
}
/deep/ .port-maker .el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
  margin-bottom: 0px;
}
/deep/ .el-form-item__label-wrap {
  margin-left: 0px !important;
}
/deep/ input,
select,
textarea {
  background-color: rgba(2525, 255, 255, 0);
  font-size: 12px !important;
}
[data-v-32860b3d] button,
input[data-v-32860b3d],
select[data-v-32860b3d],
textarea[data-v-32860b3d] {
  border: none;
  outline: none;
}
// /deep/ .el-form-item--small .el-form-item__content, .el-form-item--small .el-form-item__label {
// line-height:0px;
// font-size: 12px;
// }
// /deep/ .el-form-item__label {
//   line-height:0px;
// }
// /deep/ .el-form-item--small .el-form-item__content, .el-form-item--small .el-form-item__label {
//   line-height: 0px;
// }
.port-btn-box {
  // position: absolute;
  // right: 0;
  // bottom: 0;
  display: flex;
  flex-direction: row-reverse;
  // flex-wrap: nowrap;
}
.edit-btn {
  background-color: rgb(102, 177, 255);
}
.delete-btn {
  margin-left: 5px;
  background-color: rgb(245, 108, 108);
}
.zoom-level {
  margin-left: 5px;
  background-color: rgb(13, 235, 42);
}
.tips {
  position: absolute;
  font-size: 12px;
  color: red;
  left: 0;
}
.edit-btn:hover {
  color: #fff;
}
.delete-btn:hover {
  color: #fff;
}
.test {
  border: 1px solid red !important;
  border-radius: 3px;
}
</style>
