<template>
  <div class="ai-chat-container">
    <!-- 悬浮按钮 -->
    <div class="chat-button" @click="toggleChat">
      <el-icon :size="24"><ChatDotRound /></el-icon>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" />
    </div>

    <!-- 聊天窗口 -->
    <transition name="slide-fade">
      <div v-if="visible" class="chat-window">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI 智能助手</span>
          </div>
          <div class="chat-actions">
            <el-button text @click="startNewChat" title="新对话">
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button text @click="toggleChat" title="关闭">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 对话历史列表 -->
        <div class="chat-history">
          <div class="history-title">最近对话</div>
          <el-scrollbar max-height="200px">
            <div
                v-for="(history, index) in chatHistories"
                :key="index"
                class="history-item"
                :class="{ active: currentHistoryIndex === index }"
                @click="switchHistory(index)"
            >
              <div class="history-content">{{ history.title }}</div>
              <div class="history-time">{{ history.time }}</div>
            </div>
          </el-scrollbar>
        </div>

        <!-- 聊天内容区 -->
        <el-scrollbar ref="chatScrollRef" class="chat-messages">
          <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="message.role"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :icon="User" />
              <el-avatar v-else :icon="ChatDotRound" class="ai-avatar" />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatContent(message.content)"></div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-avatar">
              <el-avatar :icon="ChatDotRound" class="ai-avatar" />
            </div>
            <div class="message-content">
              <el-skeleton :rows="2" animated />
            </div>
          </div>
        </el-scrollbar>

        <!-- 输入区 -->
        <div class="chat-input">
          <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息... (Shift+Enter 换行)"
              :disabled="loading"
              @keydown.enter.exact.prevent="sendMessage"
          />
          <div class="input-actions">
            <el-button :disabled="loading" @click="clearMessages">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
            <el-button
                type="primary"
                :loading="loading"
                @click="sendMessage"
            >
              <el-icon><Promotion /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ChatDotRound, User, Plus, Close, Delete, Promotion } from '@element-plus/icons-vue'
import { chat } from '@/api/ai'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import dayjs from 'dayjs'

const md = new MarkdownIt()

const visible = ref(false)
const loading = ref(false)
const inputMessage = ref('')
const unreadCount = ref(0)
const currentHistoryIndex = ref(0)

// 对话历史
const chatHistories = ref([
  { title: 'Java 过滤器配置', time: '10:30' },
  { title: 'Vue3 项目搭建', time: '昨天' },
  { title: '企业数据查询', time: '昨天' }
])

// 当前对话消息
const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是企业智能助手，请问有什么可以帮您？',
    time: dayjs().format('HH:mm')
  }
])

const chatScrollRef = ref()

// 切换聊天窗口
const toggleChat = () => {
  visible.value = !visible.value
  if (visible.value) {
    unreadCount.value = 0
    scrollToBottom()
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = {
    role: 'user' as const,
    content: inputMessage.value.trim(),
    time: dayjs().format('HH:mm')
  }

  messages.value.push(userMessage)
  const userMessageContent = inputMessage.value.trim()
  inputMessage.value = ''
  loading.value = true

  scrollToBottom()

  try {
    const res = await chat(userMessageContent)

    // 处理返回内容，确保 content 是字符串
    let content: string
    if (typeof res.data === 'string') {
      content = res.data
    } else {
      // res.data 是 { status: string; content: string } 对象
      content = res.data.content || JSON.stringify(res.data)
    }

    const assistantMessage = {
      role: 'assistant' as const,
      content: content,
      time: dayjs().format('HH:mm')
    }

    messages.value.push(assistantMessage)

    if (!visible.value) {
      unreadCount.value++
    }
  } catch (error) {
    ElMessage.error('消息发送失败')
    const errorMessage = {
      role: 'assistant' as const,
      content: '抱歉，消息发送失败，请稍后重试。',
      time: dayjs().format('HH:mm')
    }
    messages.value.push(errorMessage)
  } finally {
    loading.value = false
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 开始新对话
const startNewChat = () => {
  messages.value = [
    {
      role: 'assistant',
      content: '您好！我是企业智能助手，请问有什么可以帮您？',
      time: dayjs().format('HH:mm')
    }
  ]
  chatHistories.value.unshift({
    title: '新对话',
    time: dayjs().format('HH:mm')
  })
  currentHistoryIndex.value = 0
  ElMessage.success('已开启新对话')
}

// 切换历史记录
const switchHistory = (index: number) => {
  currentHistoryIndex.value = index
  // TODO: 加载对应的历史消息
  ElMessage.info('加载历史对话功能待实现')
}

// 清空对话
const clearMessages = () => {
  messages.value = [
    {
      role: 'assistant',
      content: '对话已清空，请问有什么可以帮您？',
      time: dayjs().format('HH:mm')
    }
  ]
  ElMessage.success('对话已清空')
}

// 格式化内容（支持 Markdown）
const formatContent = (content: string) => {
  return md.render(content)
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollRef.value) {
      const container = chatScrollRef.value.$el
      container.scrollTop = container.scrollHeight
    }
  })
}
</script>

<style scoped lang="scss">
.ai-chat-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
  }

  :deep(.el-badge) {
    position: absolute;
    top: -5px;
    right: -5px;
  }
}

.chat-window {
  position: absolute;
  right: 0;
  bottom: 80px;
  width: 400px;
  height: 600px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(20px);
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .chat-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  .chat-actions {
    display: flex;
    gap: 8px;

    :deep(.el-button) {
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.chat-history {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;

  .history-title {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
  }

  .history-item {
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;

    &:hover {
      background: #e4e7ed;
    }

    &.active {
      background: #ecf5ff;
      color: #409EFF;
    }

    .history-content {
      font-size: 13px;
      color: #333;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .history-time {
      font-size: 11px;
      color: #909399;
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;

  .message {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        align-items: flex-end;

        .message-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
      }
    }

    &.assistant {
      .message-avatar {
        .ai-avatar {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
      }

      .message-content {
        .message-text {
          background: #fff;
          color: #333;
        }
      }
    }

    .message-avatar {
      flex-shrink: 0;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 70%;

      .message-text {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.6;
        word-wrap: break-word;

        :deep(p) {
          margin: 0 0 8px 0;

          &:last-child {
            margin: 0;
          }
        }

        :deep(pre) {
          background: #282c34;
          color: #abb2bf;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 8px 0;

          code {
            font-family: 'Consolas', 'Monaco', monospace;
          }
        }

        :deep(code) {
          background: #f5f7fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', monospace;
        }

        :deep(ul), :deep(ol) {
          padding-left: 20px;
          margin: 8px 0;
        }
      }

      .message-time {
        font-size: 11px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background: #fff;

  .input-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }
}
</style>