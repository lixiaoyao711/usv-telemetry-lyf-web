<template>
  <div class="plan">
    <div class="plan-show">
      <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
      <el-card>
        <el-row class="showPlanName">
          <el-col>
            <h2 :v-model="showPlanName">{{ showPlanName }}</h2>
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
              :routerTrackLineLoca="routerTrackLine"
              :routerTrackLineTwoLoca="routerTrackLineTwo"
              :targetDistance="targetDistance"
              :setmanned="setmanned"
              ref="amap"
            ></Amap>
          </el-col>
          <!-- 计划列表 -->
          <el-col :span="5">
            <el-row class="plan-lk-header">
              <el-col :span="12">
                <h3>
                  计划列表
                  <i class="el-icon-circle-plus-outline" @click="showAdd"></i>
                </h3>
              </el-col>
              <el-col :span="12">
                <div class="planSearch">
                  <el-input v-model="planQuery.condition.keyword" size="mini" placeholder="输入计划关键字" @input="planSearceFun" />
                </div>
              </el-col>
            </el-row>
            <!-- 表格 -->
            <el-table :data="planList" border @cell-click="changeTable" v-loading="loading" highlight-current-row ref="planistTable">
              <el-table-column label="#" type="index" width="35px"></el-table-column>
              <el-table-column label="计划名称" prop="name"></el-table-column>
              <el-table-column label="操作" width="63px">
                <template slot-scope="scope">
                  <!-- 修改 -->
                  <i class="el-icon-edit" @click="showEdit(scope)"></i>
                  <!-- 删除 -->
                  <i class="el-icon-delete" @click="deletePlan(scope)"></i>
                </template>
              </el-table-column>
            </el-table>
            <!-- 计划分页功能 -->
            <el-pagination
              small
              @current-change="planCurrentChange"
              :current-page.sync="planQuery.page"
              :page-size="planQuery.size"
              :pager-count="5"
              layout="prev, pager, next, jumper"
              :total="planQuery.total"
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
            <el-input v-model="LatiLongConversion.setLatiLong" class="LngLatInput-wgs"></el-input>
          </div>
        </div>
        <span class="footbox-locaton-span">区域:</span>
        <el-input @input="changeAddress" v-model="address" class="LngLatInput"></el-input>
        <el-button type="primary" @click="addPoints" v-show="!isClick && !isRouteTrack">编辑航线</el-button>
        <el-button type="primary" @click="drawPlanPoints" v-show="isClick" :loading="isUpData">保存</el-button>
        <el-button type="danger" @click="cancelMarker" v-show="isClick">取消编辑</el-button>
        <el-button type="primary" @click="routeTrackpan" v-show="!isClick && !isRouteTrack">轨迹跟踪</el-button>
        <el-button type="primary" @click="stopRouteTrack" v-show="!isClick && isRouteTrack">停止轨迹跟踪</el-button>
        <el-button type="danger" @click="clearRouteTrack" v-show="!isClick && routerTrackLine[0] && !isRouteTrack">清除轨迹</el-button>
        <el-button type="primary" @click="showAction" v-show="!isClick && !isRouteTrack">执行计划</el-button>
      </el-col>
      <!-- 添加dialog -->
      <el-dialog
        title="添加计划"
        :visible.sync="addlogVisible"
        width="30%"
        center
        @close="closeAdd"
      >
        <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
          <el-form-item label="计划名称" prop="name">
            <el-input v-model="addFrom.name" placeholder="请输入计划名称" clearable></el-input>
          </el-form-item>
          <el-form-item v-if="this.role == 'Administrator'" label="组织机构" prop="organizationId">
            <el-select placeholder="请选择" v-model="addFrom.organizationId" clearable>
              <el-option v-for="item in organInfoList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addPlan" :loading="isaddlogVisible">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改计划 -->
      <el-dialog title="修改计划" :visible.sync="editlogVisible" width="30%" center @close="closeEdit" @opened="openEdit">
        <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
          <el-form-item label="计划名称" prop="name">
            <el-input v-model="editFrom.name" placeholder="请输入计划名称"></el-input>
          </el-form-item>
          <el-form-item v-if="this.role == 'Administrator'" label="组织机构" prop="organizationId">
            <el-select placeholder="请选择" v-model="editFrom.organization.name" clearable>
              <el-option v-for="item in organInfoList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editPlan" :loading="iseditlogVisible">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 执行计划 -->
      <el-dialog title="执行计划" :visible.sync="actionPlanDialogTableVisible" width="30%" center @closed="actionPlanClosed($event)">
        <el-form ref="actiomFormRef" label-width="110px" :rules="actiomRules" :model="actiomFrom">
          <el-form-item label="执行计划船只" prop="usvId">
            <el-select placeholder="请选择" v-model="actiomFrom.usvId" clearable>
              <el-option v-for="item in shipInfoList" :key="item.id" :label="item.displayName" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- 选择返航方式 -->
            <el-radio v-model="actiomFrom.returnMode" :label="1">{{
              enums.returnMode(1)
            }}</el-radio>
            <el-radio v-model="actiomFrom.returnMode" :label="2">{{
              enums.returnMode(2)
            }}</el-radio>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="routerAplan">取 消</el-button>
          <el-button type="primary" @click="actionPlan($event)" :loading="actionPlanLoad"
            >确 定</el-button
          >
        </span>
      </el-dialog>
      <!-- 轨迹跟踪 -->
      <el-dialog title="轨迹跟踪" :visible.sync="routeTrackDialogTableVisible" width="30%" center>
        <el-form ref="routeTrackFormRef" label-width="110px" :rules="routeTrackRules" :model="routeTrackFrom">
          <el-form-item label="绘制轨迹船只" prop="usvId">
            <el-select placeholder="请选择" v-model="routeTrackFrom.usvId" clearable>
              <el-option v-for="item in shipInfoList" :key="item.id" :label="item.displayName" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="routeTrackFalse">取 消</el-button>
          <el-button type="primary" @click="routeTrackPlan" :loading="isrouteTrackFalse"
            >确 定</el-button
          >
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
import enums from '@/utils/enums';
import { debounce, trun } from '@/utils/common';

export default {
  name: 'Plan',
  components: {
    Breadcrumb,
    Amap,
    amapleft,
    amapright,
    ActionPlan
  },
  data() {
    return {
      enums: enums,
      ismarker: false,
      loading: true,
      visible: false,
      isClick: false,
      // 区域搜索框
      address: '',
      // 登录用户的角色
      role: window.localStorage.role,
      // 分页数据查询条件==计划
      planQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
        // 计划总分页数
        total: null,
      },
      // 分页数据查询条件==船只
      shipQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 10,
      },
      // 删除后展示的标题
      showNull: {
        name: '请选择需要执行的计划',
      },
      //经纬度
      lnglat: {
        longitude: null,
        latitude: null,
        value: null,
      },
      // 计划信息
      setMeasurement: null,
      search: '',
      // 船只信息
      setmanned: null,
      //正在执行计划的船只
      shipList: [],
      editPlanPoint: {},
      planInformiation: {},
      objectLnglat: {
        // 计划id
        telemetryPlanId: null,
        fixes: [],
      },
      pointList: [],
      visible: false,
      addlogVisible: false,
      editlogVisible: false,
      actionPlanDialogTableVisible: false,
      // 路线跟踪
      routeTrackDialogTableVisible: false,
      routerTrackLine: [],
      routerTrackLineTwo: [],
      isRouteTrack: false,
      routerTrackLineTime: null,
      isrouteTrackFalse: false,
      // 执行计划
      actionPlanLoad: false,
      showPlanName: '请新增需要执行的计划',
      organInfoList: [],
      planList: [],
      shipInfoList: [],
      addFrom: {
        name: '',
        organizationId: window.localStorage.organizationId,
      },
      editFrom: {
        name: '',
        organizationId: null,
        organization: {},
      },
      actiomFrom: {
        planId: null,
        usvId: null,
        returnMode: 1,
      },
      routeTrackFrom: {
        planId: null,
        usvId: null,
      },
      drawer: false,
      breadcrumbList: ['测量计划管理', '计划管理'],
      // 校验规则
      editRules: {
        name: [
          {
            required: true,
            message: '请输入计划名称',
            trigger: 'blur',
          },
        ],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
      },
      addRules: {
        name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
      },
      actiomRules: {
        usvId: [{ required: true, message: '请选择要执行计划的船只', trigger: 'change' }],
      },
      // 选择自动绘制轨迹的船只
      routeTrackRules: {
        usvId: [{ required: true, message: '请选择需要绘制轨迹船只', trigger: 'change' }],
      },
      // 经纬度按照指定规则转换
      LatiLongConversion: {
        sridWgs84: 'wgs84',
        sridGcj02: 'gcj02',
        setLatiLong: ''
      },
      // 当前位置与指定标点虚线绘制
      targetDistance: [],
      // loading确认变量
      isUpData: false,
      iseditlogVisible: false,
      isaddlogVisible: false,
      // 保存未修改的点标记信息
      oldPointList: [],
      currentRowIndex: null,
      //船只信息id
      usvRuntimeInfoChangedId: null,
      wsConnectedCbHandle: 0,
      // iframe的src的url部分
      iframeUrl: null,
      // 视频token
      videoTokenData: {},
      //保存视频token的过期时间
      videoTokenExptime: null,
      // 更新token
      TokenUpdateTime: null,
      // 搜索防抖
      searchTime: null,
      DisconnectMessage: '',
    };
  },
  props: {},
  methods: {
    // =====================页面加载获取数据==================
    // 获取组织机构数据
    async getOrganData() {
      const { data: res } = await this.$http.get('/organization/all');
      if (!res.errorCode) {
        // console.log(res); 解决
        this.addFrom.organizationId = this.addFrom.organizationId == 1 ? null : this.addFrom.organizationId;
        if (this.role == 'Administrator') {
          this.addFrom.organizationId = null;
        }
        this.organInfoList = res.data;
      }
    },
    // 从数据库请求计划列表
    async getPlanData(judge) {
      // jude为数字表示要跳转的计划下标
      // jude为字符表示默认不跳转
      // jude为空表示默认跳转到小标0
      let query = this.planQuery.condition.keyword;
      let page = this.planQuery.page;
      let size = this.planQuery.size;
      const { data: res } = await this.$http.get(
        `/plan/query?Condition.Keyword=${query}&Page=${page}&Size=${size}`
      );
      if (!res.errorCode) {
        // 数据库获取并且赋值给 planList===============
        this.planList = res.data.result;
        console.log(this.planList);
        this.planQuery.total = res.data.total;
        for (let val of this.planList) {
          for (let vals of val.fixes) {
            vals.location = trun(vals.location);
          }
        }
        this.loading = false;
        if (this.planList.length == 0 && this.planQuery.condition.keyword == '') {
          this.$alert('当前没有计划，请选择新建计划后执行后续操作');
        } else if (!judge || judge < 0) {
          // 刷新页面进行默认页面显示，数据删除第一个
          this.changeTable(this.planList[0]);
        } else if (judge >= this.planList.length) {
          // 删除最后一个数据
          this.changeTable(this.planList[judge - 1]);
        }
        // else if (judge != '') {
        //   // 页面切换，不跳转
        //   console.log('不跳转');
        // }
        else {
          // judge 为需要高亮的行数
          this.changeTable(this.planList[judge]);
        }
      }
    },
    //从数据库请求船只列表
    async getShipData() {
      let query = this.shipQuery.condition.keyword;
      let page = this.shipQuery.page;
      let size = this.shipQuery.size;
      const { data: res } = await this.$http.get(
        `/usv/search?Condition.Keyword=${query}&Page=${page}&Size=${size}`
      );
      if (!res.errorCode) {
        // console.log(res); 解决
        this.shipInfoList = res.data.result;
        this.total = res.data.total;
        this.loading = false;
      }
    },
    // 调用Usv接口做一个token更新
    async setTokenUpdata() {
      const { data: res } = await this.$http.get(`usv/get?id=${this.routeTrackFrom.usvId}`);
    },
    // ======================页面加载数据获取结束==================
    // =========================计划操作开始=======================
    // 选择计划==列表高亮
    setCurrent(row) {
      this.$refs.planistTable.setCurrentRow(row);
    },
    planCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.planQuery.page = val;
      setTimeout(() => {
        this.getPlanData();
      }, 150);
    },
    // 选择计划==点击选择
    changeTable(row) {
      if (row) {
        // 计划被点击详细信息================
        this.objectLnglat.telemetryPlanId = row.id;
        for (let i in this.planList) {
          if (this.planList[i].id == this.objectLnglat.telemetryPlanId) {
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
        this.showPlanName = row.name;
        // 清空数组
        row.fixes.sort((a, b) => a.order - b.order);
        this.objectLnglat.fixes.splice(0, this.objectLnglat.fixes.length);
        // 排序
        row.fixes.sort(function(a, b) {
          return a.order - b.order;
        });
        for (let x in row.fixes) {
          this.$set(this.objectLnglat.fixes, this.objectLnglat.fixes.length, {
            location: {
              latitude: row.fixes[x].location.latitude,
              longitude: row.fixes[x].location.longitude,
            },
            order: row.fixes[x].order,
          });
        }
        this.pointList = this.objectLnglat.fixes;
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
    // 选择正在执行计划的船只
    async changeActionPlanShip(row) {
      const { data: res } = await this.$http.get(`/plan/getexecutioncontext?usvId=${row.id}`);
      if (!res.errorCode) {
        console.log(res);
        this.setMeasurement = res.data;
        this.$message.success('获取成功');
      }
    },
    // 添加计划==对话框开启
    showAdd() {
      this.addlogVisible = true;
    },
    // 添加计划
    addPlan() {
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          this.isaddlogVisible = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.isaddlogVisible = loading;
          });
          const { data: res } = await this.$http.post(`/plan/add`, this.addFrom);
          if (!res.errorCode) {
            console.log(res);
            this.addlogVisible = false;
            this.getPlanData();
            setTimeout(() => {
              this.isaddlogVisible = false;
            }, 150);
          }
        }
      });
    },
    // 添加计划==对话框关闭==回调事件
    closeAdd() {
      this.$refs.addFormRef.resetFields();
    },
    // 计划搜索
    planSearceFun: debounce(function() {
      this.planQuery.page = 1;
      this.getPlanData();
    }, 300),
    // 修改计划==对话框开启
    async showEdit(scope) {
      // 获得需要高亮显示的函数
      // this.currentRowIndex = scope.$index;
      const { data: res } = await this.$http.get(`/plan/get?id=${scope.row.id}`);
      if (!res.errorCode) {
        console.log(res);
        this.editFrom = res.data;
      }
      this.editlogVisible = true;
    },
    // 修改计划
    editPlan() {
      this.$refs.editFormRef.validate(async val => {
        if (val) {
          this.iseditlogVisible = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.iseditlogVisible = loading;
          });
          const { data: res } = await this.$http.post(`/plan/modify`, this.editFrom);
          if (!res.errorCode) {
            console.log(res);
            this.getPlanData(this.currentRowIndex);
            setTimeout(() => {
              this.iseditlogVisible = false;
            }, 150);
          }
        }
      });
    },
    // 执行计划==对话框开启
    showAction() {
      this.actionPlanDialogTableVisible = true;
    },
    // 执行计划
    actionPlan(val) {
      // 获取当前的计划id
      this.actiomFrom.planId = this.objectLnglat.telemetryPlanId;
      this.$refs.actiomFormRef.validate(async val => {
        if (val) {
          this.viewOnlineVideo(this.actiomFrom.usvId);
          this.actionPlanLoad = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.actionPlanLoad = loading;
          });
          const { data: res } = await this.$http.post(`/plan/execute`, this.actiomFrom);
          if (!res.errorCode) {
            console.log(res);
            // 获取船id和计划id进行查询
            this.$router.push({
              path: 'actionplan',
              query: {
                usvId: this.actiomFrom.usvId,
              },
            });
            this.actionPlanDialogTableVisible = false;
            this.$message.success('执行计划成功');
            setTimeout(() => {
              this.actionPlanLoad = false;
            }, 150);
          }
        }
      });
    },
    // 执行计划==对话框关闭
    routerAplan() {
      this.actionPlanDialogTableVisible = false;
      this.actionPlanLoad = false;
    },
    // 执行计划==对话框关闭==回调事件
    actionPlanClosed() {
      console.log('执行计划对话框被关闭');
    },
    //计划更新上传
    async drawPlanPoints() {
      this.isUpData = true;
      // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
      // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
      bus.$on('loading', ({ loading }) => {
        this.isUpData = loading;
      });

      let objectLnglat = JSON.parse(JSON.stringify(this.objectLnglat));
      for (let val of objectLnglat.fixes) {
        val.location = trun(val.location);
      }
      const { data: res } = await this.$http.post(`/plan/updatefixes`, objectLnglat);

      if (!res.errorCode) {
        // console.log(res); 解决
        this.getPlanData(this.currentRowIndex);
        this.isClick = false;
        this.$message.success('计划已经更新上传');
        this.option ? this.option.close() : '';
      }
    },
    // 计划列表删除计划
    async deletePlan(scope) {
      // 获得需要高亮显示的函数
      const confirmRlust = await this.$confirm('此操作将永久删除该计划, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/plan/delete?id=${scope.row.id}`);
        if (!res.errorCode) {
          // console.log(res); 解决
          this.$message.success('删除计划成功');
          this.pointList = [];
          if (this.planList.length <= 1 && this.planQuery.page > 1) {
            this.planQuery.page -= 1;
            this.getPlanData();
          } else {
            this.getPlanData(this.currentRowIndex);
          }
        }
      } else {
        this.$message.info('取消了删除');
      }
    },
    // ======================计划操作结束===================
    // ======================地图操作开始===================
    //添加点==功能开启
    addPoints() {
      this.isClick = true;
      this.oldPointList = JSON.parse(JSON.stringify(this.objectLnglat.fixes));
      if (this.DisconnectMessage) {
        this.option = this.$message({
          type: 'error',
          message: this.DisconnectMessage,
          duration: 0,
        });
      }
    },
    // 取消编辑点==工能关闭
    cancelMarker() {
      this.isClick = false;
      this.pointList = JSON.parse(JSON.stringify(this.oldPointList));
      this.objectLnglat.fixes = this.pointList;
      this.option ? this.option.close() : '';
    },
    //计划标记点==点击地图设置
    getLngLat(data) {
      // console.log(data); 解决
      this.lnglat = data;
      this.$set(this.objectLnglat.fixes, this.objectLnglat.fixes.length, {
        location: { latitude: data.latitude, longitude: data.longitude },
        order: this.objectLnglat.fixes.length + 1,
      });
      this.index++;
    },
    // 经纬度查看
    ViewLocation(data) {
      this.lnglat = data;
    },
    // 修改区域==地图中心变化
    changeAddress: debounce(function() {
      if (this.address) {
        this.$refs.amap.getMapCenter(this.address);
      }
    }, 300),
    // wgs48经纬度转换
    setWgsFun: debounce(
      async function() {
        const { data: res } = await this.$http.get(
          `geography/convert?coord=${this.lnglat.value}&srid=${this.LatiLongConversion.sridWgs84}`
        );
        if (!res.errorCode) {
          // console.log(res); //解决
          let location = trun(res.data);
          this.LatiLongConversion.setLatiLong = location.latitude + ',' + location.longitude;
        }
      },
      300,
      true
    ),
    // 绘制轨迹==对话框开启
    routeTrackpan() {
      this.routeTrackDialogTableVisible = true;
    },
    // 绘制轨迹
    routeTrackPlan() {
      this.$refs.routeTrackFormRef.validate(async val => {
        if (val) {
          // loading
          this.isrouteTrackFalse = true;
          this.routeTrackPlanTime(true);
        }
      });
    },
    async routeTrackPlanTime(requireOnline) {
      // 获取当前的计划id
      this.actiomFrom.planId = this.objectLnglat.telemetryPlanId;
      // 优先监测船只是否处于离线状态，否则执行后面数据获取
      const { data: res } = await this.$http.get(`usv/get?id=${this.routeTrackFrom.usvId}`);
      if (!res.errorCode) {
        console.log(res); //解决
        if (res.data.runtimeInfo.state != 0) {
        
          //点击轨迹绘制，执行amaps内的回调函数，进行判断并且执行
          this.$refs.amap.onCompleted(x => this.$refs.amap.clickMapCenter());
          this.wsConnectedCbHandle = signalr.connected(this.routeTrackShow);
          // 5分钟获取一次token
          this.TokenUpdateTime = setInterval(() => {
            this.setTokenUpdata();
          }, 300000);
        } else {
          this.$message.info('当前船只处于离线状态,无法绘制轨迹');
          this.isrouteTrackFalse = false;
        }
      }
    },
    routeTrackShow(event, id) {
      signalr
        .subscribe('usvRuntimeInfoChanged', this.routeTrackFrom.usvId, res => {
          if (res) {
            this.setmanned = res;
            if (res.state != 0 || !requireOnline) {
              // 不能存放相同的经纬度
              if (res.location != null) {
                res.location = trun(res.location);
                res.wgs84Location = trun(res.wgs84Location);
                res.calibratedLocation = trun(res.calibratedLocation)
                const isLine = this.routerTrackLine.some(item => {
                  return res.location.longitude == item[0] && res.location.latitude == item[1];
                });
                if (!isLine) {
                  this.$set(this.routerTrackLine, this.routerTrackLine.length, [res.location.longitude, res.location.latitude]);
                }

                // 不能存放相同的第二条经纬度
                const isLineTwo = this.routerTrackLineTwo.some(item => {
                  return res.calibratedLocation.longitude == item[0] && res.calibratedLocation.latitude == item[1];
                });
                if (!isLineTwo) {
                  this.$set(this.routerTrackLineTwo, this.routerTrackLineTwo.length, [
                    res.calibratedLocation.longitude,
                    res.calibratedLocation.latitude
                  ]);
                }
              }
            }
          } else {
            this.$message.error('指定的无人船不存在或者用户没有访问指定无人船的权限!!');
          }
        })
        .then(codingId => {
          this.isRouteTrack = true;
          this.isrouteTrackFalse = false;
          this.routeTrackDialogTableVisible = false;
          this.usvRuntimeInfoChangedId = codingId;
        });
    },
    // 轨迹跟踪==对话框关闭
    routeTrackFalse() {
      this.routeTrackDialogTableVisible = false;
      this.isrouteTrackFalse = false;
    },
    // 停止轨迹跟踪
    stopRouteTrack() {
      // window.clearTimeout(this.routerTrackLineTime);
      window.clearInterval(this.TokenUpdateTime);

      signalr.unsubscribe([this.usvRuntimeInfoChangedId]);
      signalr.unconnected(this.wsConnectedCbHandle);
      this.usvRuntimeInfoChangedId = null;

      this.isRouteTrack = false;
      this.isrouteTrackFalse = false;
      // setTimeout(() => {
      //   clearTimeout(this.routerTrackLineTime);
      //   this.isRouteTrack = false;
      //   this.isrouteTrackFalse = false;
      // }, 100);
    },
    // 清除船只轨迹
    clearRouteTrack() {
      this.routerTrackLine = [];
      this.routerTrackLineTwo = [];
    },

    // ======================地图操作结束=====================
    // ==================暂时未用到=================
    clickAdd() {
      setTimeout(() => {
        this.$refs.addInput.focus();
      }, 100);
    },
    // popover隐藏事件
    hideAddInput() {
      this.addData.name = '';
    },
    //查看实时视频
    async viewOnlineVideo(id) {
      const { data: res } = await this.$http.get(`/camera/live?usvId=${id}`);
      if (!res.errorCode) {
        this.iframeUrl = res.data;
        // 执行获取token的函数
        this.getOnlineVideoToken();
      } else {
        this.$message.error(`${res.message}`);
      }
    },
    //获取实时视频token函数
    async getOnlineVideoToken() {
      const { data: videoRes } = await this.$http.get(`/camera/accesstoken`);
      if (!videoRes.errorCode) {
        // 保存token,和过期时间
        this.videoTokenData = videoRes.data;
        this.videoTokenExptime = parseInt(new Date(this.videoTokenData.expiry).getTime() / 1000);
      } else {
        this.$message.error(`${videoRes.message}`);
      }
    },
    closeEdit() {
      this.option ? this.option.close() : '';
    },
    openEdit() {
      if (this.DisconnectMessage) {
        this.option = this.$message({
          type: 'error',
          message: this.DisconnectMessage,
          duration: 0,
        });
      }
    },
  },
  created() {
    this.getPlanData();
    this.getOrganData();
    this.getShipData();
  },
  destroyed() {
    if (this.usvRuntimeInfoChangedId) {
      signalr.unsubscribe([this.usvRuntimeInfoChangedId]);
      signalr.unconnected(this.wsConnectedCbHandle);
    }

    window.clearInterval(this.TokenUpdateTime);
  },

  computed: {},
  beforeMount() {},
  mounted() {
    bus.$on('Disconnect', ({ message }) => {
      this.DisconnectMessage = message;
    });
  },
  watch: {
    // 经纬度更新==wgs转换
    lnglat() {
      this.setWgsFun('uoai');
      // debounce(this.setWgsFun(), 1500);
    },
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
  },
};
</script>

<style lang="less" scoped>
.plan {
  height: 100%;
}
.showPlanName {
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
.plan-lk-header {
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
.el-icon-circle-plus-outline {
  margin-left: 15px;
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
/deep/ .el-icon-circle-plus-outline[data-v-1bfdf00a] {
  margin-left: 0px;
}
</style>
