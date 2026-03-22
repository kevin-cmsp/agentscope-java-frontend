<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="logo">
        <h2 v-if="!sidebarCollapsed">后台管理系统</h2>
        <el-icon v-else :size="24" color="#fff"><Setting /></el-icon>
      </div>
      <el-menu
          :default-active="activeMenu"
          background-color="#001529"
          text-color="#a6adb4"
          active-text-color="#409EFF"
          router
          :collapse="sidebarCollapsed"
      >
        <template v-for="menu in menuStore.sidebarMenus" :key="menu.id">
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="child.path"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="menu.path">
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleSidebar">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo?.nickname || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showUserInfo">个人信息</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- AI 对话悬浮窗 -->
    <AIChat />

    <!-- 个人信息对话框 -->
    <el-dialog
        v-model="userInfoDialogVisible"
        title="个人信息"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form :model="userStore.userInfo" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userStore.userInfo.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userStore.userInfo.nickname" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userStore.userInfo.mobile" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userStore.userInfo.email" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-tag :type="userStore.userInfo.status === 1 ? 'success' : 'danger'">
            {{ userStore.userInfo.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userInfoDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { UserFilled, Fold, Expand, Setting } from '@element-plus/icons-vue'
import AIChat from '@/components/AIChat.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()

const sidebarCollapsed = ref(false)
const userInfoDialogVisible = ref(false)

const activeMenu = computed(() => route.path)

// 监听菜单变化
watch(() => menuStore.sidebarMenus, (newMenus) => {
  console.log('=== 侧边栏菜单变化 ===')
  console.log('菜单数量:', newMenus.length)
  console.log('菜单详情:', JSON.stringify(newMenus, null, 2))
}, { deep: true, immediate: true })

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleLogout = async () => {
  await userStore.userLogout()
  router.push('/login')
}

const showUserInfo = () => {
  userInfoDialogVisible.value = true
}
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  transition: width 0.3s;

  &.sidebar-collapsed {
    width: 64px;
  }

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #002140;

    h2 {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
