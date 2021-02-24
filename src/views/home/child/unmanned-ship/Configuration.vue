<template>
  <div>
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
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
      </el-row>
      <el-table :data="shipInfoList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="无人船名称" prop="displayName"></el-table-column>
        <el-table-column label="序列号" prop="serialNumber"></el-table-column>
        <el-table-column label="所属机构" prop="organization.name"></el-table-column>
        <el-table-column label="操作" fixed="right" width="180">
          <template slot-scope="scope">
            <el-button type="success" size="mini" @click="showConfigInfo(scope)">配置</el-button>
            <el-button type="primary" size="mini" @click="showViewInfo(scope)">查看</el-button>
            <!-- <el-button type="danger" size="mini" @click="deleteConfig(scope)">删除</el-button> -->
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
    <!-- 配置无人船dialog -->
    <el-dialog title="配置状态" :visible.sync="configlogVisible" width="30%" center>
      <el-form ref="configFormRef" :model="configFrom" class="configbox">
        <el-form-item>
          <!-- 通过船是否在执行任务来决定显示暂停还是继续执行 -->
          <el-radio v-model="radio" :label="1">暂停任务</el-radio>
          <el-radio v-model="radio" :label="2">继续任务</el-radio>
          <!-- <el-row>
            <span v-if="!configFrom.resume">暂停任务</span>
            <span v-else>任务执行中</span>
            <el-col>
              <el-switch
                v-model="configFrom.resume"
                active-color="#36EF1E"
                inactive-color="#EE4949"
              ></el-switch>
            </el-col>
          </el-row>-->
        </el-form-item>
        <!-- <el-form-item v-if="false">
          <span>恢复任务</span>
          <el-col>
            <el-switch v-model="value" active-color="#36EF1E" inactive-color="#EE4949"></el-switch>
          </el-col>
        </el-form-item>-->
        <el-form-item>
          <span>停止任务</span>
          <el-col>
            <el-switch v-model="configFrom.return" active-color="#36EF1E" inactive-color="#EE4949"></el-switch>
          </el-col>
        </el-form-item>
        <el-form-item>
          <span>复位</span>
          <el-col>
            <el-switch v-model="configFrom.reset" active-color="#36EF1E" inactive-color="#EE4949"></el-switch>
          </el-col>
        </el-form-item>
        <!-- <el-form-item>
          <span>电压</span>
          <el-col>
            <el-switch v-model="value" active-color="#36EF1E" inactive-color="#EE4949"></el-switch>
          </el-col>
        </el-form-item>-->
        <el-form-item>
          <span>恢复出厂设置</span>
          <el-col>
            <el-switch
              v-model="configFrom.factoryreset"
              active-color="#36EF1E"
              inactive-color="#EE4949"
            ></el-switch>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="configlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editConfig">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 产看配置信息dialog -->
    <el-dialog title="配置详情信息" :visible.sync="viewlogVisible" width="30%" center>
      <el-form ref="detailsFormRef" label-width="110px" :model="detailsFrom">
        <el-form-item label="无人船名称" required>
          <el-input v-model="detailsFrom.shipName" readonly></el-input>
        </el-form-item>
        <el-form-item label="电池电量" required>
          <el-input v-model="detailsFrom.power" readonly></el-input>
        </el-form-item>
        <el-form-item label="运行状态" required>
          <el-input v-model="detailsFrom.status" readonly></el-input>
        </el-form-item>
        <el-form-item label="序列号" required>
          <el-input v-model="detailsFrom.sequence" readonly placeholder="与无人船建立连接时获得"></el-input>
        </el-form-item>
        <el-form-item label="硬件版本" required>
          <el-input v-model="detailsFrom.firmware" readonly placeholder="与无人船建立连接时获得"></el-input>
        </el-form-item>
        <el-form-item label="固件版本" required>
          <el-input v-model="detailsFrom.hardware" readonly placeholder="与无人船建立连接时获得"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="viewlogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Breadcrumb from 'common/Breadcrumb'

export default {
  name: "Configuration",
  data () {
    return {
      value: '',
      configlogVisible: false,
      viewlogVisible: false,
      breadcrumbList: ['无人船管理', '配置信息'],
      shipInfoList: [],
      // 分页数据查询条件
      shipQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: ''
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
      },
      // 单选框
      radio: 1,
      // 控制继续任务还是暂停任务
      configValue: {
        factoryreset: false, //恢复出厂设置
        pause: false,  //暂停任务
        resume: false,  //继续任务
        return: false,  //停止任务
        reset: false  //复位
      },
      total: 0,
      loading: true,
      configFrom: {
        factoryreset: false, //恢复出厂设置
        pause: false,  //暂停任务
        resume: false,  //继续任务
        return: false,  //停止任务
        reset: false  //复位
      },
      detailsFrom: {
        shipName: '',
        sequence: '',
        power: '',
        status: "",
        firmware: '',
        hardware: ''
      },
      test: {
        enableServerCommunicationCircuitBreaker: true,
        enableRemoteControlCommunicationCircuitBreaker: true,
        enableLowBatteryReturn: true,
        thresholdVoltage: 1,
        enableLoopCruising: true,
        loopCount: 1
      }
    }
  },
  methods: {
    async getShipData () {
      var query = this.shipQuery.condition.keyword
      var page = this.shipQuery.page
      var size = this.shipQuery.size
      const { data: res } = await this.$http.get(`/usv/search?Condition.Keyword=${query}&Page=${page}&Size=${size}`)
      if (!res.errorCode) {
        this.shipInfoList = res.data.result
        this.total = res.data.total
        this.loading = false
        console.log(res);
      }
      else {
        this.$message.error(`${res.Message}`)
      }
    },
    changeShipData () {
      this.shipQuery.page = 1
      this.getShipData()
    },
    // 配置无人船信息
    async showConfigInfo (scope) {
      this.configlogVisible = true
      this.configFrom.id = scope.row.id
      console.log(this.configFrom.id);
    },
    async showViewInfo (scope) {
      this.viewlogVisible = true
      const { data: res } = await this.$http.get(`/usv/getconfig?id=${scope.row.id}`)
    },
    // 点击了确认配置
    async editConfig () {
      // 滑块值为true的滑块,发起请求.为false不发送
      for (let i in this.configFrom) { //获取对象各个键的值
        if (this.configFrom[i] === true) {
          const { data: res } = await this.$http.post(`/usv/${i}?id=${this.configFrom.id}`)
          if (!res.errorCode) {
            this.$message.success('请求成功')
            console.log(res);
          }
          else {
            this.$message.error(`${res.message}`)
          }
        }
        console.log(this.configFrom[i]);
      }
      // 如果开启了继续执行滑块,那么请求继续执行任务接口,如果关闭了执行暂停任务
      // if (this.configFrom.resume === false) {
      //   const { data: res } = await this.$http.post(`/api/usv/pause?id=${this.configFrom.id}`)
      //   if (!res.errorCode) {

      //   }
      //   else {
      //     this.$message.error(`${res.Message}`)
      //   }
      // }
      // 单选框选择了哪一个,就调用哪一个接口
      if (this.radio === 1) {
        const { data: res } = await this.$http.post(`/usv/pause?id=${this.configFrom.id}`)
        if (!res.errorCode) {
          this.$message.success('请求成功')
          console.log(res);
        }
        else {
          this.$message.error(`${res.message}`)
        }
      }
      else {
        const { data: res } = await this.$http.post(`/usv/resume?id=${this.configFrom.id}`)
        if (!res.errorCode) {
          this.$message.success('请求成功')
          console.log(res);
        }
        else {
          this.$message.error(`${res.message}`)
        }
      }
      console.log(this.radio);
      this.configlogVisible = false
    },
    // async deleteConfig (scope) {
    //   let index = scope.$index
    //   const confirmRlust = await this.$confirm(
    //     "此操作将永久删除该船只, 是否继续?",
    //     "提示",
    //     {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     }
    //   ).catch(err => err);
    //   console.log(scope);
    //   if (confirmRlust == 'confirm') {
    //     this.configInfoList.splice(index, 1)
    //     this.$message.success('删除成功!')
    //   }
    //   else {
    //     this.$message.info("取消了删除!");
    //   }
    // },
    handleSizeChange (newSize) {
      this.shipQuery.size = newSize
      this.getShipData()
    },
    handleCurrentChange (newPage) {
      this.shipQuery.page = newPage
      this.getShipData()
    },
  },
  created () {
    this.getShipData()
  },
  components: {
    Breadcrumb
  },
  computed: {},
  beforeMount () { },
  mounted () { },
  watch: {},
}
</script>
<style lang="less" scoped>
.configbox {
  text-align: center;
}
</style>
