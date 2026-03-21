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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getMenuTree } from '@/api/menu'
import type { Menu } from '@/types/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref<Menu[]>([])

// 加载数据
const loadData = async () => {
  try {
    const res = await getMenuTree()
    tableData.value = res.data
  } catch (error) {
    ElMessage.error('加载菜单失败')
  }
}

// 新增
const handleCreate = () => {
  ElMessage.info('新增菜单功能待实现')
}

// 编辑
const handleEdit = (row: Menu) => {
  ElMessage.info(`编辑菜单：${row.name}`)
}

// 删除
const handleDelete = (row: Menu) => {
  ElMessageBox.confirm(`确定要删除菜单 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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
