<template>
  <!-- 接口 ： waterway -->
  <div class="planchannel" v-loading="isChannelLoading">
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <div class="planchannel_inforation">
      <div class="planchannel_inforation_map">
        <Amap
          ref="planchannelAmap"
          :channelInfo="channelInfo.channelInfos"
          :navaidAllInfor="navaid.navaidAllInfor"
          :manualAddArray="buttonClickData.channelAddData.manualAddArray"
          :navaidFromArray="navaid.navaidFromArray"
          :navaidToArray="navaid.navaidToArray"
          :updateAddArray="buttonClickData.channelAddData.updateAddArray"
          :amapAddArray="navaid.amapAddArray"
          :amapDeleteArray="navaid.amapDeleteArray"
          :amapReplaceArray="navaid.amapReplaceArray"
          @ischannelSelect="ischannelSelectFun"
          @channelDeleteArray="channelDeleteArrayFun"
          @setVueMapBoundsLk="setVueMapBoundsFun"
          @ChannelUpdateADR="ChannelUpdateADRFun"
        ></Amap>
      </div>
      <div class="planchannel_inforation_map--search">
        航道搜索：
        <el-select
          placeholder="请输入航道名字"
          prefix-icon="el-icon-search"
          filterable
          remote
          clearable
          v-model="channelSearch.condition.keyword"
          :remote-method="channelKeyWordsSearchFun"
          @change="channelSearchNoLocation()"
        >
          <!-- <div v-if="channelSearchTips.channelLine.length"> -->
          <el-option
            v-for="(item, index) in channelSearchTips.channelLine"
            :key="item.id"
            :label="item.ident"
            :value="item.ident"
          >
          </el-option>
          <!-- </div> -->
        </el-select>
        <div>
          {{ channelInfo.channelInfos.fixes }}
        </div>
      </div>
      <!-- 航道操作栏 -->
      <div class="planchannel_inforation_map--operation" ref="operation">
        <div class="operation_deleted--show" ref="operation_deleted_show" @click="channelOpation">
          &lt;
        </div>
        <!-- 选中的航道信息显示 -->
        <div
          :class="{
            'planchannel_inforation_map--father--operation_infor':
              (amapBrackDarta.markerInfor && amapBrackDarta.markerInfor.ident) ||
              (amapBrackDarta.markerInfor && amapBrackDarta.markerInfor.radius) ||
              amapBrackDarta.channelDeleteArray.length ||
              amapBrackDarta.channelDeleteArray.length,
          }"
        >
          <div class="planchannel_inforation_map--operation_infor">
            <!-- 航点显示 -->
            <div
              class="operation_infor--marker"
              v-if="amapBrackDarta.markerInfor && amapBrackDarta.markerInfor.ident"
            >
              <p><span>航点：</span>{{ amapBrackDarta.markerInfor.ident }}</p>
            </div>
            <div class="operation_infor">
              <div
                class="operation_infor--marker"
                v-if="amapBrackDarta.markerInfor && amapBrackDarta.markerInfor.radius"
              >
                <p><span>航点半径：</span>{{ amapBrackDarta.markerInfor.radius }} m</p>
              </div>
            </div>
            <!-- 航线选择 -->
            <div class="operation_infor--line">
              <div class="operation_infor_line_div" v-if="amapBrackDarta.channelDeleteArray.length">
                <div><span>航线：</span></div>
                <div class="operation_infor_line_div_div">
                  <el-button
                    type="primary"
                    :plain="index != buttonClickData.normalIndex"
                    :disabled="
                      Boolean(
                        buttonClickData.disabled ||
                          buttonClickData.channelAddData.manualAddArray.length
                      )
                    "
                    v-for="(val, index) in amapBrackDarta.channelDeleteArray"
                    :key="index"
                    class="operation_infor_line_div_button"
                    @click="markerClickFun(val, index)"
                    >{{ val.ident }}</el-button
                  >
                </div>
              </div>
            </div>
            <!-- 信息展示 -->
            <div class="operation_infor">
              <div class="operation_infor--marker" v-if="amapBrackDarta.channelDeleteArray.length">
                <p>
                  <span>航线长度：</span
                  >{{
                    amapBrackDarta.channelDeleteArray[
                      buttonClickData.normalIndex
                    ].totalDistance.toFixed(2)
                  }}
                  m
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="planchannel_inforation_map--operation_deleted">
          <el-button
            type="primary"
            icon="el-icon-aim"
            @click="channelAddDialogShow()"
            class="operation_deleted_button"
            ref="amapLayer"
            v-show="buttonClickData.disabled == false"
            >增加航道</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-aim"
            @click="channelUpdataClickFun()"
            class="operation_deleted_button"
            ref="amapLayer"
            v-show="
              amapBrackDarta.ischannelSelect && !buttonClickData.disabled && !channelAddData.isClick
            "
            >修改航道</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-aim"
            @click="channelDeleteClickFun()"
            class="operation_deleted_button"
            ref="amapLayer"
            v-show="amapBrackDarta.ischannelSelect && !channelAddData.isClick"
            >删除航道</el-button
          >
        </div>
      </div>
      <!-- 新增航道操作框 -->
      <div
        class="planchannel_inforation_map--addAouter"
        v-if="buttonClickData.channelAddData.dialog"
      >
        <h6>{{ enums.channelRouter(channelAddData.data.plan) }}</h6>
        <div class="planchannel_inforation_map--addAouter_ident">
          <span>ident：</span>
          <p>{{ buttonClickData.channelAddData.ident }}</p>
        </div>
        <div
          class="planchannel_inforation_map--addAouter_autoRouter"
          v-if="channelAddData.data.plan == 0"
        >
          <div
            :class="{
              addAouter_autoRouter_start: true,
              'addAouter_autoRouter_start--befer': false,
            }"
          >
            <span>起点：</span>
            <p :class="{ dontContent: !buttonClickData.channelAddData.isStartData.ident }">
              {{ buttonClickData.channelAddData.isStartData.ident }}
            </p>
            <el-button
              type="success"
              icon="el-icon-check"
              circle
              @click="addReouterStartClick()"
              v-if="buttonClickData.channelAddData.isStart"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="addReouterStartClick()"
              v-else
            ></el-button>
          </div>
          <div
            :class="{ addAouter_autoRouter_end: true, 'addAouter_autoRouter_start--befer': false }"
          >
            <span>终点：</span>
            <p :class="{ dontContent: !buttonClickData.channelAddData.isEndData.ident }">
              {{ buttonClickData.channelAddData.isEndData.ident }}
            </p>
            <el-button
              type="success"
              icon="el-icon-check"
              circle
              @click="addReouterEndClick()"
              v-if="buttonClickData.channelAddData.isEnd"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="addReouterEndClick()"
              v-else
            ></el-button>
          </div>
        </div>
        <div
          class="planchannel_inforation_map--addAouter_manualRouter"
          v-if="channelAddData.data.plan == 1"
        >
          <p class="addAouter_manualRouter-p">规划路径：</p>
          <div v-if="buttonClickData.channelAddData.manualAddArray.length != 0" class="maxheight">
            <li v-for="(val, index) in buttonClickData.channelAddData.manualAddArray" :key="val.id">
              <span v-if="index != 0"> --> </span>
              <p class="manualRouter_div_li_p">{{ val.navaid.ident }}</p>
              <div
                class="manualRouter_div_li_div"
                @click="manualAddArrayDelete(index)"
                v-if="buttonClickData.channelAddData.manualAddArray.length - 1 == index"
              >
                <i class="el-icon-delete-solid"></i>
              </div>
            </li>
          </div>
          <!-- 函数deleteHtml 内部代码 原最优路径规划方案（1）-->
        </div>
        <div class="planchannel_inforation_map--addAouter_is">
          <el-button type="primary" plain @click="channelAddClearFun()">取消</el-button>
          <el-button type="primary" plain @click="channelAddFun()">确定</el-button>
        </div>
      </div>
      <!-- 航道导航树 -->
      <!-- <div class="planchannel_inforation_map--NavigationTree"></div> -->
    </div>
    <!-- dialog弹框显示 -->
    <!-- 增加航道 -->
    <el-dialog
      title="增加航道"
      :visible.sync="channelAddData.dialog"
      width="30%"
      center
      @close="channelAddDialogCloseFun()"
    >
      <el-form
        ref="channelAddRef"
        :rules="channelAddData.rules"
        :model="channelAddData.data"
        label-width="auto"
        @submit.native.prevent
      >
        <el-form-item label="航道Ident" prop="ident">
          <el-input
            v-model="channelAddData.data.ident"
            placeholder="请输入航道ident"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <!-- 选择航道规划方式 -->
          <el-radio v-model="channelAddData.data.plan" :label="0">{{
            enums.channelRouter(0)
          }}</el-radio>
          <el-radio v-model="channelAddData.data.plan" :label="1">{{
            enums.channelRouter(1)
          }}</el-radio>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="channelAddData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="addAouterShow()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入地图
import '@/plugins/amap';
import Breadcrumb from 'common/Breadcrumb';
import Amap from '@/amap/Amaps.vue';
// import * as signalr from '@/utils/shioSignalR';
// 事件总线
import bus from '@/components/common/bus';
import { debounce, trun, floatSix } from '@/utils/common';
import enums from '@/utils/enums';
import LoginVue from '../../../login/Login.vue';

export default {
  name: 'planchannel',
  components: {
    Breadcrumb,
    Amap,
  },
  data() {
    return {
      isChannelLoading: false,
      // 登录用户的角色
      role: window.localStorage.role,
      breadcrumbList: ['航道管理'],
      // enums文件导出一个对象，对象中包含所有从enums中得到的方法，调用方法获取数据，在这里导出是因为 vue 中template无法直接获取enums文件的数据，需要在data中设置一次，方法中直接使用enums即可，不需要加this,因为不是从data数据中获取的
      enums: enums,
      // 分页数据查询条件==航道
      channelSearch: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
        // 一次获取设置最大值
        maxSize: 2147483647,
        // 设置总分页数
        total: null,
      },
      // 查询航标
      navaidSearch: {
        // 全局模糊查询条件
        Condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
        // 一次获取设置最大值
        maxSize: 2147483647,
        // 设置总分页数
        total: null,
      },
      // 航道信息
      channelInfo: {
        channelInfos: [],
        // 去除重复的信息的坐标
        channelSetView: [],
        // 去除重复的信息的航道信息
        clearRepeatWaypointInfor: [],
        // 暂时无用
        navaid: [],
        navaidLocation: {
          latitude: '',
          longitude: '',
        },
      },
      // 航标信息
      navaid: {
        navaidAllInfor: [],
        navaidFromOldData: [],
        navaidFromData: [],
        navaidToData: [],
        navaidFromArray: [],
        navaidToArray: [],
        // 在地图上面显示替换，删除，添加按钮
        addArray: [],
        deleteArray: {},
        replaceArray: [],
        // 传递个地图页面的修改航道的数据数据
        amapAddArray: [],
        amapDeleteArray: [],
        amapReplaceArray: [],
      },

      // 增加航道
      channelAddData: {
        dialog: false,
        isClick: false,
        rules: {
          ident: [
            { required: true, message: '请输入航道ident', trigger: 'blur' },
            {
              pattern: /^[A-Z][\d]{1,3}$/,
              message: '请首字母大写并跟随1-3个数字',
              trigger: 'blur',
            },
          ],
        },
        data: {
          ident: '',
          plan: 0,
        },
      },
      // 地图返回数据
      amapBrackDarta: {
        // 判断删除航道是否渲染
        ischannelSelect: false,
        // 接受被点击的航道
        channelDeleteArray: [],
        // 接收被点击的航标信息
        markerInfor: {},
        ischannelLine: false,
      },
      // 航道操作 button点击数据
      buttonClickData: {
        channelAddData: {
          dialog: false,
          ident: '',
          isStart: false,
          isStartData: {},
          isEnd: false,
          isEndData: {},
          waterwayId: '',
          // 手动添加数组
          manualAddArray: [],
          //
          // 是否是修改航道
          isChannelUpdata: false,
          // 修改航道显示航线
          updateAddArray: [],
          // 是否已添加
          updateAddFlage: false,
          // 是否已替换
          updateReplaceFlage: false,
        },
        // 默认选中航道第一个
        normalIndex: 0,
        // 不能选择
        disabled: false,
      },
      // 修改航道可选择信息
      updateCannelSelect: {
        oldChannel: [],
        newChannel: [],
        previousMarker: {},
        nowMarker: {},
        nextMarker: {},
        isOld: false,
      },
      // 地图四个角经纬度
      vueMapLocation: {},
      // 地图层级
      zoomSize: '',
      // 搜索半径 暂定,暂时不传
      radius: 320,
      // 网络判断弹窗
      DisconnectMessage: '',
      manualAddLine: {
        color: '#333',
        size: 4,
      },
      // 搜索提示航道
      channelSearchTips: {
        channelLine: [],
        loading: false,
      },
    };
  },
  props: {},
  methods: {
    // ===========================地图管理=========================
    // 获取当前地图左上角和右下角
    setVueMapBoundsFun(location, zoomSize) {
      this.vueMapLocation = location;
      this.zoomSize = zoomSize;
    },
    // amaps传输数据
    ischannelSelectFun(data) {
      this.amapBrackDarta.ischannelSelect = data;
    },

    async channelDeleteArrayFuns(data, Waypoint) {
      // 返回的航道和航标信息（包含多个）
      this.amapBrackDarta.channelDeleteArray = data;
      data.length == 1 ? (this.buttonClickData.normalIndex = 0) : '';
      data.length == 0 ? (this.amapBrackDarta.ischannelSelect = false) : '';

      let channelAddData = this.buttonClickData.channelAddData;
      let navaidFromData = this.navaid.navaidFromData;
      let isflage = false;

      this.amapBrackDarta.markerInfor = Waypoint;

      this.navaid.addArray = [];
      this.navaid.deleteArray = {};
      this.navaid.replaceArray = [];

      // this.navaidAddDeleteReplace();

      if (this.$refs.operation_deleted_show.innerHTML == '&lt;') {
        this.channelOpation();
      }
      // 增加航道的航点信息 !this.buttonClickData.channelAddData.isStartData.ident &&
      if (channelAddData.dialog && Waypoint) {
        if (!this.channelAddData.data.plan) {
          if (!channelAddData.isStart) {
            channelAddData.isStartData = Waypoint;
          } else if (channelAddData.isStart && !channelAddData.isEnd) {
            channelAddData.isEndData = Waypoint;
          }
        } else {
          if (channelAddData.manualAddArray.length != 0) {
            if (this.navaid.navaidFromOldData) {
              let isRadius = this.navaid.navaidFromOldData.some(item => {
                return (
                  floatSix(item.location.longitude) == floatSix(Waypoint.location.longitude) &&
                  floatSix(item.location.latitude) == floatSix(Waypoint.location.latitude)
                );
              });
              let isrepeat = channelAddData.manualAddArray.some(item => {
                return (
                  floatSix(item.navaid.location.longitude) ==
                    floatSix(Waypoint.location.longitude) &&
                  floatSix(item.navaid.location.latitude) == floatSix(Waypoint.location.latitude)
                );
              });
              if (isRadius && !isrepeat) {
                this.$set(channelAddData.manualAddArray, channelAddData.manualAddArray.length, {
                  order: channelAddData.manualAddArray.length + 1,
                  navaidId: Waypoint.id,
                  navaid: Waypoint,
                });
                isflage = true;
              } else if (isrepeat) {
                // 表示更改
                // this.$message.warning('请不要选择已有航点');
                // 从当前数组找到点击数数据，获取上下数据的id值，用以获取信息
                for (let i in channelAddData.manualAddArray) {
                  if (
                    channelAddData.manualAddArray[i].navaidId == this.amapBrackDarta.markerInfor.id
                  ) {
                    if (i != 0 && i != channelAddData.manualAddArray.length - 1) {
                      let startId, EndId, markerId;
                      // 点击航标前一个
                      startId = channelAddData.manualAddArray[i - 1].navaid;
                      this.updateCannelSelect.previousMarker =
                        channelAddData.manualAddArray[i - 1].navaid;
                      // 点击航标后一个
                      EndId = channelAddData.manualAddArray[parseInt(i) + 1].navaid;
                      this.updateCannelSelect.nextMarker =
                        channelAddData.manualAddArray[parseInt(i) + 1].navaid;
                      // 当前点击航标
                      markerId = channelAddData.manualAddArray[i].navaid;
                      this.updateCannelSelect.nowMarker = channelAddData.manualAddArray[i].navaid;

                      // 异步获取数据
                      let [fromData, toData, markerTodata] = await Promise.all([
                        this.navaidFrom(startId, 'from', undefined, true),
                        this.navaidFrom(EndId, 'to', undefined, true),
                        this.navaidFrom(markerId, 'to', undefined, true),
                      ]);

                      // 遍历获取到的from和to数据，当有相同时，表示可以当前点击航标可以被替换，当from的数据可以直接到达to的标点是，表示，当前点可以被删除
                      for (let val of fromData.data) {
                        if (val.id == EndId.id) {
                          this.navaid.deleteArray = markerId;
                        }
                        for (let vals of toData.data) {
                          if (vals.id === val.id && vals.id !== markerId.id) {
                            this.navaid.replaceArray.push(vals);
                          }
                        }
                        for (let vals of markerTodata.data) {
                          if (vals.id === val.id && vals.id !== markerId.id) {
                            this.navaid.addArray.push(vals);
                          }
                        }
                      }

                      this.navaidAddDeleteReplace();

                      // 废弃方法，获取最优路劲
                      // let startId = channelAddData.manualAddArray[i - 1].navaidId;
                      // let EndId = channelAddData.manualAddArray[parseInt(i) + 1].navaidId;
                      // let idArray = [
                      //   channelAddData.manualAddArray[i - 1],
                      //   channelAddData.manualAddArray[i],
                      //   channelAddData.manualAddArray[parseInt(i) + 1]
                      // ];
                      // this.autoChannel(startId, EndId, idArray);
                    } else if (i == 0) {
                      // 修改开头
                      let startId, EndId, markerId;
                      // 点击航标前一个
                      startId = channelAddData.manualAddArray[i].navaid;
                      this.updateCannelSelect.previousMarker =
                        channelAddData.manualAddArray[i].navaid;
                      // 点击航标后一个
                      EndId = channelAddData.manualAddArray[parseInt(i) + 1].navaid;
                      this.updateCannelSelect.nextMarker =
                        channelAddData.manualAddArray[parseInt(i) + 1].navaid;
                      // 当前点击航标
                      markerId = channelAddData.manualAddArray[i].navaid;
                      this.updateCannelSelect.nowMarker = channelAddData.manualAddArray[i].navaid;

                      // 异步获取数据
                      let [fromData, toData, markerTodata] = await Promise.all([
                        this.navaidFrom(startId, 'from', undefined, true),
                        this.navaidFrom(EndId, 'to', undefined, true),
                        this.navaidFrom(markerId, 'to', undefined, true),
                      ]);
                      // 遍历获取到的from和to数据，当有相同时，表示可以当前点击航标可以被替换，当from的数据可以直接到达to的标点是，表示，当前点可以被删除
                      this.navaid.deleteArray = markerId;
                      for (let val of fromData.data) {
                        for (let vals of toData.data) {
                          if (vals.id === val.id && vals.id !== markerId.id) {
                            this.navaid.replaceArray.push(vals);
                          }
                        }
                      }
                      for (let vals of markerTodata.data) {
                        this.navaid.addArray.push(vals);
                      }

                      this.navaidAddDeleteReplace();
                    } else if (i == channelAddData.manualAddArray.length - 1) {
                      // 修改末尾
                      let startId, EndId, markerId;
                      // 点击航标前一个
                      startId = channelAddData.manualAddArray[parseInt(i) - 1].navaid;
                      this.updateCannelSelect.previousMarker =
                        channelAddData.manualAddArray[parseInt(i) - 1].navaid;
                      // 点击航标后一个
                      EndId = channelAddData.manualAddArray[i].navaid;
                      this.updateCannelSelect.nextMarker = channelAddData.manualAddArray[i].navaid;
                      // 当前点击航标
                      markerId = channelAddData.manualAddArray[i].navaid;
                      this.updateCannelSelect.nowMarker = channelAddData.manualAddArray[i].navaid;

                      // 异步获取数据
                      let [fromData, toData] = await Promise.all([
                        this.navaidFrom(startId, 'from', undefined, true),
                        this.navaidFrom(EndId, 'to', undefined, true),
                      ]);
                      // 遍历获取到的from和to数据，当有相同时，表示可以当前点击航标可以被替换，当from的数据可以直接到达to的标点是，表示，当前点可以被删除
                      this.navaid.deleteArray = markerId;

                      for (let val of fromData.data) {
                        for (let vals of toData.data) {
                          if (vals.id === val.id && vals.id !== markerId.id) {
                            this.navaid.replaceArray.push(vals);
                          }
                        }
                      }
                      this.navaidAddDeleteReplace();
                    }
                  }
                }
              } else {
                this.$message.warning(
                  '请选择处于' +
                    channelAddData.manualAddArray[channelAddData.manualAddArray.length - 1].navaid
                      .ident +
                    '半径导航范围内的航点'
                );
              }
            }
          } else {
            this.$set(channelAddData.manualAddArray, channelAddData.manualAddArray.length, {
              order: channelAddData.manualAddArray.length + 1,
              navaidId: Waypoint.id,
              navaid: Waypoint,
            });
          }
        }
      }

      // 获取点击航标附近可导航范围
      if (Waypoint) {
        if (
          this.navaid.navaidFromOldData.length > 0 &&
          channelAddData.dialog &&
          this.channelAddData.data.plan
        ) {
          if (isflage) {
            // 异步获取数据
            let [fromData, toData] = await Promise.all([
              this.navaidFrom(
                Waypoint,
                'from',
                (!this.navaid.navaidFromOldData.length &&
                  channelAddData.dialog &&
                  this.channelAddData.data.plan) ||
                  isflage
              ),
              this.navaidFrom(Waypoint, 'to'),
            ]);
            this.navaid.navaidFromArray = fromData.navaidArray;
            this.navaid.navaidToArray = toData.navaidArray;
          }
        } else {
          // 异步获取数据
          let [fromData, toData] = await Promise.all([
            this.navaidFrom(
              Waypoint,
              'from',
              (!this.navaid.navaidFromOldData.length &&
                channelAddData.dialog &&
                this.channelAddData.data.plan) ||
                isflage
            ),
            this.navaidFrom(Waypoint, 'to'),
          ]);
          
          this.navaid.navaidFromArray = fromData.navaidArray;
          this.navaid.navaidToArray = toData.navaidArray;
        }
      }
      isflage = false;
    },
    // 航标点击
    channelDeleteArrayFun: debounce(
      function(data, Waypoint) {
        // 清空
        this.navaid.amapDeleteArray = [];
        this.navaid.amapAddArray = [];
        this.navaid.amapReplaceArray = [];
        this.channelDeleteArrayFuns(data, Waypoint);
      },
      300,
      true
    ),
    // =========================地图管理结束=========================

    // =======================航道管理获取信息=======================
    // 航道信息获取
    async getChannelInfo() {
      let { data: info } = await this.$http({
        method: 'GET',
        url: '/waterway/search',
        params: {
          'Condition.Keyword': this.channelSearch.condition.keyword,
          'Condition.Rect.TopLeft': trun(this.vueMapLocation.TopLeft),
          'Condition.Rect.TopRight': trun(this.vueMapLocation.TopRight),
          'Condition.Rect.BottomLeft': trun(this.vueMapLocation.BottomLeft),
          'Condition.Rect.BottomRight': trun(this.vueMapLocation.BottomRight),
          'Condition.ZoomLevel': this.zoomSize,
          Page: this.channelSearch.page,
          Size: this.channelSearch.maxSize,
        },
      });
      if (!info.errorCode) {
        // 所有航道获取颜色
        // while (this.channelLineColors.length < info.data.result.length) {
        //   this.channelLineColors = [...this.channelLineColors, ...this.channelLineColors];
        // }
        this.channelInfo.channelInfos = info.data.result;
        this.setChannelinfo();
      }
    },
    // 航标信息获取
    async getNavaidAllInfor() {
      const { data: res } = await this.$http({
        method: 'get',
        url: '/navaid/search',
        params: {
          'Condition.keyword': this.navaidSearch.Condition.keyword,
          // 'Condition.Keyword': this.channelSearch.condition.keyword,
          'Condition.Rect.TopLeft': trun(this.vueMapLocation.TopLeft),
          'Condition.Rect.TopRight': trun(this.vueMapLocation.TopRight),
          'Condition.Rect.BottomLeft': trun(this.vueMapLocation.BottomLeft),
          'Condition.Rect.BottomRight': trun(this.vueMapLocation.BottomRight),
          'Condition.ZoomLevel': this.zoomSize,
          Page: this.navaidSearch.page,
          Size: this.navaidSearch.maxSize,
        },
      });
      if (!res.errorCode) {
        this.navaid.navaidAllInfor = res.data.result;
        for (let val of this.navaid.navaidAllInfor) {
          val.location = trun(val.location);
        }
      }
    },
    // 确认航道后搜索执行，航道提示
    async channelSearchTipsFun(query) {
      const { data: res } = await this.$http({
        method: 'GET',
        url: '/waterway/search',
        params: {
          'Condition.Keyword': query,
          'Condition.ZoomLevel': this.zoomSize,
          Page: this.channelSearch.page,
          Size: this.channelSearch.maxSize,
        },
      });
      if (!res.errorCode) {
        // 航道提示
        this.channelSearchTips.channelLine = res.data.result;
      }
    },
    // 航道不按照指定范围搜索,确认航道后搜索执行，页面跳转
    async channelSearchNoLocation() {
      let { data: info } = await this.$http({
        method: 'GET',
        url: '/waterway/search',
        params: {
          'Condition.Keyword': this.channelSearch.condition.keyword,
          'Condition.ZoomLevel': this.zoomSize,
          Page: this.channelSearch.page,
          Size: this.channelSearch.maxSize,
        },
      });
      if (!info.errorCode) {
        this.channelInfo.channelInfos = info.data.result;
        this.setChannelinfo();
        if (this.channelSearch.condition.keyword) {
          // 页面加载自适应地图标点
          this.$refs.planchannelAmap.onCompleted(x =>
            this.$refs.planchannelAmap.setView(this.channelInfo.channelSetView)
          );
        }
      }
    },

    // 航标不按照指定范围搜索 == 暂时没有用
    async navaidSearchNoLocation() {
      const { data: res } = await this.$http({
        method: 'get',
        url: '/navaid/search',
        params: {
          'Condition.keyword': this.navaidSearch.Condition.keyword,
          Page: this.navaidSearch.page,
          Size: this.navaidSearch.maxSize,
        },
      });
      if (!res.errorCode) {
        console.log(res);
      }
    },
    // 地图变动搜索
    channelSearchFun: debounce(async function(flage) {
      this.channelSearch.page = 1;
      await this.getChannelInfo();
      // 判断当前是否打开了操作框
      // if (this.$refs.operation_deleted_show.innerHTML == '&gt;') {
      //   this.channelOpation();
      // }
      let channelAddData = this.buttonClickData.channelAddData;

      // if (flage && !channelAddData.dialog) {
      if (flage) {
        let channelDeleteArray = this.amapBrackDarta.channelDeleteArray;

        let markerInfor = this.amapBrackDarta.markerInfor;
        let planchannelAmap = this.$refs.planchannelAmap;
        // 判断是否已经点击了 航点 或者 航线 ，在刷新时再次点击，保证页面没有变化
        if (
          markerInfor &&
          markerInfor.ident &&
          !this.buttonClickData.channelAddData.isChannelUpdata
        ) {
          planchannelAmap.onCompleted(x =>
            planchannelAmap.channelMarker(
              [markerInfor.location.longitude, markerInfor.location.latitude],
              markerInfor
            )
          );
        } else if (channelDeleteArray.length && channelDeleteArray[0].fixesArray.length) {
          planchannelAmap.onCompleted(x =>
            planchannelAmap.channelStyle(channelDeleteArray[0].fixesArray, true)
          );
        }
      }
    }, 300),
    navaidSearchFun: debounce(function() {
      this.channelSearch.page = 1;
      // 处于修改航道时，不重新获取航标位置
      // if (!this.buttonClickData.channelAddData.isChannelUpdata) {
      this.getNavaidAllInfor();
      // }
    }, 300),
    // 键盘输入的搜索
    channelKeyWordsSearchFun(query) {
      this.channelSearchTips.channelLine = [];
      this.channelSearch.page = 1;
      if (query) {
        this.channelSearchTipsFun(query);
      } else {
        this.getChannelInfo();
      }
    },

    // 点击航标获取附近可导航航标
    async navaidFrom(navaid, str, flage, update) {
      // console.log(navaid);
      let { data: res } = await this.$http({
        method: 'get',
        url: '/navaid/' + str,
        params: {
          navaidId: navaid.id,
        },
      });
      if (!res.errorCode) {
        // console.log(res.data);
        if (str == 'from') {
          this.navaid.navaidFromData = res.data;
          for (let val of this.navaid.navaidFromData) {
            val.location = trun(val.location);
          }
          let navaidFromArray = [];
          // 可导航线操作
          if (navaid && navaid.location && !update) {
            let navaidFromData = res.data;
            for (let navaidFromDatas of navaidFromData) {
              this.$set(navaidFromArray, navaidFromArray.length, [
                [navaid.location.longitude, navaid.location.latitude],
                [navaidFromDatas.location.longitude, navaidFromDatas.location.latitude],
              ]);
            }
          }
          // 是否将获得的值设置为老旧的值
          if (flage) {
            this.navaid.navaidFromOldData = this.navaid.navaidFromData;
          }
          return { data: res.data, navaidArray: navaidFromArray };
        } else {
          this.navaid.navaidToData = res.data;
          for (let val of this.navaid.navaidToData) {
            val.location = trun(val.location);
          }
          let navaidToArray = [];
          // 可导航线操作
          if (navaid && navaid.location && !update) {
            let navaidToData = res.data;
            for (let navaidFromDatas of navaidToData) {
              this.$set(navaidToArray, navaidToArray.length, [
                [navaid.location.longitude, navaid.location.latitude],
                [navaidFromDatas.location.longitude, navaidFromDatas.location.latitude],
              ]);
            }
          }
          return { data: res.data, navaidArray: navaidToArray };
        }
        // return res.data;
      }
    },
    // 航道名字点击
    markerClickFun(channelInfor, index) {
      this.buttonClickData.normalIndex = index;
      let planchannelAmap = this.$refs.planchannelAmap;
      planchannelAmap.onCompleted(x => planchannelAmap.channelStyleClearALL());

      planchannelAmap.onCompleted(x => planchannelAmap.channelStyle(channelInfor.fixesArray));
    },
    //
    // =====================航道管理获取信息结束=====================

    // =======================航道操作========================
    // 操作界面显示
    channelOpation() {
      if (this.$refs.operation_deleted_show.innerHTML == '&gt;') {
        this.$refs.operation_deleted_show.innerHTML = '&lt;';
        this.$refs.operation.style.transform = 'translateX(100%)';
      } else {
        this.$refs.operation_deleted_show.innerHTML = '&gt;';
        this.$refs.operation.style.transform = 'translateX(0)';
      }
    },
    // 添加航道并获取航道id
    async channelAddIdent(ident = this.buttonClickData.channelAddData.ident) {
      let { data: res } = await this.$http({
        method: 'POST',
        url: '/waterway/add',
        data: { ident },
      });
      if (!res.errorCode) {
        // 得到航道id;
        let waterwayId = res.data.id;
        return waterwayId;
      }
    },
    // 修改航道
    async channelUpdataClickFun() {
      let channelDeleteArray = this.amapBrackDarta.channelDeleteArray;
      // 默认为0，选择第一条航道
      let index = this.buttonClickData.normalIndex;
      this.buttonClickData.disabled = true;
      let channelAddData = this.buttonClickData.channelAddData;
      this.buttonClickData.channelAddData.waterwayId = channelDeleteArray[index].id;
      this.buttonClickData.channelAddData.isChannelUpdata = true;
      // 打开手动规划窗口
      this.channelAddData.data.plan = 1;
      channelAddData.ident = channelDeleteArray[index].ident;
      channelAddData.dialog = true;
      // 不要影响原本的数组，单独做计算
      channelAddData.manualAddArray = JSON.parse(JSON.stringify(channelDeleteArray[index].fixes));
      channelAddData.updateAddArray = JSON.parse(JSON.stringify(channelDeleteArray[index].fixes));

      // 获取点击航标附近可导航范围
      // 异步获取数据
      let [fromData, toData] = await Promise.all([
        // 获取点击航标附近可导航范围
        this.navaidFrom(
          channelAddData.manualAddArray[channelAddData.manualAddArray.length - 1].navaid,
          'from',
          true
        ),
        this.navaidFrom(
          channelAddData.manualAddArray[channelAddData.manualAddArray.length - 1].navaid,
          'to'
        ),
      ]);
      this.navaid.navaidFromArray = fromData.navaidArray;
      this.navaid.navaidToArray = toData.navaidArray;
    },
    // 修改航道接口调用==传入航道{wateryId,fixes}
    async channelUpdata(setFixObject, flage, waterwayId) {
      let { data: setFix } = await this.$http({
        method: 'post',
        url: '/waterway/setfix',
        data: setFixObject,
      });
      if (!setFix.errorCode) {
        // 关闭当前操作栏并清楚所有数据
        this.channelAddClearFun();
        // 重新渲染数组颜色，绘制航道执行数据
        this.channelSearchFun(flage);
      }
    },

    // 增加航道窗口显示
    channelAddDialogShow() {
      this.channelAddData.dialog = true;
      this.channelAddData.isClick = true;
      this.channelAddData.data.plan == 0;
    },
    // 增加航道
    addAouterShow() {
      //  执行该函数去触发ref下的验证,不满足则传入参数为false
      this.$refs.channelAddRef.validate(async val => {
        if (val) {
          this.channelAddData.dialog = false;
          this.buttonClickData.channelAddData.dialog = true;
        }
      });
    },
    // 自动规划航道==起点选择
    addReouterStartClick() {
      if (this.buttonClickData.channelAddData.isStartData.ident) {
        this.buttonClickData.channelAddData.isStart = !this.buttonClickData.channelAddData.isStart;
      } else {
        this.$message({
          type: 'warning',
          message: '请选择起点',
        });
      }
    },
    // 自动规划航道==终点选择
    addReouterEndClick() {
      if (this.buttonClickData.channelAddData.isEndData.ident) {
        this.buttonClickData.channelAddData.isEnd = !this.buttonClickData.channelAddData.isEnd;
      } else {
        this.$message({
          type: 'warning',
          message: '请选择终点',
        });
      }
    },
    // 自动航道规划
    async autoChannel(startDataId, endDataId, array) {
      let { data: idArrays } = await this.$http({
        method: 'get',
        url: '/navigation/navigatefromnavaid',
        params: {
          StartNavaidId: startDataId,
          EndNavaidId: endDataId,
        },
      });
      if (!idArrays.errorCode) {
        let setFixArray = [];
        let setFixObject;
        let channelAddData = this.buttonClickData.channelAddData;
        if (channelAddData.updateAddArray.length) {
          channelAddData.updateAddArray = [];
        }
        for (let i in idArrays.data) {
          idArrays.data[i].navaid.location = trun(idArrays.data[i].navaid.location);
          // 设置手动规划、修改路线
          this.$set(setFixArray, setFixArray.length, {
            navaidId: idArrays.data[i].id,
            navaid: idArrays.data[i].navaid,
          });
        }
        if (!channelAddData.isChannelUpdata) {
          console.log('当前属于增加航道事件');

          // 获取信息修改到手动规划页面做部分修改
          this.channelAddData.data.plan = 1;
          channelAddData.manualAddArray = setFixArray;

          // 获取点击航标附近可导航范围
          let [fromData, toData] = await Promise.all([
            // 获取点击航标附近可导航范围
            this.navaidFrom(setFixArray[setFixArray.length - 1].navaid, 'from', true),
            this.navaidFrom(setFixArray[setFixArray.length - 1].navaid, 'to'),
          ]);
          this.navaid.navaidFromArray = fromData.navaidArray;
          this.navaid.navaidToArray = toData.navaidArray;
        } else {
          console.log('当前属于修改航道事件');

          // 利用获取最优航道接口进行设置，结果失败，但是代码不知道还有没有用，暂时不删
          // function isrepeat() {
          //   console.log(array);
          //   console.log(setFixArray);
          //   for (let i = 0; i < array.length; i++) {
          //     if (setFixArray[i].navaidId != array[i].navaidId) {
          //       return false;
          //     }
          //   }
          //   return true;
          // }
          // this.updateCannelSelect.oldChannel = [];
          // this.updateCannelSelect.newChannel = [];
          // if (!isrepeat()) {
          //   console.log('获取的数组不完全相等');
          //   let path = [];
          //   for (let val of setFixArray) {
          //     path.push([val.navaid.location.longitude, val.navaid.location.latitude]);
          //   }
          //   let setFixObj = {
          //     setFixArray,
          //     path
          //   };
          //   channelAddData.updateAddArray.push(setFixObj);
          //   this.updateCannelSelect.oldChannel = array;
          //   this.updateCannelSelect.newChannel = setFixArray;
          //   console.log(this.updateCannelSelect);
          // }
        }
      }
    },
    // 规划航道==增加
    async channelAddFun() {
      // 自动规划航道==增加
      if (!this.channelAddData.data.plan) {
        let startDataId = this.buttonClickData.channelAddData.isStartData.id;
        let endDataId = this.buttonClickData.channelAddData.isEndData.id;
        // 判断是否两个按钮都确定
        if (!this.buttonClickData.channelAddData.isStart) {
          this.$message.warning('请选择并确认起点航标');
        } else if (!this.buttonClickData.channelAddData.isEnd) {
          this.$message.warning('请选择并确认终点航标');
        } else {
          this.autoChannel(startDataId, endDataId);
        }
      }
      // 手动规划航道==增加
      else {
        if (this.buttonClickData.channelAddData.manualAddArray.length >= 2) {
          if (!this.buttonClickData.channelAddData.isChannelUpdata) {
            // 得到航道id;
            var waterwayId = await this.channelAddIdent();
          } else {
            // 得到航道id;
            var waterwayId = this.buttonClickData.channelAddData.waterwayId;
            this.buttonClickData.channelAddData.isChannelUpdata = false;
          }

          // 设置order值
          for (let i in this.buttonClickData.channelAddData.manualAddArray) {
            this.$set(
              this.buttonClickData.channelAddData.manualAddArray[i],
              'order',
              parseInt(i) + 1
            );
          }

          // 只能传2个id值
          let setFixArray = this.buttonClickData.channelAddData.manualAddArray.map(item => {
            return { order: item.order, navaidId: item.navaidId };
          });
          let setFixObject = {
            waterwayId,
            fixes: setFixArray,
          };
          this.channelUpdata(setFixObject, true, waterwayId);
          // 不要影响原本的数组，单独做计算
          // channelAddData.manualAddArray = JSON.parse(JSON.stringify(channelDeleteArray[index].fixes));
          // 不要影响原本的数组，单独做计算
          // if (this.buttonClickData.channelAddData.manualAddArray.length) {
          // this.buttonClickData.channelDeleteArray[this.buttonClickData.normalIndex].fixes = JSON.parse(
          //   JSON.stringify(this.buttonClickData.channelAddData.manualAddArray)
          // );
          // }
        } else {
          this.$message.warning('一条航道必须拥有两个及两个以上的航标');
        }
      }
    },
    // 手动规划路劲==删除
    async manualAddArrayDelete(index) {
      let manualAddArray = this.buttonClickData.channelAddData.manualAddArray;
      this.$delete(manualAddArray, index);
      if (manualAddArray.length == 0) {
        this.navaid.navaidFromOldData = [];
        // 获取点击航标附近可导航范围
      } else {
        let [fromData, toData] = await Promise.all([
          // 获取点击航标附近可导航范围
          this.navaidFrom(manualAddArray[manualAddArray.length - 1].navaid, 'from', true),
          this.navaidFrom(manualAddArray[manualAddArray.length - 1].navaid, 'to'),
        ]);
        this.navaid.navaidFromArray = fromData.navaidArray;
        this.navaid.navaidToArray = toData.navaidArray;
        this.amapBrackDarta.markerInfor = manualAddArray[manualAddArray.length - 1].navaid;
      }
    },
    // 取消增加航道/增加航道成功后还原数据
    channelAddClearFun() {
      let channelAddData = this.buttonClickData.channelAddData;
      channelAddData.dialog = false;
      channelAddData.isStart = false;
      channelAddData.isEnd = false;
      channelAddData.isChannelUpdata = false;
      channelAddData.isStartData = '';
      channelAddData.isEndData = 'Waypoint';
      channelAddData.ident = '';
      channelAddData.manualAddArray = [];
      channelAddData.updateAddArray = [];
      channelAddData.updateAddFlage = false;
      channelAddData.updateReplaceFlage = false;
      this.channelAddData.isClick = false;
      this.navaid.navaidFromOldData = [];
      this.updateCannelSelect.oldChannel = [];
      this.updateCannelSelect.newChannel = [];
      this.buttonClickData.disabled = false;
      // 对地图内容进行清空
      if (this.$refs.planchannelAmap && this.$refs.planchannelAmap.channelAddSelet) {
        this.$refs.planchannelAmap.channelAddSelet = '';
      }
    },
    // 增加航道 弹框关闭
    channelAddDialogCloseFun() {
      this.buttonClickData.channelAddData.ident = this.channelAddData.data.ident;
      this.$refs.channelAddRef.resetFields();
    },

    // 删除航道
    channelDeleteClickFun() {
      let channelDeleteArray = this.amapBrackDarta.channelDeleteArray;
      let index = this.buttonClickData.normalIndex;
      this.$confirm(
        '此操作将永久删除' + channelDeleteArray[index].ident + '航道, 是否继续?',
        '提示',
        {
          // 默认为确定取消，但是可以修改
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          // 测试时当前值为1，经过测试，他会按顺序去寻找能找到的值，并非按照指定文件
          this.channelDeleteFun(channelDeleteArray[index].id, true);
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          });
        });
    },
    async channelDeleteFun(channelId, flage) {
      let { data: res } = await this.$http.post('waterway/delete?id=' + channelId);
      if (!res.errorCode) {
        this.$delete(this.amapBrackDarta.channelDeleteArray, this.buttonClickData.normalIndex);
        if (!this.amapBrackDarta.channelDeleteArray.length) {
          this.amapBrackDarta.ischannelSelect = false;
        }
        // 关闭当前操作栏并清楚所有数据
        this.channelAddClearFun();
        // 重新渲染数组颜色，绘制航道执行数据
        this.channelSearchFun(flage);
      }
    },
    // =======================航道操作结束========================

    // =======================航道信息操作=======================
    // 获取信息进行航道信息设置
    setChannelinfo() {
      // 每次选择先清空一次
      this.channelInfo.channelSetView = [];
      this.channelInfo.clearRepeatWaypointInfor = [];
      let channelSetView = this.channelInfo.channelSetView;
      let clearRepeatWaypointInfor = this.channelInfo.clearRepeatWaypointInfor;
      for (let i in this.channelInfo.channelInfos) {
        // 折线二维数组
        this.$set(this.channelInfo.channelInfos[i], 'fixesArray', []);
        // 颜色，折线大小设置，帮助后面更改渲染
        this.$set(
          this.channelInfo.channelInfos[i],
          'strokeColor',
          enums.colorArray(this.channelInfo.channelInfos[i].ident.slice(0, 1))
        );
        this.$set(this.channelInfo.channelInfos[i], 'strokeWeight', '2');
        // 航道，航标删除、替换、添加判断
        this.$set(this.channelInfo.channelInfos[i], 'channeldelete', false);

        // 轨迹排序
        this.channelInfo.channelInfos[i].fixes.sort(function(a, b) {
          return a.order - b.order;
        });

        for (let x in this.channelInfo.channelInfos[i].fixes) {
          let fixesArrays = this.channelInfo.channelInfos[i].fixesArray;
          let locations = this.channelInfo.channelInfos[i].fixes[x];
          // 经纬度转换
          locations.navaid.location = trun(locations.navaid.location);
          // 轨迹数组创建
          this.$set(fixesArrays, fixesArrays.length, [
            locations.navaid.location.longitude,
            locations.navaid.location.latitude,
          ]);
          // 折线图层设置
          let isChannelSetView = channelSetView.some(item => {
            return (
              item[0] === locations.navaid.location.longitude &&
              item[1] === locations.navaid.location.latitude
            );
          });
          if (!isChannelSetView) {
            this.$set(channelSetView, channelSetView.length, [
              locations.navaid.location.longitude,
              locations.navaid.location.latitude,
            ]);
            this.$set(clearRepeatWaypointInfor, clearRepeatWaypointInfor.length, locations);
          }
        }
      }
    },
    // 获取航标信息，进行增，删，改，航标
    navaidAddDeleteReplace() {
      // 从所有地图航标内获取有哪些航标可以做到对当前航道增删改
      for (let val of this.navaid.navaidAllInfor) {
        if (val.id === this.navaid.deleteArray.id) {
          // 可以删除中间的值
          this.navaid.amapDeleteArray.splice(0, 0, val);
        }
        if (this.navaid.addArray.length) {
          for (let vals of this.navaid.addArray) {
            if (vals.id === val.id) {
              // 每一次相等代表有一个数组可以压入
              // 废弃方案
              // let array = [this.updateCannelSelect.previousMarker, val, this.updateCannelSelect.nowMarker];
              // this.$set(this.navaid.amapAddArray, this.navaid.amapAddArray.length, array);
              // this.$set(this.navaid.amapAddArray, this.navaid.amapAddArray.length, array);
              // 测试方案
              let isReplace = this.buttonClickData.channelAddData.manualAddArray.some(item => {
                return item.navaidId === val.id;
              });
              if (!isReplace) {
                this.$set(this.navaid.amapAddArray, this.navaid.amapAddArray.length, vals);
              }
            }
          }
        }
        if (this.navaid.replaceArray.length) {
          for (let vals of this.navaid.replaceArray) {
            if (vals.id === val.id) {
              // 每一次相等代表有一个数组可以压入
              // 废弃方案
              // let array = [this.updateCannelSelect.previousMarker, val, this.updateCannelSelect.nextMarker];
              // this.$set(this.navaid.amapReplaceArray, this.navaid.amapReplaceArray.length, array);

              // 测试方案
              let isReplace = this.buttonClickData.channelAddData.manualAddArray.some(item => {
                return item.navaidId === val.id;
              });
              if (!isReplace) {
                this.$set(this.navaid.amapReplaceArray, this.navaid.amapReplaceArray.length, vals);
              }
            }
          }
        }
      }
    },
    // 修改航道数组操作
    async ChannelUpdateADRFun(data, type) {
      // 航道数组
      let manualAddArray = this.buttonClickData.channelAddData.manualAddArray;
      // 被点击航点
      let markerInfor = this.amapBrackDarta.markerInfor;
      // updateAddArray = JSON.parse(JSON.stringify(manualAddArray));
      // 判断是否添加过，以添加则替换，未添加则添加
      for (let i = 0; i < manualAddArray.length; i++) {
        if (markerInfor.id === manualAddArray[i].navaidId) {
          if (type == 'Add') {
            // if (this.buttonClickData.channelAddData.updateReplaceFlage) {
            //   let replaceId = this.$refs.planchannelAmap.channelAddSelet;
            //   console.log(replaceId);
            //   for (let i = 0; i < manualAddArray.length; i++) {
            //     if (replaceId === manualAddArray[i].navaidId) {
            //       manualAddArray.splice(i, 1, { navaidId: markerInfor.id, navaid: markerInfor });
            //     }
            //   }
            //   this.buttonClickData.channelAddData.updateReplaceFlag = false;
            // }

            //过于复杂化
            // if (!this.buttonClickData.channelAddData.updateAddFlage) {
            //   manualAddArray.splice(i, 0, { navaidId: data.id, navaid: data });
            //   i++;
            //   this.buttonClickData.channelAddData.updateAddFlage = true;
            // } else {
            //   manualAddArray.splice(i - 1, 1, { navaidId: data.id, navaid: data });
            // }

            manualAddArray.splice(i, 0, { navaidId: data.id, navaid: data });
            i++;
          } else if (type == 'Delete') {
            manualAddArray.splice(i, 1);
            i--;
            if (manualAddArray.length == 0) {
              this.navaid.navaidFromOldData = [];
              // 获取点击航标附近可导航范围
            } else if (i == manualAddArray.length - 1) {
              let [fromData, toData] = await Promise.all([
                // 获取点击航标附近可导航范围
                this.navaidFrom(manualAddArray[manualAddArray.length - 1].navaid, 'from', true),
                this.navaidFrom(manualAddArray[manualAddArray.length - 1].navaid, 'to'),
              ]);
              this.navaid.navaidFromArray = fromData.navaidArray;
              this.navaid.navaidToArray = toData.navaidArray;
            }
          } else {
            // 过于复杂化
            // if (this.buttonClickData.channelAddData.updateAddFlage) {
            //   manualAddArray.splice(i - 1, 1);
            //   this.buttonClickData.channelAddData.updateAddFlage = false;
            //   manualAddArray.splice(i -1, 1, { navaidId: data.id, navaid: data });
            //   console.log('replace');
            // } else {
            //   manualAddArray.splice(i, 1, { navaidId: data.id, navaid: data });
            //   console.log('replace');
            // }
            // this.buttonClickData.channelAddData.updateReplaceFlage = true;

            manualAddArray.splice(i, 1, { navaidId: data.id, navaid: data });
          }
        }
      }

      // 关闭当前航道
      this.navaid.amapAddArray = [];
      this.navaid.amapDeleteArray = [];
      this.navaid.amapReplaceArray = [];
      // 对地图内容进行清空
      if (this.$refs.planchannelAmap && this.$refs.planchannelAmap.channelAddSelet) {
        this.$refs.planchannelAmap.channelAddSelet = '';
      }
    },

    // 暂时无用代码集========================================
    // 显示最优路径时判断点击的数据
    updateChannelNewClick() {
      this.updateCannelSelect.isOld = true;
      let manualAddArray = this.buttonClickData.channelAddData.manualAddArray;
      let oldChannel = this.updateCannelSelect.oldChannel;
      let newChannel = this.updateCannelSelect.newChannel;
      for (let i in manualAddArray) {
        if (oldChannel[0].navaidId == manualAddArray[i].navaidId) {
          manualAddArray.splice(i, oldChannel.length, ...newChannel);
        }
      }
      console.log(manualAddArray);
    },
    updateChannelOldClick() {
      this.updateCannelSelect.isOld = false;
      let manualAddArray = this.buttonClickData.channelAddData.manualAddArray;
      let oldChannel = this.updateCannelSelect.oldChannel;
      let newChannel = this.updateCannelSelect.newChannel;
      for (let i in manualAddArray) {
        if (oldChannel[0].navaidId == manualAddArray[i].navaidId) {
          manualAddArray.splice(i, newChannel.length, ...oldChannel);
        }
      }
      console.log(manualAddArray);
    },
    // 航道操作开启、废弃方案存储
    // channelOperation() {
    //   if (true) {
    //   }
    // },
    // 鼠标移入时显示
    // addReouterEnter() {
    //   console.log('鼠标移入');
    //   this.buttonClickData.channelAddData.isStart = !this.buttonClickData.channelAddData.isStart;
    // },
    // addReouterleave() {
    //   console.log('鼠标移除');
    //   this.buttonClickData.channelAddData.isStart = !this.buttonClickData.channelAddData.isStart;
    // },
    // 废弃方案存储
    /* deleteHtml(){
      <!-- 废弃方案 -->
          <!-- <div v-if="updateCannelSelect.oldChannel && updateCannelSelect.oldChannel.length">
            <p class="addAouter_manualRouter-p">可修改选择：</p>
            <div>
              <p class="addAouter_manualRouter-p">
                最优路径规划：
                <el-button
                  type="success"
                  icon="el-icon-check"
                  circle
                  @click="updateChannelNewClick()"
                  v-if="updateCannelSelect.isOld"
                ></el-button>
                <el-button type="primary" icon="el-icon-edit" circle @click="updateChannelNewClick()" v-else></el-button>
              </p>
              <div class="maxheight">
                <li v-for="(val, index) in updateCannelSelect.newChannel" :key="val.id">
                  <span v-if="index != 0"> ——> </span>
                  <p class="manualRouter_div_li_p">{{ val.navaid.ident }}</p>
                </li>
              </div>
            </div>
            <div class="maxheight">
              <p class="addAouter_manualRouter-p">
                原路径：
                <el-button
                  type="success"
                  icon="el-icon-check"
                  circle
                  @click="updateChannelOldClick()"
                  v-if="!updateCannelSelect.isOld"
                ></el-button>
                <el-button type="primary" icon="el-icon-edit" circle @click="updateChannelOldClick()" v-else></el-button>
              </p>
              <div>
                <li v-for="(val, index) in updateCannelSelect.oldChannel" :key="val.id">
                  <span v-if="index != 0"> ——> </span>
                  <p class="manualRouter_div_li_p">{{ val.navaid.ident }}</p>
                </li>
              </div>
            </div>
          </div> -->
    } */
    // =====================航道信息操作结束=====================
  },
  created() {},
  destroyed() {},
  computed: {},
  beforeMount() {},
  mounted() {
    bus.$on('Disconnect', ({ message }) => {
      this.DisconnectMessage = message;
    });
  },
  watch: {
    DisconnectMessage() {
      if (this.DisconnectMessage && (this.isClick || this.editlogVisible)) {
        this.option = this.$message({
          type: 'error',
          message: this.DisconnectMessage,
          duration: 0,
        });
      } else {
        this.option ? this.option.close() : '';
      }
    },
    // 每次改变地图，则重新获取信息显示
    vueMapLocation: {
      handler() {
        this.navaidSearchFun();
        this.channelSearchFun(true);
      },
      deep: true,
    },
  },
};
</script>

<style lang="less" scoped>
.planchannel {
  height: 100%;
  overflow: hidden;
}
.planchannel_inforation {
  height: calc(100% - 40px);
  width: 100%;
  position: relative;
}
.planchannel_inforation_map {
  height: 100%;
  width: 100%;
  position: absolute;
}
.planchannel_inforation_map--search {
  position: absolute;
  right: 10px;
  width: 15%;
  min-width: 95px;
}
.planchannel_inforation_map--operation {
  position: absolute;
  max-width: 220px;
  right: 0;
  transform: translateX(100%);
  top: 75px;
  background: rgba(200, 200, 200, 0.7);
  padding: 10px 10px 0 10px;
  transition: transform 0.2s linear;
}
.operation_deleted--show {
  width: 10px;
  height: 25px;
  position: absolute;
  top: 50%;
  transform: translate(-200%, -50%);
  text-align: center;
  line-height: 23px;
  background: rgba(200, 200, 200, 0.7);
  cursor: pointer;
}
.planchannel_inforation_map--father--operation_infor {
  margin-bottom: 10px;
}
.planchannel_inforation_map--operation_infor {
  position: relative;
  font-size: 12px;

  .operation_infor--marker {
    height: auto;
  }
  .operation_infor--line {
    .operation_infor_line_div {
      .operation_infor_line_div_div {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .operation_infor_line_div_button:nth-child(3n + 1) {
          margin: 0 !important;
        }
      }
    }
  }
}
.planchannel_inforation_map--operation_deleted {
  display: flex;
  flex-direction: column;
  // flex-wrap:wrap;
}
.operation_deleted_button {
  margin-left: 0px !important;
  margin-bottom: 10px;
}
// 路径操作框
.planchannel_inforation_map--addAouter {
  min-width: 150px;
  position: absolute;
  bottom: 20px;
  left: 0;
  background: rgba(200, 200, 200, 0.7);
  border-radius: 0 6px 6px 0;
  padding: 10px;
  h6 {
    text-align: center;
  }
  .planchannel_inforation_map--addAouter_ident {
    display: flex;
  }
  .planchannel_inforation_map--addAouter_autoRouter {
    div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 3px;
      height: 24px;
      p {
        min-width: 70px;
        height: 100%;
      }
      .dontContent {
        border-bottom: 1px solid #333;
        box-sizing: border-box;
      }
    }
  }
  .planchannel_inforation_map--addAouter_manualRouter {
    max-width: 210px;
    .addAouter_manualRouter-p {
      height: auto;
      width: 100%;
    }
    div {
      display: flex;
      flex-wrap: wrap;
      li {
        display: flex;
        padding: 2px;
        position: relative;
        p {
          margin: 0 3px;
          background: #333;
          color: #fff;
          padding: 2px 3px;
          font-size: 12px;
        }
        .manualRouter_div_li_div {
          position: absolute;
          width: 5px;
          top: -2px;
          right: 0px;
          font-size: 12px;
          cursor: pointer;
          z-index: 2;
        }
        .manualRouter_div_li_div:hover {
          color: red;
        }
      }
    }
  }
  .planchannel_inforation_map--addAouter_is {
    display: flex;
    justify-content: center;
    margin-top: 5px;
  }
  .addAouter_autoRouter_start--befer {
    background: #333;
  }
  /deep/.el-button--small {
    padding: 4px;
  }
}
</style>
