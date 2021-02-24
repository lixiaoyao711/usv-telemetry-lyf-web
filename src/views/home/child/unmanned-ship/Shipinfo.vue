<template>
  <div>
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8" class="search-col">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="shipQuery.condition.keyword"
            clearable
            @change="changeShipData"
          >
            <el-button slot="append" @click="changeShipData" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddShip">添加无人船</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="shipInfoList" border stripe v-loading="getloading">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="无人船名称" prop="displayName"></el-table-column>
        <el-table-column label="序列号" prop="serialNumber"></el-table-column>
        <el-table-column label="摄像机序列号" prop="cameraSN"></el-table-column>
        <el-table-column label="摄像机验证码" prop="cameraValidationCode"></el-table-column>
        <el-table-column label="无人船状态" prop="runtimeInfo.state"></el-table-column>
        <el-table-column label="所属机构" prop="organization.name"></el-table-column>
        <el-table-column label="操作" fixed="right" width="165">
          <template slot-scope="scope">
            <!-- 下拉菜单 -->
            <el-dropdown
              @command="handleCommand"
              placement="bottom-start"
              @visible-change="getShipInfoById(scope)"
            >
              <el-button type="primary" size="mini">
                编辑
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="info">修改信息</el-dropdown-item>
                <el-dropdown-item command="config">修改配置</el-dropdown-item>
                <el-dropdown-item command="reset">恢复出厂设置</el-dropdown-item>
                <el-dropdown-item command="returnHome">设置返航点</el-dropdown-item>
                <el-dropdown-item v-if="!scope.row.isExecutingPlan" command="action"
                  >执行计划</el-dropdown-item
                >
                <!-- <el-dropdown-item v-else>船只正在执行计划</el-dropdown-item> -->
                <!-- <el-dropdown-item v-if="!scope.row.isExecutingPlan" command="action">执行计划</el-dropdown-item>-->
                <!-- <el-dropdown-item  command="viewPlan">查看执行中的计划</el-dropdown-item>
                <el-dropdown-item  command="viewPlan2">查看执行中的计划222</el-dropdown-item> -->

                <el-dropdown-item command="viewStatusInfo">查看状态信息</el-dropdown-item>
                <el-dropdown-item v-if="viewRunStatusFrom.state != '离线'" command="viewRunStatus"
                  >船只运行状态</el-dropdown-item
                >
                <el-dropdown-item command="onlineVideo">查看实时视频</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button type="danger" size="mini" @click="deleteShip(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页效果 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="shipQuery.page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="shipQuery.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加无人船dialog -->
    <el-dialog
      title="添加无人船"
      :visible.sync="addlogVisible"
      width="30%"
      center
      @close="closeAdd"
    >
      <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
        <el-form-item label="序列号" prop="serialNumber">
          <el-input v-model="addFrom.serialNumber" placeholder="请输入无人船序列号"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="displayName">
          <el-input v-model="addFrom.displayName" placeholder="请输入无人船名称"></el-input>
        </el-form-item>
        <el-form-item label="摄像机序列号" prop="cameraSN">
          <el-input v-model="addFrom.cameraSN" placeholder="请输入摄像机序列号"></el-input>
        </el-form-item>
        <el-form-item label="摄像机验证码" prop="cameraValidationCode">
          <el-input
            v-model="addFrom.cameraValidationCode"
            placeholder="请输入摄像机验证码"
          ></el-input>
        </el-form-item>
        <el-form-item label="最低电压(V)" prop="minimumBatteryVoltage">
          <el-input
            v-model="addFrom.minimumBatteryVoltage"
            placeholder="请输入最低电压(V)"
          ></el-input>
        </el-form-item>
        <el-form-item label="最高电压(V)" prop="maximumBatteryVoltage">
          <el-input
            v-model="addFrom.maximumBatteryVoltage"
            placeholder="请输入最高电压(V)"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属机构" prop="organizationId">
          <el-select placeholder="请选择" v-model="addFrom.organizationId" clearable>
            <el-option
              v-for="item in organInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addShipInfo" :loading="addLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑无人船dialog -->
    <el-dialog
      title="编辑无人船"
      :visible.sync="editlogVisible"
      width="30%"
      center
      @close="closeEdit"
    >
      <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
        <el-form-item label="名称" prop="displayName">
          <el-input v-model="editFrom.displayName"></el-input>
        </el-form-item>
        <el-form-item label="摄像机序列号" prop="cameraSN">
          <el-input v-model="editFrom.cameraSN"></el-input>
        </el-form-item>
        <el-form-item label="摄像机验证码" prop="cameraValidationCode">
          <el-input v-model="editFrom.cameraValidationCode"></el-input>
        </el-form-item>
        <el-form-item label="最低电压(V)" prop="minimumBatteryVoltage">
          <el-input
            v-model="editFrom.minimumBatteryVoltage"
            placeholder="请输入最低电压(V)"
          ></el-input>
        </el-form-item>
        <el-form-item label="最高电压(V)" prop="maximumBatteryVoltage">
          <el-input
            v-model="editFrom.maximumBatteryVoltage"
            placeholder="请输入最高电压(V)"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属机构" required prop="organizationId">
          <el-select placeholder="请选择" v-model="editFrom.organizationId" clearable>
            <el-option
              v-for="item in organInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editShip" :loading="editinfoLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改配置无人船dialog -->
    <el-dialog
      title="配置状态"
      :visible.sync="configlogVisible"
      width="30%"
      center
      @close="closeConfig"
    >
      <el-form ref="configFormRef" :model="configFrom" class="configbox" :rules="configRules">
        <el-form-item>
          <span>服务器通信中断保护</span>
          <el-col>
            <el-switch
              v-model="configFrom.enableServerCommunicationCircuitBreaker"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-col>
        </el-form-item>
        <el-form-item>
          <span>遥控器通信中断保护</span>
          <el-col>
            <el-switch
              v-model="configFrom.enableRemoteControlCommunicationCircuitBreaker"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-col>
        </el-form-item>
        <el-form-item>
          <span>自动避障</span>
          <el-col>
            <el-switch
              v-model="configFrom.enableObstacleAvoidance"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-col>
        </el-form-item>
        <el-form-item>
          <span>低电量返航</span>
          <el-col>
            <el-switch
              v-model="configFrom.enableLowBatteryReturn"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-col>
        </el-form-item>
        <el-form-item v-show="configFrom.enableLowBatteryReturn" prop="thresholdBatteryLevel">
          <span>电量</span>
          <el-col>
            <el-progress
              :width="80"
              :stroke-width="6"
              type="dashboard"
              :percentage="Number(configFrom.thresholdBatteryLevel)"
              :color="colors"
            ></el-progress>
          </el-col>
          <el-col>
            <el-slider v-model="configFrom.thresholdBatteryLevel" show-input :max="99"></el-slider>
          </el-col>
          <!-- <el-col>
            <el-input v-model="configFrom.thresholdBatteryLevel" class="retrun-power" type="number"></el-input>
          </el-col>-->
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="configlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="btneditConfig" :loading="configLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 运行状态dialog -->
    <el-dialog
      title="运行状态"
      :visible.sync="viewRunStatusdialogVisible"
      width="30%"
      center
      @close="closeViewRunStatus"
      @opened="openedViewRunStatus"
    >
      <el-form ref="viewRunStatusFormRef" label-width="110px" :model="viewRunStatusFrom">
        <el-row>
          <el-col :span="11">
            <el-form-item label="无人船状态">
              <el-input v-model="viewRunStatusFrom.state" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="软件版本">
              <el-input v-if="!viewRunStatusFrom.firmwareVersion" :value="``" readonly></el-input>
              <el-input v-else v-model="viewRunStatusFrom.firmwareVersion" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="硬件版本">
              <el-input v-if="!viewRunStatusFrom.hardwareVersion" :value="``" readonly></el-input>
              <el-input v-else v-model="viewRunStatusFrom.hardwareVersion" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="Gps个数">
              <el-input v-model="viewRunStatusFrom.gpsSatellites" readonly></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="viewRunStatusFrom.state != '离线'">
          <el-col :span="22">
            <el-form-item label="经纬度">
              <el-input v-model="setLocation" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="异常模块">
              <el-input v-if="viewRunStatusFrom.state == '离线'" readonly></el-input>
              <el-input v-else v-model="viewRunStatusFrom.moduleFailures" readonly></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="俯仰角">
              <el-input
                v-if="!viewRunStatusFrom.pitch || viewRunStatusFrom.state == '离线'"
                :value="``"
                readonly
              ></el-input>
              <el-input
                v-else
                v-model="Number(viewRunStatusFrom.pitch).toFixed(2) + `°`"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="电池电量">
              <el-input
                v-if="!viewRunStatusFrom.battery || viewRunStatusFrom.state == '离线'"
                :value="``"
                readonly
              ></el-input>
              <el-input
                v-else
                v-model="Number(viewRunStatusFrom.battery * 100).toFixed(2) + '%'"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="翻滚角">
              <el-input
                v-if="!viewRunStatusFrom.roll || viewRunStatusFrom.state == '离线'"
                :value="``"
                readonly
              ></el-input>
              <el-input
                v-else
                v-model="Number(viewRunStatusFrom.roll).toFixed(2) + `°`"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="方位角">
              <el-input
                v-if="!viewRunStatusFrom.yaw || viewRunStatusFrom.state == '离线'"
                :value="``"
                readonly
              ></el-input>
              <el-input
                v-else
                v-model="Number(viewRunStatusFrom.yaw).toFixed(2) + '°'"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="航行速度">
              <el-input
                v-if="!viewRunStatusFrom.velocity || viewRunStatusFrom.state == '离线'"
                :value="``"
                readonly
              ></el-input>
              <el-input
                v-else
                v-model="Number(viewRunStatusFrom.velocity).toFixed(2) + 'm/s'"
                readonly
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="viewRunStatusdialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 执行计划 -->
    <el-dialog
      title="执行计划"
      :visible.sync="actionPlanDialogTableVisible"
      width="30%"
      center
      @close="actionClose"
    >
      <el-form ref="actiomFormRef" label-width="110px" :rules="actiomRules" :model="actiomFrom">
        <el-form-item label="选择计划" prop="planId">
          <el-select placeholder="请选择" v-model="actiomFrom.planId" clearable>
            <el-option
              v-for="item in planList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="返航方式" required>
          <!-- 选择返航方式 -->
          <el-radio v-model="actiomFrom.returnMode" :label="1">直线返航</el-radio>
          <el-radio v-model="actiomFrom.returnMode" :label="2">原路返航</el-radio>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="actionPlanDialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="actionPlan" :loading="actionPlanLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 返航点 -->
    <el-dialog
      title="设置返航点"
      :visible.sync="returnHomeVisible"
      :isClick="isClick"
      width="50%"
      center
      @close="returnHomeClose"
      destroy-on-close
    >
      <div class="return-home-box">
        <Amap
          ref="amapRef"
          class="return-home"
          :returnHomeData="returnHomeData"
          :isClick="isClick"
          :returnHomeUsv="viewRunStatusFrom"
          v-loading="returnHomeLoading"
        ></Amap>
        <el-button type="primary" @click="openEdit" v-show="!isClick" class="return-home-edit"
          >编辑</el-button
        >
        <div class="return-home-edit">
          <el-button type="primary" @click="updataEdit" v-show="isClick" :loading="upDataLoading"
            >保存</el-button
          >
          <el-button type="danger" @click="cancelEdit" v-show="isClick">取消</el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="returnHomeVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 实时视频dialog -->
    <el-dialog
      title="实时视频"
      :visible.sync="onlineVideoDialogVisible"
      width="650px"
      center
      @close="closeOnlineVideo"
      destroy-on-close
    >
      <OnlineVideo :accessToken="videoTokenData.token" :url="videoTokenData.url"></OnlineVideo>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="onlineVideoDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
// 导入地图
import '@/plugins/amap';
import Amap from '@/amap/Amaps.vue';

import Breadcrumb from 'common/Breadcrumb';
// 节流函数
import { throttle, trun } from '@/utils/common';
// 事件总线
import bus from '@/components/common/bus';

// 检查token是否过期
import { checkTokenTime } from '@/utils/common';
import { viewOnlineVideo, getOnlineVideoToken } from '@/utils/request';

// 实时监控组件
import OnlineVideo from '@/components/video/OnlineVideo';

// 导入SignalR.js
import * as signalr from '@/utils/shioSignalR';

import enums from '@/utils/enums';

export default {
  name: 'Shipinfo',
  data() {
    // 自定义校验规则
    // 检查电量
    var checkPower = (rule, value, cb) => {
      //验证输入的电量范围
      const regPower = /^(([1-8][0-9]?|9[0-8]?)\.\d+|[1-9][0-9]?)$/;
      if (regPower.test(value)) {
        return cb();
      }
      cb(new Error('请输入1-99的数值'));
    };
    // 电压是否10-30
    var checkVoltage = (rule, value, cb) => {
      //验证输入的电量范围
      const regVoltage = /^([12][0-9]|30)$/;
      if (regVoltage.test(value)) {
        return cb();
      }
      cb(new Error('请输入10-30的数值'));
    };
    return {
      // 无人船状态
      loading: false,
      addLoading: false,
      getloading: false,
      configLoading: false,
      editinfoLoading: false,
      actionPlanLoading: false,
      returnHomeLoading: true,
      upDataLoading: false,
      //保存检查token的inervai,
      checkTokenInterval: null,
      // 分页数据查询条件
      shipQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
      },
      // 分页数据查询条件
      planQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 30,
      },
      total: 0,
      // 新增数据表单数据
      addFrom: {
        serialNumber: '',
        displayName: '',
        cameraSN: '',
        organizationId: null,
      },
      // 修改数据表单数据
      editFrom: {},
      // 执行计划数据
      actiomFrom: {
        planId: null,
        usvId: null,
        returnMode: 1,
      },
      //查看运行状态的setInterval
      viewRunStatusInterval: null,
      // 查看无人船状态数据
      viewRunStatusFrom: {
        // 电量
        battery: '',
        // 瞬时速度
        firmwareVersion: null,
        // 平均速度
        hardwareVersion: null,
        // gps个数
        gpsSatellites: null,
        // 经纬度
        location: {
          longitude: null,
          latitude: null,
        },
        // 异常模块
        moduleFailures: null,
        // 障碍物
        obstacleInfo: null,
        // 昂角
        pitch: 0,
        // 翻滚角
        roll: 0,
        // 无人船状态
        state: 0,
        // 航行速度
        velocity: null,
        // 方位角
        yaw: 0,
      },
      // 面包屑数据
      breadcrumbList: ['无人船管理', '信息管理'],
      // eltable数据绑定源
      shipInfoList: [
        {
          cameraSN: '',
          displayName: '',
          organization: {},
          organizationId: null,
          serialNumber: '',
          btnOne: '',
          btnTwo: '',
          btnThree: '',
          btnFour: '',
        },
      ],
      // 保存配置信息
      configFrom: {},
      masterConfigFrom: {},
      // 控制编辑按钮的开关
      isClick: false,
      // 保存无人船的id
      shipId: 0,
      // 返航点信息
      returnHomeData: [],
      // 保存下拉菜单时获取的对象
      dropdownScope: {},
      // 组织机构数据
      organInfoList: [],
      //计划数据
      planList: [],
      // iframe的src的url部分
      iframeUrl: null,
      // 视频token
      videoTokenData: {
        url: null,
        token: null,
        exp: null,
      },
      //保存视频token的过期时间
      videoTokenExptime: null,
      // 新增船只验证规则
      addRules: {
        serialNumber: [{ required: true, message: '请输入无人船序列号', trigger: 'blur' }],
        displayName: [{ required: true, message: '请输入无人船名称', trigger: 'blur' }],
        cameraSN: [{ required: true, message: '请输入摄像机序列号', trigger: 'blur' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
        cameraValidationCode: [
          { required: true, message: '请输入摄像机验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '摄像机验证码长度为6', trigger: ['blur', 'change'] },
        ],
        minimumBatteryVoltage: [
          { required: true, message: '请输入最低电压值10-30V', trigger: 'blur' },
          {
            validator: checkVoltage,
            trigger: ['blur', 'change'],
          },
        ],
        maximumBatteryVoltage: [
          { required: true, message: '请输入最高电压值10-30V', trigger: 'blur' },
          {
            validator: checkVoltage,
            trigger: ['blur', 'change'],
          },
        ],
      },
      // 修改船信息校验规则
      editRules: {
        displayName: [{ required: true, message: '请输入船只名称', trigger: 'blur' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
        cameraValidationCode: [
          { required: true, message: '请输入摄像机验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '摄像机验证码长度为6', trigger: ['blur', 'change'] },
        ],
        cameraSN: [{ required: true, message: '请输入摄像机序列号', trigger: 'blur' }],
        minimumBatteryVoltage: [
          { required: true, message: '请输入最低电压值10-30V', trigger: 'blur' },
          {
            validator: checkVoltage,
            trigger: ['blur', 'change'],
          },
        ],
        maximumBatteryVoltage: [
          { required: true, message: '请输入最高电压值10-30V', trigger: 'blur' },
          {
            validator: checkVoltage,
            trigger: ['blur', 'change'],
          },
        ],
      },
      // 修改配置信息的校验规则
      configRules: {
        thresholdBatteryLevel: [
          { required: true, message: '请输入返航电量', trigger: 'blur' },
          {
            validator: checkPower,
            trigger: 'change',
          },
        ],
      },
      // 执行计划校验规则
      actiomRules: {
        planId: [{ required: true, message: '请选择需要执行的计划', trigger: 'change' }],
      },
      configlogVisible: false,
      addlogVisible: false,
      editlogVisible: false,
      viewRunStatusdialogVisible: false,
      actionPlanDialogTableVisible: false,
      onlineVideoDialogVisible: false,
      returnHomeVisible: false,
      // 事件流编码,取消事件流等操作会用到
      usvRuntimeInfoChangedId: null,
      wsConnectedCbHandle: 0,
      wsReturnHome: 0,
      //电量百分比进度条的颜色样式
      colors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 },
      ],
      DisconnectMessage: '',
    };
  },
  methods: {
    async getShipData() {
      this.getloading = true;
      var query = this.shipQuery.condition.keyword;
      var page = this.shipQuery.page;
      var size = this.shipQuery.size;
      const { data: res } = await this.$http.get(
        `/usv/search?Condition.Keyword=${query}&Page=${page}&Size=${size}`
      );
      if (!res.errorCode) {
        this.shipInfoList = res.data.result;
        this.total = res.data.total; // 将shipInfoList得state转换成对应得无人船状态
        console.log(this.shipInfoList);
        for (const item of this.shipInfoList) {
          item.runtimeInfo.state = enums.usvState(item.runtimeInfo.state);
        }
        this.getloading = false;
      }
    },
    changeShipData() {
      this.shipQuery.page = 1;
      this.getShipData();
    },
    // 获取组织机构数据
    async getOrganData() {
      const { data: res } = await this.$http.get('/organization/all');
      if (!res.errorCode) {
        this.organInfoList = res.data;
      }
    },
    // 获取计划数据
    async getPlanData() {
      let query = this.planQuery.condition.keyword;
      let page = this.planQuery.page;
      let size = this.planQuery.size;
      const { data: res } = await this.$http.get(
        `/plan/query?Condition.Keyword=${query}&Page=${page}&Size=${size}`
      );
      if (!res.errorCode) {
        this.planList = res.data.result;
        this.loading = false;
      }
    },
    handleSizeChange(newSize) {
      this.shipQuery.size = newSize;
      this.getShipData();
    },
    handleCurrentChange(newPage) {
      this.shipQuery.page = newPage;
      this.getShipData();
    },
    // 显示添加dialog
    showAddShip() {
      this.addlogVisible = true;
    },
    // 显示修改dialog
    async showEditShip(id) {
      this.loading = true;
      const { data: res } = await this.$http.get(`/usv/get?id=${id}`, id);
      if (!res.errorCode) {
        console.log(res);
        this.editFrom = res.data;
        this.viewRunStatusFrom = res.data.runtimeInfo;
        this.viewRunStatusFrom.state = enums.usvState(res.data.runtimeInfo.state);
      }
    },
    // 查看状态信息的事件流函数
    showShipStatusInfo() {
      // 传入事件名,id,和回调函数
      signalr
        .subscribe('usvRuntimeInfoChanged', this.shipId, data => {
          this.viewRunStatusFrom = data;

          // 状态转换
          this.viewRunStatusFrom.state = enums.usvState(data.state);
          this.viewRunStatusFrom.location = trun(this.viewRunStatusFrom.location);
        })
        .then(data => {
          // 保存编码,是取消事件流的唯一标识
          if (data) {
            this.usvRuntimeInfoChangedId = data;
          } else {
            this.$message.error(`指定的无人船不存在或者用户没有访问指定无人船的权限`);
          }
        });
    },
    // 显示修改配置dialog
    async showConfigInfo(scope) {
      const { data: res } = await this.$http.get(`/usv/getconfig?id=${scope.row.id}`);
      if (!res.errorCode) {
        this.configlogVisible = true;
        this.masterConfigFrom = res.data;
        this.masterConfigFrom.thresholdBatteryLevel = Math.round(
          this.masterConfigFrom.thresholdBatteryLevel * 100
        );
        // 深克隆
        this.configFrom = _.cloneDeep(this.masterConfigFrom);
        // 将无人船的id保存起来,点击确定的时候用
        this.shipId = scope.row.id;
      }
    },
    // 跳转显示查看无人船状态
    async showviewRunStatus(scope) {
      console.log(scope);
      var confirmRlust = await this.$confirm('此操作将跳转到船只运行状态界面, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        // this.$router.push({
        //   path: 'viewrunstatus',
        //   query: { planId: null, usvId: scope.row.id }
        // });
        this.$router.push({
          path: 'actionplan',
          // path: `actionplan${scope.row.id}`,
          query: { usvId: scope.row.id },
          // params: { usvId: scope.row.id }
        });
      } else {
        this.$message.info('取消了跳转!');
      }
    },
    // 确定添加无人船信息
    addShipInfo: throttle(function() {
      this.btnAddShip();
    }, 3000),
    btnAddShip() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          this.addLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.addLoading = loading;
          });
          console.log(this.addLoading);
          const { data: res } = await this.$http.post('/usv/add', this.addFrom);
          if (!res.errorCode) {
            this.getShipData();
            this.$message.success('添加无人船成功');
            this.addlogVisible = false;
          }
        }
      });
    },
    // 确定编辑无人船
    editShip() {
      this.$refs.editFormRef.validate(async val => {
        if (val) {
          this.editinfoLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.editinfoLoading = loading;
          });
          const { data: res } = await this.$http.post('/usv/update', this.editFrom);
          if (!res.errorCode) {
            this.$message.success('更新数据成功');
            this.editlogVisible = false;
            this.getShipData();
            this.loading = false;
          }
        }
      });
    },
    // 确定编辑配置信息
    btneditConfig() {
      this.$refs.configFormRef.validate(async val => {
        // 验证通过,或者没有选着低电量返回.可以出发表单提交.如果只有规则会出现选择了低电量返回触发验证规则后,又取消低电量返回,再次提交无法提交的bug
        if (val || this.configFrom.enableLowBatteryReturn == false) {
          this.configLoading = true;
          // 深克隆
          this.masterConfigFrom = _.cloneDeep(this.configFrom);
          if (this.masterConfigFrom.enableLowBatteryReturn == true) {
            this.masterConfigFrom.thresholdBatteryLevel /= 100;
          }
          console.log(this.masterConfigFrom);
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.configLoading = loading;
          });
          const { data: res } = await this.$http.post(
            `/usv/setconfig?id=${this.shipId}`,
            this.masterConfigFrom
          );
          if (!res.errorCode) {
            this.configlogVisible = false;
            this.$message.success('状态配置成功');
          }
        }
      });
    },
    // 下拉框显示回调事件
    getShipInfoById(scope) {
      this.dropdownScope = scope;
      this.shipId = scope.row.id;
    },
    //下拉框选择事件
    handleCommand(command) {
      // 修改信息
      if (command == 'info') {
        this.showEditShip(this.shipId);
        this.editlogVisible = true;
      }
      // 修改配置
      if (command == 'config') {
        this.showConfigInfo(this.dropdownScope);
      }
      // 恢复出厂设置
      if (command == 'reset') {
        this.reset(this.dropdownScope);
      }
      // 设置返航点
      if (command == 'returnHome') {
        this.showReturnHome();
      }
      // 执行计划
      if (command == 'action') {
        // 不调用查看视频函数,就无法获取到token,无法播放视频
        viewOnlineVideo(this.shipId, this.videoTokenData);
        this.showAction(this.dropdownScope);
      }
      // 查看船只运行状态
      if (command == 'viewRunStatus') {
        // 不调用查看视频函数,就无法获取到token,无法播放视频
        this.viewOnlineVideo(this.dropdownScope);
        this.showviewRunStatus(this.dropdownScope);
      }

      // 测试尝试
      // if (process.env.VUE_APP_DEBUG == 1 &&command == 'viewPlan') {
      //   this.viewOnlineVideo(this.dropdownScope);
      //   this.showviewRunStatusa(this.dropdownScope);
      // }
      // if (process.env.VUE_APP_DEBUG == 1 &&command == 'viewPlan2') {
      //   this.viewOnlineVideo(this.dropdownScope);
      //   this.showviewRunStatusa22(this.dropdownScope);
      // }
      // 查看状态信息
      if (command == 'viewStatusInfo') {
        this.viewRunStatusdialogVisible = true;
      }
      // 查看实时视频
      if (command == 'onlineVideo') {
        viewOnlineVideo(this.shipId, this.videoTokenData);
        this.onlineVideoDialogVisible = true;
        // 十秒检查一次token是否快过期,快过期给新的tokne
        this.checkTokenInterval = setInterval(() => {
          if (checkTokenTime(this.videoTokenData.exp, 3600)) {
            // 更新token的函数
            getOnlineVideoToken(this.videoTokenData);
          }
        }, 10000);
      }
    },
    // 显示执行计划dialog
    showAction(scope) {
      this.getPlanData();
      this.actiomFrom.usvId = scope.row.id;
      this.actionPlanDialogTableVisible = true;
      console.log(this.dropdownScope);
    },
    // 查看无人船信息
    showViewInfo(scope) {
      let index = scope.$index;
      (this.viewFrom.shipName = scope.row.shipName),
        (this.viewFrom.sequence = scope.row.sequence),
        (this.viewFrom.organ = scope.row.organ),
        (this.viewFrom.user = scope.row.user),
        (this.viewlogVisible = true);
    },
    // 恢复出厂设置
    async reset(scope) {
      const confirmRlust = await this.$confirm('此操作将恢复出厂设置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/usv/factoryreset?id=${scope.row.id}`);
        if (!res.errorCode) {
          this.$message.success('恢复出厂设置成功');
          this.getShipData();
        }
      } else {
        this.$message.info('取消了恢复出厂设置!');
      }
    },
    // 设置返航点
    async showReturnHome() {
      this.returnHomeVisible = true;
      const { data: res } = await this.$http.get(`/usv/getreturnpoint?id=${this.shipId}`);
      console.log(res);
      if (!res.errorCode) {
        this.$set(this.returnHomeData, 0, {
          location: trun(res.data),
        });
      }
      console.log(this.returnHomeData);
      // 开启事件流
      this.wsReturnHome = signalr.connected(this.showShipStatusInfo);
    },
    //查看实时视频
    async viewOnlineVideo(scope) {
      const { data: res } = await this.$http.get(`/camera/live?usvId=${scope.row.id}`);
      if (!res.errorCode) {
        this.iframeUrl = res.data;
        // 执行获取token的函数
        this.getOnlineVideoToken();
      }
    },
    //获取实时视频token函数
    async getOnlineVideoToken() {
      const { data: videoRes } = await this.$http.get(`/camera/accesstoken`);
      if (!videoRes.errorCode) {
        // 保存token,和过期时间
        this.videoTokenData = videoRes.data;
        this.videoTokenExptime = parseInt(new Date(this.videoTokenData.expiry).getTime() / 1000);
      }
    },
    // 删除无人船信息
    async deleteShip(scope) {
      const confirmRlust = await this.$confirm('此操作将永久删除该船只, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/usv/delete?id=${scope.row.id}`);
        if (!res.errorCode) {
          this.$message.success('删除无人船成功');
          this.getShipData();
        }
      } else {
        this.$message.info('取消了删除!');
      }
    },
    // 执行计划
    async actionPlan() {
      this.$refs.actiomFormRef.validate(async val => {
        if (val) {
          this.actionPlanLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.actionPlanLoading = loading;
          });
          const { data: res } = await this.$http.post(`/plan/execute`, this.actiomFrom);
          console.log(this.actiomFrom);
          if (!res.errorCode) {
            this.$message.success('开始执行计划');
            this.getShipData();
            this.$router.push({
              path: `actionplan`,
              query: { usvId: this.actiomFrom.usvId },
              // parmas:{ usvId: this.actiomFrom.usvId }
            });
          }
        }
      });
    },
    // 新增dialog关闭事件
    closeAdd() {
      this.$refs.addFormRef.resetFields();
    },
    // 编辑dialog关闭事件
    closeEdit() {
      this.$refs.editFormRef.resetFields();
      this.dropdownScope = {};
    },
    // 关闭执行计划
    actionClose() {
      this.$refs.actiomFormRef.resetFields();
      this.actiomFrom.returnMode = 1;
    },
    // 关闭设置返航点
    returnHomeClose() {
      // 关闭时重置按钮个loading的状态
      this.isClick = false;
      this.returnHomeLoading = true;
      // 通过传回编码关闭事件流,要将他以数组传回去
      // 重置DisconnectMessage的内容
      signalr.unsubscribe([this.usvRuntimeInfoChangedId]);
      signalr.unconnected(this.wsReturnHome);
    },
    //关闭配置信息
    closeConfig() {
      this.loading = false;
      this.$refs.configFormRef.resetFields();
      this.dropdownScope = {};
    },
    // 打开查看运行状态dialog事件
    openedViewRunStatus() {
      //将setInterval保存下来,查看运行状态dialog关闭的时候停止setInterval
      // this.viewRunStatusInterval = setInterval(() => {
      //   this.showEditShip(this.shipId);
      // }, 3000);
      if (this.DisconnectMessage) {
        this.option = this.$message({
          type: 'error',
          message: this.DisconnectMessage,
          duration: 0,
        });
      }
      // 开启事件流
      this.wsConnectedCbHandle = signalr.connected(this.showShipStatusInfo);
    },
    // 关闭查看运行状态dialog事件
    closeViewRunStatus() {
      this.viewRunStatusdialogVisible = false;
      // 通过传回编码关闭事件流,要将他以数组传回去
      // 重置DisconnectMessage的内容
      signalr.unsubscribe([this.usvRuntimeInfoChangedId]);
      signalr.unconnected(this.wsConnectedCbHandle);

      this.option ? this.option.close() : '';
    },
    //关闭查看实时视频的dialog时间
    closeOnlineVideo() {
      // 关闭定时器
      clearInterval(this.checkTokenInterval);
    },
    // 打开编辑功能
    openEdit() {
      this.isClick = true;
    },
    // 取消编辑功能
    cancelEdit() {
      this.isClick = false;
    },
    // 保存编辑
    async updataEdit() {
      this.isClick = false;
      this.upDataLoading = true;

      let location = this.returnHomeData[0].location;
      let postLocation = trun(this.returnHomeData[0].location);
      // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
      // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
      bus.$on('loading', ({ loading }) => {
        this.upDataLoading = loading;
      });
      console.log(this.returnHomeData[0].location);
      const { data: res } = await this.$http.post(
        `/usv/setreturnpoint?id=${this.shipId}&location=${location.latitude}%2C${location.longitude}`,
        postLocation
      );
      if (!res.errorCode) {
        this.$message.success('更新返航点成功');
      }
    },
  },
  created() {
    this.getShipData();
    this.getOrganData();
    this.getPlanData();
  },
  components: {
    Breadcrumb,
    OnlineVideo,
    Amap,
  },
  computed: {
    //通过计算属性返回经纬度,因为v-model 不能绑定两个数据
    setLocation() {
      return (
        Number(this.viewRunStatusFrom.location.latitude) +
        ',' +
        Number(this.viewRunStatusFrom.location.longitude)
      );
    },
  },
  beforeMount() {},
  mounted() {
    bus.$on('Disconnect', ({ message }) => {
      this.DisconnectMessage = message;
    });
    bus.$on('returnHome', ({ val }) => {
      this.returnHomeLoading = val;
    });
  },
  watch: {
    // DisconnectMessage变化了证明事件流连接关闭了
    DisconnectMessage() {
      if (this.viewRunStatusdialogVisible && this.DisconnectMessage) {
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
.search-col {
  margin-right: 30px;
}
.el-select {
  width: 100%;
}
.configbox {
  text-align: center;
}
.retrun-power {
  width: 60px;
}
/deep/ .retrun-power .el-input__inner {
  text-align: center;
}
// 关闭el-input为type类型时的上下箭头
/deep/ input::-webkit-outer-spin-button,
/deep/ input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
/deep/ input[type='number'] {
  -moz-appearance: textfield;
}
.el-dropdown {
  margin-right: 10px;
}
/deep/ .el-dropdown-item {
  text-align: center;
}
.return-home-box {
  position: relative;
}
.return-home {
  height: 50vh;
}
.return-home-edit {
  position: absolute;
  bottom: 10px;
  right: 90px;
}
</style>
