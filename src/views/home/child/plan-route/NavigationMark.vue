<template>
  <div>
    <div>
      <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
      <el-row class="future-box">
        <el-col :span="2">
          <el-dropdown @command="handleCommand">
            <el-button type="primary" size="mini" class="drop-down-menu">
              模式切换<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="list">列表模式</el-dropdown-item>
              <el-dropdown-item command="map">地图模式</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="6" class="add-maker-col">
          <!-- 搜索功能需要每次搜索的时候将page重置为1 -->
          <el-input
            placeholder="请输入内容"
            v-model="makerQuery.Condition.keyword"
            @input="debounceSearch"
            class="input-with-select"
            clearable
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button v-show="showListOrMap" type="primary" @click="showAddDialog('list')">添加航标</el-button>
        </el-col>
        <div v-show="isAddBox">
          <el-form ref="mapAddFormRef" :rules="mapAddRules" :inline="true" :model="saveMarkData" class="demo-form-inline">
            <el-form-item label="身份码" prop="ident" class="ident-box"
              ><el-input v-model="saveMarkData.ident" :disabled="!addorEdit"></el-input>
            </el-form-item>

            <el-form-item label="经度" class="location-box">
              <el-input v-model="saveMarkData.location.longitude" @input="editMakerInput" :disabled="addorEdit"></el-input>
            </el-form-item>

            <el-form-item label="纬度" class="location-box">
              <el-input v-model="saveMarkData.location.latitude" @input="editMakerInput" :disabled="addorEdit"></el-input>
            </el-form-item>

            <el-form-item label="半径" prop="radius" class="radius-box">
              <el-input v-model="saveMarkData.radius" type="Number"></el-input>
            </el-form-item>

            <el-form-item label="层级" prop="zoomLevel" class="radius-box">
              <el-input v-model="saveMarkData.zoomLevel" type="Number"></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="mapAddMakerInfo" v-if="addorEdit" :loading="addMakerLoading">添 加</el-button>
              <el-button type="primary" @click="mapEditMakerInfo" v-show="!addorEdit" :loading="editLoading">修 改</el-button>
              <el-button type="warning" @click="mapCancelAdd">取 消</el-button>
              <el-button type="danger" v-show="!addorEdit" @click="deleteMarker(saveMarkData)">
                删 除
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-row>
    </div>

    <el-card v-show="showListOrMap">
      <!-- 表格 -->
      <el-table :data="makerInfoList" border stripe v-loading="tableLoading">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="身份码" prop="ident"></el-table-column>
        <el-table-column label="经度" prop="location.latitude"></el-table-column>
        <el-table-column label="纬度" prop="location.longitude"></el-table-column>
        <el-table-column label="半径" prop="radius"></el-table-column>
        <el-table-column label="层级" prop="zoomLevel"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteMarker(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页效果 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="makerQuery.page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="makerQuery.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="makerQuery.total"
      ></el-pagination>
    </el-card>
    <el-card v-if="!showListOrMap">
      <Amap
        class="nav-map"
        :navMakerInfoList="makerInfoList"
        :isClick="isClick"
        :isShowBtn="isShowBtn"
        :proMarkerRadius="arraySaveMarkData"
        :isClickMarker="isClickMarker"
        @setVueMapBounds="setVueMapBounds"
        @LngLat="getLngLat"
        @mapEditMarker="mapEditMarker"
        @navCircleMove="navCircleMove"
        @navCircleAdjust="navCircleAdjust"
        ref="navMap"
      ></Amap>
    </el-card>
    <!-- 添加dialog -->
    <el-dialog title="添加航标" :visible.sync="addlogVisible" width="30%" center @close="closeAdd">
      <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
        <el-form-item label="身份码" prop="ident">
          <el-input v-model="addFrom.ident" placeholder="请输入身份码" clearable></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="latitude">
          <el-input :disabled="isDisabled" v-model="addFrom.latitude" placeholder="请输入经度" type="number" clearable></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="longitude">
          <el-input :disabled="isDisabled" v-model="addFrom.longitude" placeholder="请输入纬度" type="number" clearable></el-input>
        </el-form-item>
        <el-form-item label="半径" prop="radius">
          <el-input v-model="addFrom.radius" placeholder="请输入半径" type="number" clearable></el-input>
        </el-form-item>
        <el-form-item label="层级" prop="zoomLevel">
          <el-input v-model="addFrom.zoomLevel" placeholder="请输入层级" type="number" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMakerInfo" :loading="addMakerLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑dialog -->
    <el-dialog title="编辑航标" :visible.sync="editlogVisible" width="30%" center @close="closeEdit">
      <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
        <el-form-item label="身份码" prop="ident">
          <el-input v-model="editFrom.ident" clearable disabled></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="latitude">
          <el-input v-model="editFrom.latitude" clearable></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="longitude">
          <el-input v-model="editFrom.longitude" clearable></el-input>
        </el-form-item>
        <el-form-item label="半径" prop="radius">
          <el-input v-model="editFrom.radius" clearable></el-input>
        </el-form-item>
        <el-form-item label="层级" prop="zoomLevel">
          <el-input v-model="editFrom.zoomLevel" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMaker" :loading="editLoading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
// 导入地图
import '@/plugins/amap';
import Amap from '@/amap/Amaps.vue';

import Breadcrumb from 'common/Breadcrumb';
// 事件总线
import bus from '@/components/common/bus';
//公共函数
import { debounce, trun, navPolyline } from '@/utils/common';
// 导入公用接口函数
import { getMakerData } from '@/utils/request';
export default {
  name: 'NavigationMark',
  //数据
  data() {
    // 自定义校验规则
    var checkIdnet = (rule, value, cb) => {
      //验证ident是否为大写数字组成切长度为5
      const regIdent = /^[A-Z0-9]{5}$/;
      if (regIdent.test(value)) {
        return cb();
      }
      cb(new Error('请输入大写字母和数字，长度为5'));
    };
    // 自定义校验规则
    var checkZoomLevel = (rule, value, cb) => {
      // 验证层级是否为3-20
      const regIdent = value >= 3 && value <= 20 ? true : '';
      if (regIdent) {
        return cb();
      }
      cb(new Error('请输入3-20的数字'));
    };
    return {
      // ------基础数据-----
      breadcrumbList: ['航标管理'],
      makerInfoList: [],
      showListOrMap: true,
      getMapLocation: {},
      isShowBtn: true,
      isClick: true,
      toNavpolyline: [],
      toAddMarkpolyline: [[]],
      fromNavpolyline: [],
      fromAddMarkpolyline: [[]],
      // 控制经纬度input是否禁用
      isDisabled: false,
      isAddBox: false,
      isClickMarker: false,
      //地图
      vueMap: null,
      // 识别是删除edit还是修改edit
      openEditValue: '',
      // 控制地图模式,修改or添加按钮的显隐
      addorEdit: true,
      // 保存地图范围
      vueMapLocation: {},
      //航标的数据
      saveMarkData: {
        ident: '',
        location: {
          latitude: null,
          longitude: null,
        },
        radius: null,
        zoomLevel: null,
      },
      // 点击时保存航标信息
      saveLocation: null,
      arraySaveMarkData: [],
      saveMarkDataId: null,
      // 存储在点击的某个maker的下标
      clickMarkIndex: Number,
      //判断是否拖动圆
      isMoveCircle: false,
      // 判断是否点击了取消
      isClickCance: false,
      //如果是新增
      // 查询条件
      makerQuery: {
        Condition: {
          Rect: {
            TopLeft: null,
            TopRight: null,
            BottomLeft: null,
            BottomRight: null,
          },
          zoomLevel: null,
          radius: null,
          keyword: null,
        },
        page: 1,
        size: 5,
        total: 0,
      },
      // ------------表单数据----------
      addFrom: {
        ident: '',
        latitude: null,
        longitude: null,
        radius: null,
        zoomLevel: 3,
      },
      editFrom: {
        ident: '',
        latitude: null,
        longitude: null,
        radius: null,
        zoomLevel: 0,
      },
      // --------diglog---------
      addlogVisible: false,
      editlogVisible: false,
      editLoading: false,
      upDataLoading: false,
      // -------------验证规则----------
      addRules: {
        ident: [
          {
            required: true,
            message: '请输入身份码',
            trigger: 'blur',
          },
          {
            validator: checkIdnet,
            trigger: 'blur',
          },
        ],
        radius: [{ required: true, message: '请输入半径', trigger: 'blur' }],
        latitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
        longitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
        zoomLevel: [
          { required: true, message: '请输入层级', trigger: 'blur' },
          {
            validator: checkZoomLevel,
            trigger: 'blur',
          },
        ],
      },
      mapAddRules: {
        ident: [
          { required: true, message: '请输入身份码', trigger: 'blur' },
          {
            validator: checkIdnet,
            trigger: 'blur',
          },
        ],
        radius: [{ required: true, message: '请输入半径', trigger: 'blur' }],
        zoomLevel: [
          { required: true, message: '请输入层级', trigger: 'blur' },
          {
            validator: checkZoomLevel,
            trigger: 'blur',
          },
        ],
      },

      editRules: {
        ident: [
          { required: true, message: '请输入身份码', trigger: 'blur' },
          {
            validator: checkIdnet,
            trigger: 'blur',
          },
        ],
        radius: [{ required: true, message: '请输入半径', trigger: 'blur' }],
        latitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
        longitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
        zoomLevel: [
          { required: true, message: '请输入层级', trigger: 'blur' },
          {
            validator: checkZoomLevel,
            trigger: 'blur',
          },
        ],
      },
      // ----------loading------------
      tableLoading: false,
      addMakerLoading: false,
    };
  },
  //组件传值
  props: {},
  //方法
  methods: {
    // ---------------分页查询方法----------------
    async handleSizeChange(newSize) {
      this.makerQuery.size = newSize;
      this.makerInfoList = await getMakerData(this.makerQuery);
    },
    async handleCurrentChange(newPage) {
      this.makerQuery.page = newPage;
      this.makerInfoList = await getMakerData(this.makerQuery);
    },
    // 搜索框事件
    // 防抖预防多次触发调用
    debounceSearch: debounce(function() {
      this.searchMaker();
    }, 500),
    async searchMaker() {
      this.makerQuery.page = 1;
      // 地图渲染以后,才执行清空操作,否者会报错undifend
      if (this.$refs.navMap) {
        this.arraySaveMarkData = [];
        this.$refs.navMap.markerRadius = [];
        this.clearNavPolyline();
        this.$refs.mapAddFormRef.resetFields();
      }
      this.makerInfoList = await getMakerData(this.makerQuery);
    },
    // ------------------显示dialog-----------------
    showAddDialog(val) {
      if (val === 'list') {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
        this.addFrom.latitude = this.getMapLocation.latitude;
        this.addFrom.longitude = this.getMapLocation.longitude;
      }
      this.addlogVisible = true;
    },
    // 保存
    updataEdit() {
      this.isShowBtn = true;
    },
    // 取消保存
    cancelEdit() {
      this.isShowBtn = true;
      this.openEditValue = '';
    },
    //列表添加添加方法
    addMakerInfo() {
      // 由于请求下来的数据不能直接放进验证表单,所以转换了一次,提交的时候转换回去
      let postAddFrom = {
        ident: this.addFrom.ident,
        location: `${this.addFrom.latitude},${this.addFrom.longitude}`,
        radius: this.addFrom.radius,
        zoomLevel: this.addFrom.zoomLevel,
      };
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          this.addMakerLoading = true;
          bus.$on('loading', ({ loading }) => {
            this.addMakerLoading = loading;
          });
          const { data: res } = await this.$http.post('/navaid/add', postAddFrom);
          if (!res.errorCode) {
            this.$message.success('添加数据成功');
            this.makerInfoList = await getMakerData(this.makerQuery);
            this.addlogVisible = false;
          }
        }
      });
    },
    //地图添加添加方法
    mapAddMakerInfo() {
      //开始可以请求数据
      this.isMoveCircle = false;
      // 由于请求下来的数据不能直接放进验证表单,所以转换了一次,提交的时候转换回去
      let postAddFrom = {
        ident: this.saveMarkData.ident,
        location: `${this.saveMarkData.location.latitude},${this.saveMarkData.location.longitude}`,
        radius: this.saveMarkData.radius,
        zoomLevel: this.saveMarkData.zoomLevel,
      };
      this.$refs.mapAddFormRef.validate(async val => {
        console.log(val);
        if (val) {
          this.addMakerLoading = true;
          bus.$on('loading', ({ loading }) => {
            this.addMakerLoading = loading;
          });
          const { data: res } = await this.$http.post('/navaid/add', postAddFrom);
          if (!res.errorCode) {
            this.$message.success('添加数据成功');
            // //新增点将编辑点使用的数据清除
            this.saveLocation = null;
            this.makerInfoList = await getMakerData(this.makerQuery);
            this.clearNavPolyline();
            this.arraySaveMarkData = [];
          }
        }
      });
    },
    // 地图取消添加方法
    async mapCancelAdd() {
      // //新增点将编辑点使用的数据清除
      this.saveLocation = null;
      this.isClickCance = true;
      // 点击取消清空地图数据并且重置表单
      this.clearNavPolyline();
      // 继续请求数据
      this.isMoveCircle = false;
      this.$refs.mapAddFormRef.resetFields();
      this.arraySaveMarkData = [];
      this.saveMarkDataId = null;
      this.makerInfoList = await getMakerData(this.makerQuery);
    },
    mapEditMakerInfo(row) {
      // 继续请求数据
      this.isMoveCircle = false;
      // 由于请求下来的数据不能直接放进验证表单,所以转换了一次,提交的时候转换回去
      let postEditForm = {
        id: this.saveMarkData.id,
        location: `${this.saveMarkData.location.latitude},${this.saveMarkData.location.longitude}`,
        radius: this.saveMarkData.radius,
        zoomLevel: this.saveMarkData.zoomLevel,
      };
      this.$refs.mapAddFormRef.validate(async val => {
        if (val) {
          this.editLoading = true;
          bus.$on('loading', ({ loading }) => {
            this.editLoading = loading;
          });
          const { data: res } = await this.$http({
            method: 'post',
            url: '/navaid/update',
            data: postEditForm,
          });
          // const {data:res} = await this.$http.post(`/navaid/update`,postEditForm)
          if (!res.errorCode) {
            this.$message.success('修改数据成功');
            // //新增点将编辑点使用的数据清除
            this.saveLocation = null;
            this.makerInfoList = await getMakerData(this.makerQuery);
          }
        }
      });
    },

    async showEditDialog(row) {
      this.editlogVisible = true;
      const { data: res } = await this.$http({
        method: 'get',
        url: '/navaid/get',
        params: {
          ident: row.ident,
        },
      });
      if (!res.errorCode) {
        const { id, ident, radius, zoomLevel } = res.data;
        let location = res.data.location.split(',');
        this.editFrom = {
          id,
          ident,
          latitude: location[0],
          longitude: location[1],
          radius,
          zoomLevel,
        };
      }
    },
    // ---------------修改方法----------------
    editMaker() {
      // 由于请求下来的数据不能直接放进验证表单,所以转换了一次,提交的时候转换回去
      let postEditForm = {
        id: this.editFrom.id,
        location: `${this.editFrom.latitude},${this.editFrom.longitude}`,
        radius: this.editFrom.radius,
        zoomLevel: this.editFrom.zoomLevel,
      };
      this.$refs.editFormRef.validate(async val => {
        if (val) {
          this.editLoading = true;
          bus.$on('loading', ({ loading }) => {
            this.editLoading = loading;
          });
          const { data: res } = await this.$http({
            method: 'post',
            url: '/navaid/update',
            data: postEditForm,
          });
          // const {data:res} = await this.$http.post(`/navaid/update`,postEditForm)
          if (!res.errorCode) {
            this.$message.success('修改数据成功');
            this.makerInfoList = await getMakerData(this.makerQuery);
            this.editlogVisible = false;
          }
        }
      });
    },
    editMakerInput() {
      this.isMoveCircle = true;
      this.makerInfoList.splice(this.clickMarkIndex, 1, this.saveMarkData);
      // 改变的时候清空线
      this.clearNavPolyline();
    },
    // ---------------删除方法-------------
    async deleteMarker(row) {
      const confirmRlust = await this.$confirm('此操作将永久删除该航标, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/navaid/delete?id=${row.id}`);
        if (!res.errorCode) {
          this.arraySaveMarkData = [];
          // 删除成功就看可以继续请求数据
          this.$message.success('删除成功!');
          this.makerInfoList = await getMakerData(this.makerQuery);
        }
      } else {
        this.$message.info('取消了删除!');
      }
    },
    // 地图点击航标的方法
    async mapEditMarker(row, map) {
      // 是否点击取消的状态
      this.isClickCance = false;
      if (this.isMoveCircle) {
        // 如果编辑了另一个航标,重新请求数据
        this.makerInfoList = await getMakerData(this.makerQuery);
      }
      this.saveMarkDataId = row.id;
      //显示新增的maker的标识
      this.isClickMarker = false;
      //将地图保存下来使用
      this.vueMap = map;
      // // 显示半径的圆圈数据
      if (this.arraySaveMarkData.length == 0) {
        this.arraySaveMarkData.push(row);
      } else {
        this.arraySaveMarkData.splice(0, 1, row);
        console.log(this.arraySaveMarkData);
      }
      // 点击地图时把上一次的添加表单内容重置(主要是为了清空验证规则)
      this.$refs.mapAddFormRef.resetFields();
      // 点击航标显示修改航标按钮
      this.addorEdit = false;
      // 点击不是当前的航标的时候清空之前的
      this.clearNavPolyline();
      this.$refs.navMap.propsRadius = [];
      // 显示from表单并且将当前航标的数据给他
      this.saveMarkData = _.cloneDeep(row);
      // 点击时保存初始的数据
      this.saveLocation = _.cloneDeep(row);
      // }
      //找点击的某一个航标的下标
      for (const i in this.makerInfoList) {
        if (this.makerInfoList[i].ident == this.saveMarkData.ident) {
          this.clickMarkIndex = i;
        }
      }
    },

    // 航标半径园的move事件
    navCircleMove(lnglat) {
      // this.clearNavPolyline();
      // 拖动了圆的中心就不在请求航标数据
      this.isMoveCircle = true;
      //拖动前清空上一次
      this.clearNavPolyline();
      this.saveMarkData.location.latitude = lnglat.lat;
      this.saveMarkData.location.longitude = lnglat.lng;
      // 不是新增才去splice数组
      if (!this.addorEdit) {
        this.makerInfoList.splice(this.clickMarkIndex, 1, this.saveMarkData);
      }
      console.log(this.toAddMarkpolyline);
      console.log(this.fromAddMarkpolyline);
    },
    debouncenavCircleMove: debounce(async function() {
      this.clearNavPolyline();
      if (this.saveMarkData.radius == null) {
        this.saveMarkData.radius = 0;
      }
      const { data: from } = await this.$http.get(
        `/navaid/fromlocation?location=${this.saveMarkData.location.latitude}%2C${this.saveMarkData.location.longitude}&radius=${this.saveMarkData.radius}`
      );

      const { data: to } = await this.$http.get(
        `/navaid/tolocation?location=${this.saveMarkData.location.latitude}%2C${this.saveMarkData.location.longitude}`
      );

      if (!from.errorCode) {
        this.fromAddMarkpolyline = [];
        for (const i of from.data) {
          let location = i.location.split(',');
          // 过滤掉没有显示的航标,不然地图上会有很多线指向空的航标
          for (const key of this.makerInfoList) {
            if (location[0] == key.location.latitude && location[1] == key.location.longitude) {
              this.fromAddMarkpolyline.push([
                [this.saveMarkData.location.longitude, this.saveMarkData.location.latitude],
                [location[1], location[0]],
              ]);
            }
          }
        }
      }

      if (!to.errorCode) {
        this.toAddMarkpolyline = [];
        for (const i of to.data) {
          let location = i.location.split(',');
          // 过滤掉没有显示的航标,不然地图上会有很多线指向空的航标

          for (const key of this.makerInfoList) {
            if (location[0] == key.location.latitude && location[1] == key.location.longitude) {
              this.toAddMarkpolyline.push([
                [this.saveMarkData.location.longitude, this.saveMarkData.location.latitude],
                [location[1], location[0]],
              ]);
            }
          }
        }
      }
      //清空多余的连接线
      for (const i in this.toAddMarkpolyline) {
        if (this.saveLocation) {
          if (
            this.saveLocation.location.latitude == this.toAddMarkpolyline[i][1][1] &&
            this.saveLocation.location.longitude == this.toAddMarkpolyline[i][1][0]
          ) {
            this.toAddMarkpolyline.splice(i, 1);
          }
        }
      }
      for (const i in this.fromAddMarkpolyline) {
        if (this.saveLocation) {
          if (
            this.saveLocation.location.latitude == this.fromAddMarkpolyline[i][1][1] &&
            this.saveLocation.location.longitude == this.fromAddMarkpolyline[i][1][0]
          ) {
            this.fromAddMarkpolyline.splice(i, 1);
          }
        }
      }

      this.addNavPolyline();
    }, 300),
    // 将拖拽原的半径值,赋给input绑定的数据
    navCircleAdjust(radius) {
      this.saveMarkData.radius = radius;
    },
    //----------------关闭dialog方法--------------
    closeAdd() {
      this.$refs.addFormRef.resetFields();
    },
    closeEdit() {
      this.$refs.editFormRef.resetFields();
    },
    //----------------------下拉菜单回调---------------
    async handleCommand(command) {
      // 列表模式跟地图模式之间切换
      if (command == 'list') {
        this.isShowBtn = true;
        const listMakerQuery = {
          Condition: {
            Rect: {
              TopLeft: null,
              TopRight: null,
              BottomLeft: null,
              BottomRight: null,
            },
            zoomLevel: null,
            radius: null,
            keyword: null,
          },
          page: 1,
          size: 5,
          total: 0,
        };
        this.makerInfoList = await getMakerData(listMakerQuery);
        this.makerQuery.total = listMakerQuery.total;
        this.makerQuery.size = listMakerQuery.size;
        this.showListOrMap = true;
        this.isAddBox = false;
      } else {
        this.isAddBox = true;

        this.showListOrMap = false;
      }
    },
    //-----------------地图方法-------------------
    // 获取地图的显示范围,mapZoomSise为地图层级
    async setVueMapBounds(val, mapZoomSize) {
      console.log('进入了');
      if (!this.isMoveCircle) {
        // 地图显示时候,重置查询条件,让数据根据地图的范围显示航标
        this.vueMapLocation = val;
        this.makerQuery.Condition.Rect.TopLeft = trun(this.vueMapLocation.TopLeft);
        this.makerQuery.Condition.Rect.TopRight = trun(this.vueMapLocation.TopRight);
        this.makerQuery.Condition.Rect.BottomLeft = trun(this.vueMapLocation.BottomLeft);
        this.makerQuery.Condition.Rect.BottomRight = trun(this.vueMapLocation.BottomRight);
        this.makerQuery.Condition.zoomLevel = mapZoomSize;
        this.makerQuery.page = 1;
        this.makerQuery.size = 2147483647;
        if (!this.showListOrMap) {
          this.makerInfoList = await getMakerData(this.makerQuery);
        }
        // 如果执行了滚动操作,清空当前的航标线,和新增的半径
        // this.fromAddMarkpolyline = [[]];
        // this.toAddMarkpolyline = [[]];
      }
    },
    //获取经纬度
    async getLngLat(val, map) {
      // 是否点击取消的状态
      this.isClickCance = false;
      // //新增点将编辑点使用的数据清除
      this.saveLocation = null;
      if (this.isMoveCircle) {
        // 如果编辑了另一个航标,重新请求数据
        this.makerInfoList = await getMakerData(this.makerQuery);
      }
      // // 关闭请求接口标识
      // this.isMoveCircle = true;
      // 点击地图时把上一次的添加表单内容重置(主要是为了清空验证规则)
      this.$refs.mapAddFormRef.resetFields();
      // 重置表单数据默认值
      this.saveMarkData.ident = 'ident';
      this.saveMarkData.radius = 1000;
      this.getMapLocation = val;
      //显示新增的maker的标识
      this.isClickMarker = true;
      //将地图保存下来使用
      this.vueMap = map;
      !this.isShowBtn && !this.openEditValue ? this.showAddDialog('map') : '';
      // 点击地图显示新增
      this.addorEdit = true;
      this.$set(this.saveMarkData, 'location', {
        latitude: val.latitude,
        longitude: val.longitude,
      });
      if (this.arraySaveMarkData.length == 0) {
        this.arraySaveMarkData.push(this.saveMarkData);
      } else {
        this.arraySaveMarkData.splice(0, 1, this.saveMarkData);
        console.log(this.arraySaveMarkData);
      }
    },
    // 开启编辑操作,可以开始删除和修改航标
    openEdit(val) {
      this.isShowBtn = false;
      this.openEditValue = val;
    },
    // 清空线的方法
    clearNavPolyline() {
      navPolyline(this.vueMap, this.fromNavpolyline);
      navPolyline(this.vueMap, this.toNavpolyline);
    },
    // 添加线的方法
    addNavPolyline() {
      this.fromNavpolyline = navPolyline(this.vueMap, this.fromNavpolyline, this.fromAddMarkpolyline, 'from');
      this.toNavpolyline = navPolyline(this.vueMap, this.toNavpolyline, this.toAddMarkpolyline, 'to');
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
  async created() {
    this.makerInfoList = await getMakerData(this.makerQuery);
  },
  //挂载前
  beforeMount() {},
  //挂载完成
  mounted() {},
  //更新前
  beforeUpdate() {},
  //更新完成
  updated() {},
  //销毁前
  beforeDestroy() {},
  //销毁完成
  destoryed() {},
  //监听
  watch: {
    saveMarkData: {
      handler() {
        if (!this.isClickCance) {
          if (this.arraySaveMarkData.length == 0) {
            this.arraySaveMarkData.push(this.saveMarkData);
            console.log(this.arraySaveMarkData);
          } else {
            this.arraySaveMarkData.splice(0, 1, this.saveMarkData);
          }
          console.log('进入了监听');
          // 通过防抖实现,松开鼠标的时候重新渲染线
          this.debouncenavCircleMove();
        }
      },
      deep: true,
    },
  },
};
</script>
<style lang="less" scoped>
.add-maker-col {
  margin-right: 30px;
}
.drop-down-menu {
  padding: 1px 10px;
}
.nav-map {
  height: 75vh;
}
/deep/ .el-card__body {
  padding: 20px 0 10px 0;
}
.map-add-maker {
  position: absolute;
  bottom: 35px;
  right: 110px;
}
.nav-marker-edit {
  position: absolute;
  bottom: 25px;
  right: 110px;
}
.planchannel_inforation_map--operation  {
  position: absolute;
  max-width: 300px;
  right: 0;
  transform: translateX(100%);
  top: 75px;
  background: rgba(200, 200, 200, 0.7);
  padding: 0 10px 10px;
  // transition: transform 0.2s linear;
  transition: transfrom 0.2 linear;
}
.operation_deleted--show  {
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
.planchannel_inforation_map--operation_deleted  {
  display: flex;
  flex-direction: column;
  // flex-wrap:wrap;
}
.operation_deleted_button  {
  margin-left: 0px !important;
  margin-top: 10px;
}
/deep/ .ident-box {
  .el-input--small {
    width: 70px;
  }
  .el-input__inner {
    width: 70px;
  }
}
.location-box {
  .el-input--small {
    width: 100px;
  }
  .el-input__inner {
    width: 100px;
  }
}
.radius-col {
  margin-right: 30px;
}
.radius-box {
  // margin-right: 30px;
  .el-input--small {
    width: 100px;
  }
  .el-input__inner {
    width: 100px;
  }
}
.future-box {
  height: 51px;
}
</style>
