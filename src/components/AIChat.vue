<template>
  <div class="ai-chat-container">
    <!-- 悬浮按钮 -->
    <div class="chat-button" @click="toggleChat">
      <el-icon :size="24"><ChatDotRound /></el-icon>
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" />
    </div>

    <!-- 聊天窗口 -->
    <transition name="slide-fade">
      <div
        v-if="visible"
        ref="chatWindowRef"
        class="chat-window"
        :style="windowStyle"
      >
        <!-- 可拖拽调整大小的手柄 -->
        <div class="resize-handle resize-handle-top" @mousedown="startResize('top', $event)"></div>
        <div class="resize-handle resize-handle-left" @mousedown="startResize('left', $event)"></div>
        <div class="resize-handle resize-handle-right" @mousedown="startResize('right', $event)"></div>
        <div class="resize-handle resize-handle-bottom" @mousedown="startResize('bottom', $event)"></div>
        <div class="resize-handle resize-handle-top-left" @mousedown="startResize('top-left', $event)"></div>
        <div class="resize-handle resize-handle-top-right" @mousedown="startResize('top-right', $event)"></div>
        <div class="resize-handle resize-handle-bottom-left" @mousedown="startResize('bottom-left', $event)"></div>
        <div class="resize-handle resize-handle-bottom-right" @mousedown="startResize('bottom-right', $event)"></div>

        <div class="chat-layout">
          <!-- 左侧：对话历史 -->
          <div class="chat-sidebar">
            <div class="sidebar-header">
              <el-button class="new-chat-btn" @click="startNewChat">
                <el-icon><Plus /></el-icon>
                <span>新建对话</span>
              </el-button>
            </div>
            <div class="sidebar-title">最近对话</div>
            <el-scrollbar class="sidebar-list">
              <div
                v-for="conv in conversations"
                :key="conv.id"
                class="history-item"
                :class="{ active: currentConversationId === conv.id }"
                @click="switchConversation(conv.id)"
              >
                <div class="history-content">{{ conv.title || '新对话' }}</div>
                <div class="history-time">{{ formatTime(conv.updateTime) }}</div>
                <el-icon class="history-delete" @click.stop="deleteConv(conv.id)"><Close /></el-icon>
              </div>
              <div v-if="conversations.length === 0" class="history-empty">
                暂无对话记录
              </div>
            </el-scrollbar>
          </div>

          <!-- 右侧：聊天区域 -->
          <div class="chat-main">
            <!-- 聊天头部 -->
            <div class="chat-header" @mousedown="startDrag">
              <div class="chat-title">
                <el-icon><ChatDotRound /></el-icon>
                <span>AI 智能助手</span>
              </div>
              <div class="chat-actions">
                <el-button text @click="toggleChat" title="关闭">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 聊天内容区 -->
            <el-scrollbar ref="chatScrollRef" class="chat-messages">
              <div v-if="messages.length === 0" class="chat-welcome">
                <div class="welcome-icon">
                  <el-icon :size="48"><ChatDotRound /></el-icon>
                </div>
                <div class="welcome-text">您好！我是企业智能助手，请问有什么可以帮您？</div>
              </div>
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
                ref="inputRef"
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
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, reactive, onBeforeUnmount } from 'vue'
import { ChatDotRound, User, Plus, Close, Delete, Promotion, CopyDocument } from '@element-plus/icons-vue'
import { chat, getConversations, getConversationMessages, deleteConversation } from '@/api/ai'
import type { Conversation } from '@/types/api'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import dayjs from 'dayjs'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const md = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang }).value +
          '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

const visible = ref(false)
const loading = ref(false)
const inputMessage = ref('')
const unreadCount = ref(0)
const currentConversationId = ref<number | null>(null)
const inputRef = ref()
const chatScrollRef = ref()
const chatWindowRef = ref()

// 窗口位置状态
const windowPosition = reactive({
  left: 0,
  top: 0,
})

// 窗口大小状态
const windowSize = reactive({
  width: 700,
  height: 550,
})

const windowStyle = ref({
  width: '700px',
  height: '550px',
  left: '0px',
  top: '0px',
})

// 对话历史列表
const conversations = ref<Conversation[]>([])

// 当前对话消息
interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
  time: string
}
const messages = ref<DisplayMessage[]>([])

// 切换聊天窗口
const toggleChat = () => {
  visible.value = !visible.value
  if (visible.value) {
    unreadCount.value = 0
    loadConversations()
    scrollToBottom()
  }
}

// 加载对话列表
const loadConversations = async () => {
  try {
    const res = await getConversations()
    if (res.code === 200) {
      conversations.value = res.data || []
    }
  } catch (error) {
    console.error('加载会话列表失败', error)
  }
}

// 切换到指定会话
const switchConversation = async (id: number) => {
  if (currentConversationId.value === id) return
  currentConversationId.value = id
  await loadMessages(id)
}

// 加载指定会话的消息
const loadMessages = async (conversationId: number) => {
  try {
    const res = await getConversationMessages(conversationId)
    if (res.code === 200 && res.data) {
      messages.value = res.data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        time: dayjs(msg.createTime).format('HH:mm')
      }))
    } else {
      messages.value = []
    }
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败', error)
    messages.value = []
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage: DisplayMessage = {
    role: 'user',
    content: inputMessage.value.trim(),
    time: dayjs().format('HH:mm')
  }

  messages.value.push(userMessage)
  const userMessageContent = inputMessage.value.trim()
  inputMessage.value = ''
  loading.value = true

  scrollToBottom()

  try {
    const res = await chat(userMessageContent, currentConversationId.value || undefined)

    // 处理返回内容 - 后端返回 Result<{status, content, conversationId}>
    const data = res.data
    const content = data?.content || '未获取到回复'
    const conversationId = data?.conversationId

    // 更新当前会话 ID
    if (conversationId) {
      currentConversationId.value = conversationId
    }

    const assistantMessage: DisplayMessage = {
      role: 'assistant',
      content: content,
      time: dayjs().format('HH:mm')
    }

    messages.value.push(assistantMessage)

    // 刷新会话列表
    await loadConversations()

    if (!visible.value) {
      unreadCount.value++
    }
  } catch (error) {
    ElMessage.error('消息发送失败')
    const errorMessage: DisplayMessage = {
      role: 'assistant',
      content: '抱歉，消息发送失败，请稍后重试。',
      time: dayjs().format('HH:mm')
    }
    messages.value.push(errorMessage)
  } finally {
    loading.value = false
    nextTick(() => {
      scrollToBottom()
      // 聚焦输入框
      if (inputRef.value) {
        inputRef.value.focus()
      }
    })
  }
}

// 开始新对话
const startNewChat = async () => {
  currentConversationId.value = null
  messages.value = []
  inputMessage.value = ''
  // 聚焦输入框
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

// 删除会话
const deleteConv = async (id: number) => {
  try {
    await deleteConversation(id)
    // 如果删除的是当前会话，清空消息
    if (currentConversationId.value === id) {
      currentConversationId.value = null
      messages.value = []
    }
    await loadConversations()
    ElMessage.success('对话已删除')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 清空当前对话显示
const clearMessages = () => {
  messages.value = []
  currentConversationId.value = null
  ElMessage.success('对话已清空')
}

// 格式化内容（支持 Markdown 和代码高亮）
const formatContent = (content: string) => {
  return md.render(content)
}

// 复制代码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  try {
    // 处理数组格式的时间 [year, month, day, hour, minute, second]
    let date: dayjs.Dayjs
    if (Array.isArray(timeStr as any)) {
      const [year, month, day, hour, minute, second] = timeStr as any
      date = dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`)
    } else {
      date = dayjs(timeStr)
    }

    if (!date.isValid()) {
      return timeStr || '未知时间'
    }
    return date.format('YYYY-MM-DD HH:mm:ss')
  } catch (error) {
    console.error('格式化时间失败', error)
    return timeStr || '未知时间'
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatScrollRef.value) {
      const scrollbar = chatScrollRef.value
      const wrapRef = scrollbar.wrapRef
      if (wrapRef) {
        wrapRef.scrollTop = wrapRef.scrollHeight
      }
    }
  })
}

// --- 窗口拖拽调整大小 ---
let isResizing = false
let resizeDirection = ''
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let resizeStartLeft = 0
let resizeStartTop = 0

const startResize = (direction: string, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isResizing = true
  resizeDirection = direction
  startX = event.clientX
  startY = event.clientY
  startWidth = windowSize.width
  startHeight = windowSize.height
  resizeStartLeft = windowPosition.left
  resizeStartTop = windowPosition.top
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
}

const doResize = (event: MouseEvent) => {
  if (!isResizing) return
  const dx = event.clientX - startX
  const dy = event.clientY - startY

  // 处理左右方向的调整
  if (resizeDirection.includes('right')) {
    const newWidth = Math.max(500, Math.min(1200, startWidth + dx))
    windowSize.width = newWidth
  } else if (resizeDirection.includes('left')) {
    const newWidth = Math.max(500, Math.min(1200, startWidth - dx))
    windowSize.width = newWidth
    windowPosition.left = Math.max(0, resizeStartLeft + dx)
  }

  // 处理上下方向的调整
  if (resizeDirection.includes('bottom')) {
    const newHeight = Math.max(400, Math.min(900, startHeight + dy))
    windowSize.height = newHeight
  } else if (resizeDirection.includes('top')) {
    const newHeight = Math.max(400, Math.min(900, startHeight - dy))
    windowSize.height = newHeight
    windowPosition.top = Math.max(0, resizeStartTop + dy)
  }

  windowStyle.value = {
    width: windowSize.width + 'px',
    height: windowSize.height + 'px',
    left: windowPosition.left + 'px',
    top: windowPosition.top + 'px',
  }
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
}

// --- 窗口拖拽移动 ---
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartLeft = 0
let dragStartTop = 0

const startDrag = (event: MouseEvent) => {
  if (isResizing) return
  isDragging = true
  dragStartX = event.clientX
  dragStartY = event.clientY
  dragStartLeft = windowPosition.left
  dragStartTop = windowPosition.top
  document.addEventListener('mousemove', doDrag)
  document.addEventListener('mouseup', stopDrag)
}

const doDrag = (event: MouseEvent) => {
  if (!isDragging) return
  const dx = event.clientX - dragStartX
  const dy = event.clientY - dragStartY

  windowPosition.left = Math.max(0, Math.min(window.innerWidth - windowSize.width, dragStartLeft + dx))
  windowPosition.top = Math.max(0, Math.min(window.innerHeight - windowSize.height, dragStartTop + dy))

  windowStyle.value = {
    width: windowSize.width + 'px',
    height: windowSize.height + 'px',
    left: windowPosition.left + 'px',
    top: windowPosition.top + 'px',
  }
}

const stopDrag = () => {
  isDragging = false
  document.removeEventListener('mousemove', doDrag)
  document.removeEventListener('mouseup', stopDrag)
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('mousemove', doDrag)
  document.removeEventListener('mouseup', stopDrag)
})

onMounted(() => {
  // 初始化窗口位置（右下角）
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  windowPosition.left = viewportWidth - 700 - 20
  windowPosition.top = viewportHeight - 550 - 72 - 20

  windowStyle.value = {
    width: windowSize.width + 'px',
    height: windowSize.height + 'px',
    left: windowPosition.left + 'px',
    top: windowPosition.top + 'px',
  }

  // 初始化
  addCopyButtons()
})

// 为代码块添加复制按钮
const addCopyButtons = () => {
  nextTick(() => {
    const preElements = document.querySelectorAll('pre.hljs')
    preElements.forEach(pre => {
      if (pre.querySelector('.copy-code-button')) return

      const code = pre.querySelector('code')
      if (!code) return

      const button = document.createElement('button')
      button.className = 'copy-code-button'
      button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> 复制'
      button.addEventListener('click', () => {
        copyCode(code.textContent || '')
      })
      pre.appendChild(button)
    })
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
  width: 56px;
  height: 56px;
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
  position: fixed;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 500px;
  min-height: 400px;
  cursor: move;
}

.resize-handle {
  position: absolute;
  z-index: 10;
}
.resize-handle-top {
  top: 0;
  left: 10px;
  right: 10px;
  height: 6px;
  cursor: n-resize;
}
.resize-handle-left {
  top: 10px;
  left: 0;
  bottom: 10px;
  width: 6px;
  cursor: w-resize;
}
.resize-handle-right {
  top: 10px;
  right: 0;
  bottom: 10px;
  width: 6px;
  cursor: e-resize;
}
.resize-handle-bottom {
  bottom: 0;
  left: 10px;
  right: 10px;
  height: 6px;
  cursor: s-resize;
}
.resize-handle-top-left {
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  cursor: nw-resize;
}
.resize-handle-top-right {
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  cursor: ne-resize;
}
.resize-handle-bottom-left {
  bottom: 0;
  left: 0;
  width: 12px;
  height: 12px;
  cursor: sw-resize;
}
.resize-handle-bottom-right {
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  cursor: se-resize;
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

.chat-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

// 左侧边栏
.chat-sidebar {
  width: 200px;
  min-width: 200px;
  background: #f5f5f5;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 12px;

    .new-chat-btn {
      width: 100%;
      border: 1px dashed #c0c4cc;
      background: #fff;
      border-radius: 8px;
      height: 36px;
      font-size: 13px;
      color: #606266;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }

  .sidebar-title {
    padding: 4px 16px 8px;
    font-size: 12px;
    color: #909399;
  }

  .sidebar-list {
    flex: 1;
    overflow-y: auto;
  }

  .history-item {
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background: #e8e8e8;

      .history-delete {
        display: flex;
      }
    }

    &.active {
      background: #e6f0ff;

      .history-content {
        color: #409eff;
      }
    }

    .history-content {
      font-size: 13px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 16px;
    }

    .history-time {
      font-size: 11px;
      color: #909399;
      margin-top: 2px;
    }

    .history-delete {
      display: none;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #c0c4cc;
      cursor: pointer;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  .history-empty {
    padding: 20px 16px;
    text-align: center;
    font-size: 12px;
    color: #c0c4cc;
  }
}

// 右侧聊天区
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.chat-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .chat-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
  }

  .chat-actions {
    display: flex;
    gap: 4px;

    :deep(.el-button) {
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;

  .chat-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;

    .welcome-icon {
      color: #c0c4cc;
      margin-bottom: 12px;
    }

    .welcome-text {
      font-size: 14px;
    }
  }

  .message {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        align-items: flex-end;

        .message-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border-radius: 12px 2px 12px 12px;
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
          border-radius: 2px 12px 12px 12px;
          border: 1px solid #ebeef5;
        }
      }
    }

    .message-avatar {
      flex-shrink: 0;

      :deep(.el-avatar) {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }
    }

    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 75%;

      .message-text {
        padding: 10px 14px;
        font-size: 13px;
        line-height: 1.6;
        word-wrap: break-word;

        :deep(p) {
          margin: 0 0 8px 0;

          &:last-child {
            margin: 0;
          }
        }

        :deep(pre.hljs) {
          background: #282c34;
          border-radius: 8px;
          position: relative;
          margin: 12px 0;
          overflow: hidden;

          &::before {
            content: '';
            display: block;
            height: 32px;
            background: #21252b;
            position: relative;

            // macOS 窗口按钮
            &::before {
              content: '';
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              display: flex;
              gap: 6px;

              background:
                radial-gradient(circle, #ff5f56 0%, #ff5f56 8px, transparent 9px) 0% 50% / 12px 12px no-repeat,
                radial-gradient(circle, #ffbd2e 0%, #ffbd2e 8px, transparent 9px) 14px 50% / 12px 12px no-repeat,
                radial-gradient(circle, #27c935 0%, #27c935 8px, transparent 9px) 28px 50% / 12px 12px no-repeat;
              width: 40px;
              height: 12px;
            }
          }

          code {
            display: block;
            padding: 0 16px 16px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            color: #abb2bf;
            white-space: pre;
          }

          // 复制按钮
          .copy-code-button {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            color: #abb2bf;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;

            &:hover {
              background: rgba(255, 255, 255, 0.2);
              color: #fff;
            }

            .el-icon {
              font-size: 14px;
            }
          }
        }

        :deep(code) {
          background: #f0f2f5;
          padding: 2px 5px;
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          color: #e83e8c;
        }

        :deep(pre.hljs code) {
          background: transparent;
          padding: 0 16px 16px;
          color: #abb2bf;
        }

        :deep(ul), :deep(ol) {
          padding-left: 20px;
          margin: 8px 0;
        }

        :deep(table) {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;

          th, td {
            border: 1px solid #dfe2e5;
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background: #f6f8fa;
            font-weight: 600;
          }
        }

        :deep(blockquote) {
          border-left: 4px solid #409eff;
          padding-left: 12px;
          margin: 8px 0;
          color: #606266;
          background: #f5f7fa;
          padding: 8px 12px;
          border-radius: 4px;
        }
      }

      .message-time {
        font-size: 10px;
        color: #c0c4cc;
        margin-top: 4px;
      }
    }
  }
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
  flex-shrink: 0;

  :deep(.el-textarea__inner) {
    resize: none;
  }

  .input-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
}
</style>