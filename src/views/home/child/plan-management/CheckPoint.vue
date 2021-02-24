<template>
  <div>
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="value" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddCheckPoint">添加检测点</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="checkPointList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="名称" prop="pointName"></el-table-column>
        <el-table-column label="个数" prop="number"></el-table-column>
        <el-table-column label="覆盖区域" prop="area"></el-table-column>
        <el-table-column label="用户名" prop="user"></el-table-column>
        <el-table-column label="操作" fixed="right" width="230">
          <template slot-scope="scope">
            <el-button type="warning" size="mini" @click="showEditPoint(scope)">编辑</el-button>
            <el-button type="primary" size="mini" @click="showViewInfo(scope)">查看</el-button>
            <el-button type="danger" size="mini" @click="deletePlan(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加dialog -->
      <el-dialog title="添加检测点" :visible.sync="addlogVisible" width="30%" center @close="closeAdd">
        <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
          <el-form-item label="名称" prop="pointName">
            <el-input v-model="addFrom.pointName" placeholder="请输入检测点名称"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addcheckPoin">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑dialog -->
      <el-dialog title="编辑检测点" :visible.sync="editlogVisible" width="30%" center @close="closeEdit">
        <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
          <el-form-item label="检测点名称" prop="pointName">
            <el-input v-model="editFrom.pointName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editPoint">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 查看dialog -->
      <el-dialog title="检测点信息" :visible.sync="viewlogVisible" width="30%" center>
        <el-form ref="viewFormRef" label-width="110px" :model="viewFrom">
          <el-form-item label="名称" required>
            <el-input v-model="viewFrom.pointName" readonly></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="viewlogVisible = false">取 消</el-button>
          <el-button type="primary" @click="viewlogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import Breadcrumb from 'common/Breadcrumb'
export default {
  name: "CheckPoint",
  data () {
    return {
      value: '',
      addlogVisible: false,
      editlogVisible: false,
      viewlogVisible: false,
      breadcrumbList: ['测量计划管理', '检测点管理'],
      checkPointList: [
        {
          pointName: '水质检测',
          number: 26,
          area: '中下游',
          user: 'admin'
        },
        {
          pointName: '河流检测',
          number: 16,
          area: '中游',
          user: 'admin'
        },
        {
          pointName: '路况检测',
          number: 50,
          area: '整个区域',
          user: 'admin'
        },
        {
          pointName: '异物检测',
          number: 13,
          area: '上游',
          user: 'admin'
        },
      ],
      addFrom: {
        pointName: ''
      },
      editFrom: {
        pointName: ''
      },
      viewFrom: {
        pointName: ''
      },
      editFromList: {
        id: 0,
        pointName: ''
      },
      addFromList: {
        pointName: ''
      },
      // 验证规则
      addRules: {

        pointName: [
          { required: true, message: '请输入检测点名称', trigger: 'blur' }
        ]

      },
      editRules: {
        pointName: [
          { required: true, message: '请输入检测点名称', trigger: 'blur' }
        ]
      }
    }
  },
  props: {
  },
  methods: {
    showAddCheckPoint () {
      this.addlogVisible = true
    },
    addcheckPoin () {
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          let index = this.checkPointList.length
          this.addFromList.pointName = this.addFrom.pointName
          this.checkPointList.splice(index, 0, this.addFromList)
          this.$message.success('添加检测点成功!')
          this.addlogVisible = false
        }
        else {
          this.$message.error('添加检测点失败!')
        }
      }),
        this.addFromList = ''
    },
    closeAdd () {
      this.$refs.addFormRef.resetFields();
    },
    closeEdit () {

    },
    editPoint () {
      this.$refs.editFormRef.validate(valid => {
        if (valid) {
          this.editFromList.pointName = this.editFrom.pointName
          this.checkPointList.splice(this.editFromList.id, 1, this.editFromList)
          this.$message.success('编辑检测点成功')
          this.editlogVisible = false
        }
        else {
          this.$message.error('编辑检测点失败')
        }
      })
      this.editFromList = []
    },
    showEditPoint (scope) {
      this.editFromList.id = scope.$index
      this.editlogVisible = true
    },
    showViewInfo (scope) {
      this.viewFrom.pointName = scope.row.pointName
      this.viewlogVisible = true
    },
    async deletePlan (scope) {
      let index = scope.$index
      const confirmRlust = await this.$confirm(
        "此操作将永久删除该检测点, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmRlust == 'confirm') {
        this.checkPointList.splice(index, 1)
        this.$message.success('删除成功!')
      }
      else {
        this.$message.info("取消了删除!");
      }
    }
  },
  created () { },
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
.el-col {
  margin-right: 30px;
}
</style>
