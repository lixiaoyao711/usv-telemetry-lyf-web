<template>
  <div>
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <el-card>
      <el-row class="map">
        <el-col>
          <Amap
            :portInfoList="portInfoList"
            :berthInfoList="berthInfoList"
            :boundsList="boundsList"
            :addBoundsList="addBoundsList"
            :addBerthBoundsList="addBerthBoundsList"
            :isShowPortBox="isShowPortBox"
            :isShowAddPortBox="isShowAddPortBox"
            :isShowAddBerthBox="isShowAddBerthBox"
            :portCircle="portCircle"
            :isPolylineChange="isPolylineChange"
            :addPortData="addPortData"
            :addBerthData="addBerthData"
            :isClick="true"
            :berthPolylineChangeList="berthPolylineChangeList"
            :portClassList="portClassList"
            :portTips="portTips"
            @setVueMapBounds="setVueMapBounds"
            @LngLat="getLngLat"
            @mapEditPort="mapEditPort"
            @btnAddBerth="btnAddBerth"
            @btnAddPort="btnAddPort"
            @closePortBox="closePortBox"
            @addPort="addPort"
            @addBerth="addBerth"
            @editPort="editPort"
            @editBerth="editBerth"
            @deletePort="deletePort"
            @deleteBerth="deleteBerth"
            @adjustPolyline="adjustPolyline"
            @adjustBerthPolyline="adjustBerthPolyline"
            @addAdjustPolyline="addAdjustPolyline"
            @clickBerth="clickBerth"
            @mouseover="mouseover"
            @mouseout="mouseout"
            @berthMouseover="berthMouseover"
            @berthMouseout="berthMouseout"
            @isShowPortTips="isShowPortTips"
            ref="map"
          ></Amap>
        </el-col>
      </el-row>
      <el-row class="search">
        <el-col>
          <el-input size="mini" placeholder="请输入港口ident" v-model="portQuery.Condition.keyword" @input="debounceSearch" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 泊位列表 -->
      <el-col :span="5" class="berth-list" v-show="isBerthBox">
        <el-row class="plan-lk-header">
          <el-col :span="12">
            <h3>
              泊位列表
              <i class="el-icon-circle-plus-outline" @click="openAddBerth"></i>
            </h3>
          </el-col>
          <!-- <el-col :span="12">
            <div class="planSearch">
              <el-input size="mini" placeholder="请输入泊位ident" />
            </div>
          </el-col> -->
        </el-row>
        <!-- 表格 -->
        <el-table
          ref="berthstTable"
          :show-header="false"
          :data="berthInfoList"
          v-loading="berthLoading"
          @row-click="clickTableRow"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="#" type="index" width="35px"></el-table-column>
          <el-table-column label="ident" prop="ident"></el-table-column>
          <el-table-column label="面积" prop="area"></el-table-column>
          <el-table-column label="操作" width="63px">
            <template slot-scope="scope">
              <!-- 删除 -->
              <i class="el-icon-delete" @click="deleteBerth(scope.row)"></i>
            </template>
          </el-table-column>
        </el-table>
        <!-- 计划分页功能 -->
        <!-- <el-pagination small :pager-count="5" layout="prev, pager, next, jumper"></el-pagination> -->
      </el-col>
    </el-card>
  </div>
</template>
<script>
import Breadcrumb from 'common/Breadcrumb';
import Amap from '@/amap/Amaps.vue';
//公共函数
import { debounce, trun, getBoundsList, postBoundsList } from '@/utils/common';
// 导入公用接口函数
import { getPortData } from '@/utils/request';

// 事件总线
import bus from '@/components/common/bus';

export default {
  name: 'PortBerth',
  //数据
  data() {
    return {
      // --------------基础数据--------------------
      breadcrumbList: ['港口泊位管理'],
      // 查询条件
      portQuery: {
        Condition: {
          Rect: {
            TopLeft: null,
            TopRight: null,
            BottomLeft: null,
            BottomRight: null,
          },
          zoomLevel: null,
          keyword: null,
        },
        page: 1,
        size: 5,
        total: 0,
      },
      // 港口数据
      portInfoList: [],
      berthInfoList: [],
      boundsList: [],
      portCircle: {},
      isRequest: true,
      //控制港口多边形的编辑状态集合
      berthPolylineChangeList: [],
      // 新增的港口数据
      addPortData: {
        area: null,
        name: 'Name',
        ident: 'ident',
        location: {
          longitude: null,
          latitude: null,
        },
        bounds: '',
        radius: 1000,
        zoomLevel: 3,
      },
      cloneAddPortData: {},
      // 新增港口的折线数据
      addBoundsList: [],
      //新增港口的验证class数组
      portClassList: [false, false, false, false],
      //是否显示tips的标志
      portTips: false,
      // 新增泊位数据
      addBerthData: {
        portId: null,
        ident: 'Bident',
        location: {
          longitude: null,
          latitude: null,
        },
        bounds: '',
      },
      // 泊位新增克隆数据
      cloneAddBerthData: {},
      // 新增泊位的多边形数据
      addBerthBoundsList: [],
      // ----------------loding--------------------
      berthLoading: false,
      // --------------------地图数据------------------
      // 是否显示新增的航点范围
      isShowaddBounds: false,
      // 是否显示新增的泊位范围
      isShowaddBerthBounds: false,
      vueMapLocation: null,
      // 控制是否显示折线和信息框
      isShowPortBox: false,
      //是否显示泊位列表
      isBerthBox: false,
      //控制是否显示新增的信息框
      isShowAddPortBox: false,
      isShowAddBerthBox: false,
      // 港口多边形是否可编辑
      isPolylineChange: false,
      // 控制港口是否可以地图上继续新增
      isPortClick: true,
      // 是否可以继续在地图上点击新增
      isBerthClick: false,
      //控制是否结束绘制范围的标识
      isEndpolygon: true,
      //控制是否点击了+泊位
      isClickAddBerth: false,
    };
  },
  //组件传值
  props: {},
  //方法
  methods: {
    // -----------------------页面方法--------------------
    // 防抖查询
    debounceSearch: debounce(async function() {
      this.portQuery.page = 1;
      // 地图渲染以后,才执行清空操作,否者会报错undifend
      if (this.$refs.map) {
        this.boundsList.length ? (this.boundsList = []) : '';
      }
      this.portInfoList = await getPortData(this.portQuery);
    }, 500),
    //点击了泊位table
    clickTableRow(row) {
      // 清空新增数据
      this.addBerthData.location.longitude ? this.deleteBerthData() : '';
      // 关闭信息窗之前先清空验证信息
      this.resetFilesData();
      // 关闭信息框
      this.isShowPortBox = false;
      this.isShowAddBerthBox = false;
      //获取点击行的index
      let index = row.index;
      for (const i in this.berthPolylineChangeList) {
        i == index ? this.$set(this.berthPolylineChangeList, i, true) : this.$set(this.berthPolylineChangeList, i, false);
      }
    },
    // 给每个行元素加一个index
    tableRowClassName({ row, rowIndex }) {
      //把每一行的索引放进row
      row.index = rowIndex;
    },
    // 请求泊位数据
    async getBerthData(id) {
      this.berthLoading = true;
      bus.$on('loading', ({ loading }) => {
        this.berthLoading = loading;
      });
      const { data: res } = await this.$http({
        method: 'get',
        url: '/port/berths',
        params: {
          portId: id,
        },
      });
      if (!res.errorCode) {
        console.log(res);
        this.berthInfoList = res.data;
        this.berthInfoList.map(item => {
          let location = trun(item.location);
          item.location = location;
          item.bounds = getBoundsList(item);
          // 每当有一个数据,就添加一个false
          this.berthPolylineChangeList.push(false);
        });
        // for (const item of this.berthInfoList) {
        //   let location = trun(item.location);
        //   item.location = location;
        //   item.bounds = getBoundsList(item);
        //   // 每当有一个数据,就添加一个false
        //   this.berthPolylineChangeList.push(false);
        // }
        console.log(this.berthPolylineChangeList);
      }
    },
    //开启泊位新增功能
    openAddBerth() {
      this.$message.success('开启新增泊位');
      this.isBerthClick = true;
      this.isClickAddBerth = true;
      this.isShowPortBox = false;
      // 关闭信息窗之前先清空验证信息
      this.resetFilesData();
      // 关闭泊位信息框
      for (const i in this.berthPolylineChangeList) {
        this.$set(this.berthPolylineChangeList, i, false);
      }
    },
    // ----------------------地图方法--------------------
    getLngLat(location, map) {
      console.log(this.isPortClick);
      // 第一次点击地图,不绘制范围又了信息框之后开始绘制
      if (this.isShowaddBounds) {
        if (this.isEndpolygon) {
          this.addBoundsList.push([location.R, location.Q]);
        }
        // 计算面积
        let area = Math.round(AMap.GeometryUtil.ringArea(this.addBoundsList));
        this.addPortData.area = area;
      }
      if (this.isShowaddBerthBounds) {
        // if (this.isEndpolygon) {
        this.addBerthBoundsList.push([location.R, location.Q]);
        // }
        // 计算面积
        // let area = Math.round(AMap.GeometryUtil.ringArea(this.addBoundsList));
      }
      if (this.isPortClick) {
        this.cloneAddPortData = _.cloneDeep(this.addPortData);
        this.addPortData.location.latitude = location.latitude;
        this.addPortData.location.longitude = location.longitude;
        this.isShowAddPortBox = true;
        this.isShowaddBounds = true;
        this.isEndpolygon = true;
        this.isPortClick = false;
      }
      //点击地图新增泊位的实现
      if ((this.isShowPortBox || this.isPolylineChange) && this.isBerthClick) {
        this.cloneAddBerthData = _.cloneDeep(this.addBerthData);
        this.addBerthData.location.latitude = location.latitude;
        this.addBerthData.location.longitude = location.longitude;
        this.isShowAddBerthBox = true;
        this.isShowaddBerthBounds = true;
        this.isBerthClick = false;
        this.isShowPortBox = false;
      }
    },
    // 获取地图的显示范围,mapZoomSise为地图层级
    async setVueMapBounds(map, val, mapZoomSize) {
      this.addPortData.zoomLevel = mapZoomSize;
      let path = [
        [val.BottomRight[0], val.BottomRight[1]],
        [val.BottomLeft[0], val.BottomLeft[1]],
        [val.TopLeft[0], val.TopLeft[1]],
        [val.TopRight[0], val.TopRight[1]],
      ];
      // 计算当前map视口面积
      let area = Math.round(AMap.GeometryUtil.ringArea(path));
      if (this.isRequest) {
        // 地图显示时候,重置查询条件,让数据根据地图的范围显示航标
        this.vueMapLocation = val;
        this.portQuery.Condition.Rect.TopLeft = trun(this.vueMapLocation.TopLeft);
        this.portQuery.Condition.Rect.TopRight = trun(this.vueMapLocation.TopRight);
        this.portQuery.Condition.Rect.BottomLeft = trun(this.vueMapLocation.BottomLeft);
        this.portQuery.Condition.Rect.BottomRight = trun(this.vueMapLocation.BottomRight);
        this.portQuery.Condition.zoomLevel = mapZoomSize;
        this.portQuery.page = 1;
        this.portQuery.size = 2147483647;
        this.portInfoList = await getPortData(this.portQuery);
      }
      if (this.portInfoList.length && area < this.portInfoList[0].area * 10) {
        if (this.isRequest) {
          // 如果当前视口有多个
          for (const i of this.portInfoList) {
            this.showPortArea(i, map);
          }
        }
      } else {
        // 点击新的港口清空前一次
        this.boundsList.length ? (this.boundsList = []) : '';
        // 不显示范围的同时取消详情的显示
        this.isShowPortBox = false;
        //关闭泊位列表的显示
        this.isBerthBox = false;
        // 可以继续请求数据
        this.isRequest = true;
        // 关闭折线编辑功能
        this.isPolylineChange = false;
        //关闭泊位信息
        this.berthInfoList = [];
        //重置泊位编辑状态
        this.berthPolylineChangeList = [];
        if (this.cloneAddBerthData.location) {
          this.deleteBerthData();
        }
      }
    },
    //-------------------------------------港口事件-----------------------------
    // 港口航标单击事件
    async mapEditPort(port, map) {
      if (port) {
        this.addBerthData.portId = port.id;
        if (this.boundsList.length) {
          // 关闭信息窗之前先清空验证信息
          this.resetFilesData();
          // 关闭泊位信息框
          for (const i in this.berthPolylineChangeList) {
            this.$set(this.berthPolylineChangeList, i, false);
          }
          this.isPortClick = false;
          this.isShowPortBox = true;
          this.isBerthBox = true;
          this.getBerthData(port.id);
          if (this.cloneAddPortData.location) {
            this.deletePortData();
            this.resetFilesData();
          }
        }
        this.portCircle = port;
        this.isShowPortBox ? (this.isRequest = false) : '';
        // 开启折线编辑功能
        this.isShowPortBox ? (this.isPolylineChange = true) : '';
      } else {
        this.isShowAddPortBox = true;
      }
    },
    //新增泊位点击事件
    btnAddBerth() {
      // 显示信息框
      this.isShowAddBerthBox = true;
      // 关闭信息窗之前先清空验证信息
      this.resetFilesData();
      // 关闭泊位信息框
      for (const i in this.berthPolylineChangeList) {
        this.$set(this.berthPolylineChangeList, i, false);
      }
    },
    // 新增港口点击事件
    btnAddPort() {
      this.isShowAddPortBox = true;
    },
    //港口折多边形辑事件
    adjustPolyline(area, boundsList) {
      console.log(boundsList);
      this.portCircle.area = area;
      this.portCircle.bounds = postBoundsList(boundsList, 'edit');
      console.log(this.portCircle);
    },
    //泊位多边形编辑事件
    adjustBerthPolyline(area, index, berthInfoList) {
      this.berthInfoList[index].area = area;
    },
    //新增港口多边形编辑事件
    addAdjustPolyline() {
      console.log(this.addPortData);
      let area = Math.round(AMap.GeometryUtil.ringArea(this.addBoundsList));
      console.log(area);
      this.addPortData.area = area;
      // this.$set(this.addPortData, 'area', area);
    },
    clickBerth(berth, index) {
      console.log(berth);
      // 清空新增数据
      this.addBerthData.location.longitude ? this.deleteBerthData() : '';
      // 关闭信息窗之前先清空验证信息
      this.resetFilesData();
      // 关闭信息框
      this.isShowPortBox = false;
      this.isShowAddBerthBox = false;
      for (const i in this.berthPolylineChangeList) {
        i == index ? this.$set(this.berthPolylineChangeList, i, true) : this.$set(this.berthPolylineChangeList, i, false);
      }
    },
    // 显示范围
    showPortArea(port, map) {
      // 点击新的港口清空前一次
      this.boundsList.length ? (this.boundsList = []) : '';

      this.boundsList = getBoundsList(port);
    },
    // 关闭港口详细信息
    closePortBox(val, index) {
      console.log(val);
      val == 'data' ? (this.isShowPortBox = false) : '';
      if (val == 'add') {
        this.isShowAddPortBox = false;
        // 关闭了继续编辑范围
        this.isEndpolygon = true;
      }
      // 点击关闭时,清空当前显示的数据
      if (val == 'cancel') {
        this.isPortClick = true;
        this.deletePortData();
        // 重置验证数据
        this.resetFilesData();
      }
      // 点击关闭时,清空当前泊位显示的数据
      if (val == 'berthCancel') {
        this.deleteBerthData();
        // 重置验证数据
        this.resetFilesData();
      }
      if (val == 'berthAdd') {
        this.isShowAddBerthBox = false;
      }
      if (val == 'berthData') {
        console.log(index);
        this.isShowAddBerthBox = false;
        // 取消显示当前点击得泊位得详细信息
        this.$set(this.berthPolylineChangeList, index, false);
      }
    },
    // 新增港口
    async addPort(port) {
      for (const item of this.portClassList) {
        if (item) {
          return;
        }
      }
      if (this.addPortData.ident == 'ident') {
        this.$set(this.portClassList, 0, true);
        this.portTips = true;
        if (this.addPortData.name == 'Name') {
          this.$set(this.portClassList, 1, true);
          this.portTips = true;
          return;
        } else {
          return;
        }
      }

      //数据处理
      let postData = _.cloneDeep(this.addPortData);
      let location = trun(postData.location);
      postData.location = location;
      postData.bounds = postBoundsList(this.addBoundsList);
      const { data: res } = await this.$http({
        method: 'post',
        url: '/port/add',
        data: postData,
      });
      if (!res.errorCode) {
        this.portInfoList = await getPortData(this.portQuery);
        this.$message('新增港口成功');
        // this.addPortData = _.cloneDeep(this.cloneAddPortData);
        this.isPortClick = true;
        // this.addBoundsList = [];
        this.deletePortData();
      }
    },
    // 新增泊位maker点击事件
    async addBerth(berth) {
      for (const item of this.portClassList) {
        if (item) {
          return;
        }
      }
      if (this.addBerthData.ident == 'Bident') {
        this.$set(this.portClassList, 0, true);
        this.portTips = true;
        return;
      }
      let postData = _.cloneDeep(this.addBerthData);
      let location = trun(postData.location);
      postData.location = location;
      postData.bounds = postBoundsList(this.addBerthBoundsList);
      console.log(postData);
      const { data: res } = await this.$http({
        method: 'post',
        url: '/port/addberth',
        data: postData,
      });
      if (!res.errorCode) {
        this.getBerthData(postData.portId);
        this.$message('新增泊位成功');
        this.deleteBerthData();
      }
    },
    //移入PortBox事件
    mouseover() {
      console.log('进入box');
      // 移入不在继续编辑港口范围
      this.isEndpolygon = false;
      this.isShowaddBerthBounds = false;
      this.isBerthClick = false;
    },
    //移除PortBox事件
    mouseout() {
      // 移出继续编辑港口范围
      this.isEndpolygon = true;
      this.isClickAddBerth ? ((this.isShowaddBerthBounds = true), (this.isBerthClick = false)) : '';
    },
    // 移入berthBox事件
    berthMouseover() {
      this.isShowaddBerthBounds = false;
    },
    //移除berthBox事件
    berthMouseout() {
      this.isShowaddBerthBounds = true;
    },
    // 修改港口信息
    async editPort(port) {
      for (const item of this.portClassList) {
        if (item) {
          return;
        }
      }
      // 深克隆传递回去需要修改的值,避免和原本显示的数据冲突
      let postPort = _.cloneDeep(port);
      if (typeof postPort.location == 'object') {
        let location = trun(postPort.location);
        postPort.location = location;
      }
      const { data: res } = await this.$http({
        method: 'post',
        url: '/port/update',
        data: postPort,
      });
      if (!res.errorCode) {
        this.$message.success('更新港口成功');
      }
    },
    //修改泊位信息
    async editBerth(berth) {
      for (const item of this.portClassList) {
        if (item) {
          return;
        }
      }
      // 深克隆传递回去需要修改的值,避免和原本显示的数据冲突
      let postBerth = _.cloneDeep(berth);
      // 数据转换
      if (typeof postBerth.location == 'object') {
        let location = trun(postBerth.location);
        postBerth.location = location;
      }
      let bounds = postBoundsList(postBerth.bounds);
      postBerth.bounds = bounds;
      const { data: res } = await this.$http({
        method: 'post',
        url: '/port/updateberth',
        data: postBerth,
      });
      if (!res.errorCode) {
        this.$message.success('更新港口成功');
      }
    },
    // 删除港口
    async deletePort(port) {
      const confirmRlust = await this.$confirm('此操作将永久删除该港口, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http({
          method: 'post',
          url: '/port/delete',
          params: {
            id: port.id,
          },
        });
        if (!res.errorCode) {
          this.$message.success('删除港口成功');
          this.portInfoList = await getPortData(this.portQuery);
          // 点击新的港口清空前一次
          this.boundsList.length ? (this.boundsList = []) : '';
          // 不显示范围的同时取消详情的显示
          this.isShowPortBox = false;
          //关闭泊位列表的显示
          this.isBerthBox = true;
          // 可以继续请求数据
          this.isRequest = true;
          // 关闭折线编辑功能
          this.isPolylineChange = false;
        }
      } else {
        this.$message.info('取消了删除!');
      }
    },
    //删除泊位
    async deleteBerth(berth) {
      const confirmRlust = await this.$confirm('此操作将永久删除该泊位, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http({
          method: 'post',
          url: '/port/deleteberth',
          params: {
            id: berth.id,
          },
        });
        if (!res.errorCode) {
          this.$message.success('删除泊位成功');
          this.getBerthData(berth.portId);
          // 清空新增数据
          this.addBerthData.location.longitude ? this.deleteBerthData() : '';
        }
      } else {
        this.$message.info('取消了删除!');
      }
    },
    //清除港口新增数据
    deletePortData() {
      // this.isPortClick = true;
      this.addBoundsList = [];
      this.isShowaddBounds = false;
      this.addPortData = _.cloneDeep(this.cloneAddPortData);
    },
    //清除泊位新增数据
    deleteBerthData() {
      this.isBerthClick = true;
      this.addBerthBoundsList = [];
      this.isShowaddBerthBounds = false;
      this.addBerthData = _.cloneDeep(this.cloneAddBerthData);
    },
    // 重置验证数据
    resetFilesData() {
      this.portTips = false;
      for (const i in this.portClassList) {
        this.$set(this.portClassList, i, false);
      }
    },
    isShowPortTips() {
      for (const item of this.portClassList) {
        if (item) {
          this.portTips = true;
          return;
        }
      }
      this.portTips = false;
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
    this.portInfoList = await getPortData(this.portQuery);
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
    boundsList: {
      handler() {
        if (!this.boundsList.length) {
          this.isPortClick == false ? (this.isPortClick = true) : '';
        }
      },
      deep: true,
    },
  },
};
</script>
<style lang="less" scoped>
.map {
  position: relative;
  height: 84vh;
  .el-col {
    height: 100%;
  }
}
/deep/ .el-card__body {
  padding: 0;
}
.search {
  position: absolute;
  right: 50px;
  top: 110px;
}
.plan-lk-header {
  margin-bottom: 5px;
}
.berth-list {
  position: absolute;
  right: 50px;
  top: 170px;
}
.el-table {
  background-color: rgba(255, 255, 255, 0.1);
}
/deep/ .el-pagination button:disabled {
  background-color: rgba(255, 255, 255, 0);
}
/deep/ .el-pagination--small .btn-next,
.el-pagination--small .btn-prev,
.el-pagination--small .el-pager li,
.el-pagination--small .el-pager li.btn-quicknext,
.el-pagination--small .el-pager li.btn-quickprev,
.el-pagination--small .el-pager li:last-child {
  background-color: rgba(255, 255, 255, 0);
}
/deep/ .el-pagination__editor.el-input .el-input__inner {
  background-color: rgba(255, 255, 255, 0);
}
/deep/ .planSearch .el-input__inner {
  background-color: rgba(255, 255, 255, 0.1);
}
/deep/ .el-table tr {
  background-color: rgba(255, 255, 255, 0);
}
/deep/ .el-table td {
  border-bottom: 0px;
}
.el-table::before {
  height: 0px;
}
</style>
