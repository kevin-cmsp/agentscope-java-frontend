import request from '@/utils/request'
import type { Result } from '@/types/api'

/**
 * AI 聊天
 * @param message 用户消息
 * @returns AI 回复（status 和 content）
 */
export const chat = (message: string) =>
    request.post<Result<{ status: string; content: string }>>('/chat', { message })

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