<template>
  <div class="menu-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增菜单
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
          :data="tableData"
          border
          stripe
          row-key="id"
          :tree-props="{ children: 'children' }"
          style="width: 100%"
      >
        <el-table-column prop="name" label="菜单名称" width="200" />
        <el-table-column prop="path" label="路径" width="200" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" type="warning">目录</el-tag>
            <el-tag v-else-if="row.type === 2" type="primary">菜单</el-tag>
            <el-tag v-else>按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
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
    </el-card>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="menuFormRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="请输入权限标识，如 sys:user:view" />
        </el-form-item>
        <el-form-item label="父菜单" prop="parentId">
          <el-tree-select
              v-model="formData.parentId"
              :data="menuTreeOptions"
              :props="{ label: 'name', value: 'id', children: 'children' }"
              check-strictly
              placeholder="请选择父菜单"
              :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="路由地址" prop="path" v-if="formData.type !== 3">
          <el-input v-model="formData.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="formData.type === 2">
          <el-input v-model="formData.component" placeholder="请输入组件路径，如 system/user/index" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="formData.type !== 3">
          <el-input v-model="formData.icon" placeholder="请输入图标名称，如 Setting" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="是否显示" prop="visible">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否缓存" prop="keepAlive">
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :value="1">缓存</el-radio>
            <el-radio :value="0">不缓存</el-radio>
          </el-radio-group>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { Menu } from '@/types/api'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const tableData = ref<Menu[]>([])
const menuTreeOptions = ref<Menu[]>([])

const dialogVisible = ref(false)
const dialogTitle = computed(() => isEdit.value ? '编辑菜单' : '新增菜单')
const isEdit = ref(false)
const submitLoading = ref(false)
const menuFormRef = ref<FormInstance>()

const formData = reactive<Partial<Menu>>({
  name: '',
  permission: '',
  type: 1,
  parentId: 0,
  path: '',
  component: '',
  icon: '',
  sort: 1,
  visible: 1,
  keepAlive: 0,
  status: 1
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  permission: [
    { required: true, message: '请输入权限标识', trigger: 'blur' }
  ],
  parentId: [
    { required: false, message: '请选择父菜单', trigger: 'change' }
  ]
}

// 加载数据
const loadData = async () => {
  try {
    const res = await getMenuTree()
    tableData.value = res.data
    menuTreeOptions.value = res.data
  } catch (error) {
    ElMessage.error('加载菜单失败')
  }
}

// 新增
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Menu) => {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: Menu) => {
  ElMessageBox.confirm(`确定要删除菜单 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMenu(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    permission: '',
    type: 1,
    parentId: 0,
    path: '',
    component: '',
    icon: '',
    sort: 1,
    visible: 1,
    keepAlive: 0,
    status: 1
  })
  menuFormRef.value?.clearValidate()
}

// 提交表单
const submitForm = async () => {
  if (!menuFormRef.value) return

  try {
    await menuFormRef.value.validate()

    submitLoading.value = true
    // 创建不包含 id 的数据对象，因为后端 id 为自增
    const { id, ...submitData } = formData
    try {
      if (isEdit.value) {
        await updateMenu(formData)
        ElMessage.success('更新成功')
      } else {
        await createMenu(submitData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitLoading.value = false
    }
  } catch {
    // 表单验证失败，不做任何操作，element-plus 会自动显示错误提示
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.menu-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
