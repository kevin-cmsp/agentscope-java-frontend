<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名" width="150" />
        <el-table-column prop="remark" label="描述" width="200" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleAssignMenus(row)">
              分配菜单
            </el-button>
            <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end"
          @size-change="handleSearch"
          @current-change="handleSearch"
      />
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="roleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
      >
        <el-form-item label="角色名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配菜单对话框 -->
    <el-dialog
        v-model="menuDialogVisible"
        :title="'分配菜单：' + currentRole?.name"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form>
        <el-form-item label="选择菜单">
          <el-tree
              ref="menuTreeRef"
              :data="menuTreeData"
              :props="{ children: 'children', label: 'name' }"
              show-checkbox
              node-key="id"
              :default-checked-keys="selectedMenuIds"
              :expand-on-click-node="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMenuAssignment" :loading="menuAssignLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { queryRoles, createRole, updateRole, deleteRole, getRoleById, assignMenus, getRoleMenus } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const searchForm = reactive({
  roleName: '',
  status: null as number | null
})

const tableData = ref<any[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑角色' : '新增角色')
const isEdit = ref(false)
const submitLoading = ref(false)
const roleFormRef = ref<FormInstance>()

const formData = reactive<any>({
  name: '',
  code: '',
  remark: '',
  sort: 1,
  status: 1
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ]
}

// 分配菜单相关
const menuDialogVisible = ref(false)
const menuAssignLoading = ref(false)
const currentRole = ref<any>(null)
const selectedMenuIds = ref<number[]>([])
const menuTreeData = ref<any[]>([])
const menuTreeRef = ref<any>()

// 加载数据
const loadData = async () => {
  try {
    const res = await queryRoles({
      roleName: searchForm.roleName,
      status: searchForm.status || undefined
    })
    tableData.value = res.data
    pagination.total = res.data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.roleName = ''
  searchForm.status = null
  handleSearch()
}

// 新增
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: any) => {
  isEdit.value = true
  try {
    const res = await getRoleById(row.id)
    const roleData = res.data
    Object.assign(formData, roleData)
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取角色信息失败')
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 分配菜单
const handleAssignMenus = async (row: any) => {
  currentRole.value = row
  selectedMenuIds.value = []

  try {
    // 加载菜单树
    const menuRes = await getMenuTree()
    menuTreeData.value = menuRes.data

    // 加载角色已分配的菜单
    const roleMenusRes = await getRoleMenus(row.id)
    selectedMenuIds.value = roleMenusRes.data || []

    menuDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载菜单数据失败')
  }
}

// 提交菜单分配
const submitMenuAssignment = async () => {
  if (!currentRole.value) return

  menuAssignLoading.value = true
  try {
    // 获取选中的菜单 ID（包括半选中的节点）
    const checkedKeys = menuTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

    await assignMenus(currentRole.value.id, allCheckedKeys)
    ElMessage.success('分配成功')
    menuDialogVisible.value = false
  } catch (error) {
    ElMessage.error('分配失败')
  } finally {
    menuAssignLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    remark: '',
    sort: 1,
    status: 1
  })
  roleFormRef.value?.clearValidate()
}

// 提交表单
const submitForm = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value) {
        await updateRole(formData)
        ElMessage.success('更新成功')
      } else {
        await createRole(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.role-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
