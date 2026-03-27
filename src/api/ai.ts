import request from '@/utils/request'
import type { Result, Conversation, Message, UserProfile, MemoryStats } from '@/types/api'

/**
 * AI 聊天
 * @param message 用户消息
 * @param conversationId 会话ID（可选，不传则自动创建新会话）
 * @returns AI 回复（status、content、conversationId）
 */
export const chat = (message: string, conversationId?: number) =>
    request.post<Result<{ status: string; content: string; conversationId: number; references?: any }>>('/chat', { message, conversationId })

/**
 * 获取会话列表
 */
export const getConversations = () =>
    request.get<Result<Conversation[]>>('/chat/conversations')

/**
 * 创建新会话
 * @param title 会话标题
 */
export const createConversation = (title?: string) =>
    request.post<Result<Conversation>>('/chat/conversations', { title })

/**
 * 获取指定会话的消息列表
 * @param conversationId 会话ID
 */
export const getConversationMessages = (conversationId: number) =>
    request.get<Result<Message[]>>(`/chat/conversations/${conversationId}/messages`)

/**
 * 删除指定会话
 * @param conversationId 会话ID
 */
export const deleteConversation = (conversationId: number) =>
    request.delete<Result<void>>(`/chat/conversations/${conversationId}`)

/**
 * 活动策划
 * @param message 活动需求
 * @returns 策划方案
 */
export const planParty = (message: string) =>
    request.post<Result<{ status: string; content: string }>>('/party/level', { message })

/**
 * 天气查询
 * @param city 城市名称
 * @returns 天气信息
 */
export const getWeather = (city: string) =>
    request.post<string>('/weather', { city })

/**
 * 计算器
 * @param operation 操作类型 (add/subtract/multiply/divide/percentage)
 * @param a 数字 a
 * @param b 数字 b
 * @returns 计算结果
 */
export const executeCalculator = (operation: string, a: number, b: number) =>
    request.post<string>('/skills/calculator', { operation, a, b })

/**
 * 获取当前用户画像
 * @returns 用户画像信息
 */
export const getUserProfile = () =>
    request.get<Result<UserProfile>>('/profile')

/**
 * 触发用户画像分析
 * @returns 分析后的用户画像
 */
export const analyzeUserProfile = () =>
    request.post<Result<UserProfile>>('/profile/analyze')

/**
 * 获取记忆统计信息
 * @returns 记忆统计
 */
export const getMemoryStats = () =>
    request.get<Result<MemoryStats>>('/memory/stats')
