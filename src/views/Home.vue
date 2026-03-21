<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <el-icon><House /></el-icon>
          <span>欢迎使用后台管理系统</span>
        </div>
      </template>

      <div class="welcome-content">
        <div class="welcome-text">
          <h2>您好，{{ userStore.userInfo?.nickname || '用户' }}！</h2>
          <p>当前时间：{{ currentTime }}</p>
        </div>

        <div class="statistics">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-label">系统状态</div>
                <div class="stat-value status-normal">正常</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-label">在线用户</div>
                <div class="stat-value">12</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-label">今日访问</div>
                <div class="stat-value">128</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <!-- 快捷功能区 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>快捷功能</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button @click="handleWeather">
              <el-icon><Sunny /></el-icon>
              天气查询
            </el-button>
            <el-button @click="handleCalculator">
              <el-icon><Operation /></el-icon>
              计算器
            </el-button>
            <el-button @click="handleParty">
              <el-icon><Umbrella /></el-icon>
              活动策划
            </el-button>
            <el-button @click="handleData">
              <el-icon><TrendCharts /></el-icon>
              数据查询
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>最近对话</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
                v-for="(activity, index) in recentChats"
                :key="index"
                :timestamp="activity.time"
                placement="top"
            >
              <el-card>
                <p>{{ activity.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { House, DataAnalysis, Sunny, Operation, Umbrella, TrendCharts, Document } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const currentTime = ref(dayjs().format('YYYY/MM/DD HH:mm:ss'))
let timer: any = null

const recentChats = ref([
  { content: '查询北京天气', time: '10 分钟前' },
  { content: '计算 100 + 200', time: '30 分钟前' },
  { content: '策划团建活动', time: '1 小时前' }
])

// 更新时间
const updateTime = () => {
  currentTime.value = dayjs().format('YYYY/MM/DD HH:mm:ss')
}

onMounted(() => {
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 快捷功能处理
const handleWeather = () => {
  ElMessage.info('请在 AI 对话框中输入：北京天气')
}

const handleCalculator = () => {
  ElMessage.info('请在 AI 对话框中输入：100 加 200 等于多少')
}

const handleParty = () => {
  ElMessage.info('请在 AI 对话框中输入：帮我策划一场团建活动')
}

const handleData = () => {
  ElMessage.info('请在 AI 对话框中输入：上个月的销售数据')
}
</script>

<style scoped lang="scss">
.home-container {
  padding: 20px;
}

.welcome-card {
  :deep(.el-card__header) {
    background: #f5f7fa;
    padding: 15px 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.welcome-content {
  padding: 20px 0;

  .welcome-text {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 10px;
    }

    p {
      font-size: 16px;
      color: #666;
    }
  }

  .statistics {
    .stat-item {
      text-align: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #333;

        &.status-normal {
          color: #67c23a;
        }
      }
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;

  .el-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 50px;
    font-size: 14px;
  }
}

:deep(.el-timeline-item__content) {
  p {
    margin: 0;
    color: #606266;
  }
}
</style>
