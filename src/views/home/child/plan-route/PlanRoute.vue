<template>
  <div class="route">
    <div>
      <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
      <el-card>
        <el-row class="showRouteName">
          <el-col>
            <h2 :v-model="showRouteName">{{ showRouteName }}</h2>
          </el-col>
        </el-row>
        <el-row class="map" :gutter="20">
          <!-- 地图 -->
          <el-col :span="19">
            <Amap
              @LngLat="getLngLat"
              @ViewLocation="ViewLocation"
              :pointDataList="pointList"
              :isClick="isClick"
              :routerTrackLine="routerTrackLine"
              :routerTrackLineTwo="routerTrackLineTwo"
              :targetDistance="targetDistance"
              :setmanned="setmanned"
              ref="amap"
            ></Amap>
          </el-col>
          <!-- 计划列表 -->
          <el-col :span="5">
            <el-row class="route-lk-header">
              <el-col :span="24">
                <h3>
                  航线列表
                  <i class="el-icon-circle-plus-outline" @click="showAddRoute"></i>
                </h3>
              </el-col>
              <el-col :span="10">
                <div>
                  <el-input
                    v-model="routeQuery.Condition.Departure"
                    size="mini"
                    placeholder="输入航线始发地"
                    @input="debounceSearch"
                  />
                </div>
              </el-col>
              <el-col :span="13">
                <div class="planSearch">
                  <el-input
                    @input="debounceDestination"
                    placeholder="请输入目的地"
                    size="mini"
                    class="input-with-select"
                    v-model="routeQuery.Condition.Destination"
                    clearable
                  />
                </div>
              </el-col>
            </el-row>
            <!-- 表格 -->
            <el-table
              :data="routeList"
              border
              @cell-click="changeTable"
              v-loading="loading"
              highlight-current-row
              ref="planistTable"
            >
              <el-table-column label="#" type="index" width="30px"></el-table-column>
              <el-table-column label="名称" prop="name" width="100px"></el-table-column>
              <el-table-column label="始发地" prop="departure" width="70px"></el-table-column>
              <el-table-column label="目的地" prop="destination" width="70px"></el-table-column>
              <el-table-column label="操作" width="62px">
                <template slot-scope="scope">
                  <!-- 修改 -->
                  <i class="el-icon-edit" @click="showEditRoute(scope)"></i>
                  <!-- 删除 -->
                  <i class="el-icon-delete" @click="delRoute(scope)"></i>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页效果 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="routeQuery.page"
              :page-sizes="[5, 10, 20, 50]"
              :page-size="routeQuery.size"
              layout="  prev, pager, next, jumper"
              :total="total"
            ></el-pagination>
          </el-col>
        </el-row>
      </el-card>
      <!-- 按钮信息区域 -->
      <el-col class="footbox">
        <div class="plan-lfn-lon">
          <div>
            <span>经纬度:</span>
            <el-input v-model="lnglat.value" class="LngLatInput"></el-input>
          </div>
          <div>
            <span>wgs84坐标:</span>
            <el-input v-model="setwgs84" class="LngLatInput-wgs"></el-input>
          </div>
        </div>
        <span class="footbox-locaton-span">区域:</span>
        <el-input
          @keyup.enter.native="changeAddress"
          v-model="address"
          class="LngLatInput"
        ></el-input>
        <el-button type="primary" @click="addPoints" v-show="!isClick && !isRouteTrack"
          >编辑航线</el-button
        >
        <el-button type="primary" @click="drawRoutePoints" v-show="isClick" :loading="isUpData"
          >保存</el-button
        >
        <el-button type="danger" @click="cancelMarker" v-show="isClick">取消编辑</el-button>
      </el-col>
      <!-- 添加航线dialog -->
      <el-dialog
        title="添加航线"
        :visible.sync="addlogVisible"
        width="30%"
        center
        @close="closeAdd"
      >
        <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
          <el-form-item label="名称" prop="name">
            <el-input v-model="addFrom.name" placeholder="请输入名称"></el-input>
          </el-form-item>
          <el-form-item label="始发地" prop="departure">
            <el-input v-model="addFrom.departure" placeholder="请输入始发地"></el-input>
          </el-form-item>
          <el-form-item label="目的地" prop="destination">
            <el-input v-model="addFrom.destination" placeholder="请输入目的地"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoute" :loading="addLoading">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑航线dialog -->
      <el-dialog
        title="编辑航线"
        :visible.sync="editlogVisible"
        width="30%"
        center
        @close="closeEdit"
      >
        <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
          <el-form-item label="航线名称" prop="name">
            <el-input v-model="editFrom.name"></el-input>
          </el-form-item>
          <el-form-item label="始发地" prop="departure">
            <el-input v-model="editFrom.departure"></el-input>
          </el-form-item>
          <el-form-item label="目的地" prop="destination">
            <el-input v-model="editFrom.destination"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoute" :loading="editinfoLoading">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
// 导入地图
import '@/plugins/amap';
import amapright from '@/components/plan/amap-information';
import amapleft from '@/components/plan/ampm-Unmanned';
import Breadcrumb from 'common/Breadcrumb';
import ActionPlan from '../plan-management/ActionPlan';
import Amap from '@/amap/Amaps.vue';
import * as signalr from '@/utils/shioSignalR';
// import ActionPlan from './ActionPlan.vue';
// 事件总线
import bus from '@/components/common/bus';
// 防抖
import { debounce, trun } from '@/utils/common';

export default {
  name: 'PlanRoute',
  //数据
  data() {
    return {
      breadcrumbList: ['航线管理'],
      // 分页查询条件
      routeQuery: {
        Condition: {
          // 始发地
          Departure: '',
          // 目的地
          Destination: '',
          Keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
      },
      total: 0,
      //经纬度
      lnglat: {
        longitude: null,
        latitude: null,
        value: null,
      },
      setwgs84: '',
      // 保存未修改的点标记信息
      oldPointList: [],
      currentRowIndex: null,
      // 区域搜索框
      address: '',
      objectLnglat: [],
      // ================from表单数据=================
      addFrom: {
        name: '',
        departure: '',
        destination: '',
      },
      editFrom: {},
      pointList: [],
      showRouteName: '请选择航线',
      isClick: false,
      isRouteTrack: false,
      routerTrackLine: [],
      routerTrackLineTwo: [],
      targetDistance: [],
      routeList: [],
      setmanned: null,
      loading: false,
      // ================dialogVisible==============
      addlogVisible: false,
      editlogVisible: false,
      // =================loading加载圈圈===========
      addLoading: false,
      getloading: false,
      editinfoLoading: false,
      isUpData: false,
      // ==============校验规则===============
      addRules: {
        name: [
          {
            required: true,
            message: '请输入航线名称',
            trigger: 'blur',
          },
        ],
        departure: [
          {
            required: true,
            message: '请输入始发地',
            trigger: 'blur',
          },
        ],
        destination: [
          {
            required: true,
            message: '请输入目的地',
            trigger: 'blur',
          },
        ],
      },
      editRules: {
        name: [
          {
            required: true,
            message: '请输入航线名称',
            trigger: 'blur',
          },
        ],
        departure: [
          {
            required: true,
            message: '请输入始发地',
            trigger: 'blur',
          },
        ],
        destination: [
          {
            required: true,
            message: '请输入目的地',
            trigger: 'blur',
          },
        ],
      },
      routeId: null,
    };
  },
  //组件传值
  props: {},
  //方法
  methods: {
    // 获取航线数据
    async getPlanRouteDate(judge) {
      let Departure = this.routeQuery.Condition.Departure;
      let Destination = this.routeQuery.Condition.Destination;
      let Keyword = this.routeQuery.Condition.Keyword;
      const { data: res } = await this.$http.get(
        `/route/search?Condition.Departure=${Departure}&Condition.Destination=${Destination}&Condition.Keyword=${Keyword}&Page=${this.routeQuery.page}&Size=${this.routeQuery.size}`
      );
      if (!res.errorCode) {
        this.routeList = res.data.result;
        for (const i of this.routeList) {
          for (const key of i.fixes) {
            let location = trun(key.location);
            key.location = location;
          }
        }
        console.log(this.routeList);
        this.total = res.data.total;
        if (judge == 'search') {
          console.log(judge);
          return '';
        }
        if (this.routeList.length == 0 && Keyword == '') {
          this.$alert('当前没有航线，请选择新建航线后执行后续操作');
          this.showRouteName = '当前没有航线，请选择新建航线后执行后续操作';
        } else if (!judge || judge < 0) {
          // 刷新页面进行默认页面显示，数据第一个
          this.changeTable(this.routeList[0]);
        } else if (judge >= this.routeList.length) {
          // 删除最后一个数据
          this.changeTable(this.routeList[judge - 1]);
        }
        // else if (judge != '') {
        //   // 页面切换，不跳转
        //   console.log('不跳转');
        // }
        else {
          // judge 为需要高亮的行数
          this.changeTable(this.routeList[judge]);
        }
      }
    },
    // ==============显示dialog事件================
    showAddRoute() {
      this.addlogVisible = true;
    },
    async showEditRoute(scope) {
      this.editlogVisible = true;
      const { data: res } = await this.$http.get(`/route/get?id=${scope.row.id}`);
      if (!res.errorCode) {
        this.editFrom = res.data;
      }
    },
    // ==================dialog确定事件==============
    addRoute() {
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          this.addLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.addLoading = loading;
          });
          const { data: res } = await this.$http.post(`/route/add`, this.addFrom);
          if (!res.errorCode) {
            this.$message.success('添加航线成功');
            this.addlogVisible = false;
            this.getPlanRouteDate();
          }
        }
      });
    },
    editRoute() {
      this.$refs.editFormRef.validate(async val => {
        if (val) {
          this.editinfoLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.editinfoLoading = loading;
          });
          const { data: res } = await this.$http.post(`/route/update`, this.editFrom);
          if (!res.errorCode) {
            this.editlogVisible = false;
            this.getPlanRouteDate(this.currentRowIndex);
            this.$message.success('更新数据成功');
          }
        }
      });
    },
    //------------ dialog关闭事件 ------------------//
    closeAdd() {
      this.addFrom = {};
    },
    closeEdit() {
      this.editFrom = {};
    },

    // 搜索框事件
    // 防抖预防多次触发调用
    debounceSearch: debounce(function() {
      this.searchDeparture();
    }, 500),
    debounceDestination: debounce(function() {
      this.searchDestination();
    }, 500),
    // ---始发地---
    searchDeparture() {
      (this.routeQuery.page = 1), this.getPlanRouteDate('search');
    },
    // ------目的地-----
    searchDestination() {
      (this.routeQuery.page = 1), this.getPlanRouteDate('search');
    },
    // ===========分页事件==============
    handleSizeChange(newSize) {
      this.routeQuery.size = newSize;
      this.getPlanRouteDate();
    },
    handleCurrentChange(newPage) {
      this.routeQuery.page = newPage;
      this.getPlanRouteDate();
    },
    //------------ dialog关闭事件 ------------------//
    closeAdd() {
      this.addFrom = {};
    },
    closeEdit() {
      this.editFrom = {};
    },
    // ------------------删除事件------------------
    async delRoute(scope) {
      const confirmRlust = await this.$confirm('此操作将永久删除该航线, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/route/delete?id=${scope.row.id}`);
        if (!res.errorCode) {
          this.$message.success('删除航线成功');
          this.pointList = [];
          if (this.routeList.length <= 1 && this.routeQuery.page > 1) {
            this.routeQuery.page -= 1;
            this.getPlanRouteDate();
          } else {
            this.getPlanRouteDate(this.currentRowIndex);
          }
        }
      } else {
        this.$message.info('取消了删除!');
      }
    },
    // 选择计划==列表高亮
    setCurrent(row) {
      this.$refs.planistTable.setCurrentRow(row);
    },
    getLngLat(data) {
      console.log(data);
      this.lnglat = data;
      this.$set(this.objectLnglat, this.objectLnglat.length, {
        location: { latitude: data.latitude, longitude: data.longitude },
        order: this.objectLnglat.length + 1,
      });
      console.log(`点操作，被点击，${this.objectLnglat}`);
      console.log(this.objectLnglat);
    },
    ViewLocation(data) {
      this.lnglat = data;
    },
    routeSearceFun() {},
    changeTable(row) {
      if (row) {
        this.routeId = row.id;
        console.log(this.routeId);
        for (let i in this.routeList) {
          if (this.routeList[i].id == this.routeId) {
            this.currentRowIndex = i;
          }
        }
        this.setCurrent(row);
        //控制切换任务时,新的任务不能直接标记点,需要点击绘制点后才能标记点
        this.isClick = false;
        this.ismarker = false;
        // 防止点击出现问题，清空删除数组
        this.$refs.amap.dels = new Set();
        // 显示当前选择任务的标题name
        this.showRouteName = row.name;
        // 清空数组
        row.fixes.sort((a, b) => a.order - b.order);
        this.objectLnglat.splice(0, this.objectLnglat.length);
        // 排序
        row.fixes.sort(function(a, b) {
          return a.order - b.order;
        });
        for (let x in row.fixes) {
          this.$set(this.objectLnglat, this.objectLnglat.length, {
            location: {
              latitude: row.fixes[x].location.latitude,
              longitude: row.fixes[x].location.longitude,
            },
            order: row.fixes[x].order,
          });
        }
        this.pointList = this.objectLnglat;
        console.log(this.pointList);
        // 每次点击清除默认小船信息
        // this.cleartables();
        // 用于判断是否自定义适应
        let isTrackLine = false;
        if (this.routerTrackLine.length != 0) {
          isTrackLine = true;
        }
        // 每次点击自适应地图标点
        this.$refs.amap.onCompleted(x => this.$refs.amap.setView());
      }
    },
    // 修改区域==地图中心变化
    changeAddress() {
      this.$refs.amap.getMapCenter(this.address);
    },
    setWgsFun: debounce(
      async function() {
        const { data: res } = await this.$http.get(
          `geography/convert?coord=${this.lnglat.value}&srid=wgs84`
        );
        if (!res.errorCode) {
          // console.log(res); //解决
          let location = trun(res.data);
          this.setwgs84 = location.latitude + ',' + location.longitude;
        }
      },
      300,
      true
    ),
    //航线更新上传
    async drawRoutePoints() {
      this.isUpData = true;
      // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
      // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
      bus.$on('loading', ({ loading }) => {
        this.isUpData = loading;
      });
      // for (const i of this.objectLnglat) {
      //   let location = trun(i.location);
      //   i.location = location;
      // }
      let objectLnglat = JSON.parse(JSON.stringify(this.objectLnglat));
      for (let val of objectLnglat) {
        val.location = trun(val.location);
      }
      console.log(this.objectLnglat);
      const { data: res } = await this.$http.post(`/route/setfix?id=${this.routeId}`, objectLnglat);
      if (!res.errorCode) {
        console.log(this.objectLnglat);
        this.getPlanRouteDate(this.currentRowIndex);
        console.log(this.currentRowIndex);
        this.isClick = false;
        this.$message.success('航点已更新');
      }
    },
    //添加点==功能开启
    addPoints() {
      // 没有航线提示用户,并且关闭编辑航线功能
      this.routeList.length
        ? (this.isClick = true)
        : this.$alert('当前没有航线，请选择新建航线后执行后续操作');

      this.oldPointList = JSON.parse(JSON.stringify(this.objectLnglat));
    },
    // 取消编辑点==工能关闭
    cancelMarker() {
      this.isClick = false;
      this.pointList = JSON.parse(JSON.stringify(this.oldPointList));
      this.objectLnglat = this.pointList;
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
    this.getPlanRouteDate();
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
    // 经纬度更新==wgs转换
    lnglat() {
      this.setWgsFun();
    },
  },
};
</script>
<style lang="less" scoped>
.route {
  height: 100%;
}
.showRouteName {
  text-align: center;
}
.map {
  height: 60vh;
  margin-top: 30px;
  position: relative;
}
.plan-block {
  height: calc(100% - 50px);
  width: 100%;
}
.route-lk-header {
  margin-bottom: 5px;
}

#container {
  height: 60vh;
  margin-top: 30px;
}
.addInput {
  margin-bottom: 10px;
}
i {
  cursor: pointer;
}
.el-icon-edit {
  margin-right: 17px;
}
.footbox {
  margin-top: 15px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .plan-lfn-lon {
    display: flex;
  }
  .footbox-locaton-span {
    min-width: 40px;
  }
}
.LngLatInput {
  width: 200px;
  margin-right: 15px;
}
.LngLatInput-wgs {
  width: 300px;
  margin-right: 15px;
}
.amap-col {
  position: relative;
  margin-right: 13px;
}
.shipList {
  position: absolute;
  width: 250px;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.3);
  top: 0;
  z-index: 1;
}
.shipInfo {
  position: absolute;
  width: 500px;
  height: 20px;
  background-color: rgba(14, 13, 13, 0.3);
  top: 0;
  right: 0;
  line-height: 22px;
}
/deep/.el-col-19 {
  height: 100%;
}
/deep/.el-table {
  background-color: transparent;
  margin-top: 0px;
}
/deep/.el-table tr {
  color: #000;
  background-color: rgba(150, 150, 150, 0.3);
}
/deep/.el-table th {
  color: #000;
  background-color: rgba(255, 255, 255, 0.1) !important;
}
/deep/ .el-pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
/deep/ .el-pagination__jump {
  margin-left: 0;
}
/deep/ .el-card__body {
  padding: 0px;
}
.planSearch {
  margin-left: 25px;
}
</style>
